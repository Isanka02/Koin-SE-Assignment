import { SAMPLE_RECEIPT_PRESETS } from '../data/initialExpenses';
import { ExtractedReceipt } from '../types/expense';

let presetCursor = 0;

/**
 * Simulates receipt OCR and parsing from an uploaded or captured image URI.
 * Cycles through realistic sample presets so reviewers can test the full
 * review, edit, and validation flow immediately without API keys.
 */
export async function extractReceiptFromImage(
  _imageUri: string
): Promise<ExtractedReceipt> {
  await new Promise((resolve) => setTimeout(resolve, 1400));

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
