# Koin Expenses

Receipt Scan & Expense Review Flow built with **React Native**, **Expo (SDK 58)**, and **TypeScript**.

---

## Preview & Demo

- **Demo Video (iOS & Android):** 

- iOS demo link: https://drive.google.com/file/d/1TPZggizvXITCzN5ynMiyA6GaJtCcrdrI/view?usp=sharing

-Android demo link: https://drive.google.com/file/d/1CL5fJ0lQFegumBzVtEzAIIRKYnWCjD82/view?usp=sharing


- **Expo Go / EAS Preview Link:** 
Update details page URL: https://expo.dev/preview/update?message=Koin+Expenses+preview&updateRuntimeVersion=1.0.0&createdAt=2026-11-26T08%3A29%3A19.557Z&slug=exp&projectId=afcf1f5e-b63b-433a-9333-93f2de622c4f&group=42632ffc-f2e9-4264-a5be-0c56c6c9e0cc

![Preview QR code](./assets/expo-qr.png)

---

## Features

- **Expenses Overview (`ExpensesScreen`)**: Warm cream canvas (`#F4F1EA`), header with `KOIN` branding and `+ Scan Bill` pill CTA, dashed-border receipt upload card (`Camera` & `Gallery`), `Recent Activity` feed with pastel category badges and `tabular-nums` currency alignment, and bottom navigation bar.
- **Receipt Capture & Upload**: Uses `expo-image-picker` for both device Camera and Photo Gallery with friendly permission-denial alerts.
- **Scanning State**: Displays an uploaded receipt preview and loading state while extraction runs.
- **Interactive Receipt Review (`ReviewReceiptScreen`)**:
  - Top bar with back navigation and scanned receipt thumbnail.
  - Editable **Merchant Name**, **Date**, and **Category** dropdown modal.
  - Editable line items (name and `$` price), trash delete per row, and **+ Add Item**.
  - **Real-time Dynamic Total**: Automatically recalculated from current line items using `useMemo` and integer-cents arithmetic.
  - **Input Validation**: Blocks empty merchant names, empty dates, empty item names, invalid/negative prices, empty item lists, and `$0.00` totals with clear inline error feedback.
  - **Mobile UX Polish**: `KeyboardAvoidingView`, `keyboardShouldPersistTaps="handled"`, and `SafeAreaView` across iOS and Android.

---

## Tech Stack

- **React Native** (`0.88.1`) & **React** (`19.3.0`)
- **Expo** (`~58.0.26`)
- **TypeScript** (`~6.0.3`, strict mode)
- **Expo Image Picker** (`expo-image-picker`)
- **Safe Area Context** (`react-native-safe-area-context`)
- **Vector Icons** (`@expo/vector-icons`)

---

## Project Architecture

```text
KoinExpenses/
├── src/
│   ├── components/
│   │   ├── BottomNavigation.tsx     # Safe-area-aware 4-tab navigation bar
│   │   ├── CategoryBadge.tsx        # Pastel category icon badges
│   │   ├── ExpenseCard.tsx          # Recent Activity transaction row
│   │   ├── ReceiptItemRow.tsx       # Editable line item row with validation state
│   │   ├── ReceiptSummaryCard.tsx   # Merchant, Date, and Category modal picker
│   │   └── ScanningModal.tsx        # Image preview + scanning loader overlay
│   ├── constants/
│   │   └── theme.ts                 # Palette, spacing, radii, and tabular-nums style
│   ├── data/
│   │   └── initialExpenses.ts       # Sample expenses and simulated receipt presets
│   ├── screens/
│   │   ├── ExpensesScreen.tsx       # Screen 1: Upload / Snap + Recent Activity
│   │   └── ReviewReceiptScreen.tsx  # Screen 2: Edit, validate, and confirm receipt
│   ├── services/
│   │   └── receiptExtractionService.ts  # Simulated receipt extraction service
│   ├── types/
│   │   └── expense.ts               # Core TypeScript domain models
│   └── utils/
│       ├── currency.ts              # Integer-cents formatting & strict parsing
│       ├── validation.ts            # Receipt form validation rules
│       └── __tests__/
│           └── receiptLogic.test.ts # Unit tests for currency math & validation
├── App.tsx
├── app.json
└── package.json
```

### Key Architectural Choices

1. **Integer-Cents Currency Math (`src/utils/currency.ts`)**: All monetary amounts are stored and summed as integer cents (`priceInCents`, `amountInCents`) rather than IEEE 754 floats, preventing drift such as `0.1 + 0.2 = 0.30000000000000004`.
2. **Strict Price Parsing**: `parsePriceToCents` returns `null` for malformed inputs (empty strings, negatives, non-numeric text, >2 decimals) instead of silently coercing them to `0`.
3. **Derived Total State**: `ReviewReceiptScreen` computes `totalInCents` via `useMemo` directly from the `items` array, ensuring the total can never drift out of sync with edits, additions, or deletions.
4. **Decoupled Extraction Service (`src/services/receiptExtractionService.ts`)**: Simulates OCR/parsing behind a typed async boundary so a production vision/OCR backend can be swapped in without modifying UI components.

---

## Setup & Running Locally

```bash
# 1. Install dependencies
npm install

# 2. Run TypeScript check and unit tests
npm run typecheck
npm test

# 3. Start Expo Go dev server
npx expo start
```

- **iOS**: Scan the QR code using the iPhone Camera app and open in **Expo Go** (sign in to the same Expo account on Expo CLI and Expo Go if prompted).
- **Android**: Scan the QR code inside the **Expo Go** app.
- *(If local LAN blocks the phone from reaching Metro, run `npx expo start --tunnel`.)*

---

## AI Tooling Notes

This project was built using **Antigravity** as an AI-native engineering assistant within a 3–4 hour timebox:
- **Incremental Scaffolding**: Built and tested step-by-step (foundation types/math/validation -> `ExpensesScreen` -> `ReviewReceiptScreen` -> unit tests) rather than generating the entire app in one shot.
- **Debugging & Verification**:
  - Caught and resolved a React 19 / React Native 0.88 TypeScript ref typing change (`ComponentRef<typeof TextInput>`) via `tsc --noEmit`.
  - Diagnosed a Metro asset-resolution failure (`Fontisto.ttf` not found after installing `@expo/vector-icons` while Metro was running) and fixed it with `npx expo start -c`.
  - Evaluated live Gemini Vision integration (`HTTP 403` free-tier restriction on the test project) and intentionally kept the app cleanly scoped to simulated extraction so reviewers can run it immediately with zero API keys or billing setup.
- **Manual & Automated Testing**: Verified integer-cents edge cases, empty/negative/invalid inputs, real-time total recalculation, and camera/gallery flows on physical devices.

---

## Known Limitations

- **Simulated Extraction**: `receiptExtractionService.ts` returns realistic sample receipt presets after a simulated delay rather than performing live OCR on the image pixels.
- **In-Memory State**: Newly saved expenses are stored in React state (`App.tsx`) and reset when the app restarts.
- **Focused Scope**: `Home`, `Insights`, and `Profile` tabs in the bottom navigation display a lightweight notice, keeping the implementation focused on the Receipt Scan & Expense Review flow.
