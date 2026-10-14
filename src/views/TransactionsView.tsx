import React, { useMemo, useState } from 'react';
import {
  ArrowDownLeft,
  ArrowUpDown,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Download,
  Filter,
  Plus,
  RotateCcw,
  Search,
} from 'lucide-react';
import { TransactionItem } from '../components/transactions/TransactionItem';
import type { CurrencyCode, Transaction, TransactionType } from '../types/finance';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../utils/categories';
import { formatCurrency } from '../utils/currency';

interface TransactionsViewProps {
  transactions: Transaction[];
  currency: CurrencyCode;
  onOpenAddModal: () => void;
  onEditTransaction: (tx: Transaction) => void;
  onDeleteTransaction: (tx: Transaction) => void;
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({
  transactions,
  currency,
  onOpenAddModal,
  onEditTransaction,
  onDeleteTransaction,
}) => {
  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | TransactionType>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortBy, setSortBy] = useState<'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc'>(
    'date_desc'
  );

  // Pagination
  const [page, setPage] = useState(1);
  const itemsPerPage = 12;

  // Filtered & Sorted Transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      // 1. Search title or notes
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesTitle = tx.title.toLowerCase().includes(query);
        const matchesNotes = tx.notes ? tx.notes.toLowerCase().includes(query) : false;
        if (!matchesTitle && !matchesNotes) return false;
      }

      // 2. Type filter
      if (typeFilter !== 'all' && tx.type !== typeFilter) {
        return false;
      }

      // 3. Category filter
      if (categoryFilter !== 'all' && tx.category !== categoryFilter) {
        return false;
      }

      // 4. Date range filter
      if (startDate && tx.date < startDate) {
        return false;
      }
      if (endDate && tx.date > endDate) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'date_desc') return b.date.localeCompare(a.date) || b.createdAt - a.createdAt;
      if (sortBy === 'date_asc') return a.date.localeCompare(b.date) || a.createdAt - b.createdAt;
      if (sortBy === 'amount_desc') return b.amount - a.amount;
      if (sortBy === 'amount_asc') return a.amount - b.amount;
      return 0;
    });
  }, [transactions, searchTerm, typeFilter, categoryFilter, startDate, endDate, sortBy]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredTransactions.length / itemsPerPage));
  const currentPage = Math.min(page, totalPages);
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Summary counts of current view
  const currentViewIncome = filteredTransactions
    .filter((tx) => tx.type === 'income')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const currentViewExpense = filteredTransactions
    .filter((tx) => tx.type === 'expense')
    .reduce((sum, tx) => sum + tx.amount, 0);

  // Reset Filters
  const handleResetFilters = () => {
    setSearchTerm('');
    setTypeFilter('all');
    setCategoryFilter('all');
    setStartDate('');
    setEndDate('');
    setSortBy('date_desc');
    setPage(1);
  };

  // CSV Export function
  const handleExportCSV = () => {
    if (filteredTransactions.length === 0) return;
    const headers = ['ID', 'Tipe', 'Judul', 'Kategori', 'Nominal', 'Tanggal', 'Catatan'];
    const rows = filteredTransactions.map((tx) => [
      tx.id,
      tx.type === 'income' ? 'Pemasukan' : 'Pengeluaran',
      `"${tx.title.replace(/"/g, '""')}"`,
      `"${tx.category}"`,
      tx.amount,
      tx.date,
      `"${(tx.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `montra_transaksi_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const allAvailableCategories = [...new Set([...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES])];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header Card with Quick Totals */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white border border-stone-200/80 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#173D32]">Semua Riwayat Transaksi</h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Ditemukan {filteredTransactions.length} dari total {transactions.length} mutasi
          </p>
        </div>

        {/* Action Controls: Export CSV & Catat */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            onClick={handleExportCSV}
            disabled={filteredTransactions.length === 0}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl border border-stone-200 text-stone-700 font-semibold text-xs hover:bg-stone-50 transition disabled:opacity-50"
            title="Download CSV"
          >
            <Download className="w-4 h-4 text-[#173D32]" />
            <span>Ekspor CSV</span>
          </button>

          <button
            onClick={onOpenAddModal}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#173D32] text-white font-semibold text-xs hover:bg-[#123027] active:scale-98 shadow-sm transition"
          >
            <Plus className="w-4 h-4 text-[#D9F99D]" />
            <span>+ Catat Transaksi</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white border border-stone-200/80 shadow-2xs space-y-3.5">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search Box */}
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari transaksi berdasarkan judul atau catatan..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#173D32]/20 focus:border-[#173D32] transition"
            />
          </div>

          {/* Type Filter */}
          <div className="md:col-span-2">
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value as any);
                setPage(1);
              }}
              className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#173D32]/20 focus:border-[#173D32] transition"
            >
              <option value="all">Semua Tipe</option>
              <option value="expense">Pengeluaran</option>
              <option value="income">Pemasukan</option>
            </select>
          </div>

          {/* Category Filter */}
          <div className="md:col-span-3">
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#173D32]/20 focus:border-[#173D32] transition"
            >
              <option value="all">Semua Kategori</option>
              {allAvailableCategories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div className="md:col-span-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#173D32]/20 focus:border-[#173D32] transition"
            >
              <option value="date_desc">Terbaru (Newest)</option>
              <option value="date_asc">Terlama (Oldest)</option>
              <option value="amount_desc">Nominal Terbesar</option>
              <option value="amount_asc">Nominal Terkecil</option>
            </select>
          </div>
        </div>

        {/* Date Range & Reset Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-stone-100 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-stone-400 text-[11px] font-semibold uppercase">Rentang:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPage(1);
              }}
              className="px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-700"
              placeholder="Dari"
            />
            <span className="text-stone-400">—</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setPage(1);
              }}
              className="px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-700"
              placeholder="Sampai"
            />
            {(searchTerm || typeFilter !== 'all' || categoryFilter !== 'all' || startDate || endDate) && (
              <button
                onClick={handleResetFilters}
                className="flex items-center gap-1 text-[11px] font-semibold text-rose-600 hover:text-rose-700 px-2 py-1 rounded-md hover:bg-rose-50 transition"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Filter</span>
              </button>
            )}
          </div>

          {/* Quick Filter Totals */}
          <div className="flex items-center gap-4 text-xs font-semibold tabular-nums">
            <span className="text-emerald-700">
              Total Masuk: +{formatCurrency(currentViewIncome, currency)}
            </span>
            <span className="text-rose-600">
              Total Keluar: -{formatCurrency(currentViewExpense, currency)}
            </span>
          </div>
        </div>
      </div>

      {/* Transaction List */}
      <div className="space-y-2.5">
        {transactions.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-stone-200/80 shadow-2xs">
            <div className="w-12 h-12 rounded-2xl bg-lime-50 text-[#173D32] flex items-center justify-center mx-auto mb-3">
              <Plus className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-stone-800">Belum ada transaksi</h4>
            <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
              Belum ada transaksi. Catat pemasukan atau pengeluaran pertamamu.
            </p>
            <div className="flex items-center justify-center gap-2 mt-4">
              <button
                onClick={onOpenAddModal}
                className="px-5 py-2.5 rounded-xl bg-[#173D32] text-white text-xs font-semibold hover:bg-[#123027] transition shadow-xs flex items-center gap-2"
              >
                <Plus className="w-4 h-4 text-[#D9F99D]" />
                <span>Catat Transaksi Pertama</span>
              </button>
            </div>
          </div>
        ) : paginatedTransactions.length > 0 ? (
          paginatedTransactions.map((tx) => (
            <TransactionItem
              key={tx.id}
              transaction={tx}
              currency={currency}
              onEdit={onEditTransaction}
              onDelete={onDeleteTransaction}
            />
          ))
        ) : (
          <div className="p-12 text-center bg-white rounded-3xl border border-stone-200/80 shadow-2xs">
            <Filter className="w-10 h-10 mx-auto text-stone-300 stroke-1 mb-2" />
            <h4 className="text-sm font-bold text-stone-700">Tidak ada transaksi yang cocok</h4>
            <p className="text-xs text-stone-400 mt-1 max-w-sm mx-auto">
              Coba sesuaikan kata kunci pencarian atau bersihkan filter untuk menampilkan data transaksi Anda.
            </p>
            <button
              onClick={handleResetFilters}
              className="mt-4 px-4 py-2 rounded-xl bg-stone-100 text-stone-700 text-xs font-semibold hover:bg-stone-200 transition"
            >
              Reset Semua Filter
            </button>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-stone-200/80 shadow-2xs text-xs">
          <p className="text-stone-500 font-medium">
            Halaman <span className="font-bold text-stone-900">{currentPage}</span> dari{' '}
            <span className="font-bold text-stone-900">{totalPages}</span>
          </p>

          <div className="flex items-center gap-2">
            <button
              disabled={currentPage <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-stone-200 text-stone-700 font-semibold hover:bg-stone-50 disabled:opacity-40 transition"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Sebelumnya</span>
            </button>

            <button
              disabled={currentPage >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-stone-200 text-stone-700 font-semibold hover:bg-stone-50 disabled:opacity-40 transition"
            >
              <span>Berikutnya</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
