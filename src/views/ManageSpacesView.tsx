import React, { useState } from 'react';
import {
  Archive,
  ArrowRight,
  Building,
  Check,
  Edit2,
  FolderKanban,
  Home,
  Plus,
  RefreshCw,
  Shield,
  Trash2,
  UserCheck,
  Users,
  Wallet,
} from 'lucide-react';
import { ManageMembersModal } from '../components/spaces/ManageMembersModal';
import { SpaceIcon } from '../components/spaces/SpaceIcon';
import { DEMO_MEMBERS } from '../db/db';
import type {
  CurrentUser,
  FinancialSpace,
  SpaceRole,
  SpaceType,
  ViewTab,
} from '../types/finance';
import { formatCurrency } from '../utils/currency';
import { formatFriendlyDate } from '../utils/date';
import { Modal } from '../components/common/Modal';

interface ManageSpacesViewProps {
  spaces: FinancialSpace[];
  activeSpaceId: string;
  currentUser: CurrentUser;
  currentRole: SpaceRole;
  onSelectSpace: (spaceId: string) => void;
  onOpenCreateSpace: () => void;
  onUpdateSpace: (spaceId: string, updates: Partial<FinancialSpace>) => Promise<void>;
  onArchiveSpace: (spaceId: string) => Promise<void>;
  onAddMember: (spaceId: string, member: { name: string; email: string; role: SpaceRole }) => Promise<void>;
  onUpdateRole: (spaceId: string, memberId: string, newRole: SpaceRole) => Promise<void>;
  onRemoveMember: (spaceId: string, memberId: string) => Promise<void>;
  onSwitchDemoUser: (user: CurrentUser) => void;
  setActiveTab: (tab: ViewTab) => void;
  currency: any;
}

