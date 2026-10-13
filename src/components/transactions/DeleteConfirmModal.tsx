import React, { useState } from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';
import type { CurrencyCode, Transaction } from '../../types/finance';
import { formatCurrency } from '../../utils/currency';
import { formatFriendlyDate } from '../../utils/date';
import { Modal } from '../common/Modal';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
  onConfirm: () => Promise<void>;
  currency: CurrencyCode;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  transaction,
  onConfirm,
  currency,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);

  if (!transaction) return null;

  const handleConfirm = async () => {
    try {
      setIsDeleting(true);
      await onConfirm();
      onClose();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Hapus Transaksi?"
      subtitle="Tindakan ini akan menghapus catatan dan memperbarui saldo serta anggaran terkait."
      maxWidth="sm"
    >
      <div className="space-y-4">
        <div className="flex items-center gap-3 p-3.5 bg-rose-50 border border-rose-200/80 rounded-2xl">
          <div className="p-2 bg-rose-100 rounded-xl text-rose-700 shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-rose-950">{transaction.title}</h4>
            <div className="flex items-center gap-2 text-xs text-rose-700 mt-0.5">
              <span>{formatFriendlyDate(transaction.date)}</span>
              <span>•</span>
              <span className="font-semibold">{formatCurrency(transaction.amount, currency)}</span>
            </div>
          </div>
        </div>

        <p className="text-xs text-stone-500">
          Apakah Anda yakin ingin menghapus transaksi ini? Data yang terhapus tidak dapat dikembalikan.
        </p>

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-stone-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-stone-200 text-stone-600 font-semibold text-sm hover:bg-stone-50 transition"
          >
            Batal
          </button>
          <button
            type="button"
            disabled={isDeleting}
            onClick={handleConfirm}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 text-white font-semibold text-sm hover:bg-rose-700 active:scale-98 shadow-sm transition disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
            <span>{isDeleting ? 'Menghapus...' : 'Ya, Hapus'}</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};
