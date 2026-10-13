import type { ExpenseCategory, IncomeCategory, TransactionCategory } from '../types/finance';

export interface CategoryInfo {
  name: TransactionCategory;
  type: 'income' | 'expense';
  iconName: string;
  color: string; // Hex color for charts
  bgClass: string;
  textClass: string;
}

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'Food & Drinks',
  'Transportation',
  'Shopping',
  'Bills & Utilities',
  'Education',
  'Health',
  'Entertainment',
  'Housing',
  'Other Expenses',
];

export const INCOME_CATEGORIES: IncomeCategory[] = [
  'Salary',
  'Pocket Money',
  'Freelance',
  'Business',
  'Affiliate Income',
  'Gifts',
  'Other Income',
];

export const CATEGORY_DETAILS: Record<TransactionCategory, CategoryInfo> = {
  // Expense Categories
  'Food & Drinks': {
    name: 'Food & Drinks',
    type: 'expense',
    iconName: 'Utensils',
    color: '#F97316', // Orange
    bgClass: 'bg-orange-50 text-orange-700 border-orange-200',
    textClass: 'text-orange-700',
  },
  Transportation: {
    name: 'Transportation',
    type: 'expense',
    iconName: 'Car',
    color: '#3B82F6', // Blue
    bgClass: 'bg-blue-50 text-blue-700 border-blue-200',
    textClass: 'text-blue-700',
  },
  Shopping: {
    name: 'Shopping',
    type: 'expense',
    iconName: 'ShoppingBag',
    color: '#EC4899', // Pink
    bgClass: 'bg-pink-50 text-pink-700 border-pink-200',
    textClass: 'text-pink-700',
  },
  'Bills & Utilities': {
    name: 'Bills & Utilities',
    type: 'expense',
    iconName: 'Zap',
    color: '#EAB308', // Amber/Yellow
    bgClass: 'bg-amber-50 text-amber-700 border-amber-200',
    textClass: 'text-amber-700',
  },
  Education: {
    name: 'Education',
    type: 'expense',
    iconName: 'GraduationCap',
    color: '#8B5CF6', // Purple
    bgClass: 'bg-purple-50 text-purple-700 border-purple-200',
    textClass: 'text-purple-700',
  },
  Health: {
    name: 'Health',
    type: 'expense',
    iconName: 'HeartPulse',
    color: '#EF4444', // Red
    bgClass: 'bg-red-50 text-red-700 border-red-200',
    textClass: 'text-red-700',
  },
  Entertainment: {
    name: 'Entertainment',
    type: 'expense',
    iconName: 'Film',
    color: '#06B6D4', // Cyan
    bgClass: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    textClass: 'text-cyan-700',
  },
  Housing: {
    name: 'Housing',
    type: 'expense',
    iconName: 'Home',
    color: '#64748B', // Slate
    bgClass: 'bg-slate-50 text-slate-700 border-slate-200',
    textClass: 'text-slate-700',
  },
  'Other Expenses': {
    name: 'Other Expenses',
    type: 'expense',
    iconName: 'MoreHorizontal',
    color: '#78716C', // Stone
    bgClass: 'bg-stone-100 text-stone-700 border-stone-200',
    textClass: 'text-stone-700',
  },

  // Income Categories
  Salary: {
    name: 'Salary',
    type: 'income',
    iconName: 'Briefcase',
    color: '#15803D', // Emerald Green
    bgClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    textClass: 'text-emerald-800',
  },
  'Pocket Money': {
    name: 'Pocket Money',
    type: 'income',
    iconName: 'Wallet',
    color: '#10B981', // Green
    bgClass: 'bg-green-50 text-green-700 border-green-200',
    textClass: 'text-green-700',
  },
  Freelance: {
    name: 'Freelance',
    type: 'income',
    iconName: 'Laptop',
    color: '#14B8A6', // Teal
    bgClass: 'bg-teal-50 text-teal-800 border-teal-200',
    textClass: 'text-teal-800',
  },
  Business: {
    name: 'Business',
    type: 'income',
    iconName: 'Building',
    color: '#059669', // Dark Emerald
    bgClass: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    textClass: 'text-emerald-900',
  },
  'Affiliate Income': {
    name: 'Affiliate Income',
    type: 'income',
    iconName: 'Share2',
    color: '#0D9488', // Teal Dark
    bgClass: 'bg-teal-100 text-teal-900 border-teal-300',
    textClass: 'text-teal-900',
  },
  Gifts: {
    name: 'Gifts',
    type: 'income',
    iconName: 'Gift',
    color: '#F43F5E', // Rose
    bgClass: 'bg-rose-50 text-rose-700 border-rose-200',
    textClass: 'text-rose-700',
  },
  'Other Income': {
    name: 'Other Income',
    type: 'income',
    iconName: 'Coins',
    color: '#4B5563', // Gray
    bgClass: 'bg-gray-100 text-gray-800 border-gray-200',
    textClass: 'text-gray-800',
  },
};
