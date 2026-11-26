import React, { useState } from 'react';
import {
  Alert,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BottomNavigation } from '../components/BottomNavigation';
import { ExpenseCard } from '../components/ExpenseCard';
import { ScanningModal } from '../components/ScanningModal';
import { COLORS, RADIUS, SPACING } from '../constants/theme';
import { extractReceiptFromImage } from '../services/receiptExtractionService';
import {
  BottomTabKey,
  Expense,
  ExtractedReceipt,
} from '../types/expense';

interface ExpensesScreenProps {
  expenses: Expense[];
  successMessage: string | null;
  onDismissSuccess: () => void;
  onReceiptExtracted: (receipt: ExtractedReceipt, imageUri: string) => void;
}

export function ExpensesScreen({
  expenses,
  successMessage,
  onDismissSuccess,
  onReceiptExtracted,
}: ExpensesScreenProps) {
  const [activeTab, setActiveTab] = useState<BottomTabKey>('expenses');
  const [scanningImageUri, setScanningImageUri] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  const processReceiptImage = async (imageUri: string) => {
    setScanningImageUri(imageUri);
    setIsScanning(true);
    try {
      const extracted = await extractReceiptFromImage(imageUri);
      onReceiptExtracted(extracted, imageUri);
    } catch {
      Alert.alert(
        'Extraction Failed',
        'Could not process this receipt image. Please try again.'
      );
    } finally {
      setIsScanning(false);
      setScanningImageUri(null);
    }
  };

  const handleOpenGallery = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        'Photo Library Access Needed',
        'Please allow photo library access in your device settings to upload a receipt.'
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 0.8,
    });

    const asset = !result.canceled ? result.assets[0] : undefined;
    if (asset?.uri) {
      await processReceiptImage(asset.uri);
    }
  };

  const handleOpenCamera = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        'Camera Access Needed',
        'Please allow camera access in your device settings to snap a receipt.'
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: false,
      quality: 0.8,
    });

    const asset = !result.canceled ? result.assets[0] : undefined;
    if (asset?.uri) {
      await processReceiptImage(asset.uri);
    }
  };

  const handleScanBillPress = () => {
    Alert.alert('Scan a Bill', 'Choose how you want to add your receipt:', [
      { text: 'Camera', onPress: handleOpenCamera },
      { text: 'Gallery', onPress: handleOpenGallery },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handleTabPress = (tab: BottomTabKey) => {
    if (tab !== 'expenses') {
      Alert.alert(
        'Expenses Flow Active',
        'This prototype focuses on Receipt Scan & Expense Review.'
      );
      return;
    }
    setActiveTab(tab);
  };

  const renderHeader = () => (
    <View>
      {/* Top Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.brandEyebrow}>KOIN</Text>
          <Text style={styles.screenTitle}>Expenses</Text>
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.scanButton,
            pressed && styles.pressed,
          ]}
          onPress={handleScanBillPress}
          accessibilityRole="button"
          accessibilityLabel="Scan Bill"
        >
          <Ionicons name="add" size={18} color={COLORS.textPrimary} />
          <Text style={styles.scanButtonText}>Scan Bill</Text>
        </Pressable>
      </View>

      {/* Save Confirmation Banner */}
      {successMessage ? (
        <Pressable style={styles.successBanner} onPress={onDismissSuccess}>
          <Ionicons
            name="checkmark-circle"
            size={18}
            color={COLORS.emeraldDark}
          />
          <Text style={styles.successText}>{successMessage}</Text>
          <Ionicons name="close" size={16} color={COLORS.emeraldDark} />
        </Pressable>
      ) : null}

      {/* Upload / Snap Receipt Card */}
      <View style={styles.uploadCard}>
        <View style={styles.uploadIconBadge}>
          <Ionicons
            name="receipt-outline"
            size={24}
            color={COLORS.emeraldDark}
          />
        </View>

        <Text style={styles.uploadTitle}>Upload or Snap a Bill</Text>
        <Text style={styles.uploadSubtitle}>Less typing. More living.</Text>

        <View style={styles.actionRow}>
          <Pressable
            style={({ pressed }) => [
              styles.actionButton,
              pressed && styles.actionButtonPressed,
            ]}
            onPress={handleOpenCamera}
            accessibilityRole="button"
            accessibilityLabel="Camera"
          >
            <Ionicons
              name="camera-outline"
              size={18}
              color={COLORS.textPrimary}
            />
            <Text style={styles.actionButtonText}>Camera</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.actionButton,
              pressed && styles.actionButtonPressed,
            ]}
            onPress={handleOpenGallery}
            accessibilityRole="button"
            accessibilityLabel="Gallery"
          >
            <Ionicons
              name="image-outline"
              size={18}
              color={COLORS.textPrimary}
            />
            <Text style={styles.actionButtonText}>Gallery</Text>
          </Pressable>
        </View>
      </View>

      {/* Recent Activity Section Header */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <Text style={styles.sectionPeriod}>This week</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <FlatList
        data={expenses}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <ExpenseCard
            expense={item}
            showDivider={index < expenses.length - 1}
          />
        )}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      <BottomNavigation activeTab={activeTab} onSelectTab={handleTabPress} />

      <ScanningModal visible={isScanning} imageUri={scanningImageUri} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  listContent: {
    paddingHorizontal: SPACING.xl,
    paddingTop: Platform.OS === 'android' ? SPACING.md : SPACING.xs,
    paddingBottom: SPACING.xxl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.xl,
  },
  brandEyebrow: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.4,
    color: COLORS.emeraldDark,
    marginBottom: 2,
  },
  screenTitle: {
    fontSize: 30,
    fontWeight: '700',
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.emerald,
    paddingHorizontal: SPACING.lg,
    paddingVertical: 11,
    borderRadius: RADIUS.pill,
    gap: 4,
  },
  scanButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  pressed: {
    opacity: 0.85,
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.emeraldSoft,
    borderWidth: 1,
    borderColor: COLORS.emeraldBorder,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 2,
    marginBottom: SPACING.lg,
    gap: SPACING.sm,
  },
  successText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.emeraldDark,
  },
  uploadCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.xl,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#9EDAC2',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.xxl + 4,
    alignItems: 'center',
    marginBottom: SPACING.xxl + 4,
  },
  uploadIconBadge: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.emeraldSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  uploadTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  uploadSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xl,
    textAlign: 'center',
  },
  actionRow: {
    flexDirection: 'row',
    width: '100%',
    gap: SPACING.md,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.cardMuted,
    height: 44,
    borderRadius: RADIUS.sm + 2,
    gap: SPACING.sm,
  },
  actionButtonPressed: {
    opacity: 0.75,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  sectionPeriod: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
});
