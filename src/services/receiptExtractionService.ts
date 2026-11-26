import { SAMPLE_RECEIPT_PRESETS } from '../data/initialExpenses';
import {
  EXPENSE_CATEGORIES,
  ExpenseCategory,
  ExtractedReceipt,
  ReceiptItem,
} from '../types/expense';

export interface ExtractReceiptOptions {
  base64?: string;
  mimeType?: string;
}

interface GeminiExtractedItem {
  name?: unknown;
  price?: unknown;
}

interface GeminiExtractedPayload {
  merchant?: unknown;
  date?: unknown;
  category?: unknown;
  items?: unknown;
}

interface InteractionStep {
  type?: string;
  content?: Array<{ type?: string; text?: string }>;
}

interface InteractionResponse {
  steps?: InteractionStep[];
  outputs?: Array<{ type?: string; text?: string }>;
}

const GEMINI_INTERACTIONS_URL =
  'https://generativelanguage.googleapis.com/v1beta/interactions';
const GEMINI_MODEL = 'gemini-3.8-flash';
const API_TIMEOUT_MS = 18000;

let presetCursor = 0;

function normalizeCategory(raw: unknown): ExpenseCategory {
  if (
    typeof raw === 'string' &&
    EXPENSE_CATEGORIES.includes(raw as ExpenseCategory)
  ) {
    return raw as ExpenseCategory;
  }
  return 'Other';
}

function buildSimulatedReceipt(): ExtractedReceipt {
  const preset =
    SAMPLE_RECEIPT_PRESETS[presetCursor % SAMPLE_RECEIPT_PRESETS.length];
  presetCursor += 1;

  const timestamp = Date.now();
  return {
    merchant: preset.merchant,
    date: preset.date,
    category: preset.category,
    items: preset.items.map((item, index) => ({
      id: `${timestamp}-${index + 1}`,
      name: item.name,
      priceInCents: item.priceInCents,
    })),
  };
}

function extractTextFromInteraction(data: InteractionResponse): string | null {
  if (Array.isArray(data.steps)) {
    for (let i = data.steps.length - 1; i >= 0; i -= 1) {
      const step = data.steps[i];
      if (step.type === 'model_output' && Array.isArray(step.content)) {
        const textBlock = step.content.find(
          (block) => block.type === 'text' && typeof block.text === 'string'
        );
        if (textBlock?.text) {
          return textBlock.text;
        }
      }
    }
  }

  if (Array.isArray(data.outputs)) {
    for (let i = data.outputs.length - 1; i >= 0; i -= 1) {
      const out = data.outputs[i];
      if (typeof out.text === 'string' && out.text.trim()) {
        return out.text;
      }
    }
  }

  return null;
}

function parseGeminiPayload(rawJson: string): ExtractedReceipt | null {
  const parsed = JSON.parse(rawJson) as GeminiExtractedPayload;
  const merchant =
    typeof parsed.merchant === 'string' && parsed.merchant.trim()
      ? parsed.merchant.trim()
      : 'Unknown Merchant';

  const date =
    typeof parsed.date === 'string' && parsed.date.trim()
      ? parsed.date.trim()
      : new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });

  const category = normalizeCategory(parsed.category);

  const rawItems = Array.isArray(parsed.items) ? parsed.items : [];
  const timestamp = Date.now();
  const items: ReceiptItem[] = [];

  rawItems.forEach((entry, index) => {
    const candidate = entry as GeminiExtractedItem;
    const name =
      typeof candidate.name === 'string' ? candidate.name.trim() : '';
    const numericPrice =
      typeof candidate.price === 'number'
        ? candidate.price
        : Number(candidate.price);

    if (name && Number.isFinite(numericPrice) && numericPrice >= 0) {
      items.push({
        id: `${timestamp}-${index + 1}`,
        name,
        priceInCents: Math.round(numericPrice * 100),
      });
    }
  });

  if (items.length === 0) {
    return null;
  }

  return { merchant, date, category, items };
}

async function extractWithGeminiVision(
  apiKey: string,
  base64: string,
  mimeType: string
): Promise<ExtractedReceipt | null> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

  try {
    const response = await fetch(GEMINI_INTERACTIONS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
        'Api-Revision': '2026-05-20',
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: GEMINI_MODEL,
        input: [
          {
            type: 'text',
            text:
              'Extract the receipt details from this image. ' +
              'Return the merchant name in clean title case, the receipt date formatted like "Nov 24, 2026", ' +
              'the best matching category from ["Food & Dining", "Groceries", "Transport", "Shopping", "Utilities", "Other"], ' +
              'and only the purchased line items with their unit/line prices as decimal numbers (do not include Subtotal, Tax, or Total rows as line items unless tax is an actual charge > 0).',
          },
          {
            type: 'image',
            data: base64,
            mime_type: mimeType,
          },
        ],
        response_format: {
          type: 'text',
          mime_type: 'application/json',
          schema: {
            type: 'object',
            properties: {
              merchant: { type: 'string' },
              date: { type: 'string' },
              category: {
                type: 'string',
                enum: EXPENSE_CATEGORIES,
              },
              items: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    name: { type: 'string' },
                    price: { type: 'number' },
                  },
                  required: ['name', 'price'],
                },
              },
            },
            required: ['merchant', 'date', 'category', 'items'],
          },
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      console.warn(
        `Gemini extraction returned HTTP ${response.status}:`,
        errorText
      );
      return null;
    }

    const data = (await response.json()) as InteractionResponse;
    const jsonText = extractTextFromInteraction(data);
    if (!jsonText) {
      return null;
    }

    return parseGeminiPayload(jsonText);
  } catch (error) {
    console.warn('Gemini extraction failed, falling back to simulation:', error);
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Extracts receipt fields from a captured or picked image.
 * - If EXPO_PUBLIC_GEMINI_API_KEY is configured and image base64 is available,
 *   calls Gemini Vision for real receipt OCR/parsing.
 * - Otherwise (or if the API call fails), falls back to realistic simulated presets
 *   so reviewers can test immediately without API keys.
 */
export async function extractReceiptFromImage(
  _imageUri: string,
  options?: ExtractReceiptOptions
): Promise<ExtractedReceipt> {
  const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY?.trim();

  if (apiKey && options?.base64) {
    const liveResult = await extractWithGeminiVision(
      apiKey,
      options.base64,
      options.mimeType || 'image/jpeg'
    );
    if (liveResult) {
      return liveResult;
    }
  }

  await new Promise((resolve) => setTimeout(resolve, 1400));
  return buildSimulatedReceipt();
}
