import React, { useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Edit3,
  Layers,
  Plus,
  TrendingDown,
  Wallet,
} from 'lucide-react';
import { Modal } from '../components/common/Modal';
import type { Budget, CurrencyCode, ExpenseCategory, Transaction } from '../types/finance';
import { CATEGORY_DETAILS, EXPENSE_CATEGORIES } from '../utils/categories';
import { formatCurrency, parseCurrencyInput } from '../utils/currency';
import { formatMonthName, getCurrentMonthJakarta } from '../utils/date';

interface BudgetsViewProps {
  budgets: Budget[];
  transactions: Transaction[];
  currency: CurrencyCode;
  onSaveBudget: (month: string, category: ExpenseCategory | 'Total', amount: number) => Promise<void>;
  onDeleteBudget: (id: string) => Promise<void>;
}

export const BudgetsView: React.FC<BudgetsViewProps> = ({
  budgets,
  transactions,
  currency,
  onSaveBudget,
  onDeleteBudget,
}) => {
  const [selectedMonth, setSelectedMonth] = useState<string>(getCurrentMonthJakarta());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalCategory, setModalCategory] = useState<ExpenseCategory | 'Total'>('Total');
  const [modalAmount, setModalAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Month navigation helper
  const changeMonth = (delta: number) => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const d = new Date(year, month - 1 + delta, 1);
    const nextY = d.getFullYear();
    const nextM = String(d.getMonth() + 1).padStart(2, '0');
    setSelectedMonth(`${nextY}-${nextM}`);
  };

  // 1. Filter expense transactions strictly for selectedMonth
  const monthExpenseTx = transactions.filter(
    (tx) => tx.type === 'expense' && tx.date.startsWith(selectedMonth)
  );
  const totalMonthExpense = monthExpenseTx.reduce((sum, tx) => sum + tx.amount, 0);

  // Category expense lookup
  const categoryExpenses: Record<string, number> = {};
  for (const tx of monthExpenseTx) {
    categoryExpenses[tx.category] = (categoryExpenses[tx.category] || 0) + tx.amount;
  }

  // Budgets for selectedMonth
  const monthBudgets = budgets.filter((b) => b.month === selectedMonth);
  const totalBudgetEntry = monthBudgets.find((b) => b.category === 'Total');

  // If explicit total budget is defined, use it; otherwise sum category budgets if available
  const activeCategoryBudgets = monthBudgets.filter((b) => b.category !== 'Total');
  const totalBudgetLimit = totalBudgetEntry
    ? totalBudgetEntry.amount
    : activeCategoryBudgets.reduce((sum, b) => sum + b.amount, 0);

  const remainingTotalBudget = Math.max(0, totalBudgetLimit - totalMonthExpense);
  const totalUtilization =
    totalBudgetLimit > 0 ? Math.round((totalMonthExpense / totalBudgetLimit) * 100) : 0;

  // Open modal to set or edit budget
  const handleOpenSetBudget = (cat: ExpenseCategory | 'Total', currentVal?: number) => {
    setModalCategory(cat);
    setModalAmount(currentVal !== undefined ? currentVal.toString() : '');
    setIsModalOpen(true);
  };

  const handleSaveBudgetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseCurrencyInput(modalAmount);
    try {
      setIsSubmitting(true);
      await onSaveBudget(selectedMonth, modalCategory, parsed);
      setIsModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Month Selector Bar & Action */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white border border-stone-200/80 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#173D32]">Anggaran Pengeluaran Bulanan</h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Kendalikan batas pengeluaran untuk menjaga stabilitas finansial
          </p>
        </div>

        {/* Month Navigator Controls */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex items-center bg-stone-100 rounded-2xl p-1 border border-stone-200">
            <button
              onClick={() => changeMonth(-1)}
              className="p-1.5 rounded-xl hover:bg-white text-stone-600 transition"
              title="Bulan sebelumnya"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 text-xs font-bold text-[#173D32] min-w-[130px] text-center">
              {formatMonthName(selectedMonth)}
            </span>
            <button
              onClick={() => changeMonth(1)}
              className="p-1.5 rounded-xl hover:bg-white text-stone-600 transition"
              title="Bulan berikutnya"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => handleOpenSetBudget('Total', totalBudgetLimit)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#173D32] text-white font-semibold text-xs hover:bg-[#123027] active:scale-98 shadow-sm transition"
          >
            <Plus className="w-4 h-4 text-[#D9F99D]" />
            <span>Atur Batas Anggaran</span>
          </button>
        </div>
      </div>

      {totalBudgetLimit === 0 && activeCategoryBudgets.length === 0 && (
        <div className="p-6 rounded-3xl bg-lime-50/70 border border-lime-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white text-[#173D32] flex items-center justify-center shadow-2xs shrink-0">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#173D32]">Belum ada anggaran</h4>
              <p className="text-xs text-stone-600 mt-0.5">
                Belum ada anggaran. Buat budget pertamamu untuk mulai mengatur pengeluaran.
              </p>
            </div>
          </div>
          <button
            onClick={() => handleOpenSetBudget('Total', 0)}
            className="px-4 py-2 rounded-xl bg-[#173D32] text-white text-xs font-semibold hover:bg-[#123027] transition shadow-xs whitespace-nowrap"
          >
            Buat Budget Pertama
          </button>
        </div>
      )}

      {/* Main Budget Hero Card: Total Monthly Spending Limit */}
      <div className="p-6 sm:p-7 rounded-3xl bg-white border border-stone-200/80 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-stone-100">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                Total Anggaran Bulan {formatMonthName(selectedMonth)}
              </span>
              <button
                onClick={() => handleOpenSetBudget('Total', totalBudgetLimit)}
                className="text-stone-400 hover:text-[#173D32] p-1"
                title="Edit Total Anggaran"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
            </div>
            <h3 className="text-3xl font-extrabold text-[#173D32] tabular-nums">
              {formatCurrency(totalBudgetLimit, currency)}
            </h3>
            <p className="text-xs text-stone-400 mt-1">
              Batas total pengeluaran untuk semua kategori
            </p>
          </div>

          {/* Quick Metrics Columns */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-3.5 bg-stone-50 rounded-2xl">
              <span className="text-stone-500 block mb-0.5">Pengeluaran Aktual:</span>
              <span className="text-base font-bold text-rose-600 tabular-nums">
                {formatCurrency(totalMonthExpense, currency)}
              </span>
            </div>

            <div className="p-3.5 bg-stone-50 rounded-2xl">
              <span className="text-stone-500 block mb-0.5">Sisa Anggaran:</span>
              <span
                className={`text-base font-bold tabular-nums ${
                  remainingTotalBudget > 0 ? 'text-emerald-700' : 'text-rose-600'
                }`}
              >
                {formatCurrency(remainingTotalBudget, currency)}
              </span>
            </div>

            <div className="col-span-2 sm:col-span-1 p-3.5 bg-stone-50 rounded-2xl">
              <span className="text-stone-500 block mb-0.5">Utilisasi Anggaran:</span>
              <span
                className={`text-base font-bold tabular-nums ${
                  totalUtilization >= 100
                    ? 'text-rose-600'
                    : totalUtilization >= 75
                    ? 'text-amber-600'
                    : 'text-[#173D32]'
                }`}
              >
                {totalUtilization}%
              </span>
            </div>
          </div>
        </div>

        {/* Global Progress Bar & Threshold Badges */}
        <div className="mt-6">
          <div className="flex items-center justify-between text-xs font-semibold mb-2">
            <div className="flex items-center gap-2">
              {totalUtilization >= 100 ? (
                <span className="inline-flex items-center gap-1.5 text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
                  <AlertCircle className="w-3.5 h-3.5" /> Melebihi Batas Anggaran!
                </span>
              ) : totalUtilization >= 75 ? (
                <span className="inline-flex items-center gap-1.5 text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                  <AlertTriangle className="w-3.5 h-3.5" /> Mendekati Batas Anggaran ({totalUtilization}%)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Anggaran Terkendali Aman
                </span>
              )}
            </div>
            <span className="text-stone-400 font-medium">Target batas: 100%</span>
          </div>

          <div className="w-full bg-stone-100 h-3.5 rounded-full overflow-hidden p-0.5">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                totalUtilization >= 100
                  ? 'bg-rose-600'
                  : totalUtilization >= 75
                  ? 'bg-amber-500'
                  : 'bg-[#173D32]'
              }`}
              style={{ width: `${Math.min(100, totalUtilization)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Category Budgets Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-[#173D32] flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#173D32]" />
            <span>Anggaran Per Kategori Pengeluaran</span>
          </h3>
          <span className="text-xs text-stone-400">
            {activeCategoryBudgets.length} kategori aktif
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {EXPENSE_CATEGORIES.map((cat) => {
            const budgetEntry = monthBudgets.find((b) => b.category === cat);
            const limit = budgetEntry ? budgetEntry.amount : 0;
            const spent = categoryExpenses[cat] || 0;
            const remaining = Math.max(0, limit - spent);
            const utilization = limit > 0 ? Math.round((spent / limit) * 100) : 0;
            const isOver = limit > 0 && spent > limit;
            const catInfo = CATEGORY_DETAILS[cat];

            return (
              <div
                key={cat}
                className="p-5 rounded-3xl bg-white border border-stone-200/80 hover:border-stone-300 shadow-2xs transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-xl border ${catInfo.bgClass}`}
                    >
                      {cat}
                    </span>
                    <button
                      onClick={() => handleOpenSetBudget(cat, limit)}
                      className="text-stone-400 hover:text-[#173D32] p-1 rounded-lg hover:bg-stone-50 transition"
                      title="Atur Limit Kategori"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-stone-400">Terpakai:</span>
                      <span className="font-bold text-stone-900 tabular-nums">
                        {formatCurrency(spent, currency)}
                      </span>
                    </div>

                    <div className="flex justify-between text-xs">
                      <span className="text-stone-400">Limit:</span>
                      <span className="font-medium text-stone-600 tabular-nums">
                        {limit > 0 ? formatCurrency(limit, currency) : 'Belum diatur'}
                      </span>
                    </div>

                    {limit > 0 && (
                      <div className="flex justify-between text-xs pt-1">
                        <span className="text-stone-400">Sisa:</span>
                        <span
                          className={`font-bold tabular-nums ${
                            isOver ? 'text-rose-600' : 'text-emerald-700'
                          }`}
                        >
                          {isOver
                            ? `Lebih ${formatCurrency(spent - limit, currency)}`
                            : formatCurrency(remaining, currency)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-stone-100">
                  {limit > 0 ? (
                    <div>
                      <div className="flex justify-between text-[11px] mb-1">
                        <span
                          className={`font-semibold ${
                            utilization >= 100
                              ? 'text-rose-600'
                              : utilization >= 75
                              ? 'text-amber-600'
                              : 'text-stone-600'
                          }`}
                        >
                          {utilization}% terpakai
                        </span>
                        {utilization >= 100 && (
                          <span className="text-rose-600 font-bold">Over Budget</span>
                        )}
                      </div>
                      <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            utilization >= 100
                              ? 'bg-rose-600'
                              : utilization >= 75
                              ? 'bg-amber-500'
                              : 'bg-[#173D32]'
                          }`}
                          style={{ width: `${Math.min(100, utilization)}%` }}
                        />
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleOpenSetBudget(cat, 0)}
                      className="w-full py-2 rounded-xl bg-stone-50 hover:bg-stone-100 text-[#173D32] text-xs font-semibold text-center transition"
                    >
                      + Pasang Limit Kategori
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Set Budget Modal Dialog */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Atur Anggaran — ${modalCategory}`}
        subtitle={`Bulan ${formatMonthName(selectedMonth)}. Masukkan batas nominal pengeluaran.`}
        maxWidth="sm"
      >
        <form onSubmit={handleSaveBudgetSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Batas Anggaran ({currency})
            </label>
            <div className="relative">
              <input
                type="text"
                inputMode="numeric"
                placeholder="Contoh: 1.500.000"
                value={modalAmount ? parseCurrencyInput(modalAmount).toLocaleString('id-ID') : ''}
                onChange={(e) => {
                  const num = e.target.value.replace(/[^0-9]/g, '');
                  setModalAmount(num);
                }}
                className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl text-base font-bold text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#173D32]/20 focus:border-[#173D32] tabular-nums transition"
              />
            </div>
            <p className="text-[11px] text-stone-400 mt-1">
              Ketik 0 jika ingin menghapus batas anggaran untuk kategori ini.
            </p>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-stone-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2.5 rounded-xl border border-stone-200 text-stone-600 font-semibold text-xs hover:bg-stone-50 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-[#173D32] text-white font-semibold text-xs hover:bg-[#123027] shadow-sm transition"
            >
              {isSubmitting ? 'Menyimpan...' : 'Simpan Batas'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
