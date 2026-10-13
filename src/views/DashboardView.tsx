import React from 'react';
import {
  ArrowDownLeft,
  ArrowRight,
  ArrowUpRight,
  BarChart2,
  Camera,
  CheckCircle,
  Clock,
  PieChart as PieChartIcon,
  PiggyBank,
  Plus,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { TransactionItem } from '../components/transactions/TransactionItem';
import type { CurrencyCode, DateFilterPreset, Transaction, TransactionCategory, ViewTab } from '../types/finance';
import { CATEGORY_DETAILS } from '../utils/categories';
import { formatCurrency } from '../utils/currency';

interface DashboardViewProps {
  transactions: Transaction[];
  periodTransactions: Transaction[];
  availableBalance: number;
  periodIncome: number;
  periodExpense: number;
  periodNet: number;
  monthlyBudgetAmount: number;
  currentMonthExpense: number;
  remainingMonthlyBudget: number;
  budgetUtilization: number;
  totalSavingsTarget: number;
  totalSavingsSaved: number;
  savingsOverallProgress: number;
  currency: CurrencyCode;
  dateFilter: DateFilterPreset;
  setActiveTab: (tab: ViewTab) => void;
  onOpenAddModal: () => void;
  onOpenScanner?: () => void;
  onEditTransaction: (tx: Transaction) => void;
  onDeleteTransaction: (tx: Transaction) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  transactions,
  periodTransactions,
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
  currency,
  dateFilter,
  setActiveTab,
  onOpenAddModal,
  onOpenScanner,
  onEditTransaction,
  onDeleteTransaction,
}) => {
  // 1. Calculate Category Spending Data for Donut Chart (Strictly Expenses only)
  const expenseTransactions = periodTransactions.filter((tx) => tx.type === 'expense');
  const categoryMap: Record<string, number> = {};

  for (const tx of expenseTransactions) {
    categoryMap[tx.category] = (categoryMap[tx.category] || 0) + tx.amount;
  }

  const categoryChartData = Object.entries(categoryMap)
    .map(([name, value]) => ({
      name,
      value,
      percentage: periodExpense > 0 ? Math.round((value / periodExpense) * 100) : 0,
      color: CATEGORY_DETAILS[name as TransactionCategory]?.color || '#94A3B8',
    }))
    .sort((a, b) => b.value - a.value);

  // 2. Prepare Daily / Period Income vs Expense Data for Bar Chart
  const periodDaysMap: Record<string, { date: string; income: number; expense: number }> = {};
  // Sort chronological for chart
  const sortedPeriodTx = [...periodTransactions].sort((a, b) => a.date.localeCompare(b.date));

  for (const tx of sortedPeriodTx) {
    // format to short date e.g. "12 Okt"
    const parts = tx.date.split('-');
    const shortDate = `${parts[2]}/${parts[1]}`;
    if (!periodDaysMap[shortDate]) {
      periodDaysMap[shortDate] = { date: shortDate, income: 0, expense: 0 };
    }
    if (tx.type === 'income') {
      periodDaysMap[shortDate].income += tx.amount;
    } else {
      periodDaysMap[shortDate].expense += tx.amount;
    }
  }

  const flowChartData = Object.values(periodDaysMap).slice(-7); // Last 7 active data points

  // Recent 5 transactions
  const recentTransactions = transactions.slice(0, 5);

  const filterLabel = {
    today: 'Hari Ini',
    this_week: 'Minggu Ini',
    this_month: 'Bulan Ini',
    this_year: 'Tahun Ini',
    all: 'Semua Periode',
    custom: 'Rentang Khusus',
  }[dateFilter];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Banner: Financial Status & Available Balance Hero */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Main Available Balance Card (Forest Green & Soft Lime) */}
        <div className="lg:col-span-2 rounded-3xl bg-[#173D32] text-white p-6 sm:p-7 shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-48 h-48 rounded-full bg-[#D9F99D]/10 pointer-events-none blur-xl" />
          <div className="absolute -left-10 -bottom-10 w-40 h-40 rounded-full bg-[#255E4E]/40 pointer-events-none blur-lg" />

          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-[#D9F99D] text-xs font-semibold backdrop-blur-xs">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Saldo Riil Akun (Lifetime Balance)</span>
              </div>
              <span className="text-xs text-stone-300">Montra PWA</span>
            </div>

            <p className="text-xs sm:text-sm font-medium text-stone-300">Total Saldo Tersedia</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mt-1 mb-2 tabular-nums">
              {formatCurrency(availableBalance, currency)}
            </h2>
            <p className="text-xs text-stone-300/80">
              Formula: Saldo Awal + Total Pemasukan − Total Pengeluaran
            </p>
          </div>

          {/* Quick period summary footer pills */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-6 pt-5 border-t border-white/10 text-xs">
            <div className="bg-white/5 rounded-xl p-2.5">
              <span className="text-stone-300 block text-[11px]">Pemasukan ({filterLabel})</span>
              <span className="text-sm font-bold text-[#D9F99D] tabular-nums">
                +{formatCurrency(periodIncome, currency)}
              </span>
            </div>
            <div className="bg-white/5 rounded-xl p-2.5">
              <span className="text-stone-300 block text-[11px]">Pengeluaran ({filterLabel})</span>
              <span className="text-sm font-bold text-rose-300 tabular-nums">
                -{formatCurrency(periodExpense, currency)}
              </span>
            </div>
            <div className="col-span-2 sm:col-span-1 bg-white/5 rounded-xl p-2.5">
              <span className="text-stone-300 block text-[11px]">Arus Kas Bersih (Net)</span>
              <span
                className={`text-sm font-bold tabular-nums ${
                  periodNet >= 0 ? 'text-emerald-300' : 'text-rose-300'
                }`}
              >
                {periodNet >= 0 ? '+' : ''}
                {formatCurrency(periodNet, currency)}
              </span>
            </div>
          </div>
        </div>

        {/* Monthly Budget & Savings Progress Card */}
        <div className="space-y-4 flex flex-col justify-between">
          {/* Monthly Budget Widget */}
          <div className="p-5 rounded-3xl bg-white border border-stone-200/80 shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-50 text-[#173D32]">
                  <Wallet className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-stone-900">Anggaran Bulan Ini</h3>
              </div>
              <button
                onClick={() => setActiveTab('budgets')}
                className="text-xs text-[#173D32] font-semibold hover:underline"
              >
                Kelola
              </button>
            </div>

            {monthlyBudgetAmount > 0 ? (
              <div>
                <div className="flex items-baseline justify-between mt-2">
                  <span className="text-xs text-stone-500">Sisa Anggaran:</span>
                  <span
                    className={`text-base font-bold tabular-nums ${
                      remainingMonthlyBudget > 0 ? 'text-[#173D32]' : 'text-rose-600'
                    }`}
                  >
                    {formatCurrency(remainingMonthlyBudget, currency)}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-stone-100 h-2.5 rounded-full overflow-hidden mt-2">
                  <div
                    className={`h-full transition-all duration-500 rounded-full ${
                      budgetUtilization >= 100
                        ? 'bg-rose-600'
                        : budgetUtilization >= 75
                        ? 'bg-amber-500'
                        : 'bg-[#173D32]'
                    }`}
                    style={{ width: `${Math.min(100, budgetUtilization)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-stone-400 mt-1.5">
                  <span>Terpakai: {budgetUtilization}%</span>
                  <span>Total: {formatCurrency(monthlyBudgetAmount, currency)}</span>
                </div>
              </div>
            ) : (
              <div className="mt-3 p-3 bg-stone-50 rounded-xl text-center">
                <p className="text-xs text-stone-500">Belum ada batas anggaran bulan ini.</p>
                <button
                  onClick={() => setActiveTab('budgets')}
                  className="mt-1.5 text-xs text-[#173D32] font-bold hover:underline"
                >
                  + Pasang Anggaran
                </button>
              </div>
            )}
          </div>

          {/* Savings Goals Widget */}
          <div className="p-5 rounded-3xl bg-white border border-stone-200/80 shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-lime-50 text-[#173D32]">
                  <PiggyBank className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-stone-900">Target Tabungan</h3>
              </div>
              <button
                onClick={() => setActiveTab('savings')}
                className="text-xs text-[#173D32] font-semibold hover:underline"
              >
                Lihat
              </button>
            </div>

            <div>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-xs text-stone-500">Terkumpul:</span>
                <span className="text-base font-bold text-[#173D32] tabular-nums">
                  {formatCurrency(totalSavingsSaved, currency)}
                </span>
              </div>

              <div className="w-full bg-stone-100 h-2.5 rounded-full overflow-hidden mt-2">
                <div
                  className="h-full bg-[#173D32] rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, savingsOverallProgress)}%` }}
                />
              </div>

              <div className="flex justify-between text-[11px] text-stone-400 mt-1.5">
                <span>Progress: {savingsOverallProgress}%</span>
                <span>Target: {formatCurrency(totalSavingsTarget, currency)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section: Income vs Expense & Category Spending Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Income vs Expenses Flow */}
        <div className="p-5 sm:p-6 rounded-3xl bg-white border border-stone-200/80 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-[#173D32] flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-[#173D32]" />
                <span>Pemasukan vs Pengeluaran</span>
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">Tren arus kas ({filterLabel})</p>
            </div>
            <div className="flex items-center gap-3 text-xs font-medium">
              <span className="flex items-center gap-1.5 text-emerald-700">
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-600" /> Masuk
              </span>
              <span className="flex items-center gap-1.5 text-rose-600">
                <span className="w-2.5 h-2.5 rounded-sm bg-rose-500" /> Keluar
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            {flowChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={flowChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="date" stroke="#A8A29E" fontSize={11} tickLine={false} />
                  <YAxis
                    stroke="#A8A29E"
                    fontSize={11}
                    tickLine={false}
                    tickFormatter={(v) => (v >= 1000000 ? `${(v / 1000000).toFixed(0)}jt` : v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v)}
                  />
                  <Tooltip
                    formatter={(val: any) => [formatCurrency(Number(val) || 0, currency), '']}
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '16px',
                      border: '1px solid #E7E5E4',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="income" name="Pemasukan" fill="#15803D" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="expense" name="Pengeluaran" fill="#EF4444" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-stone-400 text-xs">
                <Clock className="w-8 h-8 mb-2 stroke-1 text-stone-300" />
                <span>Belum ada transaksi di rentang waktu ini.</span>
              </div>
            )}
          </div>
        </div>

        {/* Chart 2: Spending by Category Donut Chart */}
        <div className="p-5 sm:p-6 rounded-3xl bg-white border border-stone-200/80 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-[#173D32] flex items-center gap-2">
                <PieChartIcon className="w-4 h-4 text-[#173D32]" />
                <span>Pengeluaran Berdasarkan Kategori</span>
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Total: {formatCurrency(periodExpense, currency)}
              </p>
            </div>
            <span className="text-[11px] font-semibold text-stone-400 bg-stone-100 px-2.5 py-1 rounded-full">
              {categoryChartData.length} Kategori
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 items-center gap-4 min-h-[250px]">
            {categoryChartData.length > 0 ? (
              <>
                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryChartData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={80}
                        paddingAngle={3}
                      >
                        {categoryChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(val: any) => [formatCurrency(Number(val) || 0, currency), '']}
                        contentStyle={{
                          backgroundColor: '#FFFFFF',
                          borderRadius: '16px',
                          border: '1px solid #E7E5E4',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                          fontSize: '12px',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Legend list with percentage */}
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {categoryChartData.map((cat) => (
                    <div key={cat.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 truncate">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: cat.color }}
                        />
                        <span className="text-stone-700 truncate font-medium">{cat.name}</span>
                      </div>
                      <div className="text-right shrink-0 ml-2">
                        <span className="font-bold text-stone-900 tabular-nums">
                          {cat.percentage}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="col-span-2 h-48 flex flex-col items-center justify-center text-stone-400 text-xs">
                <CheckCircle className="w-8 h-8 mb-2 stroke-1 text-emerald-400" />
                <span>Tidak ada pengeluaran pada periode ini. Pengeluaran Anda hemat!</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Transactions List */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white border border-stone-200/80 shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-[#173D32]">Transaksi Terakhir</h3>
            <p className="text-xs text-stone-500">Catatan mutasi keuangan terbaru Anda</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('transactions')}
              className="text-xs font-semibold text-[#173D32] hover:text-[#123027] flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-stone-50 transition"
            >
              <span>Lihat Semua ({transactions.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            {onOpenScanner && (
              <button
                onClick={onOpenScanner}
                className="hidden sm:flex items-center gap-1 text-xs font-semibold border border-stone-200 text-stone-700 px-3 py-1.5 rounded-lg hover:bg-stone-50 transition"
              >
                <Camera className="w-3.5 h-3.5 text-[#173D32]" />
                <span>Pindai Struk</span>
              </button>
            )}
            <button
              onClick={onOpenAddModal}
              className="hidden sm:flex items-center gap-1 text-xs font-semibold bg-[#173D32] text-white px-3 py-1.5 rounded-lg hover:bg-[#123027] transition"
            >
              <Plus className="w-3.5 h-3.5 text-[#D9F99D]" />
              <span>Tambah</span>
            </button>
          </div>
        </div>

        {recentTransactions.length > 0 ? (
          <div className="space-y-2.5">
            {recentTransactions.map((tx) => (
              <TransactionItem
                key={tx.id}
                transaction={tx}
                currency={currency}
                onEdit={onEditTransaction}
                onDelete={onDeleteTransaction}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-stone-50 rounded-2xl border border-dashed border-stone-200">
            <div className="w-12 h-12 rounded-2xl bg-stone-100 flex items-center justify-center mx-auto mb-3 text-stone-400">
              <Camera className="w-6 h-6 text-[#173D32]" />
            </div>
            <p className="text-sm font-bold text-stone-800">Versi Beta Siap Digunakan</p>
            <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
              Saldo akun Anda saat ini Rp0. Mulai catat transaksi harian secara manual atau pindai struk belanja dengan kamera.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2.5 mt-4">
              <button
                onClick={onOpenAddModal}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#173D32] text-white text-xs font-semibold hover:bg-[#123027] transition shadow-sm"
              >
                <Plus className="w-4 h-4 text-[#D9F99D]" />
                <span>Catat Transaksi Manual</span>
              </button>
              {onOpenScanner && (
                <button
                  onClick={onOpenScanner}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-stone-300 bg-white text-stone-700 text-xs font-semibold hover:bg-stone-50 transition shadow-xs"
                >
                  <Camera className="w-4 h-4 text-[#173D32]" />
                  <span>Pindai Struk (AI OCR)</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
