import React, { useState } from 'react';
import { Check, Plus, Trash2, Users, Wallet } from 'lucide-react';
import { Modal } from '../common/Modal';
import type { CurrencyCode, SpaceRole, SpaceType } from '../../types/finance';
import { parseCurrencyInput } from '../../utils/currency';
import { SPACE_ICONS, SpaceIcon } from './SpaceIcon';

interface CreateSpaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateSpace: (data: {
    name: string;
    description?: string;
    icon: string;
    color: string;
    type: SpaceType;
    openingBalance?: number;
    initialMembers?: { name: string; email: string; role: SpaceRole }[];
  }) => Promise<any>;
  currency: CurrencyCode;
}

const COLOR_OPTIONS = [
  '#173D32', // Montra Forest Green
  '#0284C7', // Ocean Blue
  '#F97316', // Orange
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#059669', // Emerald
  '#D97706', // Amber
  '#475569', // Slate
];

export const CreateSpaceModal: React.FC<CreateSpaceModalProps> = ({
  isOpen,
  onClose,
  onCreateSpace,
  currency,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<SpaceType>('personal');
  const [icon, setIcon] = useState('Wallet');
  const [color, setColor] = useState('#173D32');
  const [openingBalance, setOpeningBalance] = useState('');
  const [initialMembers, setInitialMembers] = useState<
    { name: string; email: string; role: SpaceRole }[]
  >([]);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState<SpaceRole>('member');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleAddMember = () => {
    if (!newMemberName.trim() || !newMemberEmail.trim()) return;
    setInitialMembers((prev) => [
      ...prev,
      { name: newMemberName.trim(), email: newMemberEmail.trim(), role: newMemberRole },
    ]);
    setNewMemberName('');
    setNewMemberEmail('');
    setNewMemberRole('member');
  };

  const handleRemoveMember = (idx: number) => {
    setInitialMembers((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMessage('Nama ruang keuangan wajib diisi.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage(null);
      await onCreateSpace({
        name: name.trim(),
        description: description.trim(),
        type,
        icon,
        color,
        openingBalance: parseCurrencyInput(openingBalance),
        initialMembers: type === 'shared' ? initialMembers : undefined,
      });
      // Reset form
      setName('');
      setDescription('');
      setType('personal');
      setIcon('Wallet');
      setColor('#173D32');
      setOpeningBalance('');
      setInitialMembers([]);
      onClose();
    } catch (err: any) {
      setErrorMessage(err?.message || 'Gagal membuat ruang keuangan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Buat Ruang Keuangan Baru"
      subtitle="Pisahkan pencatatan keuangan ke dalam ruang mandiri (Personal, Keluarga, Bisnis, dsb)."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMessage && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 font-semibold">
            {errorMessage}
          </div>
        )}

        {/* Space Type Selection */}
        <div>
          <label className="block text-xs font-bold text-stone-700 mb-1.5">
            Tipe Ruang Keuangan
          </label>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => {
                setType('personal');
                if (icon === 'Home') setIcon('Wallet');
              }}
              className={`p-3 rounded-2xl border text-left transition flex items-start gap-2.5 ${
                type === 'personal'
                  ? 'bg-stone-50 border-[#173D32] ring-2 ring-[#173D32]/10'
                  : 'border-stone-200 hover:bg-stone-50'
              }`}
            >
              <div className="p-2 rounded-xl bg-emerald-100 text-[#173D32] shrink-0">
                <Wallet className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-stone-900">Personal (Privat)</p>
                <p className="text-[10px] text-stone-500 mt-0.5">
                  Hanya Anda yang dapat melihat dan mencatat transaksi.
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                setType('shared');
                if (icon === 'Wallet') setIcon('Home');
              }}
              className={`p-3 rounded-2xl border text-left transition flex items-start gap-2.5 ${
                type === 'shared'
                  ? 'bg-blue-50/70 border-blue-600 ring-2 ring-blue-600/10'
                  : 'border-stone-200 hover:bg-stone-50'
              }`}
            >
              <div className="p-2 rounded-xl bg-blue-100 text-blue-700 shrink-0">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-stone-900">Shared (Bersama)</p>
                <p className="text-[10px] text-stone-500 mt-0.5">
                  Kolaborasi bersama keluarga, pasangan, atau rekan.
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* Name */}
        <div>
          <label className="block text-xs font-bold text-stone-700 mb-1">
            Nama Ruang <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            placeholder={
              type === 'shared'
                ? 'Contoh: Rumah Tangga Bersama, Kas Kos, Trip Bali'
                : 'Contoh: Dompet Harian, Tabungan Darurat, Proyek Sampingan'
            }
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#173D32]/20 focus:border-[#173D32]"
          />
        </div>

        {/* Icon & Color Selection */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Icon Picker */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5">Ikon Ruang</label>
            <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto p-1 bg-stone-50 border border-stone-200 rounded-xl">
              {SPACE_ICONS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setIcon(item.id)}
                  className={`p-2 rounded-lg transition ${
                    icon === item.id
                      ? 'bg-[#173D32] text-white shadow-2xs'
                      : 'text-stone-600 hover:bg-stone-200'
                  }`}
                  title={item.label}
                >
                  <item.icon className="w-4 h-4" />
                </button>
              ))}
            </div>
          </div>

          {/* Color Picker */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5">Warna Aksen</label>
            <div className="flex flex-wrap gap-2 p-2 bg-stone-50 border border-stone-200 rounded-xl">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className="w-6 h-6 rounded-full transition flex items-center justify-center shrink-0 shadow-2xs"
                  style={{ backgroundColor: c }}
                >
                  {color === c && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Independent Opening Balance */}
        <div>
          <label className="block text-xs font-bold text-stone-700 mb-1">
            Saldo Awal Ruang ({currency}) (Opsional)
          </label>
          <input
            type="text"
            inputMode="numeric"
            placeholder="0"
            value={openingBalance ? parseCurrencyInput(openingBalance).toLocaleString('id-ID') : ''}
            onChange={(e) => setOpeningBalance(e.target.value.replace(/[^0-9]/g, ''))}
            className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-900 font-bold tabular-nums focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#173D32]/20 focus:border-[#173D32]"
          />
          <p className="text-[10px] text-stone-400 mt-1">
            Setiap ruang memiliki saldo dan perhitungan mandiri yang terpisah secara ketat.
          </p>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-bold text-stone-700 mb-1">
            Deskripsi Ruang (Opsional)
          </label>
          <input
            type="text"
            placeholder="Tujuan atau catatan peruntukan ruang ini..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#173D32]/20 focus:border-[#173D32]"
          />
        </div>

        {/* Add Members for Shared Space */}
        {type === 'shared' && (
          <div className="pt-2 border-t border-stone-100 space-y-2.5">
            <label className="block text-xs font-bold text-stone-700">
              Undang Anggota (Kolaborasi Shared Space)
            </label>

            {/* Member Input Row */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
              <input
                type="text"
                placeholder="Nama Lengkap"
                value={newMemberName}
                onChange={(e) => setNewMemberName(e.target.value)}
                className="sm:col-span-4 px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-xs"
              />
              <input
                type="email"
                placeholder="Email Anggota"
                value={newMemberEmail}
                onChange={(e) => setNewMemberEmail(e.target.value)}
                className="sm:col-span-5 px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-xs"
              />
              <select
                value={newMemberRole}
                onChange={(e) => setNewMemberRole(e.target.value as SpaceRole)}
                className="sm:col-span-3 px-2 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-xs font-medium"
              >
                <option value="member">Member</option>
                <option value="admin">Admin</option>
                <option value="viewer">Viewer (Read-only)</option>
              </select>
            </div>

            <button
              type="button"
              onClick={handleAddMember}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-xs font-semibold transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Anggota ke Daftar</span>
            </button>

            {/* List of staged members */}
            {initialMembers.length > 0 && (
              <div className="space-y-1.5 pt-1">
                {initialMembers.map((m, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 rounded-xl bg-stone-50 border border-stone-200/80 text-xs"
                  >
                    <div>
                      <span className="font-bold text-stone-800">{m.name}</span>
                      <span className="text-stone-400 text-[11px] ml-1.5">({m.email})</span>
                      <span className="ml-2 text-[10px] font-semibold bg-blue-100 text-blue-800 px-1.5 py-0.2 rounded uppercase">
                        {m.role}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveMember(idx)}
                      className="text-stone-400 hover:text-rose-600 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-stone-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-stone-200 text-stone-600 font-semibold text-xs hover:bg-stone-50 transition"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2.5 rounded-xl bg-[#173D32] text-white font-semibold text-xs hover:bg-[#123027] active:scale-98 shadow-sm transition disabled:opacity-50"
          >
            {isSubmitting ? 'Membuat...' : 'Buat Ruang Keuangan'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
