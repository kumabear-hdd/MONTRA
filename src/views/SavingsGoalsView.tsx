import React, { useState } from 'react';
import {
  ArrowDownCircle,
  ArrowUpCircle,
  Calendar,
  CheckCircle2,
  Clock,
  Edit2,
  History,
  PiggyBank,
  Plus,
  Target,
  Trash2,
} from 'lucide-react';
import { Modal } from '../components/common/Modal';
import type { CurrencyCode, SavingsGoal, SavingsLog } from '../types/finance';
import { formatCurrency, parseCurrencyInput } from '../utils/currency';
import { formatFriendlyDate, getTodayJakarta } from '../utils/date';

interface SavingsGoalsViewProps {
  savingsGoals: SavingsGoal[];
  savingsLogs: SavingsLog[];
  currency: CurrencyCode;
  onAddGoal: (data: {
    name: string;
    targetAmount: number;
    currentAmount?: number;
    targetDate: string;
    category?: string;
    notes?: string;
  }) => Promise<any>;
  onEditGoal: (id: string, updates: Partial<SavingsGoal>) => Promise<void>;
  onDeleteGoal: (id: string) => Promise<void>;
  onContribute: (
    goalId: string,
    amount: number,
    type: 'deposit' | 'withdraw',
    notes?: string
  ) => Promise<void>;
}

