import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowLeftRight,
  Check,
  ChevronDown,
  Layers,
  Plus,
  Settings2,
  Shield,
  Users,
} from 'lucide-react';
import type { CurrencyCode, FinancialSpace, ViewTab } from '../../types/finance';
import { formatCurrency } from '../../utils/currency';
import { SpaceIcon } from './SpaceIcon';

interface SpaceSelectorProps {
  spaces: FinancialSpace[];
  activeSpace: FinancialSpace;
  onSelectSpace: (spaceId: string) => void;
  onOpenCreateSpace: () => void;
  onOpenTransferModal: () => void;
  setActiveTab: (tab: ViewTab) => void;
  currency: CurrencyCode;
  compact?: boolean;
}

export const SpaceSelector: React.FC<SpaceSelectorProps> = ({
  spaces,
  activeSpace,
  onSelectSpace,
  onOpenCreateSpace,
  onOpenTransferModal,
  setActiveTab,
  currency,
  compact = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeSpaces = spaces.filter((s) => !s.isArchived);

  return (
    <div ref={containerRef} className="relative z-30">
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2.5 rounded-2xl border transition text-left group ${
          compact
            ? 'px-2.5 py-1.5 bg-white border-stone-200 shadow-2xs hover:border-stone-300'
            : 'w-full p-2.5 bg-stone-50 border-stone-200/90 hover:bg-stone-100 hover:border-stone-300 shadow-2xs'
        }`}
        title="Beralih Ruang Keuangan (Switch Financial Space)"
      >
        {/* Space Color & Icon Chip */}
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center text-white shrink-0 shadow-xs transition group-hover:scale-105"
          style={{ backgroundColor: activeSpace.color || '#173D32' }}
        >
          <SpaceIcon name={activeSpace.icon} className="w-4 h-4" />
        </div>

        {/* Space Name & Type */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-xs text-stone-900 truncate">
              {activeSpace.name}
            </span>
            <span
              className={`text-[9px] font-bold px-1.5 py-0.2 rounded-md uppercase tracking-wider shrink-0 ${
                activeSpace.type === 'shared'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              {activeSpace.type === 'shared' ? 'Shared' : 'Personal'}
            </span>
          </div>
          {!compact && (
            <p className="text-[10px] text-stone-500 truncate mt-0.5">
              {activeSpace.type === 'shared'
                ? `${activeSpace.members?.length || 1} Anggota Kolaborasi`
                : 'Ruang Keuangan Privat'}
            </p>
          )}
        </div>

        <ChevronDown
          className={`w-4 h-4 text-stone-400 transition-transform duration-200 shrink-0 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-72 sm:w-80 rounded-2xl bg-white border border-stone-200 shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="px-3.5 py-2.5 border-b border-stone-100 bg-stone-50/70 flex items-center justify-between">
            <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
              Pilih Ruang Keuangan
            </span>
            <span className="text-[10px] font-semibold text-stone-400">
              {activeSpaces.length} Ruang Aktif
            </span>
          </div>

          {/* List of Spaces */}
          <div className="p-1.5 max-h-64 overflow-y-auto space-y-1">
            {activeSpaces.map((space) => {
              const isSelected = space.id === activeSpace.id;
              return (
                <button
                  key={space.id}
                  onClick={() => {
                    onSelectSpace(space.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl transition text-left ${
                    isSelected
                      ? 'bg-stone-100 text-stone-900 font-semibold'
                      : 'hover:bg-stone-50 text-stone-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-white shrink-0"
                      style={{ backgroundColor: space.color || '#173D32' }}
                    >
                      <SpaceIcon name={space.icon} className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold truncate">{space.name}</span>
                        <span
                          className={`text-[8px] font-bold px-1 rounded uppercase ${
                            space.type === 'shared'
                              ? 'bg-blue-50 text-blue-700'
                              : 'bg-emerald-50 text-emerald-700'
                          }`}
                        >
                          {space.type}
                        </span>
                      </div>
                      <p className="text-[10px] text-stone-400 truncate">
                        {space.type === 'shared'
                          ? `${space.members?.length || 1} anggota`
                          : 'Privat'}
                      </p>
                    </div>
                  </div>

                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-[#173D32] text-[#D9F99D] flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Footer Quick Actions */}
          <div className="p-2 border-t border-stone-100 bg-stone-50/50 space-y-1">
            {/* Cross-Space Transfer Action */}
            <button
              onClick={() => {
                setIsOpen(false);
                onOpenTransferModal();
              }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-[#173D32] hover:bg-emerald-50 transition"
            >
              <ArrowLeftRight className="w-3.5 h-3.5 text-[#173D32]" />
              <span>Transfer Antar-Ruang (Move Funds)</span>
            </button>

            {/* Global Multi-Space Overview Link */}
            <button
              onClick={() => {
                setIsOpen(false);
                setActiveTab('overview');
              }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-stone-700 hover:bg-stone-100 transition"
            >
              <Layers className="w-3.5 h-3.5 text-stone-500" />
              <span>Ringkasan Global (All Spaces)</span>
            </button>

            {/* Add Space */}
            <button
              onClick={() => {
                setIsOpen(false);
                onOpenCreateSpace();
              }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-stone-700 hover:bg-stone-100 transition"
            >
              <Plus className="w-3.5 h-3.5 text-stone-500" />
              <span>+ Buat Ruang Keuangan Baru</span>
            </button>

            {/* Manage Spaces */}
            <button
              onClick={() => {
                setIsOpen(false);
                setActiveTab('spaces');
              }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-stone-500 hover:text-stone-800 hover:bg-stone-100 transition"
            >
              <Settings2 className="w-3.5 h-3.5 text-stone-400" />
              <span>Kelola Semua Ruang</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
