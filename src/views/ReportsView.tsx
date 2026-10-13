import React, { useMemo, useState } from 'react';
import {
  ArrowDownLeft,
  ArrowUpRight,
  BarChart3,
  Calendar,
  CheckCircle,
  Clock,
  Download,
  Flame,
  PieChart as PieChartIcon,
  Printer,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { CurrencyCode, DateFilterPreset, Transaction, TransactionCategory } from '../types/finance';
import { CATEGORY_DETAILS } from '../utils/categories';
import { formatCurrency } from '../utils/currency';
import { formatFriendlyDate, getDateRangeForPreset } from '../utils/date';

interface ReportsViewProps {
  transactions: Transaction[];
  currency: CurrencyCode;
}

export const ReportsView: React.FC<ReportsViewProps> = ({ transactions, currency }) => {
  const [reportPeriod, setReportPeriod] = useState<DateFilterPreset>('this_month');
  const [customRange, setCustomRange] = useState({ start: '', end: '' });

  // 1. Date filtered records
  const { start: startDate, end: endDate } = getDateRangeForPreset(
    reportPeriod,
    customRange.start,
    customRange.end
  );

  const filteredTx = useMemo(() => {
    return transactions.filter((tx) => tx.date >= startDate && tx.date <= endDate);
  }, [transactions, startDate, endDate]);

  // Aggregate metrics
  const totalIncome = filteredTx
    .filter((tx) => tx.type === 'income')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalExpense = filteredTx
    .filter((tx) => tx.type === 'expense')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const netCashFlow = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? Math.max(0, Math.round((netCashFlow / totalIncome) * 100)) : 0;

  // 2. Spending Category Breakdown (Expense only)
  const categoryBreakdown = useMemo(() => {
    const map: Record<string, { count: number; total: number }> = {};
    for (const tx of filteredTx) {
      if (tx.type === 'expense') {
        if (!map[tx.category]) map[tx.category] = { count: 0, total: 0 };
        map[tx.category].total += tx.amount;
        map[tx.category].count += 1;
      }
    }

    return Object.entries(map)
      .map(([category, val]) => ({
        name: category,
        amount: val.total,
        count: val.count,
        percentage: totalExpense > 0 ? Math.round((val.total / totalExpense) * 100) : 0,
        color: CATEGORY_DETAILS[category as TransactionCategory]?.color || '#94A3B8',
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [filteredTx, totalExpense]);

  // 3. Top 5 Largest Expenses
  const topExpenses = useMemo(() => {
    return filteredTx
      .filter((tx) => tx.type === 'expense')
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  }, [filteredTx]);

  // 4. Monthly Trend Data across all records
  const monthlyTrendData = useMemo(() => {
    const map: Record<string, { month: string; income: number; expense: number; net: number }> = {};
    const sorted = [...transactions].sort((a, b) => a.date.localeCompare(b.date));

    for (const tx of sorted) {
      const monthKey = tx.date.substring(0, 7); // YYYY-MM
      if (!map[monthKey]) {
        map[monthKey] = { month: monthKey, income: 0, expense: 0, net: 0 };
      }
      if (tx.type === 'income') {
        map[monthKey].income += tx.amount;
      } else {
        map[monthKey].expense += tx.amount;
      }
      map[monthKey].net = map[monthKey].income - map[monthKey].expense;
    }

    return Object.values(map).slice(-6); // Last 6 recorded months
  }, [transactions]);

  // Print Report Handler
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 print:p-0">
      {/* Top Header Card */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white border border-stone-200/80 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h2 className="text-xl font-bold text-[#173D32]">Laporan & Analisis Keuangan</h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Analisis terperinci performa arus kas, struktur pengeluaran, dan tren tabungan
          </p>
        </div>

        {/* Period Selector & Print */}
        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          <div className="flex items-center bg-stone-100 rounded-xl p-1 text-xs">
            {(
              [
                { id: 'this_month', label: 'Bulan Ini' },
                { id: 'this_year', label: 'Tahun Ini' },
                { id: 'all', label: 'Semua' },
              ] as const
            ).map((p) => (
              <button
                key={p.id}
                onClick={() => setReportPeriod(p.id)}
                className={`px-3 py-1.5 rounded-lg font-medium transition ${
                  reportPeriod === p.id
                    ? 'bg-[#173D32] text-white shadow-2xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-stone-200 text-stone-700 text-xs font-semibold hover:bg-stone-50 transition"
          >
            <Printer className="w-4 h-4 text-[#173D32]" />
            <span>Cetak Ringkasan</span>
          </button>
        </div>
      </div>

      {/* 3 Core Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Income Card */}
        <div className="p-5 sm:p-6 rounded-3xl bg-white border border-stone-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-stone-500 mb-2">
            <span>Total Pemasukan</span>
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700">
              <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
            </div>
          </div>
          <h3 className="text-2xl font-extrabold text-emerald-700 tabular-nums">
            +{formatCurrency(totalIncome, currency)}
          </h3>
          <p className="text-[11px] text-stone-400 mt-1">Total aliran dana masuk pada periode ini</p>
        </div>

        {/* Expense Card */}
        <div className="p-5 sm:p-6 rounded-3xl bg-white border border-stone-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-stone-500 mb-2">
            <span>Total Pengeluaran</span>
            <div className="p-1.5 rounded-lg bg-rose-50 text-rose-600">
              <ArrowDownLeft className="w-4 h-4 stroke-[2.5]" />
            </div>
          </div>
          <h3 className="text-2xl font-extrabold text-rose-600 tabular-nums">
            -{formatCurrency(totalExpense, currency)}
          </h3>
          <p className="text-[11px] text-stone-400 mt-1">Konsumsi dan biaya operasional</p>
        </div>

        {/* Net Cash Flow Card */}
        <div className="p-5 sm:p-6 rounded-3xl bg-white border border-stone-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-stone-500 mb-2">
            <span>Arus Kas Bersih (Net)</span>
            <div
              className={`p-1.5 rounded-lg ${
                netCashFlow >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-600'
              }`}
            >
              {netCashFlow >= 0 ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
            </div>
          </div>
          <h3
            className={`text-2xl font-extrabold tabular-nums ${
              netCashFlow >= 0 ? 'text-[#173D32]' : 'text-rose-600'
            }`}
          >
            {netCashFlow >= 0 ? '+' : ''}
            {formatCurrency(netCashFlow, currency)}
          </h3>
          <p className="text-[11px] text-stone-400 mt-1">
            Tingkat simpanan (Savings rate):{' '}
            <span className="font-bold text-stone-700">{savingsRate}%</span>
          </p>
        </div>
      </div>

      {/* Monthly Comparisons Area / Bar Chart */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white border border-stone-200/80 shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-[#173D32] flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[#173D32]" />
              <span>Perbandingan Arus Kas Bulanan</span>
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Historis komparasi pemasukan, pengeluaran, dan net cash flow bulanan
            </p>
          </div>
        </div>

        <div className="h-72 w-full mt-4">
          {monthlyTrendData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyTrendData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <XAxis dataKey="month" stroke="#A8A29E" fontSize={11} tickLine={false} />
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
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="income" name="Pemasukan" fill="#15803D" radius={[6, 6, 0, 0]} />
                <Bar dataKey="expense" name="Pengeluaran" fill="#EF4444" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-stone-400">
              Belum ada data historis bulanan yang cukup.
            </div>
          )}
        </div>
      </div>

      {/* Two Column Layout: Detailed Category Breakdown Table & Top 5 Expenses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown Table */}
        <div className="p-5 sm:p-6 rounded-3xl bg-white border border-stone-200/80 shadow-2xs flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-[#173D32] flex items-center gap-2 mb-1">
              <PieChartIcon className="w-4 h-4 text-[#173D32]" />
              <span>Rincian Pengeluaran Per Kategori</span>
            </h3>
            <p className="text-xs text-stone-500 mb-4">
              Porsi alokasi pengeluaran dari total {formatCurrency(totalExpense, currency)}
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-stone-100 text-stone-400 font-semibold uppercase text-[10px]">
                    <th className="py-2.5">Kategori</th>
                    <th className="py-2.5 text-center">Mutasi</th>
                    <th className="py-2.5 text-right">Porsi</th>
                    <th className="py-2.5 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {categoryBreakdown.map((cat) => (
                    <tr key={cat.name} className="hover:bg-stone-50 transition">
                      <td className="py-2.5 font-bold text-stone-800 flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: cat.color }}
                        />
                        <span>{cat.name}</span>
                      </td>
                      <td className="py-2.5 text-center text-stone-500">{cat.count}x</td>
                      <td className="py-2.5 text-right font-semibold text-stone-700">
                        {cat.percentage}%
                      </td>
                      <td className="py-2.5 text-right font-bold text-stone-900 tabular-nums">
                        {formatCurrency(cat.amount, currency)}
                      </td>
                    </tr>
                  ))}
                  {categoryBreakdown.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-6 text-center text-stone-400 text-xs">
                        Tidak ada pengeluaran pada periode ini.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Top 5 Single Largest Expenses */}
        <div className="p-5 sm:p-6 rounded-3xl bg-white border border-stone-200/80 shadow-2xs flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-[#173D32] flex items-center gap-2 mb-1">
              <Flame className="w-4 h-4 text-rose-500" />
              <span>5 Pengeluaran Terbesar (Top Expenses)</span>
            </h3>
            <p className="text-xs text-stone-500 mb-4">
              Evaluasi pos biaya terbesar untuk peluang penghematan
            </p>

            <div className="space-y-2.5">
              {topExpenses.map((tx, idx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-stone-50 border border-stone-200/70 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-lg bg-rose-100 text-rose-700 font-bold flex items-center justify-center text-xs shrink-0">
                      {idx + 1}
                    </div>
                    <div>
                      <h4 className="font-bold text-stone-900 truncate max-w-[180px] sm:max-w-[240px]">
                        {tx.title}
                      </h4>
                      <p className="text-[11px] text-stone-500">
                        {tx.category} • {formatFriendlyDate(tx.date)}
                      </p>
                    </div>
                  </div>

                  <span className="font-extrabold text-rose-600 tabular-nums text-sm">
                    -{formatCurrency(tx.amount, currency)}
                  </span>
                </div>
              ))}
              {topExpenses.length === 0 && (
                <div className="py-8 text-center text-stone-400 text-xs">
                  Tidak ada catatan pengeluaran.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
