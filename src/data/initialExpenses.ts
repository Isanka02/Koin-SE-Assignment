import { Expense, ExtractedReceipt } from '../types/expense';

export const INITIAL_EXPENSES: Expense[] = [
  {
    id: '1',
    merchant: 'Cafe Kumbuk',
    date: 'Today, 10:42 AM',
    amountInCents: 2850,
    category: 'Food & Dining',
  },
  {
    id: '2',
    merchant: 'Keells Super',
    date: 'Yesterday, 6:18 PM',
    amountInCents: 6420,
    category: 'Groceries',
  },
  {
    id: '3',
    merchant: 'Uber',
    date: 'Nov 22, 2026',
    amountInCents: 1280,
    category: 'Transport',
  },
  {
    id: '4',
    merchant: 'The Good Market',
    date: 'Nov 21, 2026',
    amountInCents: 3500,
    category: 'Shopping',
  },
];

export const SAMPLE_RECEIPT_PRESETS: ExtractedReceipt[] = [
  {
    merchant: 'Cafe Kumbuk',
    date: 'Nov 24, 2026',
    category: 'Food & Dining',
    items: [
      { id: 'item-1', name: 'Avocado toast', priceInCents: 1400 },
      { id: 'item-2', name: 'Cappuccino', priceInCents: 650 },
      { id: 'item-3', name: 'Banana pancakes', priceInCents: 800 },
    ],
  },
  {
    merchant: 'Keells Super',
    date: 'Nov 25, 2026',
    category: 'Groceries',
    items: [
      { id: 'item-1', name: 'Organic almond milk', priceInCents: 540 },
      { id: 'item-2', name: 'Sourdough loaf', priceInCents: 480 },
      { id: 'item-3', name: 'Fresh berries', priceInCents: 725 },
      { id: 'item-4', name: 'Greek yogurt', priceInCents: 395 },
    ],
  },
  {
    merchant: 'The Good Market',
    date: 'Nov 26, 2026',
    category: 'Shopping',
    items: [
      { id: 'item-1', name: 'Canvas tote bag', priceInCents: 1850 },
      { id: 'item-2', name: 'Herbal tea tin', priceInCents: 1200 },
    ],
  },
];
