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

// ----------------------------------------------------
// Multi-Space & Member Permissions Types
// ----------------------------------------------------

export type SpaceType = 'personal' | 'shared';

export type SpaceRole = 'owner' | 'admin' | 'member' | 'viewer';

export interface SpaceMember {
  id: string;
  spaceId: string;
  userId: string;
  name: string;
  email: string;
  role: SpaceRole;
  joinedAt: number;
}

export interface FinancialSpace {
  id: string;
  name: string;
  description?: string;
  icon: string; // Lucide icon name, e.g. 'Wallet', 'Home', 'Users', 'Briefcase', 'Palmtree'
  color: string; // Hex color code
  type: SpaceType;
  openingBalance: number; // Independent opening balance per space
  ownerId: string;
  ownerName: string;
  members: SpaceMember[];
  isArchived?: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface SpaceTransfer {
  id: string;
  sourceSpaceId: string;
  destSpaceId: string;
  amount: number;
  date: string; // YYYY-MM-DD
  description: string;
  createdById: string;
  createdByName: string;
  status: 'completed' | 'pending' | 'cancelled';
  createdAt: number;
}

export interface CurrentUser {
  id: string;
  name: string;
  email: string;
}

// ----------------------------------------------------
// Scoped Financial Records (Strict spaceId isolation)
// ----------------------------------------------------

export interface Transaction {
  id: string;
  spaceId: string; // Boundary: Every record strictly belongs to a specific space
  type: TransactionType;
  title: string;
  amount: number; // Stored as positive integer
  category: TransactionCategory;
  date: string; // YYYY-MM-DD
  notes?: string;
  memberId?: string; // Member who recorded/contributed (for shared spaces)
  memberName?: string;
  transferId?: string; // Linked inter-space transfer ID if applicable
  isTransfer?: boolean; // Excluded from external income/expense reports
  createdAt: number;
  updatedAt: number;
  synced?: boolean;
}

export interface Budget {
  id: string;
  spaceId: string;
  month: string; // YYYY-MM
  category: ExpenseCategory | 'Total';
  amount: number;
  updatedAt: number;
}

export interface SavingsGoal {
  id: string;
  spaceId: string;
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
  spaceId: string;
  goalId: string;
  type: 'deposit' | 'withdraw';
  amount: number;
  date: string; // YYYY-MM-DD
  notes?: string;
  memberId?: string;
  memberName?: string;
  createdAt: number;
}

export type CurrencyCode = 'IDR' | 'USD' | 'EUR' | 'GBP' | 'SGD' | 'JPY';

export interface AppSettings {
  currency: CurrencyCode;
  defaultPeriod: 'today' | 'this_week' | 'this_month' | 'all';
  timezone: string;
  activeSpaceId?: string;
  hasInitializedSeed?: boolean;
}

export type ViewTab =
  | 'overview' // Global Multi-Space Aggregate Overview
  | 'dashboard' // Active Space Live Dashboard
  | 'transactions' // Active Space Transactions
  | 'budgets' // Active Space Budgets
  | 'savings' // Active Space Savings Goals
  | 'reports' // Active Space Reports
  | 'spaces' // Manage Spaces (Create, Edit, Members, Archive)
  | 'settings'; // Global Preferences

export type DateFilterPreset = 'today' | 'this_week' | 'this_month' | 'this_year' | 'all' | 'custom';
