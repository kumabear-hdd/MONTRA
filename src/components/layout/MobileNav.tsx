import React from 'react';
import {
  ArrowUpDown,
  BarChart3,
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
  onOpenAddModal: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  activeTab,
  setActiveTab,
  onOpenAddModal,
}) => {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200/90 px-3 py-2 pb-safe shadow-lg">
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {/* Dashboard */}
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-xl transition ${
            activeTab === 'dashboard' ? 'text-[#173D32] font-bold' : 'text-stone-500 hover:text-stone-900'
          }`}
        >
          <Layers className={`w-5 h-5 ${activeTab === 'dashboard' ? 'stroke-[2.5]' : ''}`} />
          <span className="text-[10px]">Dashboard</span>
        </button>

        {/* Transactions */}
        <button
          onClick={() => setActiveTab('transactions')}
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-xl transition ${
            activeTab === 'transactions' ? 'text-[#173D32] font-bold' : 'text-stone-500 hover:text-stone-900'
          }`}
        >
          <ArrowUpDown className={`w-5 h-5 ${activeTab === 'transactions' ? 'stroke-[2.5]' : ''}`} />
          <span className="text-[10px]">Transaksi</span>
        </button>

        {/* Center Floating Action Button (Add) */}
        <button
          onClick={onOpenAddModal}
          className="relative -top-4 flex items-center justify-center w-12 h-12 rounded-full bg-[#173D32] text-white shadow-lg shadow-emerald-950/30 active:scale-95 transition"
          aria-label="Catat Transaksi"
        >
          <Plus className="w-6 h-6 stroke-[3] text-[#D9F99D]" />
        </button>

        {/* Budgets */}
        <button
          onClick={() => setActiveTab('budgets')}
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-xl transition ${
            activeTab === 'budgets' ? 'text-[#173D32] font-bold' : 'text-stone-500 hover:text-stone-900'
          }`}
        >
          <Wallet className={`w-5 h-5 ${activeTab === 'budgets' ? 'stroke-[2.5]' : ''}`} />
          <span className="text-[10px]">Anggaran</span>
        </button>

        {/* Savings Goals */}
        <button
          onClick={() => setActiveTab('savings')}
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-xl transition ${
            activeTab === 'savings' ? 'text-[#173D32] font-bold' : 'text-stone-500 hover:text-stone-900'
          }`}
        >
          <PiggyBank className={`w-5 h-5 ${activeTab === 'savings' ? 'stroke-[2.5]' : ''}`} />
          <span className="text-[10px]">Tabungan</span>
        </button>

        {/* Reports */}
        <button
          onClick={() => setActiveTab('reports')}
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-xl transition ${
            activeTab === 'reports' ? 'text-[#173D32] font-bold' : 'text-stone-500 hover:text-stone-900'
          }`}
        >
          <BarChart3 className={`w-5 h-5 ${activeTab === 'reports' ? 'stroke-[2.5]' : ''}`} />
          <span className="text-[10px]">Laporan</span>
        </button>

        {/* Settings */}
        <button
          onClick={() => setActiveTab('settings')}
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-xl transition ${
            activeTab === 'settings' ? 'text-[#173D32] font-bold' : 'text-stone-500 hover:text-stone-900'
          }`}
        >
          <Settings className={`w-5 h-5 ${activeTab === 'settings' ? 'stroke-[2.5]' : ''}`} />
          <span className="text-[10px]">Setting</span>
        </button>
      </div>
    </nav>
  );
};
