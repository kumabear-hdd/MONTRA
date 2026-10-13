/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { DeleteConfirmModal } from './components/transactions/DeleteConfirmModal';
import { TransactionModal } from './components/transactions/TransactionModal';
import { ParsedReceiptData, ReceiptScannerModal } from './components/scanner/ReceiptScannerModal';
import { Header } from './components/layout/Header';
import { MobileNav } from './components/layout/MobileNav';
import { Sidebar } from './components/layout/Sidebar';
import { OfflineIndicator } from './components/common/OfflineIndicator';
import { useFinanceData } from './hooks/useFinanceData';
import type { Transaction, ViewTab } from './types/finance';
import { BudgetsView } from './views/BudgetsView';
import { DashboardView } from './views/DashboardView';
import { ReportsView } from './views/ReportsView';
import { SavingsGoalsView } from './views/SavingsGoalsView';
import { SettingsView } from './views/SettingsView';
import { TransactionsView } from './views/TransactionsView';

export default function App() {
  const [activeTab, setActiveTab] = useState<ViewTab>('dashboard');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDirectScannerOpen, setIsDirectScannerOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [deletingTransaction, setDeletingTransaction] = useState<Transaction | null>(null);

  // Central finance data & calculations
  const {
    loading,
    transactions,
    periodTransactions,
    budgets,
    savingsGoals,
    savingsLogs,
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
  } = useFinanceData();

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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F6F7F4] flex flex-col items-center justify-center p-6 text-stone-600">
        <div className="w-12 h-12 rounded-2xl bg-[#173D32] flex items-center justify-center animate-pulse shadow-md mb-4">
          <span className="font-extrabold text-white text-xl">M</span>
        </div>
        <p className="text-sm font-semibold text-[#173D32]">Memuat Montra...</p>
        <p className="text-xs text-stone-400 mt-1">Menyiapkan basis data finansial Anda</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F6F7F4] text-stone-900 flex font-sans selection:bg-[#D9F99D] selection:text-[#173D32]">
      {/* Desktop Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        availableBalance={availableBalance}
        currency={settings.currency}
        onOpenAddModal={handleOpenAddModal}
        onOpenScanner={handleOpenScanner}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen pb-20 lg:pb-8">
        {/* Header */}
        <Header
          activeTab={activeTab}
          availableBalance={availableBalance}
          currency={settings.currency}
          dateFilter={dateFilter}
          setDateFilter={setDateFilter}
          onOpenAddModal={handleOpenAddModal}
          onOpenScanner={handleOpenScanner}
        />

        {/* View Routing */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 pt-6">
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
              setActiveTab={setActiveTab}
              onOpenAddModal={handleOpenAddModal}
              onOpenScanner={handleOpenScanner}
              onEditTransaction={handleEditTransaction}
              onDeleteTransaction={handleDeleteTransaction}
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

          {activeTab === 'settings' && (
            <SettingsView
              settings={settings}
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
        onOpenAddModal={handleOpenAddModal}
      />

      {/* Floating Offline / Reconnection Banner */}
      <OfflineIndicator />

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
    </div>
  );
}