export const SavingsGoalsView: React.FC<SavingsGoalsViewProps> = ({
  savingsGoals,
  savingsLogs,
  currency,
  onAddGoal,
  onEditGoal,
  onDeleteGoal,
  onContribute,
}) => {
  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<SavingsGoal | null>(null);
  const [transferType, setTransferType] = useState<'deposit' | 'withdraw'>('deposit');
  const [transferAmount, setTransferAmount] = useState('');
  const [transferNotes, setTransferNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New goal form state
  const [newGoalName, setNewGoalName] = useState('');
  const [newGoalTarget, setNewGoalTarget] = useState('');
  const [newGoalCurrent, setNewGoalCurrent] = useState('');
  const [newGoalDate, setNewGoalDate] = useState('');
  const [newGoalNotes, setNewGoalNotes] = useState('');

  // Overall calculations
  const totalTarget = savingsGoals.reduce((sum, g) => sum + g.targetAmount, 0);
  const totalSaved = savingsGoals.reduce((sum, g) => sum + g.currentAmount, 0);
  const overallProgress = totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0;

  // Open Transfer Modal
  const openTransferModal = (goal: SavingsGoal, type: 'deposit' | 'withdraw') => {
    setSelectedGoal(goal);
    setTransferType(type);
    setTransferAmount('');
    setTransferNotes('');
    setIsTransferModalOpen(true);
  };

  const handleTransferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGoal) return;
    const parsedAmount = parseCurrencyInput(transferAmount);
    if (parsedAmount <= 0) return;

    try {
      setIsSubmitting(true);
      await onContribute(selectedGoal.id, parsedAmount, transferType, transferNotes);
      setIsTransferModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateGoalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetParsed = parseCurrencyInput(newGoalTarget);
    const currentParsed = parseCurrencyInput(newGoalCurrent);
    if (!newGoalName.trim() || targetParsed <= 0) return;

    try {
      setIsSubmitting(true);
      await onAddGoal({
        name: newGoalName.trim(),
        targetAmount: targetParsed,
        currentAmount: currentParsed,
        targetDate: newGoalDate || `${new Date().getFullYear()}-12-31`,
        notes: newGoalNotes.trim(),
      });
      setIsAddModalOpen(false);
      setNewGoalName('');
      setNewGoalTarget('');
      setNewGoalCurrent('');
      setNewGoalNotes('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header Card */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white border border-stone-200/80 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#173D32]">Target & Rencana Tabungan</h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Wujudkan tujuan finansial Anda secara disiplin dan terukur
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#173D32] text-white font-semibold text-xs hover:bg-[#123027] active:scale-98 shadow-sm transition"
        >
          <Plus className="w-4 h-4 text-[#D9F99D]" />
          <span>+ Buat Target Tabungan</span>
        </button>
      </div>

      {/* Aggregate Savings Progress Hero Card */}
      <div className="p-6 sm:p-7 rounded-3xl bg-white border border-stone-200/80 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-stone-100">
          <div>
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block mb-1">
              Total Akumulasi Tabungan
            </span>
            <h3 className="text-3xl font-extrabold text-[#173D32] tabular-nums">
              {formatCurrency(totalSaved, currency)}
            </h3>
            <p className="text-xs text-stone-400 mt-1">
              Dari total target akumulatif {formatCurrency(totalTarget, currency)} ({overallProgress}%)
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="p-3.5 bg-stone-50 rounded-2xl">
              <span className="text-stone-500 block mb-0.5">Sisa Perlu Ditabung:</span>
              <span className="text-base font-bold text-stone-800 tabular-nums">
                {formatCurrency(Math.max(0, totalTarget - totalSaved), currency)}
              </span>
            </div>
            <div className="p-3.5 bg-stone-50 rounded-2xl">
              <span className="text-stone-500 block mb-0.5">Jumlah Target:</span>
              <span className="text-base font-bold text-[#173D32] tabular-nums">
                {savingsGoals.length} Impian
              </span>
            </div>
          </div>
        </div>

        {/* Aggregate Progress Bar */}
        <div className="mt-5">
          <div className="flex justify-between text-xs font-semibold mb-1.5">
            <span className="text-stone-600">Progres Keseluruhan</span>
            <span className="text-[#173D32] font-bold">{overallProgress}% tercapai</span>
          </div>
          <div className="w-full bg-stone-100 h-3 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#173D32] rounded-full transition-all duration-700"
              style={{ width: `${Math.min(100, overallProgress)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Goals Cards Grid */}
      {savingsGoals.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-stone-200/80 shadow-2xs">
          <div className="w-12 h-12 rounded-2xl bg-lime-50 text-[#173D32] flex items-center justify-center mx-auto mb-3">
            <PiggyBank className="w-6 h-6" />
          </div>
          <h4 className="text-base font-bold text-stone-800">Belum ada target tabungan</h4>
          <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
            Belum ada target tabungan. Tentukan tujuan finansialmu.
          </p>
          <div className="flex items-center justify-center gap-2 mt-4">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-[#173D32] text-white text-xs font-semibold hover:bg-[#123027] transition shadow-xs flex items-center gap-2"
            >
              <Plus className="w-4 h-4 text-[#D9F99D]" />
              <span>Buat Target Tabungan Pertama</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {savingsGoals.map((goal) => {
          const progress =
            goal.targetAmount > 0
              ? Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100))
              : 0;
          const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);
          const isCompleted = goal.currentAmount >= goal.targetAmount;

          return (
            <div
              key={goal.id}
              className="p-6 rounded-3xl bg-white border border-stone-200/80 hover:border-stone-300 shadow-2xs transition flex flex-col justify-between"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-xl bg-lime-50 text-[#173D32]">
                        <PiggyBank className="w-4 h-4" />
                      </div>
                      <h4 className="text-base font-bold text-stone-900">{goal.name}</h4>
                    </div>
                    {goal.notes && (
                      <p className="text-xs text-stone-400 mt-1 line-clamp-1">{goal.notes}</p>
                    )}
                  </div>

                  <button
                    onClick={() => onDeleteGoal(goal.id)}
                    className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                    title="Hapus Target"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Amounts display */}
                <div className="grid grid-cols-2 gap-3 my-4 p-3 bg-stone-50 rounded-2xl text-xs">
                  <div>
                    <span className="text-stone-400 block text-[11px]">Terkumpul:</span>
                    <span className="text-sm font-bold text-[#173D32] tabular-nums">
                      {formatCurrency(goal.currentAmount, currency)}
                    </span>
                  </div>
                  <div>
                    <span className="text-stone-400 block text-[11px]">Target Dana:</span>
                    <span className="text-sm font-bold text-stone-800 tabular-nums">
                      {formatCurrency(goal.targetAmount, currency)}
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-stone-500">Progres: {progress}%</span>
                    <span className={isCompleted ? 'text-emerald-700 font-bold' : 'text-stone-600'}>
                      {isCompleted ? 'Target Tercapai!' : `Sisa ${formatCurrency(remaining, currency)}`}
                    </span>
                  </div>
                  <div className="w-full bg-stone-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isCompleted ? 'bg-emerald-600' : 'bg-[#173D32]'
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {/* Target Date */}
                <div className="flex items-center gap-1.5 text-xs text-stone-400 mt-4">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Target tercapai: {formatFriendlyDate(goal.targetDate)}</span>
                </div>
              </div>

              {/* Action Buttons: Setor / Tarik Tabungan */}
              <div className="grid grid-cols-2 gap-2 mt-5 pt-4 border-t border-stone-100">
                <button
                  onClick={() => openTransferModal(goal, 'deposit')}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-[#173D32] text-white font-semibold text-xs hover:bg-[#123027] transition shadow-xs"
                >
                  <ArrowDownCircle className="w-3.5 h-3.5 text-[#D9F99D]" />
                  <span>Setor Tabungan</span>
                </button>

                <button
                  onClick={() => openTransferModal(goal, 'withdraw')}
                  disabled={goal.currentAmount <= 0}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-stone-200 text-stone-700 font-semibold text-xs hover:bg-stone-50 transition disabled:opacity-40"
                >
                  <ArrowUpCircle className="w-3.5 h-3.5 text-stone-500" />
                  <span>Tarik Saldo</span>
                </button>
              </div>
            </div>
          );
        })}
        </div>
      )}

      {/* History of Savings Transfers */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white border border-stone-200/80 shadow-2xs">
        <h3 className="text-base font-bold text-[#173D32] flex items-center gap-2 mb-4">
          <History className="w-4 h-4 text-[#173D32]" />
          <span>Riwayat Mutasi Tabungan Terakhir</span>
        </h3>

        {savingsLogs.length > 0 ? (
          <div className="space-y-2">
            {savingsLogs.slice(-6).reverse().map((log) => {
              const relatedGoal = savingsGoals.find((g) => g.id === log.goalId);
              const isDeposit = log.type === 'deposit';
              return (
                <div
                  key={log.id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-stone-50 border border-stone-200/60 text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`p-1.5 rounded-lg ${
                        isDeposit ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-700'
                      }`}
                    >
                      {isDeposit ? (
                        <ArrowDownCircle className="w-4 h-4" />
                      ) : (
                        <ArrowUpCircle className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-stone-900">
                        {isDeposit ? 'Setoran Masuk' : 'Penarikan'} — {relatedGoal?.name || 'Target Tabungan'}
                      </p>
                      <p className="text-[11px] text-stone-500">
                        {formatFriendlyDate(log.date)} {log.notes ? `• ${log.notes}` : ''}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`font-bold tabular-nums ${
                      isDeposit ? 'text-emerald-700' : 'text-stone-700'
                    }`}
                  >
                    {isDeposit ? '+' : '-'}
                    {formatCurrency(log.amount, currency)}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-stone-400 py-3">Belum ada riwayat setoran atau penarikan tabungan.</p>
        )}
      </div>

      {/* Create New Goal Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Buat Target Tabungan Baru"
        subtitle="Rencanakan target dana dan batas waktu pencapaian."
        maxWidth="md"
      >
        <form onSubmit={handleCreateGoalSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Nama Impian / Target <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Contoh: Beli Laptop Baru / Dana Darurat"
              value={newGoalName}
              onChange={(e) => setNewGoalName(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#173D32]/20 focus:border-[#173D32]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Target Nominal ({currency}) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                inputMode="numeric"
                placeholder="Contoh: 15.000.000"
                value={newGoalTarget ? parseCurrencyInput(newGoalTarget).toLocaleString('id-ID') : ''}
                onChange={(e) => setNewGoalTarget(e.target.value.replace(/[^0-9]/g, ''))}
                required
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#173D32]/20 focus:border-[#173D32]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Saldo Saat Ini (Opsional)
              </label>
              <input
                type="text"
                inputMode="numeric"
                placeholder="0"
                value={newGoalCurrent ? parseCurrencyInput(newGoalCurrent).toLocaleString('id-ID') : ''}
                onChange={(e) => setNewGoalCurrent(e.target.value.replace(/[^0-9]/g, ''))}
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#173D32]/20 focus:border-[#173D32]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">Target Tanggal</label>
            <input
              type="date"
              value={newGoalDate}
              onChange={(e) => setNewGoalDate(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#173D32]/20 focus:border-[#173D32]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">Catatan</label>
            <textarea
              rows={2}
              placeholder="Rencana strategi menabung..."
              value={newGoalNotes}
              onChange={(e) => setNewGoalNotes(e.target.value)}
              className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#173D32]/20 focus:border-[#173D32] resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-stone-100">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2.5 rounded-xl border border-stone-200 text-stone-600 font-semibold text-xs hover:bg-stone-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-[#173D32] text-white font-semibold text-xs hover:bg-[#123027] shadow-sm"
            >
              {isSubmitting ? 'Menyimpan...' : 'Buat Target'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Transfer Contribution / Withdrawal Modal */}
      <Modal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        title={
          transferType === 'deposit'
            ? `Setor Tabungan — ${selectedGoal?.name}`
            : `Tarik Saldo — ${selectedGoal?.name}`
        }
        subtitle="Dana dialokasikan secara internal dan tidak dihitung ganda sebagai pemasukan/pengeluaran baru."
        maxWidth="sm"
      >
        <form onSubmit={handleTransferSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Nominal ({currency})
            </label>
            <input
              type="text"
              inputMode="numeric"
              placeholder="Contoh: 500.000"
              value={transferAmount ? parseCurrencyInput(transferAmount).toLocaleString('id-ID') : ''}
              onChange={(e) => setTransferAmount(e.target.value.replace(/[^0-9]/g, ''))}
              required
              className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl text-base font-bold text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#173D32]/20 focus:border-[#173D32] tabular-nums"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">Catatan (Opsional)</label>
            <input
              type="text"
              placeholder={transferType === 'deposit' ? 'Contoh: Alokasi gaji bulan ini' : 'Contoh: Kebutuhan darurat'}
              value={transferNotes}
              onChange={(e) => setTransferNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#173D32]/20 focus:border-[#173D32]"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-stone-100">
            <button
              type="button"
              onClick={() => setIsTransferModalOpen(false)}
              className="px-4 py-2.5 rounded-xl border border-stone-200 text-stone-600 font-semibold text-xs hover:bg-stone-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-[#173D32] text-white font-semibold text-xs hover:bg-[#123027] shadow-sm"
            >
              {isSubmitting
                ? 'Menyimpan...'
                : transferType === 'deposit'
                ? 'Konfirmasi Setor'
                : 'Konfirmasi Tarik'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
