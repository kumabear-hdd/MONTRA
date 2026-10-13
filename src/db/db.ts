import Dexie, { type Table } from 'dexie';
import type { AppSettings, Budget, SavingsGoal, SavingsLog, Transaction } from '../types/finance';

export class MontraDatabase extends Dexie {
  transactions!: Table<Transaction, string>;
  budgets!: Table<Budget, string>;
  savingsGoals!: Table<SavingsGoal, string>;
  savingsLogs!: Table<SavingsLog, string>;
  settings!: Table<{ key: string; value: any }, string>;

  constructor() {
    super('MontraFinanceDB');
    this.version(1).stores({
      transactions: 'id, type, category, date, createdAt',
      budgets: 'id, month, category',
      savingsGoals: 'id, name, targetDate, createdAt',
      savingsLogs: 'id, goalId, date, createdAt',
      settings: 'key',
    });
  }
}

export const db = new MontraDatabase();

// Default Application Settings for Beta Launch (Zero initial balance)
export const DEFAULT_SETTINGS: AppSettings = {
  openingBalance: 0, // Rp0 (Clean slate for beta launch)
  currency: 'IDR',
  defaultPeriod: 'this_month',
  timezone: 'Asia/Jakarta',
  hasInitializedSeed: true,
};

/**
 * Initialize Database for Beta Launch Version:
 * Ensures fresh 0 balance and removes mock prototype records.
 */
export async function initializeBetaLaunchData(): Promise<void> {
  const betaFlag = await db.settings.get('beta_launch_v1_clean');

  if (!betaFlag) {
    // Check if only prototype seed data exists
    const seedRecords = await db.transactions
      .filter((t) => t.id.startsWith('tx_seed_'))
      .toArray();

    if (seedRecords.length > 0) {
      // Clean prototype dummy transactions
      for (const rec of seedRecords) {
        await db.transactions.delete(rec.id);
      }
      // Also clear prototype budgets and goals
      const seedBudgets = await db.budgets.toArray();
      for (const b of seedBudgets) {
        if (b.id.startsWith('b_')) await db.budgets.delete(b.id);
      }
      const seedGoals = await db.savingsGoals.toArray();
      for (const g of seedGoals) {
        if (g.id.startsWith('goal_')) await db.savingsGoals.delete(g.id);
      }
    }

    // Set opening balance to 0 for real beta launch
    await db.settings.put({ key: 'openingBalance', value: 0 });
    await db.settings.put({ key: 'currency', value: 'IDR' });
    await db.settings.put({ key: 'defaultPeriod', value: 'this_month' });
    await db.settings.put({ key: 'timezone', value: 'Asia/Jakarta' });
    await db.settings.put({ key: 'beta_launch_v1_clean', value: true });
  }

  // Ensure settings exist
  const settingsCount = await db.settings.count();
  if (settingsCount === 0) {
    for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
      await db.settings.put({ key, value });
    }
    await db.settings.put({ key: 'beta_launch_v1_clean', value: true });
  }
}

/**
 * Optional Helper: Load Sample Demo Data on-demand (Settings > Muat Data Contoh)
 */
export async function loadSampleDemoData(): Promise<void> {
  const today = new Date();
  const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  const todayStr = today.toISOString().split('T')[0];

  const daysAgo = (days: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() - days);
    return d.toISOString().split('T')[0];
  };

  const sampleTransactions: Transaction[] = [
    {
      id: `tx_${Date.now()}_1`,
      type: 'income',
      title: 'Gaji Bulanan',
      amount: 8500000,
      category: 'Salary',
      date: daysAgo(5),
      notes: 'Gaji pokok bulan berjalan',
      createdAt: Date.now() - 5 * 86400000,
      updatedAt: Date.now() - 5 * 86400000,
      synced: true,
    },
    {
      id: `tx_${Date.now()}_2`,
      type: 'income',
      title: 'Project Freelance UI/UX',
      amount: 2200000,
      category: 'Freelance',
      date: daysAgo(2),
      notes: 'Pengerjaan prototype mobile app',
      createdAt: Date.now() - 2 * 86400000,
      updatedAt: Date.now() - 2 * 86400000,
      synced: true,
    },
    {
      id: `tx_${Date.now()}_3`,
      type: 'expense',
      title: 'Belanja Supermarket',
      amount: 450000,
      category: 'Food & Drinks',
      date: daysAgo(4),
      notes: 'Bahan makanan dan sayuran segar',
      createdAt: Date.now() - 4 * 86400000,
      updatedAt: Date.now() - 4 * 86400000,
      synced: true,
    },
    {
      id: `tx_${Date.now()}_4`,
      type: 'expense',
      title: 'Makan Siang & Kopi',
      amount: 65000,
      category: 'Food & Drinks',
      date: daysAgo(1),
      notes: 'Kopi susu dan nasi padang',
      createdAt: Date.now() - 1 * 86400000,
      updatedAt: Date.now() - 1 * 86400000,
      synced: true,
    },
    {
      id: `tx_${Date.now()}_5`,
      type: 'expense',
      title: 'Top Up Flazz KRL / MRT',
      amount: 150000,
      category: 'Transportation',
      date: daysAgo(3),
      notes: 'Saldo transportasi umum komuter',
      createdAt: Date.now() - 3 * 86400000,
      updatedAt: Date.now() - 3 * 86400000,
      synced: true,
    },
    {
      id: `tx_${Date.now()}_6`,
      type: 'expense',
      title: 'Tagihan Listrik PLN & Wi-Fi',
      amount: 620000,
      category: 'Bills & Utilities',
      date: daysAgo(6),
      notes: 'Token listrik dan internet fiber optic',
      createdAt: Date.now() - 6 * 86400000,
      updatedAt: Date.now() - 6 * 86400000,
      synced: true,
    },
  ];

  await db.transactions.bulkPut(sampleTransactions);

  const sampleBudgets: Budget[] = [
    {
      id: `b_${currentMonth}_total`,
      month: currentMonth,
      category: 'Total',
      amount: 4500000,
      updatedAt: Date.now(),
    },
    {
      id: `b_${currentMonth}_food`,
      month: currentMonth,
      category: 'Food & Drinks',
      amount: 1800000,
      updatedAt: Date.now(),
    },
    {
      id: `b_${currentMonth}_transport`,
      month: currentMonth,
      category: 'Transportation',
      amount: 500000,
      updatedAt: Date.now(),
    },
  ];

  await db.budgets.bulkPut(sampleBudgets);

  const sampleGoals: SavingsGoal[] = [
    {
      id: `goal_${Date.now()}_1`,
      name: 'Dana Darurat (Emergency Fund)',
      targetAmount: 20000000,
      currentAmount: 5000000,
      targetDate: `${today.getFullYear() + 1}-06-30`,
      category: 'Security',
      notes: '6 bulan pengeluaran rutin',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
  ];

  await db.savingsGoals.bulkPut(sampleGoals);
  await db.settings.put({ key: 'openingBalance', value: 500000 });
}
