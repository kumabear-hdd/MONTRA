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
  id: 'usr_daffa',
  name: 'Daffa',
  email: 'daffa@smkarier.co.id',
};

// Household example collaborative members
export const DEMO_MEMBERS: { id: string; name: string; email: string }[] = [
  { id: 'usr_daffa', name: 'Daffa', email: 'daffa@smkarier.co.id' },
  { id: 'usr_siti', name: 'Siti Rahma', email: 'siti@keluarga.id' },
  { id: 'usr_budi', name: 'Budi Santoso', email: 'budi@keluarga.id' },
  { id: 'usr_dewi', name: 'Dewi Lestari', email: 'dewi@keluarga.id' },
];

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

export const INITIAL_SPACES: FinancialSpace[] = [
  {
    id: 'space_personal',
    name: 'Keuangan Pribadi (Personal)',
    description: 'Ruang privat untuk mencatat pemasukan, belanja harian, dan tabungan pribadi Anda.',
    icon: 'Wallet',
    color: '#173D32', // Montra Forest Green
    type: 'personal',
    openingBalance: 0, // Clean 0 starting balance
    ownerId: DEFAULT_CURRENT_USER.id,
    ownerName: DEFAULT_CURRENT_USER.name,
    members: [
      {
        id: `m_${Date.now()}_1`,
        spaceId: 'space_personal',
        userId: DEFAULT_CURRENT_USER.id,
        name: DEFAULT_CURRENT_USER.name,
        email: DEFAULT_CURRENT_USER.email,
        role: 'owner',
        joinedAt: Date.now(),
      },
    ],
    isArchived: false,
    createdAt: Date.now() - 30 * 86400000,
    updatedAt: Date.now(),
  },
  {
    id: 'space_household',
    name: 'Rumah Tangga Bersama (Shared Household)',
    description: 'Ruang kolaborasi 4 anggota keluarga: iuran bulanan, tagihan PLN & air, belanja dapur, dan wifi.',
    icon: 'Home',
    color: '#0284C7', // Blue
    type: 'shared',
    openingBalance: 0,
    ownerId: DEFAULT_CURRENT_USER.id,
    ownerName: DEFAULT_CURRENT_USER.name,
    members: [
      {
        id: 'm_hh_1',
        spaceId: 'space_household',
        userId: 'usr_daffa',
        name: 'Daffa (Anda)',
        email: 'daffa@smkarier.co.id',
        role: 'owner',
        joinedAt: Date.now() - 25 * 86400000,
      },
      {
        id: 'm_hh_2',
        spaceId: 'space_household',
        userId: 'usr_siti',
        name: 'Siti Rahma',
        email: 'siti@keluarga.id',
        role: 'admin',
        joinedAt: Date.now() - 25 * 86400000,
      },
      {
        id: 'm_hh_3',
        spaceId: 'space_household',
        userId: 'usr_budi',
        name: 'Budi Santoso',
        email: 'budi@keluarga.id',
        role: 'member',
        joinedAt: Date.now() - 20 * 86400000,
      },
      {
        id: 'm_hh_4',
        spaceId: 'space_household',
        userId: 'usr_dewi',
        name: 'Dewi Lestari',
        email: 'dewi@keluarga.id',
        role: 'viewer',
        joinedAt: Date.now() - 15 * 86400000,
      },
    ],
    isArchived: false,
    createdAt: Date.now() - 25 * 86400000,
    updatedAt: Date.now(),
  },
];

/**
 * Initialize Database for Multi-Space Architecture:
 * Sets up initial spaces, active space preference, and migrates legacy records.
 */
export async function initializeMultiSpaceData(): Promise<void> {
  const spacesCount = await db.spaces.count();

  if (spacesCount === 0) {
    await db.spaces.bulkPut(INITIAL_SPACES);
  }

  // Ensure settings exist with activeSpaceId
  const settingsCount = await db.settings.count();
  if (settingsCount === 0) {
    for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
      await db.settings.put({ key, value });
    }
  } else {
    const activeSpaceSetting = await db.settings.get('activeSpaceId');
    if (!activeSpaceSetting) {
      await db.settings.put({ key: 'activeSpaceId', value: 'space_personal' });
    }
  }

  // Migrate any legacy unassigned transactions or records
  const unassignedTx = await db.transactions.filter((t) => !t.spaceId).toArray();
  for (const tx of unassignedTx) {
    await db.transactions.update(tx.id, { spaceId: 'space_personal' });
  }

  const unassignedBudgets = await db.budgets.filter((b) => !b.spaceId).toArray();
  for (const b of unassignedBudgets) {
    await db.budgets.update(b.id, { spaceId: 'space_personal' });
  }

  const unassignedGoals = await db.savingsGoals.filter((g) => !g.spaceId).toArray();
  for (const g of unassignedGoals) {
    await db.savingsGoals.update(g.id, { spaceId: 'space_personal' });
  }
}
