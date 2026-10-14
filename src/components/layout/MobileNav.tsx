import React from 'react';
import {
  ArrowUpDown,
  BarChart3,
  Building,
  Home,
  Layers,
  PiggyBank,
  Plus,
  Settings,
  Wallet,
} from 'lucide-react';
import type { ViewTab } from '../../types/finance';

interface MobileNavProps {
  activeTab: ViewTab;
  setActiveTab: (tab: ViewTab) => void;
  canCreateTransaction: boolean;
  onOpenAddModal: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  activeTab,
  setActiveTab,
  canCreateTransaction,
  onOpenAddModal,
}) => {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200/90 px-2 py-2 pb-safe shadow-lg">
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {/* Multiruang (Overview) */}
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex flex-col items-center gap-0.5 py-1 px-1.5 rounded-xl transition ${
            activeTab === 'overview' ? 'text-[#173D32] font-bold' : 'text-stone-500 hover:text-stone-900'
          }`}
        >
          <Layers className={`w-5 h-5 ${activeTab === 'overview' ? 'stroke-[2.5]' : ''}`} />
          <span className="text-[9px]">Multiruang</span>
        </button>

        {/* Dashboard */}
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center gap-0.5 py-1 px-1.5 rounded-xl transition ${
            activeTab === 'dashboard' ? 'text-[#173D32] font-bold' : 'text-stone-500 hover:text-stone-900'
          }`}
        >
          <Home className={`w-5 h-5 ${activeTab === 'dashboard' ? 'stroke-[2.5]' : ''}`} />
          <span className="text-[9px]">Dashboard</span>
        </button>

        {/* Center Floating Action Button (Add) */}
        <button
          onClick={onOpenAddModal}
          disabled={!canCreateTransaction}
          className="relative -top-3.5 flex items-center justify-center w-11 h-11 rounded-full bg-[#173D32] text-white shadow-lg shadow-emerald-950/30 active:scale-95 transition disabled:opacity-40"
          aria-label="Catat Transaksi"
        >
          <Plus className="w-5 h-5 stroke-[3] text-[#D9F99D]" />
        </button>

        {/* Transactions */}
        <button
          onClick={() => setActiveTab('transactions')}
          className={`flex flex-col items-center gap-0.5 py-1 px-1.5 rounded-xl transition ${
            activeTab === 'transactions' ? 'text-[#173D32] font-bold' : 'text-stone-500 hover:text-stone-900'
          }`}
        >
          <ArrowUpDown className={`w-5 h-5 ${activeTab === 'transactions' ? 'stroke-[2.5]' : ''}`} />
          <span className="text-[9px]">Transaksi</span>
        </button>

        {/* Spaces Manager */}
        <button
          onClick={() => setActiveTab('spaces')}
          className={`flex flex-col items-center gap-0.5 py-1 px-1.5 rounded-xl transition ${
            activeTab === 'spaces' ? 'text-[#173D32] font-bold' : 'text-stone-500 hover:text-stone-900'
          }`}
        >
          <Building className={`w-5 h-5 ${activeTab === 'spaces' ? 'stroke-[2.5]' : ''}`} />
          <span className="text-[9px]">Ruang</span>
        </button>

        {/* Reports */}
        <button
          onClick={() => setActiveTab('reports')}
          className={`flex flex-col items-center gap-0.5 py-1 px-1.5 rounded-xl transition ${
            activeTab === 'reports' ? 'text-[#173D32] font-bold' : 'text-stone-500 hover:text-stone-900'
          }`}
        >
          <BarChart3 className={`w-5 h-5 ${activeTab === 'reports' ? 'stroke-[2.5]' : ''}`} />
          <span className="text-[9px]">Laporan</span>
        </button>
      </div>
    </nav>
  );
};
