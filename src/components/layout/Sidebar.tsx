import React from 'react';
import {
  ArrowUpDown,
  BarChart3,
  Camera,
  Layers,
  PiggyBank,
  Plus,
  Settings,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import type { CurrencyCode, ViewTab } from '../../types/finance';
import { formatCurrency } from '../../utils/currency';
import { MontraLogo } from '../common/MontraLogo';
import { NetworkStatusBadge } from '../common/OfflineIndicator';
import { PWAInstallButton } from '../common/PWAInstallButton';

interface SidebarProps {
  activeTab: ViewTab;
  setActiveTab: (tab: ViewTab) => void;
  availableBalance: number;
  currency: CurrencyCode;
  onOpenAddModal: () => void;
  onOpenScanner?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  availableBalance,
  currency,
  onOpenAddModal,
  onOpenScanner,
}) => {
  const navItems: { id: ViewTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: Layers },
    { id: 'transactions', label: 'Transaksi', icon: ArrowUpDown },
    { id: 'budgets', label: 'Anggaran Bulanan', icon: Wallet },
    { id: 'savings', label: 'Target Tabungan', icon: PiggyBank },
    { id: 'reports', label: 'Laporan & Analisis', icon: BarChart3 },
    { id: 'settings', label: 'Pengaturan', icon: Settings },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-72 bg-white border-r border-stone-200/80 min-h-screen p-5 shrink-0 select-none">
      {/* Brand Header */}
      <div className="px-2 pt-1 pb-6">
        <MontraLogo size={42} showTagline={true} />
      </div>

      {/* Available Balance Quick Widget */}
      <div className="mb-6 p-4 rounded-2xl bg-[#173D32] text-white shadow-sm relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-3 -translate-y-3 w-24 h-24 rounded-full bg-[#D9F99D]/10 pointer-events-none" />
        <div className="flex items-center justify-between text-stone-300 text-xs mb-1">
          <span>Saldo Tersedia</span>
          <TrendingUp className="w-4 h-4 text-[#D9F99D]" />
        </div>
        <p className="text-xl font-bold tracking-tight text-white tabular-nums">
          {formatCurrency(availableBalance, currency)}
        </p>
        <p className="text-[11px] text-stone-300/80 mt-1">Saldo riil terkini</p>
      </div>

      {/* Primary & Scanner Action Buttons */}
      <div className="space-y-2 mb-6">
        <button
          onClick={onOpenAddModal}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#173D32] text-white font-semibold text-sm hover:bg-[#123027] active:scale-[0.98] transition shadow-md group"
        >
          <div className="w-5 h-5 rounded-md bg-[#D9F99D] flex items-center justify-center text-[#173D32] transition group-hover:rotate-90">
            <Plus className="w-4 h-4 stroke-[3]" />
          </div>
          <span>Catat Transaksi</span>
        </button>

        {onOpenScanner && (
          <button
            onClick={onOpenScanner}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-stone-200 text-stone-700 font-semibold text-xs hover:bg-stone-50 hover:border-[#173D32]/30 active:scale-[0.98] transition"
          >
            <Camera className="w-4 h-4 text-[#173D32]" />
            <span>Pindai Struk (AI OCR)</span>
          </button>
        )}
      </div>

      {/* Main Navigation Links */}
      <nav className="flex-1 space-y-1.5">
        <div className="text-[11px] font-semibold tracking-wider text-stone-400 uppercase px-3 mb-2">
          Menu Utama
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition text-left ${
                isActive
                  ? 'bg-[#173D32] text-white shadow-xs font-semibold'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              <Icon
                className={`w-5 h-5 ${
                  isActive ? 'text-[#D9F99D]' : 'text-stone-400 group-hover:text-stone-600'
                }`}
              />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Bottom Footer Info & PWA Button */}
      <div className="pt-4 border-t border-stone-200/80 space-y-3">
        <div className="flex items-center justify-between px-1">
          <NetworkStatusBadge />
          <span className="text-[11px] text-stone-400 font-mono">v1.2 PWA</span>
        </div>
        <PWAInstallButton compact={false} />
      </div>
    </aside>
  );
};
