export const COLORS = {
  background: '#F4F1EA',
  card: '#FFFFFF',
  cardMuted: '#EFECE4',
  border: '#E6E1D6',
  divider: '#EFECE6',
  textPrimary: '#0F172A',
  textSecondary: '#64748B',
  textMuted: '#94A3B8',
  emerald: '#10B981',
  emeraldDark: '#059669',
  emeraldSoft: '#DCFCE7',
  emeraldBorder: '#A7F3D0',
  danger: '#EF4444',
  dangerSoft: '#FEE2E2',
  white: '#FFFFFF',
  overlay: 'rgba(15, 23, 42, 0.45)',
} as const;

export const CATEGORY_STYLES = {
  'Food & Dining': {
    bg: '#DDF7EC',
    iconColor: '#059669',
    iconName: 'cafe-outline',
  },
  Groceries: {
    bg: '#EFE7FE',
    iconColor: '#7C3AED',
    iconName: 'basket-outline',
  },
  Transport: {
    bg: '#E5EEFE',
    iconColor: '#2563EB',
    iconName: 'car-outline',
  },
  Shopping: {
    bg: '#FDEEDB',
    iconColor: '#D97706',
    iconName: 'bag-handle-outline',
  },
  Utilities: {
    bg: '#E0F2FE',
    iconColor: '#0284C7',
    iconName: 'flash-outline',
  },
  Other: {
    bg: '#F1F5F9',
    iconColor: '#475569',
    iconName: 'receipt-outline',
  },
} as const;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
} as const;

export const RADIUS = {
  sm: 10,
  md: 14,
  lg: 18,
  xl: 22,
  pill: 999,
} as const;

export const TABULAR_NUMS_STYLE = {
  fontVariant: ['tabular-nums'] as ('tabular-nums')[],
};
