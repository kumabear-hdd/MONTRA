import { useCallback, useEffect, useState } from 'react';
import {
  db,
  DEFAULT_CURRENT_USER,
  DEFAULT_SETTINGS,
  DEMO_MEMBERS,
  INITIAL_SPACES,
  initializeMultiSpaceData,
} from '../db/db';
import type {
  AppSettings,
  Budget,
  CurrentUser,
  DateFilterPreset,
  ExpenseCategory,
  FinancialSpace,
  SavingsGoal,
  SavingsLog,
  SpaceMember,
  SpaceRole,
  SpaceTransfer,
  SpaceType,
  Transaction,
  TransactionType,
} from '../types/finance';
import { getCurrentMonthJakarta, getDateRangeForPreset, getTodayJakarta } from '../utils/date';

export function useFinanceData(authenticatedUser?: CurrentUser | null) {
  const [loading, setLoading] = useState<boolean>(true);

  // Multi-Space State
  const [spaces, setSpaces] = useState<FinancialSpace[]>([]);
  const [activeSpaceId, setActiveSpaceId] = useState<string>('space_personal');
  const [currentUser, setCurrentUser] = useState<CurrentUser>(
    authenticatedUser || DEFAULT_CURRENT_USER
  );

  useEffect(() => {
    if (authenticatedUser) {
      setCurrentUser(authenticatedUser);
    }
  }, [authenticatedUser]);

  // Scoped Data collections
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [allBudgets, setAllBudgets] = useState<Budget[]>([]);
  const [allGoals, setAllGoals] = useState<SavingsGoal[]>([]);
  const [allLogs, setAllLogs] = useState<SavingsLog[]>([]);
  const [allTransfers, setAllTransfers] = useState<SpaceTransfer[]>([]);
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
      const activeUser = authenticatedUser || currentUser;
      if (!activeUser?.id) {
        setSpaces([]);
        setAllTransactions([]);
        setAllBudgets([]);
        setAllGoals([]);
        setAllLogs([]);
        setAllTransfers([]);
        setLoading(false);
        return;
      }

      const storedSpaces = await db.spaces.toArray();
      // Strict isolation: only spaces where user is owner or member
      const userAccessibleSpaces = storedSpaces.filter(
        (s) => s.ownerId === activeUser.id || s.members?.some((m) => m.userId === activeUser.id)
      );

      const userSpaceIdSet = new Set(userAccessibleSpaces.map((s) => s.id));

      const storedTx = await db.transactions
        .orderBy('date')
        .reverse()
        .filter((tx) => userSpaceIdSet.has(tx.spaceId))
        .toArray();
      const storedBudgets = await db.budgets
        .filter((b) => userSpaceIdSet.has(b.spaceId))
        .toArray();
      const storedGoals = await db.savingsGoals
        .filter((g) => userSpaceIdSet.has(g.spaceId))
        .toArray();
      const storedLogs = await db.savingsLogs
        .filter((l) => userSpaceIdSet.has(l.spaceId))
        .toArray();
      const storedTransfers = await db.transfers
        .orderBy('date')
        .reverse()
        .filter((t) => userSpaceIdSet.has(t.sourceSpaceId) || userSpaceIdSet.has(t.destSpaceId))
        .toArray();
      const settingsRecords = await db.settings.toArray();

      const mergedSettings: AppSettings = { ...DEFAULT_SETTINGS };
      for (const rec of settingsRecords) {
        (mergedSettings as any)[rec.key] = rec.value;
      }

      setSpaces(userAccessibleSpaces);
      setAllTransactions(storedTx);
      setAllBudgets(storedBudgets);
      setAllGoals(storedGoals);
      setAllLogs(storedLogs);
      setAllTransfers(storedTransfers);
      setSettings(mergedSettings);

      // Restore activeSpaceId from settings if present
      const userActiveSpaceKey = `activeSpaceId_${activeUser.id}`;
      const savedUserSpaceId =
        (mergedSettings as any)[userActiveSpaceKey] || mergedSettings.activeSpaceId;
      if (savedUserSpaceId && userAccessibleSpaces.some((s) => s.id === savedUserSpaceId)) {
        setActiveSpaceId(savedUserSpaceId);
      } else if (userAccessibleSpaces.length > 0) {
        setActiveSpaceId(userAccessibleSpaces[0].id);
      }
    } catch (err) {
      console.error('Failed to refresh data from IndexedDB:', err);
    } finally {
      setLoading(false);
    }
  }, [authenticatedUser, currentUser]);

  // Initialize DB on mount
  useEffect(() => {
    (async () => {
      try {
        await initializeMultiSpaceData(authenticatedUser || currentUser);
        await refreshData();
      } catch (e) {
        console.error('Multi-space init error:', e);
        setLoading(false);
      }
    })();
  }, [refreshData, authenticatedUser, currentUser]);

  // Handle switching active space
  const handleSetActiveSpaceId = async (id: string) => {
    setActiveSpaceId(id);
    const activeUser = authenticatedUser || currentUser;
    if (activeUser?.id) {
      await db.settings.put({ key: `activeSpaceId_${activeUser.id}`, value: id });
    }
    await db.settings.put({ key: 'activeSpaceId', value: id });
  };

  // ----------------------------------------------------
  // Active Space Resolution & Role-Based Permissions
  // ----------------------------------------------------

  const safeFallbackSpace: FinancialSpace = {
    id: '',
    name: 'Belum Ada Ruang',
    description: 'Mulai dengan membuat ruang keuangan pertama Anda.',
    icon: 'Wallet',
    color: '#173D32',
    type: 'personal',
    openingBalance: 0,
    ownerId: (authenticatedUser || currentUser).id,
    ownerName: (authenticatedUser || currentUser).name,
    members: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  const activeSpace: FinancialSpace =
    spaces.find((s) => s.id === activeSpaceId && !s.isArchived) ||
    spaces.find((s) => !s.isArchived) ||
    spaces[0] ||
    safeFallbackSpace;

  // Resolve current user's role in the active space
  const memberRecord = activeSpace.members?.find((m) => m.userId === currentUser.id);
  const currentRole: SpaceRole =
    activeSpace.ownerId === currentUser.id
      ? 'owner'
      : memberRecord
      ? memberRecord.role
      : activeSpace.type === 'personal'
      ? 'owner'
      : 'viewer';

  // Permission flags based on role
  const permissions = {
    canView: true,
    canCreate: currentRole !== 'viewer',
    canEdit: currentRole !== 'viewer',
    canDelete: currentRole === 'owner' || currentRole === 'admin',
    canManageBudgets: currentRole === 'owner' || currentRole === 'admin',
    canTransfer: currentRole !== 'viewer',
    canManageMembers: currentRole === 'owner' || currentRole === 'admin',
    canDeleteSpace: currentRole === 'owner',
    isOwner: currentRole === 'owner',
    isAdmin: currentRole === 'admin',
    isViewer: currentRole === 'viewer',
  };

  // ----------------------------------------------------
  // Strictly Scoped Data for Active Space
  // ----------------------------------------------------

  // 1. Transactions belonging strictly to activeSpaceId
  const transactions = allTransactions.filter((tx) => tx.spaceId === activeSpace.id);

  // 2. Budgets belonging strictly to activeSpaceId
  const budgets = allBudgets.filter((b) => b.spaceId === activeSpace.id);

  // 3. Savings Goals belonging strictly to activeSpaceId
  const savingsGoals = allGoals.filter((g) => g.spaceId === activeSpace.id);
  const savingsLogs = allLogs.filter((l) => l.spaceId === activeSpace.id);

  // 4. Transfers involving activeSpaceId
  const spaceTransfers = allTransfers.filter(
    (t) => t.sourceSpaceId === activeSpace.id || t.destSpaceId === activeSpace.id
  );

  // ----------------------------------------------------
  // Financial Calculations & Independent Balance for Active Space
  // ----------------------------------------------------

  // Calculate Net Transfers for this space
  const transfersInAmount = allTransfers
    .filter((t) => t.destSpaceId === activeSpace.id && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);

  const transfersOutAmount = allTransfers
    .filter((t) => t.sourceSpaceId === activeSpace.id && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);

  const netTransfers = transfersInAmount - transfersOutAmount;

  // External Lifetime Income & Expenses (Transfers are NOT counted as external income or expense!)
  const lifetimeIncome = transactions
    .filter((tx) => tx.type === 'income' && !tx.isTransfer)
    .reduce((sum, tx) => sum + tx.amount, 0);

  const lifetimeExpense = transactions
    .filter((tx) => tx.type === 'expense' && !tx.isTransfer)
    .reduce((sum, tx) => sum + tx.amount, 0);

  // Available Balance = Space Opening Balance + Lifetime Income - Lifetime Expenses + Net Space Transfers
  const availableBalance = (activeSpace.openingBalance || 0) + lifetimeIncome - lifetimeExpense + netTransfers;

  // Filtered Period Metrics
  const { start: filterStart, end: filterEnd } = getDateRangeForPreset(
    dateFilter,
    customRange.start,
    customRange.end
  );

  const periodTransactions = transactions.filter((tx) => {
    return tx.date >= filterStart && tx.date <= filterEnd;
  });

  const periodIncome = periodTransactions
    .filter((tx) => tx.type === 'income' && !tx.isTransfer)
    .reduce((sum, tx) => sum + tx.amount, 0);

  const periodExpense = periodTransactions
    .filter((tx) => tx.type === 'expense' && !tx.isTransfer)
    .reduce((sum, tx) => sum + tx.amount, 0);

  const periodNet = periodIncome - periodExpense;

  // Monthly Budget Metrics for active space
  const currentMonth = getCurrentMonthJakarta();
  const currentMonthTransactions = transactions.filter(
    (tx) => tx.date.startsWith(currentMonth) && !tx.isTransfer
  );
  const currentMonthExpense = currentMonthTransactions
    .filter((tx) => tx.type === 'expense')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalBudgetEntry = budgets.find(
    (b) => b.month === currentMonth && b.category === 'Total'
  );

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

  // Savings Goals for active space
  const totalSavingsTarget = savingsGoals.reduce((sum, g) => sum + g.targetAmount, 0);
  const totalSavingsSaved = savingsGoals.reduce((sum, g) => sum + g.currentAmount, 0);
  const savingsOverallProgress =
    totalSavingsTarget > 0 ? Math.round((totalSavingsSaved / totalSavingsTarget) * 100) : 0;

  // ----------------------------------------------------
  // Global Multi-Space Aggregate Summary (For Global Overview)
  // ----------------------------------------------------

  const globalOverviewData = spaces
    .filter((s) => !s.isArchived)
    .map((s) => {
      const sTx = allTransactions.filter((tx) => tx.spaceId === s.id);
      const sIncome = sTx
        .filter((tx) => tx.type === 'income' && !tx.isTransfer)
        .reduce((sum, tx) => sum + tx.amount, 0);
      const sExpense = sTx
        .filter((tx) => tx.type === 'expense' && !tx.isTransfer)
        .reduce((sum, tx) => sum + tx.amount, 0);

      const sTransfersIn = allTransfers
        .filter((t) => t.destSpaceId === s.id && t.status === 'completed')
        .reduce((sum, t) => sum + t.amount, 0);
      const sTransfersOut = allTransfers
        .filter((t) => t.sourceSpaceId === s.id && t.status === 'completed')
        .reduce((sum, t) => sum + t.amount, 0);

      const sBalance = (s.openingBalance || 0) + sIncome - sExpense + (sTransfersIn - sTransfersOut);

      // Budgets
      const sBudgets = allBudgets.filter((b) => b.spaceId === s.id && b.month === currentMonth);
      const sTotalBudget = sBudgets.find((b) => b.category === 'Total')?.amount || 0;
      const sMonthExpense = sTx
        .filter((tx) => tx.date.startsWith(currentMonth) && tx.type === 'expense' && !tx.isTransfer)
        .reduce((sum, tx) => sum + tx.amount, 0);

      // Goals
      const sGoals = allGoals.filter((g) => g.spaceId === s.id);
      const sGoalsTarget = sGoals.reduce((sum, g) => sum + g.targetAmount, 0);
      const sGoalsSaved = sGoals.reduce((sum, g) => sum + g.currentAmount, 0);

      return {
        space: s,
        balance: sBalance,
        income: sIncome,
        expense: sExpense,
        netCashFlow: sIncome - sExpense,
        monthBudget: sTotalBudget,
        monthExpense: sMonthExpense,
        budgetUtilization: sTotalBudget > 0 ? Math.round((sMonthExpense / sTotalBudget) * 100) : 0,
        goalsTarget: sGoalsTarget,
        goalsSaved: sGoalsSaved,
        goalsProgress: sGoalsTarget > 0 ? Math.round((sGoalsSaved / sGoalsTarget) * 100) : 0,
      };
    });

  const totalGlobalNetWorth = globalOverviewData.reduce((sum, item) => sum + item.balance, 0);
  const totalGlobalIncome = globalOverviewData.reduce((sum, item) => sum + item.income, 0);
  const totalGlobalExpense = globalOverviewData.reduce((sum, item) => sum + item.expense, 0);

  // ----------------------------------------------------
  // Multi-Space Mutations
  // ----------------------------------------------------

  const createSpace = async (data: {
    name: string;
    description?: string;
    icon: string;
    color: string;
    type: SpaceType;
    openingBalance?: number;
    initialMembers?: { name: string; email: string; role: SpaceRole }[];
  }): Promise<FinancialSpace> => {
    if (!data.name.trim()) throw new Error('Nama ruang tidak boleh kosong.');

    const newSpaceId = `space_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const initialMembersList: SpaceMember[] = [
      {
        id: `m_${Date.now()}_owner`,
        spaceId: newSpaceId,
        userId: currentUser.id,
        name: `${currentUser.name} (Owner)`,
        email: currentUser.email,
        role: 'owner',
        joinedAt: Date.now(),
      },
    ];

    if (data.type === 'shared' && data.initialMembers) {
      data.initialMembers.forEach((im, idx) => {
        initialMembersList.push({
          id: `m_${Date.now()}_${idx}`,
          spaceId: newSpaceId,
          userId: `usr_${Math.random().toString(36).substring(2, 6)}`,
          name: im.name,
          email: im.email,
          role: im.role,
          joinedAt: Date.now(),
        });
      });
    }

    const newSpace: FinancialSpace = {
      id: newSpaceId,
      name: data.name.trim(),
      description: data.description?.trim() || '',
      icon: data.icon || (data.type === 'shared' ? 'Home' : 'Wallet'),
      color: data.color || (data.type === 'shared' ? '#0284C7' : '#173D32'),
      type: data.type,
      openingBalance: Math.max(0, Math.round(data.openingBalance || 0)),
      ownerId: currentUser.id,
      ownerName: currentUser.name,
      members: initialMembersList,
      isArchived: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await db.spaces.put(newSpace);
    await handleSetActiveSpaceId(newSpaceId);
    await refreshData();
    return newSpace;
  };

  const updateSpace = async (
    spaceId: string,
    updates: Partial<Omit<FinancialSpace, 'id' | 'createdAt'>>
  ): Promise<void> => {
    const existing = await db.spaces.get(spaceId);
    if (!existing) throw new Error('Ruang keuangan tidak ditemukan.');

    const updated: FinancialSpace = {
      ...existing,
      ...updates,
      updatedAt: Date.now(),
    };

    await db.spaces.put(updated);
    await refreshData();
  };

  const archiveSpace = async (spaceId: string): Promise<void> => {
    const space = await db.spaces.get(spaceId);
    if (!space) throw new Error('Ruang tidak ditemukan.');

    const activeCount = spaces.filter((s) => !s.isArchived).length;
    if (activeCount <= 1) {
      throw new Error('Anda harus memiliki setidaknya satu ruang keuangan aktif.');
    }

    await db.spaces.update(spaceId, { isArchived: true, updatedAt: Date.now() });

    // If archiving current space, switch to next available
    if (activeSpaceId === spaceId) {
      const nextAvailable = spaces.find((s) => s.id !== spaceId && !s.isArchived);
      if (nextAvailable) {
        await handleSetActiveSpaceId(nextAvailable.id);
      }
    }
    await refreshData();
  };

  const addSpaceMember = async (
    spaceId: string,
    member: { name: string; email: string; role: SpaceRole }
  ): Promise<void> => {
    const space = await db.spaces.get(spaceId);
    if (!space) throw new Error('Ruang tidak ditemukan.');

    const newMember: SpaceMember = {
      id: `m_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      spaceId,
      userId: `usr_${Date.now()}`,
      name: member.name.trim(),
      email: member.email.trim(),
      role: member.role,
      joinedAt: Date.now(),
    };

    const updatedMembers = [...(space.members || []), newMember];
    await db.spaces.update(spaceId, { members: updatedMembers, updatedAt: Date.now() });
    await refreshData();
  };

  const updateMemberRole = async (
    spaceId: string,
    memberId: string,
    newRole: SpaceRole
  ): Promise<void> => {
    const space = await db.spaces.get(spaceId);
    if (!space) throw new Error('Ruang tidak ditemukan.');

    const updatedMembers = space.members.map((m) =>
      m.id === memberId ? { ...m, role: newRole } : m
    );

    await db.spaces.update(spaceId, { members: updatedMembers, updatedAt: Date.now() });
    await refreshData();
  };

  const removeSpaceMember = async (spaceId: string, memberId: string): Promise<void> => {
    const space = await db.spaces.get(spaceId);
    if (!space) throw new Error('Ruang tidak ditemukan.');

    const updatedMembers = space.members.filter((m) => m.id !== memberId);
    await db.spaces.update(spaceId, { members: updatedMembers, updatedAt: Date.now() });
    await refreshData();
  };

  // ----------------------------------------------------
  // Inter-Space Fund Transfers
  // ----------------------------------------------------

  const transferBetweenSpaces = async (data: {
    sourceSpaceId: string;
    destSpaceId: string;
    amount: number;
    date: string;
    description: string;
  }): Promise<SpaceTransfer> => {
    if (data.sourceSpaceId === data.destSpaceId) {
      throw new Error('Ruang asal dan ruang tujuan tidak boleh sama.');
    }
    if (data.amount <= 0) {
      throw new Error('Nominal transfer harus lebih dari 0.');
    }

    const source = await db.spaces.get(data.sourceSpaceId);
    const dest = await db.spaces.get(data.destSpaceId);
    if (!source || !dest) {
      throw new Error('Ruang sumber atau tujuan transfer tidak valid.');
    }

    const transferId = `trf_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const transferRecord: SpaceTransfer = {
      id: transferId,
      sourceSpaceId: data.sourceSpaceId,
      destSpaceId: data.destSpaceId,
      amount: Math.round(data.amount),
      date: data.date || getTodayJakarta(),
      description: data.description.trim() || `Transfer dari ${source.name} ke ${dest.name}`,
      createdById: currentUser.id,
      createdByName: currentUser.name,
      status: 'completed',
      createdAt: Date.now(),
    };

    // Record linked mirror transactions in both spaces with isTransfer: true
    // This allows both spaces to show the movement in their history without polluting external income/expenses
    const sourceTx: Transaction = {
      id: `tx_trf_out_${transferId}`,
      spaceId: data.sourceSpaceId,
      type: 'expense',
      title: `Transfer Keluar → ${dest.name}`,
      amount: Math.round(data.amount),
      category: 'Other Expenses',
      date: data.date || getTodayJakarta(),
      notes: `Transfer antar-ruang: ${data.description || 'Pindah saldo'}. ID: ${transferId}`,
      transferId,
      isTransfer: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      synced: true,
    };

    const destTx: Transaction = {
      id: `tx_trf_in_${transferId}`,
      spaceId: data.destSpaceId,
      type: 'income',
      title: `Transfer Masuk ← ${source.name}`,
      amount: Math.round(data.amount),
      category: 'Other Income',
      date: data.date || getTodayJakarta(),
      notes: `Transfer antar-ruang: ${data.description || 'Pindah saldo'}. ID: ${transferId}`,
      transferId,
      isTransfer: true,
      createdAt: Date.now() + 1,
      updatedAt: Date.now() + 1,
      synced: true,
    };

    await db.transaction('rw', db.transfers, db.transactions, async () => {
      await db.transfers.put(transferRecord);
      await db.transactions.put(sourceTx);
      await db.transactions.put(destTx);
    });

    await refreshData();
    return transferRecord;
  };

  // ----------------------------------------------------
  // Scoped Transaction Mutations
  // ----------------------------------------------------

  const addTransaction = async (data: {
    type: TransactionType;
    title: string;
    amount: number;
    category: any;
    date: string;
    notes?: string;
    memberId?: string;
    memberName?: string;
  }): Promise<Transaction> => {
    if (!permissions.canCreate) {
      throw new Error('Anda hanya memiliki izin melihat (Viewer) di ruang ini.');
    }
    if (data.amount <= 0) {
      throw new Error('Nominal transaksi harus lebih dari 0.');
    }
    if (!data.title.trim()) {
      throw new Error('Judul transaksi wajib diisi.');
    }

    const newTx: Transaction = {
      id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      spaceId: activeSpace.id, // Strictly scoped to active space
      type: data.type,
      title: data.title.trim(),
      amount: Math.round(data.amount),
      category: data.category,
      date: data.date || getTodayJakarta(),
      notes: data.notes?.trim() || '',
      memberId: data.memberId || currentUser.id,
      memberName: data.memberName || currentUser.name,
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
    data: Partial<Omit<Transaction, 'id' | 'createdAt' | 'spaceId'>>
  ): Promise<void> => {
    if (!permissions.canEdit) {
      throw new Error('Anda tidak memiliki izin mengedit transaksi di ruang ini.');
    }
    const existing = await db.transactions.get(id);
    if (!existing || existing.spaceId !== activeSpace.id) {
      throw new Error('Transaksi tidak ditemukan di ruang ini.');
    }

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
    if (!permissions.canDelete) {
      throw new Error('Hanya Owner atau Admin yang dapat menghapus transaksi.');
    }
    const existing = await db.transactions.get(id);
    if (!existing || existing.spaceId !== activeSpace.id) {
      throw new Error('Transaksi tidak ditemukan di ruang ini.');
    }

    // If it's part of a transfer, delete corresponding transfer atomically
    if (existing.transferId) {
      await db.transfers.delete(existing.transferId);
      await db.transactions.where('transferId').equals(existing.transferId).delete();
    } else {
      await db.transactions.delete(id);
    }

    await refreshData();
  };

  // ----------------------------------------------------
  // Space Opening Balance & Settings
  // ----------------------------------------------------

  const setOpeningBalance = async (newBalance: number): Promise<void> => {
    if (!permissions.canManageBudgets) {
      throw new Error('Hanya Owner yang dapat mengubah saldo awal ruang.');
    }
    const val = Math.max(0, Math.round(newBalance));
    await db.spaces.update(activeSpace.id, { openingBalance: val, updatedAt: Date.now() });
    await refreshData();
  };

  const setCurrency = async (newCurrency: any): Promise<void> => {
    await db.settings.put({ key: 'currency', value: newCurrency });
    await refreshData();
  };

  // ----------------------------------------------------
  // Scoped Budget Mutations
  // ----------------------------------------------------

  const saveBudget = async (
    month: string,
    category: ExpenseCategory | 'Total',
    amount: number
  ): Promise<void> => {
    if (!permissions.canManageBudgets) {
      throw new Error('Hanya Owner atau Admin yang dapat mengatur anggaran.');
    }
    const id = `b_${activeSpace.id}_${month}_${category.replace(/\s+/g, '_').toLowerCase()}`;
    const budgetRecord: Budget = {
      id,
      spaceId: activeSpace.id,
      month,
      category,
      amount: Math.max(0, Math.round(amount)),
      updatedAt: Date.now(),
    };
    await db.budgets.put(budgetRecord);
    await refreshData();
  };

  const deleteBudget = async (id: string): Promise<void> => {
    if (!permissions.canManageBudgets) {
      throw new Error('Hanya Owner atau Admin yang dapat menghapus anggaran.');
    }
    await db.budgets.delete(id);
    await refreshData();
  };

  // ----------------------------------------------------
  // Scoped Savings Goal Mutations
  // ----------------------------------------------------

  const addSavingsGoal = async (data: {
    name: string;
    targetAmount: number;
    currentAmount?: number;
    targetDate: string;
    category?: string;
    notes?: string;
  }): Promise<SavingsGoal> => {
    if (!permissions.canCreate) {
      throw new Error('Izin tidak memadai.');
    }
    const newGoal: SavingsGoal = {
      id: `goal_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      spaceId: activeSpace.id,
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
    if (!permissions.canEdit) {
      throw new Error('Izin tidak memadai.');
    }
    const existing = await db.savingsGoals.get(id);
    if (!existing || existing.spaceId !== activeSpace.id) throw new Error('Goal not found');

    const updated: SavingsGoal = {
      ...existing,
      ...updates,
      updatedAt: Date.now(),
    };
    await db.savingsGoals.put(updated);
    await refreshData();
  };

  const deleteSavingsGoal = async (id: string): Promise<void> => {
    if (!permissions.canDelete) {
      throw new Error('Hanya Owner atau Admin yang dapat menghapus target tabungan.');
    }
    await db.savingsGoals.delete(id);
    await db.savingsLogs.where('goalId').equals(id).delete();
    await refreshData();
  };

  const contributeToSavingsGoal = async (
    goalId: string,
    amount: number,
    type: 'deposit' | 'withdraw',
    notes?: string
  ): Promise<void> => {
    if (!permissions.canCreate) throw new Error('Izin tidak memadai.');
    const goal = await db.savingsGoals.get(goalId);
    if (!goal || goal.spaceId !== activeSpace.id) throw new Error('Goal not found');

    const change = type === 'deposit' ? amount : -amount;
    const newAmount = Math.max(0, goal.currentAmount + change);

    await db.savingsGoals.update(goalId, {
      currentAmount: newAmount,
      updatedAt: Date.now(),
    });

    const log: SavingsLog = {
      id: `slog_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      spaceId: activeSpace.id,
      goalId,
      type,
      amount,
      date: getTodayJakarta(),
      notes: notes || (type === 'deposit' ? 'Setoran tabungan' : 'Penarikan tabungan'),
      memberId: currentUser.id,
      memberName: currentUser.name,
      createdAt: Date.now(),
    };
    await db.savingsLogs.put(log);
    await refreshData();
  };

  // ----------------------------------------------------
  // Demo Role Switcher (For testing permissions in UI)
  // ----------------------------------------------------

  const clearAllData = async (): Promise<void> => {
    const activeUser = authenticatedUser || currentUser;
    const userSpaces = spaces.filter((s) => s.ownerId === activeUser.id);
    const spaceIds = new Set(userSpaces.map((s) => s.id));

    const txToDelete = await db.transactions.filter((t) => spaceIds.has(t.spaceId)).primaryKeys();
    await db.transactions.bulkDelete(txToDelete);

    const budgetsToDelete = await db.budgets.filter((b) => spaceIds.has(b.spaceId)).primaryKeys();
    await db.budgets.bulkDelete(budgetsToDelete);

    const goalsToDelete = await db.savingsGoals.filter((g) => spaceIds.has(g.spaceId)).primaryKeys();
    await db.savingsGoals.bulkDelete(goalsToDelete);

    const logsToDelete = await db.savingsLogs.filter((l) => spaceIds.has(l.spaceId)).primaryKeys();
    await db.savingsLogs.bulkDelete(logsToDelete);

    const transfersToDelete = await db.transfers
      .filter((t) => spaceIds.has(t.sourceSpaceId) || spaceIds.has(t.destSpaceId))
      .primaryKeys();
    await db.transfers.bulkDelete(transfersToDelete);

    for (const s of userSpaces) {
      await db.spaces.update(s.id, { openingBalance: 0, updatedAt: Date.now() });
    }
    await refreshData();
  };

  const resetToSampleData = async (): Promise<void> => {
    // Reset to clean beta launch state with 0 balance
    await clearAllData();
  };

  const switchDemoUser = (user: CurrentUser) => {
    setCurrentUser(user);
  };

  return {
    loading,
    clearAllData,
    resetToSampleData,
    // Spaces
    spaces,
    activeSpaceId,
    activeSpace,
    currentUser,
    currentRole,
    permissions,
    setActiveSpaceId: handleSetActiveSpaceId,
    createSpace,
    updateSpace,
    archiveSpace,
    addSpaceMember,
    updateMemberRole,
    removeSpaceMember,
    transferBetweenSpaces,
    switchDemoUser,
    // Scoped Space Records
    transactions,
    periodTransactions,
    budgets,
    savingsGoals,
    savingsLogs,
    spaceTransfers,
    settings,
    dateFilter,
    setDateFilter,
    customRange,
    setCustomRange,
    filterStart,
    filterEnd,
    // Space Financial Metrics
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
    netTransfers,
    transfersInAmount,
    transfersOutAmount,
    // Global Multi-Space Aggregate Data
    globalOverviewData,
    totalGlobalNetWorth,
    totalGlobalIncome,
    totalGlobalExpense,
    // Scoped Mutations
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
    refreshData,
  };
}
