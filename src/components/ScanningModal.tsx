import React from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, SPACING } from '../constants/theme';

interface ScanningModalProps {
  visible: boolean;
  imageUri: string | null;
}

export function ScanningModal({ visible, imageUri }: ScanningModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.backdrop}>
        <View style={styles.card}>
          {imageUri ? (
            <View style={styles.previewWrapper}>
              <Image
                source={{ uri: imageUri }}
                style={styles.previewImage}
                resizeMode="cover"
              />
              <View style={styles.scanBadge}>
                <Ionicons name="sparkles" size={14} color={COLORS.emeraldDark} />
                <Text style={styles.scanBadgeText}>Scanning receipt</Text>
              </View>
            </View>
          ) : null}

          <ActivityIndicator
            size="large"
            color={COLORS.emerald}
            style={styles.spinner}
          />
          <Text style={styles.title}>Extracting Expense Details</Text>
          <Text style={styles.subtitle}>
            Reading merchant, date, and line items...
          </Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    alignItems: 'center',
  },
  previewWrapper: {
    width: '100%',
    height: 190,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    backgroundColor: COLORS.cardMuted,
    marginBottom: SPACING.lg,
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  scanBadge: {
    position: 'absolute',
    bottom: SPACING.sm,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.emeraldSoft,
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: RADIUS.pill,
  },
  scanBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.emeraldDark,
  },
  spinner: {
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});
