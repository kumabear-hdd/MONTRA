import React, { useEffect, useState } from 'react';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Calendar,
  Camera,
  Check,
  FileText,
  Sparkles,
  Tag,
} from 'lucide-react';
import type {
  CurrencyCode,
  ExpenseCategory,
  IncomeCategory,
  Transaction,
  TransactionType,
} from '../../types/finance';
import { CATEGORY_DETAILS, EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../../utils/categories';
import { formatCurrency, parseCurrencyInput } from '../../utils/currency';
import { getTodayJakarta } from '../../utils/date';
import { Modal } from '../common/Modal';
import { ParsedReceiptData, ReceiptScannerModal } from '../scanner/ReceiptScannerModal';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    type: TransactionType;
    title: string;
    amount: number;
    category: any;
    date: string;
    notes?: string;
  }) => Promise<void>;
  editingTransaction?: Transaction | null;
  currency: CurrencyCode;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingTransaction,
  currency,
}) => {
  const [type, setType] = useState<TransactionType>('expense');
  const [title, setTitle] = useState('');
  const [rawAmount, setRawAmount] = useState('');
  const [category, setCategory] = useState<string>('Food & Drinks');
  const [date, setDate] = useState<string>(getTodayJakarta());
  const [notes, setNotes] = useState('');

  const [errors, setErrors] = useState<{ title?: string; amount?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Scanner modal state & OCR feedback
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [ocrSuccessBanner, setOcrSuccessBanner] = useState<string | null>(null);

  useEffect(() => {
    if (editingTransaction) {
      setType(editingTransaction.type);
      setTitle(editingTransaction.title);
      setRawAmount(editingTransaction.amount.toString());
      setCategory(editingTransaction.category);
      setDate(editingTransaction.date);
      setNotes(editingTransaction.notes || '');
      setOcrSuccessBanner(null);
    } else {
      setType('expense');
      setTitle('');
      setRawAmount('');
      setCategory('Food & Drinks');
      setDate(getTodayJakarta());
      setNotes('');
      setOcrSuccessBanner(null);
    }
    setErrors({});
  }, [editingTransaction, isOpen]);

  // When receipt is parsed from OCR
  const handleReceiptParsed = (parsed: ParsedReceiptData) => {
    setType('expense');
    setTitle(parsed.merchant);
    setRawAmount(parsed.amount.toString());
    setCategory(parsed.category || 'Food & Drinks');
    setDate(parsed.date || getTodayJakarta());
    setNotes(parsed.notes || '');
    setErrors({});
    setOcrSuccessBanner(
      `Struk ${parsed.merchant} berhasil dipindai! Nominal Rp${parsed.amount.toLocaleString('id-ID')} dan detail lainnya telah diisi otomatis.`
    );
  };

  // When type toggles, switch default category if mismatch
  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    if (newType === 'expense' && !EXPENSE_CATEGORIES.includes(category as ExpenseCategory)) {
      setCategory('Food & Drinks');
    } else if (newType === 'income' && !INCOME_CATEGORIES.includes(category as IncomeCategory)) {
      setCategory('Salary');
    }
  };

  const handleQuickAddAmount = (addVal: number) => {
    const current = parseCurrencyInput(rawAmount);
    setRawAmount((current + addVal).toString());
    if (errors.amount) setErrors((prev) => ({ ...prev, amount: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const parsedAmount = parseCurrencyInput(rawAmount);
    const newErrors: { title?: string; amount?: string } = {};

    if (!title.trim()) {
      newErrors.title = 'Judul transaksi wajib diisi.';
    }
    if (parsedAmount <= 0) {
      newErrors.amount = 'Nominal harus lebih dari 0.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setIsSubmitting(true);
      await onSave({
        type,
        title: title.trim(),
        amount: parsedAmount,
        category,
        date,
        notes: notes.trim(),
      });
      onClose();
    } catch (err: any) {
      setErrors({ title: err?.message || 'Gagal menyimpan transaksi.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const availableCategories = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={editingTransaction ? 'Edit Transaksi' : 'Catat Transaksi'}
        subtitle={
          editingTransaction
            ? 'Perbarui detail transaksi dan saldo akan dihitung ulang secara otomatis.'
            : 'Pemasukan atau pengeluaran akan langsung memperbarui saldo & anggaran.'
        }
        maxWidth="md"
      >
        <div className="space-y-4">
          {/* Quick Receipt Scanner Action Banner for Fast Data Entry */}
          {!editingTransaction && (
            <div className="flex items-center justify-between p-3 bg-[#173D32]/5 border border-[#173D32]/15 rounded-2xl">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#173D32] text-[#D9F99D] shadow-xs">
                  <Camera className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#173D32] flex items-center gap-1.5">
                    <span>Pindai Struk dengan Kamera</span>
                    <span className="text-[10px] font-semibold bg-[#D9F99D] text-[#173D32] px-1.5 py-0.2 rounded">
                      AI OCR
                    </span>
                  </p>
                  <p className="text-[11px] text-stone-500">
                    Otomatis isi nominal, tanggal, dan toko
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsScannerOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#173D32] text-white text-xs font-semibold hover:bg-[#123027] active:scale-95 shadow-xs transition"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#D9F99D]" />
                <span>Scan Struk</span>
              </button>
            </div>
          )}

          {/* OCR Success Notification Banner */}
          {ocrSuccessBanner && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-900 flex items-start gap-2 animate-fadeIn">
              <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-bold">Hasil Pemindaian AI OCR Berhasil</p>
                <p className="text-[11px] text-emerald-700 mt-0.5">{ocrSuccessBanner}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Type Toggle: Expense vs Income */}
            <div className="grid grid-cols-2 p-1 bg-stone-100 rounded-2xl gap-1">
              <button
                type="button"
                onClick={() => handleTypeChange('expense')}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition ${
                  type === 'expense'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <ArrowDownLeft className="w-4 h-4" />
                <span>Pengeluaran (Expense)</span>
              </button>

              <button
                type="button"
                onClick={() => handleTypeChange('income')}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition ${
                  type === 'income'
                    ? 'bg-emerald-700 text-white shadow-sm'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <ArrowUpRight className="w-4 h-4" />
                <span>Pemasukan (Income)</span>
              </button>
            </div>

            {/* Amount Input */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Nominal ({currency}) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <span className="text-stone-400 font-bold text-sm">
                    {currency === 'IDR' ? 'Rp' : currency}
                  </span>
                </div>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="0"
                  value={rawAmount ? parseCurrencyInput(rawAmount).toLocaleString('id-ID') : ''}
                  onChange={(e) => {
                    const numeric = e.target.value.replace(/[^0-9]/g, '');
                    setRawAmount(numeric);
                    if (errors.amount) setErrors((prev) => ({ ...prev, amount: undefined }));
                  }}
                  className={`w-full pl-11 pr-4 py-3 bg-stone-50 border rounded-2xl text-base font-bold text-stone-900 focus:bg-white focus:outline-none focus:ring-2 tabular-nums transition ${
                    errors.amount
                      ? 'border-rose-300 focus:ring-rose-500/20'
                      : 'border-stone-200 focus:ring-[#173D32]/20 focus:border-[#173D32]'
                  }`}
                />
              </div>
              {errors.amount && (
                <p className="text-xs text-rose-600 mt-1 font-medium">{errors.amount}</p>
              )}

              {/* Quick preset chips for IDR */}
              {currency === 'IDR' && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {[25000, 50000, 100000, 250000, 500000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => handleQuickAddAmount(amt)}
                      className="px-2.5 py-1 text-[11px] font-medium bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg transition"
                    >
                      +{formatCurrency(amt, 'IDR')}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Title / Description */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Keterangan / Merchant <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder={
                  type === 'expense'
                    ? 'Contoh: Indomaret Point, Makan Siang, KRL'
                    : 'Contoh: Gaji Bulanan, Freelance'
                }
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (errors.title) setErrors((prev) => ({ ...prev, title: undefined }));
                }}
                className={`w-full px-3.5 py-2.5 bg-stone-50 border rounded-2xl text-sm text-stone-900 focus:bg-white focus:outline-none focus:ring-2 transition ${
                  errors.title
                    ? 'border-rose-300 focus:ring-rose-500/20'
                    : 'border-stone-200 focus:ring-[#173D32]/20 focus:border-[#173D32]'
                }`}
              />
              {errors.title && (
                <p className="text-xs text-rose-600 mt-1 font-medium">{errors.title}</p>
              )}
            </div>

            {/* Category & Date in 2 columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Category */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5 text-stone-400" />
                  <span>Kategori</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-2xl text-sm text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#173D32]/20 focus:border-[#173D32] transition"
                >
                  {availableCategories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-stone-400" />
                  <span>Tanggal</span>
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-2xl text-sm text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#173D32]/20 focus:border-[#173D32] transition"
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-stone-400" />
                <span>Catatan Tambahan (Opsional)</span>
              </label>
              <textarea
                rows={2}
                placeholder="Rincian barang atau nomor struk..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-2xl text-sm text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#173D32]/20 focus:border-[#173D32] transition resize-none"
              />
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-stone-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-stone-200 text-stone-600 font-semibold text-sm hover:bg-stone-50 transition"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#173D32] text-white font-semibold text-sm hover:bg-[#123027] active:scale-98 shadow-sm transition disabled:opacity-50"
              >
                <Check className="w-4 h-4 text-[#D9F99D]" />
                <span>
                  {isSubmitting
                    ? 'Menyimpan...'
                    : editingTransaction
                    ? 'Perbarui'
                    : 'Simpan Transaksi'}
                </span>
              </button>
            </div>
          </form>
        </div>
      </Modal>

      {/* OCR Scanner Modal Dialog */}
      <ReceiptScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onReceiptParsed={handleReceiptParsed}
      />
    </>
  );
};
