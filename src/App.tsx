/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AuthView } from './views/auth/AuthView';
import { OnboardingModal } from './components/auth/OnboardingModal';
import { DeleteConfirmModal } from './components/transactions/DeleteConfirmModal';
import { TransactionModal } from './components/transactions/TransactionModal';
import { ParsedReceiptData, ReceiptScannerModal } from './components/scanner/ReceiptScannerModal';
import { CreateSpaceModal } from './components/spaces/CreateSpaceModal';
import { TransferFundsModal } from './components/spaces/TransferFundsModal';
import { Header } from './components/layout/Header';
import { MobileNav } from './components/layout/MobileNav';
import { Sidebar } from './components/layout/Sidebar';
import { OfflineIndicator } from './components/common/OfflineIndicator';
import { useFinanceData } from './hooks/useFinanceData';
import type { Transaction, ViewTab } from './types/finance';
import { BudgetsView } from './views/BudgetsView';
import { DashboardView } from './views/DashboardView';
import { ManageSpacesView } from './views/ManageSpacesView';
import { OverviewView } from './views/OverviewView';
import { ReportsView } from './views/ReportsView';
import { SavingsGoalsView } from './views/SavingsGoalsView';
import { SettingsView } from './views/SettingsView';
import { TransactionsView } from './views/TransactionsView';

