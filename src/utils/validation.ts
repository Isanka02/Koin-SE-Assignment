import { EditableReceiptItem } from '../types/expense';
import { calculateTotalInCents, parsePriceToCents } from './currency';

export interface ReceiptValidationErrors {
  merchant?: string;
  date?: string;
  general?: string;
  itemNames: Record<string, string>;
  itemPrices: Record<string, string>;
}

export interface ReceiptValidationResult {
  isValid: boolean;
  totalInCents: number;
  errors: ReceiptValidationErrors;
}

export function validateReceiptForm(params: {
  merchant: string;
  date: string;
  items: EditableReceiptItem[];
}): ReceiptValidationResult {
  const errors: ReceiptValidationErrors = {
    itemNames: {},
    itemPrices: {},
  };

  if (!params.merchant.trim()) {
    errors.merchant = 'Merchant name is required.';
  }

  if (!params.date.trim()) {
    errors.date = 'Date is required.';
  }

  if (params.items.length === 0) {
    errors.general = 'Add at least one line item before saving.';
  }

  for (const item of params.items) {
    if (!item.name.trim()) {
      errors.itemNames[item.id] = 'Item name cannot be empty.';
    }

    const parsedCents = parsePriceToCents(item.priceInput);
    if (parsedCents === null) {
      errors.itemPrices[item.id] = 'Enter a valid price (e.g. 6.50).';
    } else if (parsedCents < 0) {
      errors.itemPrices[item.id] = 'Price cannot be negative.';
    }
  }

  const totalInCents = calculateTotalInCents(params.items);
  const hasItemErrors =
    Object.keys(errors.itemNames).length > 0 ||
    Object.keys(errors.itemPrices).length > 0;

  if (!errors.general && !hasItemErrors && totalInCents <= 0) {
    errors.general = 'Total amount must be greater than $0.00.';
  }

  const isValid =
    !errors.merchant &&
    !errors.date &&
    !errors.general &&
    !hasItemErrors &&
    totalInCents > 0;

  return {
    isValid,
    totalInCents,
    errors,
  };
}
