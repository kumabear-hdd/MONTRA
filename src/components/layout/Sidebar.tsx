import React from 'react';
import {
  ArrowLeftRight,
  ArrowUpDown,
  BarChart3,
  Building,
  Camera,
  FolderKanban,
  Home,
  Layers,
  PiggyBank,
  Plus,
  Settings,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import type { AuthUser } from '../../types/auth';
import type { CurrencyCode, FinancialSpace, ViewTab } from '../../types/finance';
import { formatCurrency } from '../../utils/currency';
import { MontraLogo } from '../common/MontraLogo';
import { NetworkStatusBadge } from '../common/OfflineIndicator';
import { PWAInstallButton } from '../common/PWAInstallButton';
import { SpaceSelector } from '../spaces/SpaceSelector';
import { LogOut } from 'lucide-react';

interface SidebarProps {
  activeTab: ViewTab;
  setActiveTab: (tab: ViewTab) => void;
  spaces: FinancialSpace[];
  activeSpace: FinancialSpace;
  onSelectSpace: (spaceId: string) => void;
  onOpenCreateSpace: () => void;
  onOpenTransferModal: () => void;
  availableBalance: number;
  currency: CurrencyCode;
  canCreateTransaction: boolean;
  onOpenAddModal: () => void;
  onOpenScanner?: () => void;
  user?: AuthUser | null;
  onLogout?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  spaces,
  activeSpace,
  onSelectSpace,
  onOpenCreateSpace,
  onOpenTransferModal,
  availableBalance,
  currency,
  canCreateTransaction,
  onOpenAddModal,
  onOpenScanner,
  user,
  onLogout,
}) => {
  const navItems: { id: ViewTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'overview', label: 'Ringkasan Multiruang', icon: Layers },
    { id: 'dashboard', label: 'Dashboard Ruang', icon: Home },
    { id: 'transactions', label: 'Transaksi', icon: ArrowUpDown },
    { id: 'budgets', label: 'Anggaran Bulanan', icon: Wallet },
    { id: 'savings', label: 'Target Tabungan', icon: PiggyBank },
    { id: 'reports', label: 'Laporan & Analisis', icon: BarChart3 },
    { id: 'spaces', label: 'Kelola Ruang', icon: Building },
    { id: 'settings', label: 'Pengaturan', icon: Settings },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-72 bg-white border-r border-stone-200/80 min-h-screen p-5 shrink-0 select-none">
      {/* Brand Header */}
      <div className="px-2 pt-1 pb-4">
        <MontraLogo size={42} showTagline={true} />
      </div>

      {/* Prominent Space Selector Component */}
      <div className="mb-4">
        <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1.5 px-1">
          Ruang Keuangan Aktif
        </label>
        <SpaceSelector
          spaces={spaces}
          activeSpace={activeSpace}
          onSelectSpace={onSelectSpace}
          onOpenCreateSpace={onOpenCreateSpace}
          onOpenTransferModal={onOpenTransferModal}
          setActiveTab={setActiveTab}
          currency={currency}
          compact={false}
        />
      </div>

      {/* Active Space Balance Quick Card */}
      <div
        className="mb-5 p-4 rounded-2xl text-white shadow-xs relative overflow-hidden transition-colors"
        style={{ backgroundColor: activeSpace.color || '#173D32' }}
      >
        <div className="absolute right-0 top-0 translate-x-3 -translate-y-3 w-20 h-20 rounded-full bg-white/10 pointer-events-none" />
        <div className="flex items-center justify-between text-stone-200 text-xs mb-1">
          <span className="truncate max-w-[170px] font-medium">{activeSpace.name}</span>
          <TrendingUp className="w-4 h-4 text-[#D9F99D]" />
        </div>
        <p className="text-xl font-bold tracking-tight text-white tabular-nums">
          {formatCurrency(availableBalance, currency)}
        </p>
        <p className="text-[10px] text-white/80 mt-1">Saldo tersedia di ruang ini</p>
      </div>

      {/* Primary & Scanner Action Buttons */}
      <div className="space-y-2 mb-5">
        <button
          onClick={onOpenAddModal}
          disabled={!canCreateTransaction}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#173D32] text-white font-semibold text-xs sm:text-sm hover:bg-[#123027] active:scale-[0.98] transition shadow-xs group disabled:opacity-50"
        >
          <div className="w-4 h-4 rounded-md bg-[#D9F99D] flex items-center justify-center text-[#173D32] transition group-hover:rotate-90">
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
          </div>
          <span>Catat Transaksi</span>
        </button>

        <div className="grid grid-cols-2 gap-1.5">
          {onOpenScanner && (
            <button
              onClick={onOpenScanner}
              disabled={!canCreateTransaction}
              className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl border border-stone-200 text-stone-700 font-semibold text-xs hover:bg-stone-50 active:scale-[0.98] transition disabled:opacity-50"
              title="Pindai struk dengan kamera"
            >
              <Camera className="w-3.5 h-3.5 text-[#173D32]" />
              <span>Scan Struk</span>
            </button>
          )}

          <button
            onClick={onOpenTransferModal}
            className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl border border-stone-200 text-stone-700 font-semibold text-xs hover:bg-stone-50 active:scale-[0.98] transition"
            title="Transfer dana antar-ruang"
          >
            <ArrowLeftRight className="w-3.5 h-3.5 text-[#173D32]" />
            <span>Transfer</span>
          </button>
        </div>
      </div>

      {/* Main Navigation Links */}
      <nav className="flex-1 space-y-1 overflow-y-auto pr-1">
        <div className="text-[10px] font-bold tracking-wider text-stone-400 uppercase px-3 mb-1">
          Menu
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl font-medium text-xs sm:text-sm transition text-left ${
                isActive
                  ? 'bg-[#173D32] text-white shadow-2xs font-semibold'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              <Icon
                className={`w-4 h-4 ${
                  isActive ? 'text-[#D9F99D]' : 'text-stone-400 group-hover:text-stone-600'
                }`}
              />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* User Profile & Logout */}
      {user && (
        <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200/80 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 truncate">
            <div className="w-8 h-8 rounded-full bg-[#173D32] text-[#D9F99D] font-bold text-xs flex items-center justify-center shrink-0">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="truncate">
              <h5 className="text-xs font-bold text-stone-900 truncate">{user.name}</h5>
              <p className="text-[10px] text-stone-500 truncate">{user.email}</p>
            </div>
          </div>
          {onLogout && (
            <button
              onClick={onLogout}
              className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
              title="Keluar dari akun"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* Bottom Footer Info & PWA Button */}
      <div className="pt-3 border-t border-stone-200/80 space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <NetworkStatusBadge />
          <span className="text-[10px] text-stone-400 font-mono">Multi-Space</span>
        </div>
        <PWAInstallButton compact={false} />
      </div>
    </aside>
  );
};