export const ManageSpacesView: React.FC<ManageSpacesViewProps> = ({
  spaces,
  activeSpaceId,
  currentUser,
  currentRole,
  onSelectSpace,
  onOpenCreateSpace,
  onUpdateSpace,
  onArchiveSpace,
  onAddMember,
  onUpdateRole,
  onRemoveMember,
  onSwitchDemoUser,
  setActiveTab,
  currency,
}) => {
  const [selectedForMembers, setSelectedForMembers] = useState<FinancialSpace | null>(null);
  const [editingSpace, setEditingSpace] = useState<FinancialSpace | null>(null);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editColor, setEditColor] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const openEditModal = (space: FinancialSpace) => {
    setEditingSpace(space);
    setEditName(space.name);
    setEditDesc(space.description || '');
    setEditColor(space.color || '#173D32');
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSpace || !editName.trim()) return;

    try {
      setIsSavingEdit(true);
      await onUpdateSpace(editingSpace.id, {
        name: editName.trim(),
        description: editDesc.trim(),
        color: editColor,
      });
      setEditingSpace(null);
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleArchive = async (space: FinancialSpace) => {
    if (confirm(`Yakin ingin mengarsipkan ruang "${space.name}"? Data transaksi akan tetap tersimpan.`)) {
      await onArchiveSpace(space.id);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header Card */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white border border-stone-200/80 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#173D32]">Kelola Ruang Keuangan (Financial Spaces)</h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Atur batas data keuangan, anggota kolaborasi, hak akses, dan kepemilikan
          </p>
        </div>

        <button
          onClick={onOpenCreateSpace}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#173D32] text-white font-semibold text-xs hover:bg-[#123027] active:scale-98 shadow-sm transition"
        >
          <Plus className="w-4 h-4 text-[#D9F99D]" />
          <span>+ Buat Ruang Baru</span>
        </button>
      </div>

      {/* Role-Based Permission Simulation Bar */}
      <div className="p-4 sm:p-5 rounded-3xl bg-amber-50/80 border border-amber-200/80 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-100 text-amber-800">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-amber-950 flex items-center gap-2">
                <span>Simulasi Peran Pengguna (Role-Based Access Control)</span>
                <span className="text-[10px] bg-amber-200 text-amber-900 px-1.5 py-0.2 rounded font-semibold uppercase">
                  Aktif: {currentRole}
                </span>
              </p>
              <p className="text-[11px] text-amber-800 mt-0.5">
                Uji coba hak akses sebagai anggota keluarga/rekan di Shared Space:
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {DEMO_MEMBERS.map((u) => {
              const isCurrent = currentUser.id === u.id;
              return (
                <button
                  key={u.id}
                  onClick={() => onSwitchDemoUser(u)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                    isCurrent
                      ? 'bg-amber-900 text-white shadow-xs font-bold'
                      : 'bg-white border border-amber-300 text-amber-900 hover:bg-amber-100'
                  }`}
                >
                  <span>{u.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Spaces Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {spaces.map((space) => {
          const isActive = space.id === activeSpaceId;
          const isShared = space.type === 'shared';
          const isOwner = space.ownerId === currentUser.id;

          return (
            <div
              key={space.id}
              className={`p-6 rounded-3xl bg-white border transition flex flex-col justify-between ${
                space.isArchived
                  ? 'border-stone-200 opacity-60 bg-stone-50'
                  : isActive
                  ? 'border-[#173D32] ring-2 ring-[#173D32]/10 shadow-sm'
                  : 'border-stone-200/80 hover:border-stone-300 shadow-2xs'
              }`}
            >
              <div>
                {/* Header row */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-xs"
                      style={{ backgroundColor: space.color || '#173D32' }}
                    >
                      <SpaceIcon name={space.icon} className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-stone-900 text-base">{space.name}</h3>
                        {isActive && (
                          <span className="text-[10px] font-bold bg-[#173D32] text-[#D9F99D] px-2 py-0.5 rounded-full">
                            Aktif
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                            isShared
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {space.type}
                        </span>
                        <span className="text-xs text-stone-400">
                          Pemilik: <strong className="text-stone-600">{space.ownerName}</strong>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Edit action */}
                  <button
                    onClick={() => openEditModal(space)}
                    className="p-1.5 text-stone-400 hover:text-[#173D32] hover:bg-stone-100 rounded-lg transition"
                    title="Edit Nama & Warna Ruang"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>

                {space.description && (
                  <p className="text-xs text-stone-500 mt-2 mb-4 leading-relaxed">
                    {space.description}
                  </p>
                )}

                {/* Shared Space Members Summary */}
                {isShared && (
                  <div className="mt-3 p-3.5 bg-stone-50 rounded-2xl border border-stone-200/70 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-stone-700 flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-blue-600" />
                        <span>Kolaborasi Anggota ({space.members?.length || 0})</span>
                      </span>
                      <button
                        onClick={() => setSelectedForMembers(space)}
                        className="text-xs font-semibold text-blue-700 hover:underline"
                      >
                        Kelola Izin & Anggota
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {space.members?.map((m) => (
                        <span
                          key={m.id}
                          className="inline-flex items-center gap-1 px-2 py-0.5 bg-white border border-stone-200 rounded-lg text-[11px] text-stone-700"
                        >
                          <span className="font-medium">{m.name}</span>
                          <span className="text-[9px] uppercase font-bold text-stone-400">
                            • {m.role}
                          </span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Card Actions */}
              <div className="mt-5 pt-4 border-t border-stone-100 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  {!isActive && !space.isArchived && (
                    <button
                      onClick={() => {
                        onSelectSpace(space.id);
                        setActiveTab('dashboard');
                      }}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#173D32] text-white font-semibold text-xs hover:bg-[#123027] transition shadow-2xs"
                    >
                      <span>Masuk Ruang Ini</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {isActive && (
                    <button
                      onClick={() => setActiveTab('dashboard')}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-stone-300 text-[#173D32] font-bold text-xs hover:bg-stone-50 transition"
                    >
                      <span>Buka Dashboard</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {isOwner && !space.isArchived && spaces.filter((s) => !s.isArchived).length > 1 && (
                  <button
                    onClick={() => handleArchive(space)}
                    className="p-2 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                    title="Arsipkan Ruang Ini"
                  >
                    <Archive className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Space Modal */}
      {editingSpace && (
        <Modal
          isOpen={!!editingSpace}
          onClose={() => setEditingSpace(null)}
          title={`Edit Ruang — ${editingSpace.name}`}
          subtitle="Perbarui nama ruang, warna aksen, dan deskripsi."
          maxWidth="sm"
        >
          <form onSubmit={handleSaveEdit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Nama Ruang</label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Deskripsi</label>
              <textarea
                rows={2}
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs resize-none"
              />
            </div>

            <div className="flex justify-end gap-2.5 pt-2 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setEditingSpace(null)}
                className="px-4 py-2 border rounded-xl text-xs text-stone-600"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSavingEdit}
                className="px-5 py-2 bg-[#173D32] text-white rounded-xl text-xs font-semibold hover:bg-[#123027]"
              >
                {isSavingEdit ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Manage Members Modal for Shared Spaces */}
      {selectedForMembers && (
        <ManageMembersModal
          isOpen={!!selectedForMembers}
          onClose={() => setSelectedForMembers(null)}
          space={selectedForMembers}
          currentUserId={currentUser.id}
          onAddMember={onAddMember}
          onUpdateRole={onUpdateRole}
          onRemoveMember={onRemoveMember}
        />
      )}
    </div>
  );
};
