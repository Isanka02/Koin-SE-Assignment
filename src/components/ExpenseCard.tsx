import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { COLORS, SPACING, TABULAR_NUMS_STYLE } from '../constants/theme';
import { Expense } from '../types/expense';
import { formatCurrency } from '../utils/currency';
import { CategoryBadge } from './CategoryBadge';

interface ExpenseCardProps {
  expense: Expense;
  showDivider?: boolean;
}

export function ExpenseCard({ expense, showDivider = true }: ExpenseCardProps) {
  return (
    <View style={[styles.row, showDivider && styles.divider]}>
      <CategoryBadge category={expense.category} />

      <View style={styles.details}>
        <Text style={styles.merchant} numberOfLines={1}>
          {expense.merchant}
        </Text>
        <Text style={styles.date} numberOfLines={1}>
          {expense.date}
        </Text>
      </View>

      <Text style={[styles.amount, TABULAR_NUMS_STYLE]}>
        {formatCurrency(expense.amountInCents)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md + 2,
  },
  divider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.divider,
  },
  details: {
    flex: 1,
    marginLeft: SPACING.md,
    marginRight: SPACING.sm,
  },
  merchant: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  date: {
    fontSize: 12.5,
    color: COLORS.textSecondary,
  },
  amount: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
});