function FinanceApp() {
  const { user, isAuthenticated, isLoading: authLoading, logout, isNewUser, setIsNewUser } = useAuth();
  const [activeTab, setActiveTab] = useState<ViewTab>('dashboard');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDirectScannerOpen, setIsDirectScannerOpen] = useState(false);
  const [isCreateSpaceModalOpen, setIsCreateSpaceModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [deletingTransaction, setDeletingTransaction] = useState<Transaction | null>(null);

  // Central multi-space finance data & calculations strictly scoped to authenticated user
  const {
    loading: financeLoading,
    spaces,
    activeSpaceId,
    activeSpace,
    currentUser,
    currentRole,
    permissions,
    setActiveSpaceId,
    createSpace,
    updateSpace,
    archiveSpace,
    addSpaceMember,
    updateMemberRole,
    removeSpaceMember,
    transferBetweenSpaces,
    switchDemoUser,
    transactions,
    periodTransactions,
    budgets,
    savingsGoals,
    savingsLogs,
    spaceTransfers,
    settings,
    dateFilter,
    setDateFilter,
    availableBalance,
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
    globalOverviewData,
    totalGlobalNetWorth,
    totalGlobalIncome,
    totalGlobalExpense,
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
  } = useFinanceData(user);

  // Handlers for transactions
  const handleOpenAddModal = () => {
    setEditingTransaction(null);
    setIsAddModalOpen(true);
  };

  const handleOpenScanner = () => {
    setIsDirectScannerOpen(true);
  };

  const handleReceiptParsedDirect = (parsed: ParsedReceiptData) => {
    setIsDirectScannerOpen(false);
    const draftTx: Transaction = {
      id: '',
      spaceId: activeSpaceId,
      type: 'expense',
      title: parsed.merchant,
      amount: parsed.amount,
      category: parsed.category,
      date: parsed.date,
      notes: parsed.notes || '',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setEditingTransaction(draftTx);
    setIsAddModalOpen(true);
  };

  const handleEditTransaction = (tx: Transaction) => {
    setEditingTransaction(tx);
    setIsAddModalOpen(true);
  };

  const handleDeleteTransaction = (tx: Transaction) => {
    setDeletingTransaction(tx);
  };

  const handleSaveTransaction = async (data: any) => {
    if (editingTransaction && editingTransaction.id) {
      await editTransaction(editingTransaction.id, data);
    } else {
      await addTransaction(data);
    }
  };

  const handleConfirmDelete = async () => {
    if (deletingTransaction) {
      await deleteTransaction(deletingTransaction.id);
      setDeletingTransaction(null);
    }
  };

  // Loading state
  if (authLoading || (isAuthenticated && financeLoading)) {
    return (
      <div className="min-h-screen bg-[#F6F7F4] flex flex-col items-center justify-center p-6 text-stone-600">
        <div className="w-14 h-14 rounded-2xl bg-[#173D32] flex items-center justify-center animate-pulse shadow-md mb-4">
          <span className="font-extrabold text-[#D9F99D] text-2xl">M</span>
        </div>
        <p className="text-sm font-bold text-[#173D32]">Memuat Montra...</p>
        <p className="text-xs text-stone-400 mt-1">Mengamankan sesi dan data keuangan mandiri Anda</p>
      </div>
    );
  }

  // Protected route check: if unauthenticated, render AuthView
  if (!isAuthenticated) {
    return <AuthView />;
  }

  // First-time onboarding trigger: if user has no financial spaces yet
  const showOnboarding = spaces.length === 0;

  return (
    <div className="min-h-screen bg-[#F6F7F4] text-stone-900 flex font-sans selection:bg-[#D9F99D] selection:text-[#173D32]">
      {/* Desktop Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        spaces={spaces}
        activeSpace={activeSpace}
        onSelectSpace={setActiveSpaceId}
        onOpenCreateSpace={() => setIsCreateSpaceModalOpen(true)}
        onOpenTransferModal={() => setIsTransferModalOpen(true)}
        availableBalance={availableBalance}
        currency={settings.currency}
        canCreateTransaction={permissions.canCreate}
        onOpenAddModal={handleOpenAddModal}
        onOpenScanner={handleOpenScanner}
        user={user}
        onLogout={logout}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen pb-20 lg:pb-8">
        {/* Header */}
        <Header
          activeTab={activeTab}
          spaces={spaces}
          activeSpace={activeSpace}
          onSelectSpace={setActiveSpaceId}
          onOpenCreateSpace={() => setIsCreateSpaceModalOpen(true)}
          onOpenTransferModal={() => setIsTransferModalOpen(true)}
          setActiveTab={setActiveTab}
          availableBalance={availableBalance}
          currency={settings.currency}
          dateFilter={dateFilter}
          setDateFilter={setDateFilter}
          canCreateTransaction={permissions.canCreate}
          onOpenAddModal={handleOpenAddModal}
          onOpenScanner={handleOpenScanner}
          user={user}
          onLogout={logout}
        />

        {/* View Routing */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 pt-6">
          {activeTab === 'overview' && (
            <OverviewView
              globalOverviewData={globalOverviewData}
              totalGlobalNetWorth={totalGlobalNetWorth}
              totalGlobalIncome={totalGlobalIncome}
              totalGlobalExpense={totalGlobalExpense}
              allTransfers={spaceTransfers}
              spaces={spaces}
              onSelectSpace={setActiveSpaceId}
              onOpenCreateSpace={() => setIsCreateSpaceModalOpen(true)}
              onOpenTransferModal={() => setIsTransferModalOpen(true)}
              setActiveTab={setActiveTab}
              currency={settings.currency}
            />
          )}

          {activeTab === 'dashboard' && (
            <DashboardView
              transactions={transactions}
              periodTransactions={periodTransactions}
              availableBalance={availableBalance}
              periodIncome={periodIncome}
              periodExpense={periodExpense}
              periodNet={periodNet}
              monthlyBudgetAmount={monthlyBudgetAmount}
              currentMonthExpense={currentMonthExpense}
              remainingMonthlyBudget={remainingMonthlyBudget}
              budgetUtilization={budgetUtilization}
              totalSavingsTarget={totalSavingsTarget}
              totalSavingsSaved={totalSavingsSaved}
              savingsOverallProgress={savingsOverallProgress}
              currency={settings.currency}
              dateFilter={dateFilter}
              onOpenAddModal={handleOpenAddModal}
              onOpenScanner={handleOpenScanner}
              onEditTransaction={handleEditTransaction}
              onDeleteTransaction={handleDeleteTransaction}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'transactions' && (
            <TransactionsView
              transactions={transactions}
              currency={settings.currency}
              onOpenAddModal={handleOpenAddModal}
              onEditTransaction={handleEditTransaction}
              onDeleteTransaction={handleDeleteTransaction}
            />
          )}

          {activeTab === 'budgets' && (
            <BudgetsView
              budgets={budgets}
              transactions={transactions}
              currency={settings.currency}
              onSaveBudget={saveBudget}
              onDeleteBudget={deleteBudget}
            />
          )}

          {activeTab === 'savings' && (
            <SavingsGoalsView
              savingsGoals={savingsGoals}
              savingsLogs={savingsLogs}
              currency={settings.currency}
              onAddGoal={addSavingsGoal}
              onEditGoal={editSavingsGoal}
              onDeleteGoal={deleteSavingsGoal}
              onContribute={contributeToSavingsGoal}
            />
          )}

          {activeTab === 'reports' && (
            <ReportsView transactions={transactions} currency={settings.currency} />
          )}

          {activeTab === 'spaces' && (
            <ManageSpacesView
              spaces={spaces}
              activeSpaceId={activeSpaceId}
              currentUser={currentUser}
              currentRole={currentRole}
              onSelectSpace={setActiveSpaceId}
              onOpenCreateSpace={() => setIsCreateSpaceModalOpen(true)}
              onUpdateSpace={updateSpace}
              onArchiveSpace={archiveSpace}
              onAddMember={addSpaceMember}
              onUpdateRole={updateMemberRole}
              onRemoveMember={removeSpaceMember}
              onSwitchDemoUser={switchDemoUser}
              setActiveTab={setActiveTab}
              currency={settings.currency}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsView
              settings={settings}
              activeSpace={activeSpace}
              transactions={transactions}
              onSetOpeningBalance={setOpeningBalance}
              onSetCurrency={setCurrency}
              onResetSampleData={resetToSampleData}
              onClearAllData={clearAllData}
              availableBalance={availableBalance}
            />
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        canCreateTransaction={permissions.canCreate}
        onOpenAddModal={handleOpenAddModal}
      />

      {/* Floating Offline / Reconnection Banner */}
      <OfflineIndicator />

      {/* First-Time Onboarding Modal for New Accounts or 0 Spaces */}
      <OnboardingModal
        isOpen={showOnboarding}
        userName={user?.name || 'Pengguna'}
        onComplete={async (spaceData) => {
          await createSpace(spaceData);
          setIsNewUser(false);
        }}
      />

      {/* Add / Edit Transaction Modal */}
      <TransactionModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingTransaction(null);
        }}
        onSave={handleSaveTransaction}
        editingTransaction={editingTransaction}
        currency={settings.currency}
      />

      {/* Safe Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!deletingTransaction}
        onClose={() => setDeletingTransaction(null)}
        transaction={deletingTransaction}
        onConfirm={handleConfirmDelete}
        currency={settings.currency}
      />

      {/* Direct Receipt Scanner Modal */}
      <ReceiptScannerModal
        isOpen={isDirectScannerOpen}
        onClose={() => setIsDirectScannerOpen(false)}
        onReceiptParsed={handleReceiptParsedDirect}
      />

      {/* Create Financial Space Modal */}
      <CreateSpaceModal
        isOpen={isCreateSpaceModalOpen}
        onClose={() => setIsCreateSpaceModalOpen(false)}
        onCreateSpace={createSpace}
        currency={settings.currency}
      />

      {/* Inter-Space Fund Transfer Modal */}
      <TransferFundsModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        spaces={spaces}
        activeSpaceId={activeSpaceId}
        onTransferFunds={transferBetweenSpaces}
        currency={settings.currency}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <FinanceApp />
    </AuthProvider>
  );
}
