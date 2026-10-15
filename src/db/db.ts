import Dexie, { type Table } from 'dexie';
import type {
  AppSettings,
  Budget,
  CurrentUser,
  FinancialSpace,
  SavingsGoal,
  SavingsLog,
  SpaceTransfer,
  Transaction,
} from '../types/finance';

export const DEFAULT_CURRENT_USER: CurrentUser = {
  id: '',
  name: '',
  email: '',
};

// Household collaborative members empty by default
export const DEMO_MEMBERS: { id: string; name: string; email: string }[] = [];

export class MontraDatabase extends Dexie {
  spaces!: Table<FinancialSpace, string>;
  transactions!: Table<Transaction, string>;
  budgets!: Table<Budget, string>;
  savingsGoals!: Table<SavingsGoal, string>;
  savingsLogs!: Table<SavingsLog, string>;
  transfers!: Table<SpaceTransfer, string>;
  settings!: Table<{ key: string; value: any }, string>;

  constructor() {
    super('MontraFinanceDB');

    // Version 1 (Single space legacy)
    this.version(1).stores({
      transactions: 'id, type, category, date, createdAt',
      budgets: 'id, month, category',
      savingsGoals: 'id, name, targetDate, createdAt',
      savingsLogs: 'id, goalId, date, createdAt',
      settings: 'key',
    });

    // Version 2 (Multi-Space Architecture with strict space boundaries)
    this.version(2)
      .stores({
        spaces: 'id, type, name, ownerId, isArchived, createdAt',
        transactions: 'id, spaceId, type, category, date, transferId, createdAt',
        budgets: 'id, spaceId, month, category',
        savingsGoals: 'id, spaceId, name, targetDate, createdAt',
        savingsLogs: 'id, spaceId, goalId, date, createdAt',
        transfers: 'id, sourceSpaceId, destSpaceId, date, createdAt',
        settings: 'key',
      })
      .upgrade((tx) => {
        // Automatically tag previous un-scoped records with default space
        return tx
          .table('transactions')
          .toCollection()
          .modify((t) => {
            if (!t.spaceId) t.spaceId = 'space_personal';
          });
      });
  }
}

export const db = new MontraDatabase();

// Default Application Settings
export const DEFAULT_SETTINGS: AppSettings = {
  currency: 'IDR',
  defaultPeriod: 'this_month',
  timezone: 'Asia/Jakarta',
  activeSpaceId: 'space_personal',
  hasInitializedSeed: true,
};

export function createDefaultSpaceForUser(
  user: CurrentUser,
  options?: Partial<FinancialSpace>
): FinancialSpace {
  const spaceId = `space_${user.id}_${Date.now()}`;
  return {
    id: spaceId,
    name: options?.name || 'Keuangan Pribadi',
    description: options?.description || 'Ruang utama untuk mencatat pengeluaran dan pemasukan pribadi.',
    icon: options?.icon || 'Wallet',
    color: options?.color || '#173D32',
    type: options?.type || 'personal',
    openingBalance: options?.openingBalance || 0,
    ownerId: user.id,
    ownerName: user.name,
    members: [
      {
        id: `m_${user.id}_${Date.now()}`,
        spaceId,
        userId: user.id,
        name: user.name,
        email: user.email,
        role: 'owner',
        joinedAt: Date.now(),
      },
    ],
    isArchived: false,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

export const INITIAL_SPACES: FinancialSpace[] = [];

/**
 * Initialize Database for Multi-Space Architecture:
 * Ensures settings exist and handles schema migrations.
 */
export async function initializeMultiSpaceData(user?: CurrentUser): Promise<void> {
  // Ensure default settings exist
  const settingsCount = await db.settings.count();
  if (settingsCount === 0) {
    for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
      await db.settings.put({ key, value });
    }
  }

  // If user is provided, check if user has spaces; if zero and legacy data exists, scope it
  if (user) {
    const userSpaces = await db.spaces
      .filter((s) => s.ownerId === user.id || s.members.some((m) => m.userId === user.id))
      .toArray();

    if (userSpaces.length > 0) {
      const activeSetting = await db.settings.get(`activeSpaceId_${user.id}`);
      if (!activeSetting) {
        await db.settings.put({ key: `activeSpaceId_${user.id}`, value: userSpaces[0].id });
      }
    }
  }
}

