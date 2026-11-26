import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SPACING } from '../constants/theme';
import { BottomTabKey } from '../types/expense';

interface BottomNavigationProps {
  activeTab: BottomTabKey;
  onSelectTab: (tab: BottomTabKey) => void;
}

const TABS: Array<{
  key: BottomTabKey;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  activeIcon: keyof typeof Ionicons.glyphMap;
}> = [
  { key: 'home', label: 'Home', icon: 'home-outline', activeIcon: 'home' },
  {
    key: 'expenses',
    label: 'Expenses',
    icon: 'receipt-outline',
    activeIcon: 'receipt',
  },
  {
    key: 'insights',
    label: 'Insights',
    icon: 'bar-chart-outline',
    activeIcon: 'bar-chart',
  },
  {
    key: 'profile',
    label: 'Profile',
    icon: 'person-outline',
    activeIcon: 'person',
  },
];

export function BottomNavigation({
  activeTab,
  onSelectTab,
}: BottomNavigationProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        { paddingBottom: Math.max(insets.bottom, SPACING.sm) },
      ]}
    >
      {TABS.map((tab) => {
        const isActive = tab.key === activeTab;
        const color = isActive ? COLORS.emeraldDark : COLORS.textSecondary;

        return (
          <Pressable
            key={tab.key}
            style={({ pressed }) => [styles.tab, pressed && styles.tabPressed]}
            onPress={() => onSelectTab(tab.key)}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
          >
            <Ionicons
              name={isActive ? tab.activeIcon : tab.icon}
              size={22}
              color={color}
            />
            <Text style={[styles.label, { color }, isActive && styles.labelActive]}>
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
    paddingTop: SPACING.sm + 2,
    paddingHorizontal: SPACING.sm,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xs,
    gap: 4,
  },
  tabPressed: {
    opacity: 0.7,
  },
  label: {
    fontSize: 11,
    fontWeight: '500',
  },
  labelActive: {
    fontWeight: '700',
  },
});
