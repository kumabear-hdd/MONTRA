export type TransactionType = 'income' | 'expense';

export type ExpenseCategory =
  | 'Food & Drinks'
  | 'Transportation'
  | 'Shopping'
  | 'Bills & Utilities'
  | 'Education'
  | 'Health'
  | 'Entertainment'
  | 'Housing'
  | 'Other Expenses';

export type IncomeCategory =
  | 'Salary'
  | 'Pocket Money'
  | 'Freelance'
  | 'Business'
  | 'Affiliate Income'
  | 'Gifts'
  | 'Other Income';

export type TransactionCategory = ExpenseCategory | IncomeCategory;

export interface Transaction {
  id: string;
  type: TransactionType;
  title: string;
  amount: number; // Stored as positive integer in local currency units
  category: TransactionCategory;
  date: string; // YYYY-MM-DD
  notes?: string;
  createdAt: number;
  updatedAt: number;
  synced?: boolean;
}

export interface Budget {
  id: string;
  month: string; // YYYY-MM
  category: ExpenseCategory | 'Total';
  amount: number;
  updatedAt: number;
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string; // YYYY-MM-DD
  category?: string;
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

export interface SavingsLog {
  id: string;
  goalId: string;
  type: 'deposit' | 'withdraw';
  amount: number;
  date: string; // YYYY-MM-DD
  notes?: string;
  createdAt: number;
}

export type CurrencyCode = 'IDR' | 'USD' | 'EUR' | 'GBP' | 'SGD' | 'JPY';

export interface AppSettings {
  openingBalance: number;
  currency: CurrencyCode;
  defaultPeriod: 'today' | 'this_week' | 'this_month' | 'all';
  timezone: string;
  hasInitializedSeed?: boolean;
}

export type ViewTab = 'dashboard' | 'transactions' | 'budgets' | 'savings' | 'reports' | 'settings';

export type DateFilterPreset = 'today' | 'this_week' | 'this_month' | 'this_year' | 'all' | 'custom';
