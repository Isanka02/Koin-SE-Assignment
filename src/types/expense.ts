export type ExpenseCategory =
  | 'Food & Dining'
  | 'Groceries'
  | 'Transport'
  | 'Shopping'
  | 'Utilities'
  | 'Other';

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'Food & Dining',
  'Groceries',
  'Transport',
  'Shopping',
  'Utilities',
  'Other',
];

export interface ReceiptItem {
  id: string;
  name: string;
  /** Stored as integer cents to avoid floating-point precision bugs. */
  priceInCents: number;
}

export interface EditableReceiptItem {
  id: string;
  name: string;
  /** Raw text shown in the price input so users can type decimals smoothly. */
  priceInput: string;
  /** Parsed integer cents, or null when the current input is invalid. */
  priceInCents: number | null;
}

export interface ReceiptDraft {
  merchant: string;
  date: string;
  category: ExpenseCategory;
  items: EditableReceiptItem[];
  imageUri?: string;
}

export interface ExtractedReceipt {
  merchant: string;
  date: string;
  category: ExpenseCategory;
  items: ReceiptItem[];
}

export interface Expense {
  id: string;
  merchant: string;
  date: string;
  amountInCents: number;
  category: ExpenseCategory;
  receiptUri?: string;
  items?: ReceiptItem[];
}

export type BottomTabKey = 'home' | 'expenses' | 'insights' | 'profile';
