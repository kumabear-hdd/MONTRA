import React from 'react';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Edit2,
  Trash2,
} from 'lucide-react';
import type { CurrencyCode, Transaction } from '../../types/finance';
import { CATEGORY_DETAILS } from '../../utils/categories';
import { formatCurrency } from '../../utils/currency';
import { formatFriendlyDate } from '../../utils/date';

interface TransactionItemProps {
  transaction: Transaction;
  currency: CurrencyCode;
  onEdit: (tx: Transaction) => void;
  onDelete: (tx: Transaction) => void;
  compact?: boolean;
}

export const TransactionItem: React.FC<TransactionItemProps> = ({
  transaction,
  currency,
  onEdit,
  onDelete,
  compact = false,
}) => {
  const isIncome = transaction.type === 'income';
  const categoryInfo = CATEGORY_DETAILS[transaction.category] || {
    name: transaction.category,
    color: '#64748B',
    bgClass: 'bg-stone-100 text-stone-700 border-stone-200',
  };

  return (
    <div
      className={`group flex items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-white border border-stone-200/80 hover:border-stone-300 hover:shadow-xs transition ${
        compact ? 'py-3' : ''
      }`}
    >
      {/* Left Details */}
      <div className="flex items-center gap-3 min-w-0">
        {/* Type Icon Badge */}
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
            isIncome
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80'
              : 'bg-rose-50 text-rose-600 border-rose-200/80'
          }`}
        >
          {isIncome ? (
            <ArrowUpRight className="w-5 h-5 stroke-[2.2]" />
          ) : (
            <ArrowDownLeft className="w-5 h-5 stroke-[2.2]" />
          )}
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-bold text-stone-900 truncate">{transaction.title}</h4>
            <span
              className={`hidden sm:inline-block text-[11px] font-medium px-2 py-0.5 rounded-md border ${categoryInfo.bgClass}`}
            >
              {transaction.category}
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs text-stone-500 mt-0.5">
            <span className="sm:hidden text-[11px] font-medium text-stone-600">
              {transaction.category} •
            </span>
            <span>{formatFriendlyDate(transaction.date)}</span>
            {transaction.notes && (
              <>
                <span className="hidden sm:inline text-stone-300">•</span>
                <span className="hidden sm:inline text-stone-400 italic truncate max-w-[200px]">
                  {transaction.notes}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Right Details: Amount & Quick Actions */}
      <div className="flex items-center gap-3 shrink-0 ml-3">
        <div className="text-right">
          <p
            className={`text-sm sm:text-base font-bold tabular-nums tracking-tight ${
              isIncome ? 'text-emerald-700' : 'text-rose-600'
            }`}
          >
            {isIncome ? '+' : '-'}
            {formatCurrency(transaction.amount, currency)}
          </p>
          <span className="text-[10px] text-stone-400 font-medium uppercase tracking-wider block">
            {isIncome ? 'Pemasukan' : 'Pengeluaran'}
          </span>
        </div>

        {/* Hover / tap actions */}
        <div className="flex items-center gap-1 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(transaction)}
            className="p-1.5 rounded-lg text-stone-400 hover:text-[#173D32] hover:bg-stone-100 transition"
            title="Edit Transaksi"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(transaction)}
            className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition"
            title="Hapus Transaksi"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
