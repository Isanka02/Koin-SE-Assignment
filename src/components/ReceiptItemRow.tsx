import React from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  COLORS,
  RADIUS,
  SPACING,
  TABULAR_NUMS_STYLE,
} from '../constants/theme';
import { EditableReceiptItem } from '../types/expense';

interface ReceiptItemRowProps {
  item: EditableReceiptItem;
  showDivider?: boolean;
  nameError?: string;
  priceError?: string;
  onChangeName: (id: string, name: string) => void;
  onChangePrice: (id: string, priceText: string) => void;
  onDelete: (id: string) => void;
}

export function ReceiptItemRow({
  item,
  showDivider = true,
  nameError,
  priceError,
  onChangeName,
  onChangePrice,
  onDelete,
}: ReceiptItemRowProps) {
  const hasPriceFormatError =
    Boolean(priceError) ||
    (item.priceInput.trim().length > 0 && item.priceInCents === null);

  return (
    <View style={[styles.wrapper, showDivider && styles.divider]}>
      <View style={styles.row}>
        <TextInput
          style={[styles.nameInput, nameError ? styles.nameInputError : null]}
          value={item.name}
          onChangeText={(text) => onChangeName(item.id, text)}
          placeholder="Item name"
          placeholderTextColor={COLORS.textMuted}
        />

        <View
          style={[
            styles.priceBox,
            hasPriceFormatError ? styles.priceBoxError : null,
          ]}
        >
          <Text style={styles.currencyPrefix}>$</Text>
          <TextInput
            style={[styles.priceInput, TABULAR_NUMS_STYLE]}
            value={item.priceInput}
            onChangeText={(text) => onChangePrice(item.id, text)}
            placeholder="0.00"
            placeholderTextColor={COLORS.textMuted}
            keyboardType="decimal-pad"
            selectTextOnFocus
          />
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.deleteButton,
            pressed && styles.deletePressed,
          ]}
          onPress={() => onDelete(item.id)}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={`Delete ${item.name || 'item'}`}
        >
          <Ionicons
            name="trash-outline"
            size={19}
            color={COLORS.textSecondary}
          />
        </Pressable>
      </View>

      {nameError || priceError ? (
        <View style={styles.errorContainer}>
          {nameError ? <Text style={styles.errorText}>{nameError}</Text> : null}
          {priceError ? (
            <Text style={styles.errorText}>{priceError}</Text>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingVertical: SPACING.md,
  },
  divider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#DFD9CC',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm + 2,
  },
  nameInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.textPrimary,
    paddingVertical: 6,
    paddingRight: SPACING.xs,
  },
  nameInputError: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.danger,
  },
  priceBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.sm + 2,
    height: 40,
    minWidth: 102,
    justifyContent: 'space-between',
  },
  priceBoxError: {
    borderColor: COLORS.danger,
    backgroundColor: COLORS.dangerSoft,
  },
  currencyPrefix: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textSecondary,
    marginRight: 4,
  },
  priceInput: {
    flex: 1,
    fontSize: 14.5,
    fontWeight: '600',
    color: COLORS.textPrimary,
    textAlign: 'right',
    paddingVertical: 0,
  },
  deleteButton: {
    padding: 4,
  },
  deletePressed: {
    opacity: 0.5,
  },
  errorContainer: {
    marginTop: 4,
    gap: 2,
  },
  errorText: {
    fontSize: 12,
    color: COLORS.danger,
    fontWeight: '500',
  },
});
