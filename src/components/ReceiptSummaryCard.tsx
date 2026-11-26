import React, { ComponentRef, useRef, useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, SPACING } from '../constants/theme';
import { EXPENSE_CATEGORIES, ExpenseCategory } from '../types/expense';

interface ReceiptSummaryCardProps {
  merchant: string;
  date: string;
  category: ExpenseCategory;
  merchantError?: string;
  dateError?: string;
  onChangeMerchant: (value: string) => void;
  onChangeDate: (value: string) => void;
  onChangeCategory: (category: ExpenseCategory) => void;
}

export function ReceiptSummaryCard({
  merchant,
  date,
  category,
  merchantError,
  dateError,
  onChangeMerchant,
  onChangeDate,
  onChangeCategory,
}: ReceiptSummaryCardProps) {
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const merchantInputRef = useRef<ComponentRef<typeof TextInput>>(null);
  const dateInputRef = useRef<ComponentRef<typeof TextInput>>(null);

  return (
    <View style={styles.card}>
      {/* Merchant Name */}
      <Text style={styles.fieldLabel}>Merchant Name</Text>
      <View
        style={[
          styles.merchantRow,
          merchantError ? styles.inputRowError : null,
        ]}
      >
        <TextInput
          ref={merchantInputRef}
          style={styles.merchantInput}
          value={merchant}
          onChangeText={onChangeMerchant}
          placeholder="Enter merchant name"
          placeholderTextColor={COLORS.textMuted}
          returnKeyType="next"
          onSubmitEditing={() => dateInputRef.current?.focus()}
        />
        <Pressable
          onPress={() => merchantInputRef.current?.focus()}
          hitSlop={8}
          accessibilityLabel="Edit merchant name"
        >
          <Ionicons
            name="pencil-outline"
            size={18}
            color={COLORS.textSecondary}
          />
        </Pressable>
      </View>
      {merchantError ? (
        <Text style={styles.errorText}>{merchantError}</Text>
      ) : null}

      <View style={styles.divider} />

      {/* Date & Category Row */}
      <View style={styles.metaRow}>
        <View style={styles.dateColumn}>
          <Text style={styles.fieldLabel}>Date</Text>
          <View style={styles.dateInputRow}>
            <TextInput
              ref={dateInputRef}
              style={styles.dateInput}
              value={date}
              onChangeText={onChangeDate}
              placeholder="Nov 24, 2026"
              placeholderTextColor={COLORS.textMuted}
            />
            <Pressable
              onPress={() => dateInputRef.current?.focus()}
              hitSlop={8}
              accessibilityLabel="Edit date"
            >
              <Ionicons
                name="calendar-outline"
                size={17}
                color={COLORS.textSecondary}
              />
            </Pressable>
          </View>
          {dateError ? <Text style={styles.errorText}>{dateError}</Text> : null}
        </View>

        <View style={styles.categoryColumn}>
          <Text style={styles.fieldLabel}>Category</Text>
          <Pressable
            style={({ pressed }) => [
              styles.categoryPill,
              pressed && styles.pressed,
            ]}
            onPress={() => setCategoryModalVisible(true)}
            accessibilityRole="button"
            accessibilityLabel="Select category"
          >
            <Text style={styles.categoryPillText} numberOfLines={1}>
              {category}
            </Text>
            <Ionicons
              name="chevron-down"
              size={14}
              color={COLORS.emeraldDark}
            />
          </Pressable>
        </View>
      </View>

      {/* Category Picker Modal */}
      <Modal
        visible={categoryModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setCategoryModalVisible(false)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setCategoryModalVisible(false)}
        >
          <Pressable style={styles.modalCard} onPress={() => {}}>
            <Text style={styles.modalTitle}>Select Category</Text>
            {EXPENSE_CATEGORIES.map((option) => {
              const selected = option === category;
              return (
                <Pressable
                  key={option}
                  style={[
                    styles.categoryOption,
                    selected && styles.categoryOptionSelected,
                  ]}
                  onPress={() => {
                    onChangeCategory(option);
                    setCategoryModalVisible(false);
                  }}
                >
                  <Text
                    style={[
                      styles.categoryOptionText,
                      selected && styles.categoryOptionTextSelected,
                    ]}
                  >
                    {option}
                  </Text>
                  {selected ? (
                    <Ionicons
                      name="checkmark"
                      size={18}
                      color={COLORS.emeraldDark}
                    />
                  ) : null}
                </Pressable>
              );
            })}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.lg + 2,
    marginBottom: SPACING.xxl,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  merchantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING.sm,
  },
  inputRowError: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.danger,
    paddingBottom: 2,
  },
  merchantInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
    paddingVertical: 2,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.divider,
    marginVertical: SPACING.md + 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: SPACING.md,
  },
  dateColumn: {
    flex: 1,
  },
  dateInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateInput: {
    flexShrink: 1,
    fontSize: 14.5,
    fontWeight: '600',
    color: COLORS.textPrimary,
    paddingVertical: 4,
  },
  categoryColumn: {
    alignItems: 'flex-start',
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.emeraldSoft,
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: RADIUS.pill,
    gap: 4,
  },
  categoryPillText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.emeraldDark,
  },
  pressed: {
    opacity: 0.75,
  },
  errorText: {
    fontSize: 12,
    color: COLORS.danger,
    marginTop: 4,
    fontWeight: '500',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  modalCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.md,
  },
  categoryOptionSelected: {
    backgroundColor: COLORS.emeraldSoft,
  },
  categoryOptionText: {
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.textPrimary,
  },
  categoryOptionTextSelected: {
    fontWeight: '700',
    color: COLORS.emeraldDark,
  },
});
