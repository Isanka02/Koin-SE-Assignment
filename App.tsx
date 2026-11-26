import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { INITIAL_EXPENSES } from './src/data/initialExpenses';
import { ExpensesScreen } from './src/screens/ExpensesScreen';
import { ReviewReceiptScreen } from './src/screens/ReviewReceiptScreen';
import { Expense, ExtractedReceipt } from './src/types/expense';
import { formatCurrency } from './src/utils/currency';

interface PendingReview {
  receipt: ExtractedReceipt;
  imageUri: string;
}

export default function App() {
  const [expenses, setExpenses] = useState<Expense[]>(INITIAL_EXPENSES);
  const [pendingReview, setPendingReview] = useState<PendingReview | null>(
    null
  );
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleReceiptExtracted = (
    receipt: ExtractedReceipt,
    imageUri: string
  ) => {
    setSuccessMessage(null);
    setPendingReview({ receipt, imageUri });
  };

  const handleConfirmSave = (newExpense: Expense) => {
    setExpenses((prev) => [newExpense, ...prev]);
    setPendingReview(null);
    setSuccessMessage(
      `Saved ${newExpense.merchant} (${formatCurrency(newExpense.amountInCents)})`
    );
  };

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      {pendingReview ? (
        <ReviewReceiptScreen
          initialReceipt={pendingReview.receipt}
          imageUri={pendingReview.imageUri}
          onBack={() => setPendingReview(null)}
          onConfirmSave={handleConfirmSave}
        />
      ) : (
        <ExpensesScreen
          expenses={expenses}
          successMessage={successMessage}
          onDismissSuccess={() => setSuccessMessage(null)}
          onReceiptExtracted={handleReceiptExtracted}
        />
      )}
    </SafeAreaProvider>
  );
}
