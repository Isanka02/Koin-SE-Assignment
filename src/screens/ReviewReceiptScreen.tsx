import React, { useMemo, useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { ReceiptItemRow } from '../components/ReceiptItemRow';
import { ReceiptSummaryCard } from '../components/ReceiptSummaryCard';
import {
  COLORS,
  RADIUS,
  SPACING,
  TABULAR_NUMS_STYLE,
} from '../constants/theme';
import {
  EditableReceiptItem,
  Expense,
  ExpenseCategory,
  ExtractedReceipt,
  ReceiptItem,
} from '../types/expense';
import {
  calculateTotalInCents,
  formatCurrency,
  formatPriceInput,
  parsePriceToCents,
} from '../utils/currency';
import {
  ReceiptValidationErrors,
  validateReceiptForm,
} from '../utils/validation';

interface ReviewReceiptScreenProps {
  initialReceipt: ExtractedReceipt;
  imageUri?: string;
  onBack: () => void;
  onConfirmSave: (expense: Expense) => void;
}

const EMPTY_ERRORS: ReceiptValidationErrors = {
  itemNames: {},
  itemPrices: {},
};

export function ReviewReceiptScreen({
  initialReceipt,
  imageUri,
  onBack,
  onConfirmSave,
}: ReviewReceiptScreenProps) {
  const insets = useSafeAreaInsets();

  const [merchant, setMerchant] = useState(initialReceipt.merchant);
  const [date, setDate] = useState(initialReceipt.date);
  const [category, setCategory] = useState<ExpenseCategory>(
    initialReceipt.category
  );
  const [items, setItems] = useState<EditableReceiptItem[]>(() =>
    initialReceipt.items.map((item) => ({
      id: item.id,
      name: item.name,
      priceInput: formatPriceInput(item.priceInCents),
      priceInCents: item.priceInCents,
    }))
  );
  const [showErrors, setShowErrors] = useState(false);

  // Derived dynamically from current items so total never drifts out of sync.
  const totalInCents = useMemo(() => calculateTotalInCents(items), [items]);

  const validation = useMemo(
    () => validateReceiptForm({ merchant, date, items }),
    [merchant, date, items]
  );

  const activeErrors = showErrors ? validation.errors : EMPTY_ERRORS;

  const handleItemNameChange = (id: string, name: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, name } : item))
    );
  };

  const handleItemPriceChange = (id: string, priceInput: string) => {
    const parsedCents = parsePriceToCents(priceInput);
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, priceInput, priceInCents: parsedCents }
          : item
      )
    );
  };

  const handleDeleteItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleAddItem = () => {
    const newId = `item-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    setItems((prev) => [
      ...prev,
      {
        id: newId,
        name: '',
        priceInput: '0.00',
        priceInCents: 0,
      },
    ]);
  };

  const handleConfirm = () => {
    setShowErrors(true);
    if (!validation.isValid) {
      return;
    }

    const finalizedItems: ReceiptItem[] = items.map((item) => ({
      id: item.id,
      name: item.name.trim(),
      priceInCents: parsePriceToCents(item.priceInput) ?? 0,
    }));

    const newExpense: Expense = {
      id: `exp-${Date.now()}`,
      merchant: merchant.trim(),
      date: date.trim(),
      amountInCents: calculateTotalInCents(finalizedItems),
      category,
      receiptUri: imageUri,
      items: finalizedItems,
    };

    onConfirmSave(newExpense);
  };

  const itemCountLabel = `${items.length} ${
    items.length === 1 ? 'item' : 'items'
  }`;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Top Bar */}
        <View style={styles.topBar}>
          <Pressable
            style={({ pressed }) => [
              styles.backButton,
              pressed && styles.pressed,
            ]}
            onPress={onBack}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel="Back to expenses"
          >
            <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
          </Pressable>

          <Text style={styles.headerTitle}>Review Receipt</Text>

          <View style={styles.thumbnailFrame}>
            {imageUri ? (
              <Image
                source={{ uri: imageUri }}
                style={styles.thumbnailImage}
                resizeMode="cover"
              />
            ) : (
              <Ionicons name="receipt-outline" size={20} color={COLORS.white} />
            )}
          </View>
        </View>

        {/* Scrollable Form */}
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <ReceiptSummaryCard
            merchant={merchant}
            date={date}
            category={category}
            merchantError={activeErrors.merchant}
            dateError={activeErrors.date}
            onChangeMerchant={setMerchant}
            onChangeDate={setDate}
            onChangeCategory={setCategory}
          />

          {/* Extracted Items Header */}
          <View style={styles.itemsHeader}>
            <Text style={styles.itemsHeading}>Extracted Items</Text>
            <Text style={styles.itemsCount}>{itemCountLabel}</Text>
          </View>

          {activeErrors.general ? (
            <View style={styles.generalErrorBanner}>
              <Ionicons
                name="alert-circle"
                size={18}
                color={COLORS.danger}
              />
              <Text style={styles.generalErrorText}>
                {activeErrors.general}
              </Text>
            </View>
          ) : null}

          {items.map((item, index) => (
            <ReceiptItemRow
              key={item.id}
              item={item}
              showDivider={index < items.length - 1}
              nameError={activeErrors.itemNames[item.id]}
              priceError={activeErrors.itemPrices[item.id]}
              onChangeName={handleItemNameChange}
              onChangePrice={handleItemPriceChange}
              onDelete={handleDeleteItem}
            />
          ))}

          <Pressable
            style={({ pressed }) => [
              styles.addItemButton,
              pressed && styles.pressed,
            ]}
            onPress={handleAddItem}
            accessibilityRole="button"
            accessibilityLabel="Add Item"
          >
            <Ionicons name="add" size={20} color={COLORS.emeraldDark} />
            <Text style={styles.addItemText}>Add Item</Text>
          </Pressable>

          <View style={styles.helperNoteRow}>
            <Ionicons
              name="checkmark"
              size={14}
              color={COLORS.textSecondary}
            />
            <Text style={styles.helperNoteText}>
              All set? Give your items a quick check.
            </Text>
          </View>
        </ScrollView>

        {/* Sticky Bottom Summary & Confirm Bar */}
        <View
          style={[
            styles.stickyFooter,
            { paddingBottom: Math.max(insets.bottom, SPACING.lg) },
          ]}
        >
          <View style={styles.totalRow}>
            <View>
              <Text style={styles.totalLabel}>Total Amount</Text>
              <Text style={[styles.totalValue, TABULAR_NUMS_STYLE]}>
                {formatCurrency(totalInCents)}
              </Text>
            </View>

            <View style={styles.footerItemBadge}>
              <Ionicons
                name="checkmark"
                size={15}
                color={COLORS.emeraldDark}
              />
              <Text style={styles.footerItemText}>{itemCountLabel}</Text>
            </View>
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.confirmButton,
              pressed && styles.pressed,
            ]}
            onPress={handleConfirm}
            accessibilityRole="button"
            accessibilityLabel="Confirm and Save Expense"
          >
            <Ionicons name="checkmark" size={19} color={COLORS.textPrimary} />
            <Text style={styles.confirmButtonText}>
              Confirm & Save Expense
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  flex: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingTop: Platform.OS === 'android' ? SPACING.md : SPACING.xs,
    paddingBottom: SPACING.md,
  },
  backButton: {
    marginRight: SPACING.md,
    padding: 4,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  thumbnailFrame: {
    width: 42,
    height: 42,
    borderRadius: RADIUS.sm,
    backgroundColor: '#33413B',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  scrollContent: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.xxl,
  },
  itemsHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  itemsHeading: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  itemsCount: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  generalErrorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.dangerSoft,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 2,
    marginTop: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  generalErrorText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.danger,
  },
  addItemButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: SPACING.md,
    gap: 6,
  },
  addItemText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.emeraldDark,
  },
  helperNoteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: SPACING.xs,
  },
  helperNoteText: {
    fontSize: 12.5,
    color: COLORS.textSecondary,
  },
  stickyFooter: {
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.lg,
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  totalLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  totalValue: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: -0.6,
  },
  footerItemBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingBottom: 6,
  },
  footerItemText: {
    fontSize: 13.5,
    fontWeight: '600',
    color: COLORS.emeraldDark,
  },
  confirmButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.emerald,
    height: 54,
    borderRadius: RADIUS.lg,
    gap: SPACING.sm,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  pressed: {
    opacity: 0.8,
  },
});
