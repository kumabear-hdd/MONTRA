import React, { useState } from 'react';
import { ArrowLeftRight, ArrowRight, Check, ShieldAlert } from 'lucide-react';
import { Modal } from '../common/Modal';
import type { CurrencyCode, FinancialSpace, SpaceTransfer } from '../../types/finance';
import { formatCurrency, parseCurrencyInput } from '../../utils/currency';
import { getTodayJakarta } from '../../utils/date';
import { SpaceIcon } from './SpaceIcon';

interface TransferFundsModalProps {
  isOpen: boolean;
  onClose: () => void;
  spaces: FinancialSpace[];
  activeSpaceId: string;
  onTransferFunds: (data: {
    sourceSpaceId: string;
    destSpaceId: string;
    amount: number;
    date: string;
    description: string;
  }) => Promise<SpaceTransfer>;
  currency: CurrencyCode;
}

export const TransferFundsModal: React.FC<TransferFundsModalProps> = ({
  isOpen,
  onClose,
  spaces,
  activeSpaceId,
  onTransferFunds,
  currency,
}) => {
  const activeSpaces = spaces.filter((s) => !s.isArchived);

  const [sourceSpaceId, setSourceSpaceId] = useState<string>(activeSpaceId);
  const [destSpaceId, setDestSpaceId] = useState<string>(() => {
    const other = activeSpaces.find((s) => s.id !== activeSpaceId);
    return other ? other.id : '';
  });
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(getTodayJakarta());
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const sourceSpace = spaces.find((s) => s.id === sourceSpaceId) || activeSpaces[0];
  const destSpace = spaces.find((s) => s.id === destSpaceId);

  const handleSwap = () => {
    if (!destSpaceId) return;
    const temp = sourceSpaceId;
    setSourceSpaceId(destSpaceId);
    setDestSpaceId(temp);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseCurrencyInput(amount);

    if (parsedAmount <= 0) {
      setErrorMessage('Nominal transfer harus lebih besar dari 0.');
      return;
    }
    if (!sourceSpaceId || !destSpaceId) {
      setErrorMessage('Pilih ruang asal dan ruang tujuan transfer.');
      return;
    }
    if (sourceSpaceId === destSpaceId) {
      setErrorMessage('Ruang asal dan ruang tujuan tidak boleh sama.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage(null);
      await onTransferFunds({
        sourceSpaceId,
        destSpaceId,
        amount: parsedAmount,
        date,
        description: description.trim() || `Transfer saldo antar-ruang`,
      });
      // Reset & close
      setAmount('');
      setDescription('');
      onClose();
    } catch (err: any) {
      setErrorMessage(err?.message || 'Gagal memproses transfer dana antar-ruang.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Transfer Saldo Antar-Ruang"
      subtitle="Pindahkan dana secara internal antara ruang keuangan tanpa mengubah total pendapatan/pengeluaran riil."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMessage && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 font-semibold flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Source and Destination Space Selector with Swap button */}
        <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
          {/* Source Space */}
          <div>
            <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-1">
              Dari Ruang (Sumber Dana)
            </label>
            <select
              value={sourceSpaceId}
              onChange={(e) => {
                setSourceSpaceId(e.target.value);
                if (e.target.value === destSpaceId) {
                  const other = activeSpaces.find((s) => s.id !== e.target.value);
                  if (other) setDestSpaceId(other.id);
                }
              }}
              className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs sm:text-sm font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#173D32]/20"
            >
              {activeSpaces.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.type === 'shared' ? 'Shared' : 'Personal'})
                </option>
              ))}
            </select>
          </div>

          {/* Swap Button */}
          <div className="flex justify-center -my-1">
            <button
              type="button"
              onClick={handleSwap}
              className="p-1.5 rounded-full bg-white border border-stone-200 hover:bg-stone-100 text-stone-600 shadow-2xs transition"
              title="Tukar Ruang Asal & Tujuan"
            >
              <ArrowLeftRight className="w-4 h-4" />
            </button>
          </div>

          {/* Destination Space */}
          <div>
            <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-1">
              Ke Ruang (Tujuan Dana)
            </label>
            <select
              value={destSpaceId}
              onChange={(e) => setDestSpaceId(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs sm:text-sm font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#173D32]/20"
            >
              <option value="" disabled>
                Pilih Ruang Tujuan...
              </option>
              {activeSpaces
                .filter((s) => s.id !== sourceSpaceId)
                .map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.type === 'shared' ? 'Shared' : 'Personal'})
                  </option>
                ))}
            </select>
          </div>
        </div>

        {/* Visual Flow Indicator */}
        {sourceSpace && destSpace && (
          <div className="flex items-center justify-between p-2.5 bg-emerald-50/70 border border-emerald-200/80 rounded-xl text-xs">
            <div className="flex items-center gap-1.5">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: sourceSpace.color }}
              />
              <span className="font-bold text-stone-800 truncate max-w-[110px]">
                {sourceSpace.name}
              </span>
            </div>
            <ArrowRight className="w-4 h-4 text-emerald-700 shrink-0" />
            <div className="flex items-center gap-1.5">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: destSpace.color }}
              />
              <span className="font-bold text-stone-800 truncate max-w-[110px]">
                {destSpace.name}
              </span>
            </div>
          </div>
        )}

        {/* Amount */}
        <div>
          <label className="block text-xs font-bold text-stone-700 mb-1">
            Nominal Transfer ({currency}) <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            inputMode="numeric"
            placeholder="0"
            value={amount ? parseCurrencyInput(amount).toLocaleString('id-ID') : ''}
            onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ''))}
            required
            className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-base font-bold tabular-nums text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#173D32]/20 focus:border-[#173D32]"
          />
        </div>

        {/* Date */}
        <div>
          <label className="block text-xs font-bold text-stone-700 mb-1">Tanggal Transfer</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#173D32]/20 focus:border-[#173D32]"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-bold text-stone-700 mb-1">Keterangan / Keperluan</label>
          <input
            type="text"
            placeholder="Contoh: Iuran kas rumah tangga bulan ini, Alokasi dana liburan"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#173D32]/20 focus:border-[#173D32]"
          />
        </div>

        <div className="p-2.5 bg-stone-100 rounded-xl text-[11px] text-stone-500">
          * Transfer antar-ruang dicatat sebagai mutasi dana internal. Saldo ruang sumber akan berkurang dan ruang tujuan akan bertambah secara atomik, tanpa dihitung sebagai pengeluaran atau pemasukan baru di laporan gabungan.
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-stone-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-stone-200 text-stone-600 font-semibold text-xs hover:bg-stone-50 transition"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !destSpaceId}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#173D32] text-white font-semibold text-xs hover:bg-[#123027] active:scale-98 shadow-sm transition disabled:opacity-50"
          >
            <Check className="w-4 h-4 text-[#D9F99D]" />
            <span>{isSubmitting ? 'Memproses Transfer...' : 'Kirim Transfer Saldo'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
