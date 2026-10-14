import React, { useState } from 'react';
import {
  Check,
  Plus,
  Shield,
  Trash2,
  UserCheck,
  UserPlus,
  Users,
} from 'lucide-react';
import { Modal } from '../common/Modal';
import type { FinancialSpace, SpaceRole } from '../../types/finance';

interface ManageMembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  space: FinancialSpace;
  currentUserId: string;
  onAddMember: (spaceId: string, member: { name: string; email: string; role: SpaceRole }) => Promise<void>;
  onUpdateRole: (spaceId: string, memberId: string, newRole: SpaceRole) => Promise<void>;
  onRemoveMember: (spaceId: string, memberId: string) => Promise<void>;
}

export const ManageMembersModal: React.FC<ManageMembersModalProps> = ({
  isOpen,
  onClose,
  space,
  currentUserId,
  onAddMember,
  onUpdateRole,
  onRemoveMember,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<SpaceRole>('member');
  const [isAdding, setIsAdding] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isOwner = space.ownerId === currentUserId;

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    try {
      setIsAdding(true);
      setErrorMsg(null);
      await onAddMember(space.id, {
        name: name.trim(),
        email: email.trim(),
        role,
      });
      setName('');
      setEmail('');
      setRole('member');
    } catch (err: any) {
      setErrorMsg(err?.message || 'Gagal menambahkan anggota.');
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Anggota Ruang — ${space.name}`}
      subtitle="Kelola hak akses kolaborasi: Owner, Admin, Member, atau Viewer (Read-only)."
      maxWidth="md"
    >
      <div className="space-y-5">
        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 font-semibold">
            {errorMsg}
          </div>
        )}

        {/* Members List */}
        <div>
          <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
            Daftar Anggota Aktif ({space.members?.length || 0})
          </h4>
          <div className="divide-y divide-stone-100 border border-stone-200 rounded-2xl overflow-hidden bg-white">
            {space.members?.map((m) => {
              const isSelf = m.userId === currentUserId;
              const isSpaceOwner = m.role === 'owner';

              return (
                <div
                  key={m.id}
                  className="flex items-center justify-between p-3.5 hover:bg-stone-50 transition text-xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-[#173D32]/10 text-[#173D32] font-bold flex items-center justify-center shrink-0">
                      {m.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-stone-900 truncate">{m.name}</span>
                        {isSelf && (
                          <span className="text-[10px] text-stone-400 font-semibold">(Anda)</span>
                        )}
                      </div>
                      <p className="text-[11px] text-stone-500 truncate">{m.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {/* Role Selector or Badge */}
                    {isOwner && !isSpaceOwner ? (
                      <select
                        value={m.role}
                        onChange={(e) =>
                          onUpdateRole(space.id, m.id, e.target.value as SpaceRole)
                        }
                        className="px-2 py-1 bg-stone-100 border border-stone-200 rounded-lg text-xs font-semibold text-stone-800 focus:outline-none"
                      >
                        <option value="admin">Admin</option>
                        <option value="member">Member</option>
                        <option value="viewer">Viewer (Read-only)</option>
                      </select>
                    ) : (
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                          m.role === 'owner'
                            ? 'bg-amber-100 text-amber-900'
                            : m.role === 'admin'
                            ? 'bg-blue-100 text-blue-900'
                            : m.role === 'viewer'
                            ? 'bg-stone-100 text-stone-700'
                            : 'bg-emerald-100 text-emerald-900'
                        }`}
                      >
                        {m.role}
                      </span>
                    )}

                    {/* Remove Member Button */}
                    {isOwner && !isSpaceOwner && (
                      <button
                        onClick={() => onRemoveMember(space.id, m.id)}
                        className="p-1.5 text-stone-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                        title="Hapus Anggota"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Invite New Member Form (Only for Owner or Admin) */}
        {isOwner && (
          <form
            onSubmit={handleAddSubmit}
            className="p-4 bg-stone-50 border border-stone-200 rounded-2xl space-y-3"
          >
            <h4 className="text-xs font-bold text-[#173D32] flex items-center gap-1.5">
              <UserPlus className="w-4 h-4 text-[#173D32]" />
              <span>Undang Anggota Baru ke Ruang Ini</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 text-xs">
              <input
                type="text"
                placeholder="Nama Lengkap"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="sm:col-span-4 px-3 py-2 bg-white border border-stone-200 rounded-xl"
              />
              <input
                type="email"
                placeholder="Email Anggota"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="sm:col-span-5 px-3 py-2 bg-white border border-stone-200 rounded-xl"
              />
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as SpaceRole)}
                className="sm:col-span-3 px-2.5 py-2 bg-white border border-stone-200 rounded-xl font-semibold"
              >
                <option value="member">Member</option>
                <option value="admin">Admin</option>
                <option value="viewer">Viewer (Read-only)</option>
              </select>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                disabled={isAdding}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#173D32] text-white font-semibold text-xs rounded-xl hover:bg-[#123027] transition disabled:opacity-50"
              >
                <Plus className="w-3.5 h-3.5 text-[#D9F99D]" />
                <span>{isAdding ? 'Menambahkan...' : 'Kirim Undangan'}</span>
              </button>
            </div>
          </form>
        )}

        {/* Role Explanation Legend */}
        <div className="p-3 bg-stone-50 rounded-xl text-[11px] text-stone-500 space-y-1">
          <p className="font-semibold text-stone-700">Panduan Peran & Izin:</p>
          <ul className="list-disc list-inside space-y-0.5">
            <li><strong>Owner</strong>: Pemilik ruang, kontrol penuh, undang/hapus anggota & kelola ruang.</li>
            <li><strong>Admin</strong>: Dapat mencatat, mengedit, dan menghapus transaksi serta mengatur anggaran.</li>
            <li><strong>Member</strong>: Dapat mencatat transaksi dan berkontribusi pada target tabungan.</li>
            <li><strong>Viewer</strong>: Hanya dapat melihat saldo, riwayat, dan laporan tanpa hak mengubah.</li>
          </ul>
        </div>

        <div className="flex justify-end pt-2 border-t border-stone-100">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold text-xs transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </Modal>
  );
};
