import {
  calculateTotalInCents,
  formatCurrency,
  formatPriceInput,
  parsePriceToCents,
} from '../currency';
import { validateReceiptForm } from '../validation';

let passed = 0;

function assertEqual<T>(actual: T, expected: T, message: string): void {
  if (actual !== expected) {
    throw new Error(`${message} (expected ${String(expected)}, got ${String(actual)})`);
  }
}

function assertTruthy(value: unknown, message: string): void {
  if (!value) {
    throw new Error(message);
  }
}

function runTest(name: string, fn: () => void): void {
  fn();
  passed += 1;
  console.log(`PASS: ${name}`);
}

runTest('formatCurrency formats integer cents into USD strings', () => {
  assertEqual(formatCurrency(2850), '$28.50', '2850 cents');
  assertEqual(formatCurrency(650), '$6.50', '650 cents');
  assertEqual(formatCurrency(0), '$0.00', '0 cents');
  assertEqual(formatCurrency(-125), '-$1.25', 'negative cents');
});

runTest('formatPriceInput formats cents for numeric inputs', () => {
  assertEqual(formatPriceInput(1400), '14.00', '1400 cents');
  assertEqual(formatPriceInput(0), '0.00', '0 cents');
});

runTest('parsePriceToCents parses valid prices and rejects invalid inputs', () => {
  assertEqual(parsePriceToCents('14.00'), 1400, '14.00');
  assertEqual(parsePriceToCents('6.5'), 650, '6.5');
  assertEqual(parsePriceToCents('8'), 800, '8');
  assertEqual(parsePriceToCents('.50'), 50, '.50');

  assertEqual(parsePriceToCents(''), null, 'empty string');
  assertEqual(parsePriceToCents('   '), null, 'whitespace');
  assertEqual(parsePriceToCents('-5.00'), null, 'negative');
  assertEqual(parsePriceToCents('abc'), null, 'alphabetic');
  assertEqual(parsePriceToCents('12.345'), null, 'too many decimals');
  assertEqual(parsePriceToCents('.'), null, 'lone decimal');
});

runTest('calculateTotalInCents avoids IEEE 754 floating-point drift', () => {
  const tenCents = parsePriceToCents('0.10');
  const twentyCents = parsePriceToCents('0.20');
  const total = calculateTotalInCents([
    { priceInCents: tenCents },
    { priceInCents: twentyCents },
  ]);
  assertEqual(total, 30, '0.10 + 0.20 in cents');
  assertEqual(formatCurrency(total), '$0.30', 'formatted $0.30');
});

runTest('validateReceiptForm passes for a valid Cafe Kumbuk receipt', () => {
  const result = validateReceiptForm({
    merchant: 'Cafe Kumbuk',
    date: 'Nov 24, 2026',
    items: [
      { id: '1', name: 'Avocado toast', priceInput: '14.00', priceInCents: 1400 },
      { id: '2', name: 'Cappuccino', priceInput: '6.50', priceInCents: 650 },
      { id: '3', name: 'Banana pancakes', priceInput: '8.00', priceInCents: 800 },
    ],
  });

  assertEqual(result.isValid, true, 'valid receipt');
  assertEqual(result.totalInCents, 2850, 'total $28.50');
});

runTest('validateReceiptForm blocks empty merchant, empty item, invalid price, zero total, and no items', () => {
  const emptyMerchant = validateReceiptForm({
    merchant: '   ',
    date: 'Nov 24, 2026',
    items: [{ id: '1', name: 'Coffee', priceInput: '5.00', priceInCents: 500 }],
  });
  assertEqual(emptyMerchant.isValid, false, 'empty merchant blocked');
  assertTruthy(emptyMerchant.errors.merchant, 'merchant error present');

  const emptyItem = validateReceiptForm({
    merchant: 'Cafe Kumbuk',
    date: 'Nov 24, 2026',
    items: [{ id: '1', name: '', priceInput: '5.00', priceInCents: 500 }],
  });
  assertEqual(emptyItem.isValid, false, 'empty item blocked');
  assertTruthy(emptyItem.errors.itemNames['1'], 'item name error present');

  const badPrice = validateReceiptForm({
    merchant: 'Cafe Kumbuk',
    date: 'Nov 24, 2026',
    items: [{ id: '1', name: 'Coffee', priceInput: '-2.00', priceInCents: null }],
  });
  assertEqual(badPrice.isValid, false, 'negative price blocked');
  assertTruthy(badPrice.errors.itemPrices['1'], 'item price error present');

  const noItems = validateReceiptForm({
    merchant: 'Cafe Kumbuk',
    date: 'Nov 24, 2026',
    items: [],
  });
  assertEqual(noItems.isValid, false, 'empty items blocked');
  assertTruthy(noItems.errors.general, 'general error present for 0 items');

  const zeroTotal = validateReceiptForm({
    merchant: 'Cafe Kumbuk',
    date: 'Nov 24, 2026',
    items: [{ id: '1', name: 'Free sample', priceInput: '0.00', priceInCents: 0 }],
  });
  assertEqual(zeroTotal.isValid, false, 'zero total blocked');
  assertTruthy(zeroTotal.errors.general, 'general error present for $0.00');
});

console.log(`\nAll ${passed} tests passed.`);
