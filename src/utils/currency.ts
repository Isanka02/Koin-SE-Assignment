/**
 * Formats an integer cent amount as a USD string (e.g. 2850 -> "$28.50").
 */
export function formatCurrency(cents: number): string {
  const safeCents = Number.isFinite(cents) ? Math.round(cents) : 0;
  const sign = safeCents < 0 ? '-' : '';
  const absCents = Math.abs(safeCents);
  const dollars = Math.floor(absCents / 100);
  const remainder = absCents % 100;
  return `${sign}$${dollars}.${remainder.toString().padStart(2, '0')}`;
}

/**
 * Formats integer cents for a numeric input field without a currency symbol
 * (e.g. 1400 -> "14.00").
 */
export function formatPriceInput(cents: number): string {
  const safeCents = Number.isFinite(cents) ? Math.max(0, Math.round(cents)) : 0;
  return (safeCents / 100).toFixed(2);
}

/**
 * Strictly parses a user-entered dollar string into integer cents.
 * Returns null if the input is empty, negative, non-numeric, or has >2 decimals
 * so invalid inputs are never silently coerced to zero.
 */
export function parsePriceToCents(raw: string): number | null {
  const trimmed = raw.trim();
  if (!trimmed) {
    return null;
  }

  // Allow digits with optional up to 2 decimal places (e.g. "14", "14.5", "14.50", ".50")
  if (!/^(?:\d+(?:\.\d{0,2})?|\.\d{1,2})$/.test(trimmed)) {
    return null;
  }

  const [wholePart = '0', fracPart = ''] = trimmed.split('.');
  const dollars = parseInt(wholePart || '0', 10);
  const cents = parseInt(fracPart.padEnd(2, '0'), 10);

  if (Number.isNaN(dollars) || Number.isNaN(cents)) {
    return null;
  }

  const total = dollars * 100 + cents;
  return Number.isSafeInteger(total) ? total : null;
}

/**
 * Computes the exact total in integer cents from a list of items.
 */
export function calculateTotalInCents(
  items: ReadonlyArray<{ priceInCents: number | null }>
): number {
  return items.reduce((sum, item) => sum + (item.priceInCents ?? 0), 0);
}
