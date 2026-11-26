import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CATEGORY_STYLES, RADIUS } from '../constants/theme';
import { ExpenseCategory } from '../types/expense';

interface CategoryBadgeProps {
  category: ExpenseCategory;
  size?: number;
}

export function CategoryBadge({ category, size = 44 }: CategoryBadgeProps) {
  const style = CATEGORY_STYLES[category] ?? CATEGORY_STYLES.Other;

  return (
    <View
      style={[
        styles.badge,
        {
          width: size,
          height: size,
          borderRadius: RADIUS.md,
          backgroundColor: style.bg,
        },
      ]}
    >
      <Ionicons
        name={style.iconName as keyof typeof Ionicons.glyphMap}
        size={Math.round(size * 0.48)}
        color={style.iconColor}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
