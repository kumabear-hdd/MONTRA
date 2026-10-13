import { useCallback, useEffect, useState } from 'react';
import { db, DEFAULT_SETTINGS, initializeBetaLaunchData, loadSampleDemoData } from '../db/db';
import type {
  AppSettings,
  Budget,
  CurrencyCode,
  DateFilterPreset,
  ExpenseCategory,
  SavingsGoal,
  SavingsLog,
  Transaction,
  TransactionType,
} from '../types/finance';
import { getCurrentMonthJakarta, getDateRangeForPreset, getTodayJakarta } from '../utils/date';

export function useFinanceData() {
  const [loading, setLoading] = useState<boolean>(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
  const [savingsLogs, setSavingsLogs] = useState<SavingsLog[]>([]);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);

  // Active filter state
  const [dateFilter, setDateFilter] = useState<DateFilterPreset>('this_month');
  const [customRange, setCustomRange] = useState<{ start: string; end: string }>({
    start: getTodayJakarta(),
    end: getTodayJakarta(),
  });

  // Reload all records from IndexedDB
  const refreshData = useCallback(async () => {
    try {
      const allTx = await db.transactions.orderBy('date').reverse().toArray();
      const allBudgets = await db.budgets.toArray();
      const allGoals = await db.savingsGoals.toArray();
      const allLogs = await db.savingsLogs.toArray();
      const settingsRecords = await db.settings.toArray();

      const mergedSettings: AppSettings = { ...DEFAULT_SETTINGS };
      for (const rec of settingsRecords) {
        (mergedSettings as any)[rec.key] = rec.value;
      }

      setTransactions(allTx);
      setBudgets(allBudgets);
      setSavingsGoals(allGoals);
      setSavingsLogs(allLogs);
      setSettings(mergedSettings);
    } catch (err) {
      console.error('Failed to refresh data from IndexedDB:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initialize DB for clean beta launch
  useEffect(() => {
    (async () => {
      try {
        await initializeBetaLaunchData();
        await refreshData();
      } catch (e) {
        console.error('Beta init error:', e);
        setLoading(false);
      }
    })();
  }, [refreshData]);

  // ----------------------------------------------------
  // Financial Calculations & Core Metrics
  // ----------------------------------------------------

  // Lifetime Balance = Opening Balance + Total Lifetime Income - Total Lifetime Expenses
  const lifetimeIncome = transactions
    .filter((tx) => tx.type === 'income')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const lifetimeExpense = transactions
    .filter((tx) => tx.type === 'expense')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const availableBalance = (settings.openingBalance || 0) + lifetimeIncome - lifetimeExpense;

  // Selected Reporting Period Metrics
  const { start: filterStart, end: filterEnd } = getDateRangeForPreset(
    dateFilter,
    customRange.start,
    customRange.end
  );

  const periodTransactions = transactions.filter((tx) => {
    return tx.date >= filterStart && tx.date <= filterEnd;
  });

  const periodIncome = periodTransactions
    .filter((tx) => tx.type === 'income')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const periodExpense = periodTransactions
    .filter((tx) => tx.type === 'expense')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const periodNet = periodIncome - periodExpense;

  // Monthly Budget Metrics (for current month)
  const currentMonth = getCurrentMonthJakarta();
  const currentMonthTransactions = transactions.filter((tx) => tx.date.startsWith(currentMonth));
  const currentMonthExpense = currentMonthTransactions
    .filter((tx) => tx.type === 'expense')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalBudgetEntry = budgets.find(
    (b) => b.month === currentMonth && b.category === 'Total'
  );

  // If explicit total budget is set, use it; else sum category budgets if available
  const categoryBudgets = budgets.filter(
    (b) => b.month === currentMonth && b.category !== 'Total'
  );
  const sumCategoryBudgets = categoryBudgets.reduce((sum, b) => sum + b.amount, 0);

  const monthlyBudgetAmount = totalBudgetEntry
    ? totalBudgetEntry.amount
    : sumCategoryBudgets > 0
    ? sumCategoryBudgets
    : 0;

  const remainingMonthlyBudget = Math.max(0, monthlyBudgetAmount - currentMonthExpense);
  const budgetUtilization =
    monthlyBudgetAmount > 0
      ? Math.min(200, Math.round((currentMonthExpense / monthlyBudgetAmount) * 100))
      : 0;

  // Savings Goals Overall Metrics
  const totalSavingsTarget = savingsGoals.reduce((sum, g) => sum + g.targetAmount, 0);
  const totalSavingsSaved = savingsGoals.reduce((sum, g) => sum + g.currentAmount, 0);
  const savingsOverallProgress =
    totalSavingsTarget > 0 ? Math.round((totalSavingsSaved / totalSavingsTarget) * 100) : 0;

  // ----------------------------------------------------
  // Transaction Mutations
  // ----------------------------------------------------

  const addTransaction = async (data: {
    type: TransactionType;
    title: string;
    amount: number;
    category: any;
    date: string;
    notes?: string;
  }): Promise<Transaction> => {
    if (data.amount <= 0) {
      throw new Error('Transaction amount must be greater than zero.');
    }
    if (!data.title.trim()) {
      throw new Error('Transaction title is required.');
    }

    const newTx: Transaction = {
      id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      type: data.type,
      title: data.title.trim(),
      amount: Math.round(data.amount),
      category: data.category,
      date: data.date || getTodayJakarta(),
      notes: data.notes?.trim() || '',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      synced: true,
    };

    await db.transactions.put(newTx);
    await refreshData();
    return newTx;
  };

  const editTransaction = async (
    id: string,
    data: Partial<Omit<Transaction, 'id' | 'createdAt'>>
  ): Promise<void> => {
    if (data.amount !== undefined && data.amount <= 0) {
      throw new Error('Transaction amount must be greater than zero.');
    }

    const existing = await db.transactions.get(id);
    if (!existing) throw new Error('Transaction not found');

    const updated: Transaction = {
      ...existing,
      ...data,
      amount: data.amount !== undefined ? Math.round(data.amount) : existing.amount,
      updatedAt: Date.now(),
    };

    await db.transactions.put(updated);
    await refreshData();
  };

  const deleteTransaction = async (id: string): Promise<void> => {
    await db.transactions.delete(id);
    await refreshData();
  };

  // ----------------------------------------------------
  // Settings Mutations
  // ----------------------------------------------------

  const setOpeningBalance = async (newBalance: number): Promise<void> => {
    const val = Math.max(0, Math.round(newBalance));
    await db.settings.put({ key: 'openingBalance', value: val });
    await refreshData();
  };

  const setCurrency = async (newCurrency: CurrencyCode): Promise<void> => {
    await db.settings.put({ key: 'currency', value: newCurrency });
    await refreshData();
  };

  // ----------------------------------------------------
  // Budget Mutations
  // ----------------------------------------------------

  const saveBudget = async (
    month: string,
    category: ExpenseCategory | 'Total',
    amount: number
  ): Promise<void> => {
    const id = `b_${month}_${category.replace(/\s+/g, '_').toLowerCase()}`;
    const budgetRecord: Budget = {
      id,
      month,
      category,
      amount: Math.max(0, Math.round(amount)),
      updatedAt: Date.now(),
    };
    await db.budgets.put(budgetRecord);
    await refreshData();
  };

  const deleteBudget = async (id: string): Promise<void> => {
    await db.budgets.delete(id);
    await refreshData();
  };

  // ----------------------------------------------------
  // Savings Goal Mutations
  // ----------------------------------------------------

  const addSavingsGoal = async (data: {
    name: string;
    targetAmount: number;
    currentAmount?: number;
    targetDate: string;
    category?: string;
    notes?: string;
  }): Promise<SavingsGoal> => {
    if (data.targetAmount <= 0) {
      throw new Error('Target amount must be greater than zero.');
    }
    const newGoal: SavingsGoal = {
      id: `goal_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: data.name.trim(),
      targetAmount: Math.round(data.targetAmount),
      currentAmount: Math.max(0, Math.round(data.currentAmount || 0)),
      targetDate: data.targetDate,
      category: data.category || 'General',
      notes: data.notes?.trim() || '',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await db.savingsGoals.put(newGoal);
    await refreshData();
    return newGoal;
  };

  const editSavingsGoal = async (id: string, updates: Partial<SavingsGoal>): Promise<void> => {
    const existing = await db.savingsGoals.get(id);
    if (!existing) throw new Error('Goal not found');
    const updated: SavingsGoal = {
      ...existing,
      ...updates,
      updatedAt: Date.now(),
    };
    await db.savingsGoals.put(updated);
    await refreshData();
  };

  const deleteSavingsGoal = async (id: string): Promise<void> => {
    await db.savingsGoals.delete(id);
    await db.savingsLogs.where('goalId').equals(id).delete();
    await refreshData();
  };

  /**
   * Savings transfer contribution / withdrawal:
   * Keeps money tracked inside the goal without double-counting as an expense or income!
   */
  const contributeToSavingsGoal = async (
    goalId: string,
    amount: number,
    type: 'deposit' | 'withdraw',
    notes?: string
  ): Promise<void> => {
    if (amount <= 0) throw new Error('Amount must be positive');
    const goal = await db.savingsGoals.get(goalId);
    if (!goal) throw new Error('Savings goal not found');

    const change = type === 'deposit' ? amount : -amount;
    const newAmount = Math.max(0, goal.currentAmount + change);

    await db.savingsGoals.update(goalId, {
      currentAmount: newAmount,
      updatedAt: Date.now(),
    });

    const log: SavingsLog = {
      id: `slog_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      goalId,
      type,
      amount,
      date: getTodayJakarta(),
      notes: notes || (type === 'deposit' ? 'Setoran tabungan' : 'Penarikan tabungan'),
      createdAt: Date.now(),
    };
    await db.savingsLogs.put(log);
    await refreshData();
  };

  // ----------------------------------------------------
  // Reset & Seed Actions
  // ----------------------------------------------------

  const clearAllData = async (): Promise<void> => {
    await db.transactions.clear();
    await db.budgets.clear();
    await db.savingsGoals.clear();
    await db.savingsLogs.clear();
    await db.settings.clear();
    await db.settings.put({ key: 'openingBalance', value: 0 });
    await db.settings.put({ key: 'currency', value: 'IDR' });
    await refreshData();
  };

  const resetToSampleData = async (): Promise<void> => {
    await db.transactions.clear();
    await db.budgets.clear();
    await db.savingsGoals.clear();
    await db.savingsLogs.clear();
    await db.settings.clear();
    await loadSampleDemoData();
    await refreshData();
  };

  return {
    loading,
    transactions,
    periodTransactions,
    budgets,
    savingsGoals,
    savingsLogs,
    settings,
    dateFilter,
    setDateFilter,
    customRange,
    setCustomRange,
    filterStart,
    filterEnd,
    // Metrics
    availableBalance,
    lifetimeIncome,
    lifetimeExpense,
    periodIncome,
    periodExpense,
    periodNet,
    monthlyBudgetAmount,
    currentMonthExpense,
    remainingMonthlyBudget,
    budgetUtilization,
    totalSavingsTarget,
    totalSavingsSaved,
    savingsOverallProgress,
    // Actions
    addTransaction,
    editTransaction,
    deleteTransaction,
    setOpeningBalance,
    setCurrency,
    saveBudget,
    deleteBudget,
    addSavingsGoal,
    editSavingsGoal,
    deleteSavingsGoal,
    contributeToSavingsGoal,
    clearAllData,
    resetToSampleData,
    refreshData,
  };
}
