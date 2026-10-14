import React from 'react';
import { Calendar, Camera, Plus } from 'lucide-react';
import type { CurrencyCode, DateFilterPreset, FinancialSpace, ViewTab } from '../../types/finance';
import { formatCurrency } from '../../utils/currency';
import { MontraLogo } from '../common/MontraLogo';
import { NetworkStatusBadge } from '../common/OfflineIndicator';
import { PWAInstallButton } from '../common/PWAInstallButton';
import { SpaceSelector } from '../spaces/SpaceSelector';

interface HeaderProps {
  activeTab: ViewTab;
  spaces: FinancialSpace[];
  activeSpace: FinancialSpace;
  onSelectSpace: (spaceId: string) => void;
  onOpenCreateSpace: () => void;
  onOpenTransferModal: () => void;
  setActiveTab: (tab: ViewTab) => void;
  availableBalance: number;
  currency: CurrencyCode;
  dateFilter: DateFilterPreset;
  setDateFilter: (filter: DateFilterPreset) => void;
  canCreateTransaction: boolean;
  onOpenAddModal: () => void;
  onOpenScanner?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  spaces,
  activeSpace,
  onSelectSpace,
  onOpenCreateSpace,
  onOpenTransferModal,
  setActiveTab,
  availableBalance,
  currency,
  dateFilter,
  setDateFilter,
  canCreateTransaction,
  onOpenAddModal,
  onOpenScanner,
}) => {
  const titles: Record<ViewTab, { title: string; subtitle: string }> = {
    overview: {
      title: 'Ringkasan Multiruang (All Spaces)',
      subtitle: 'Agregat performa saldo dan arus kas seluruh ruang mandiri tanpa penggabungan dana',
    },
    dashboard: {
      title: `Dashboard — ${activeSpace.name}`,
      subtitle: `Performa finansial terisolasi untuk ruang ${activeSpace.name}`,
    },
    transactions: {
      title: `Riwayat Transaksi — ${activeSpace.name}`,
      subtitle: 'Catatan seluruh mutasi pengeluaran, pemasukan, dan transfer ruang ini',
    },
    budgets: {
      title: `Anggaran Bulanan — ${activeSpace.name}`,
      subtitle: 'Rencana batas pengeluaran per kategori untuk ruang ini',
    },
    savings: {
      title: `Target Tabungan — ${activeSpace.name}`,
      subtitle: 'Wujudkan target simpanan khusus untuk ruang ini',
    },
    reports: {
      title: `Laporan & Analisis — ${activeSpace.name}`,
      subtitle: 'Visualisasi dan wawasan pengeluaran ruang aktif',
    },
    spaces: {
      title: 'Kelola Ruang Keuangan',
      subtitle: 'Konfigurasi batas ruang, izin anggota, dan peran kolaborasi',
    },
    settings: {
      title: 'Pengaturan Global',
      subtitle: 'Preferensi aplikasi, format mata uang, dan cadangan data',
    },
  };

  const showDateFilter = ['dashboard', 'transactions', 'reports'].includes(activeTab);

  const filterOptions: { id: DateFilterPreset; label: string }[] = [
    { id: 'today', label: 'Hari Ini' },
    { id: 'this_week', label: 'Minggu Ini' },
    { id: 'this_month', label: 'Bulan Ini' },
    { id: 'all', label: 'Semua' },
  ];

  return (
    <header className="sticky top-0 z-30 bg-[#F6F7F4]/90 backdrop-blur-md border-b border-stone-200/80 px-4 sm:px-6 lg:px-8 py-3.5 transition">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Left: Mobile Brand & Desktop Title */}
        <div className="flex items-center justify-between sm:justify-start gap-3 sm:gap-4">
          <div className="lg:hidden flex items-center gap-2">
            <MontraLogo size={32} showTagline={false} />
            <div className="w-44">
              <SpaceSelector
                spaces={spaces}
                activeSpace={activeSpace}
                onSelectSpace={onSelectSpace}
                onOpenCreateSpace={onOpenCreateSpace}
                onOpenTransferModal={onOpenTransferModal}
                setActiveTab={setActiveTab}
                currency={currency}
                compact={true}
              />
            </div>
          </div>

          <div className="hidden lg:block">
            <h1 className="text-xl font-bold text-[#173D32] leading-tight">
              {titles[activeTab]?.title}
            </h1>
            <p className="text-xs text-stone-500">{titles[activeTab]?.subtitle}</p>
          </div>

          {/* Mobile Balance Chip */}
          <div className="lg:hidden flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white border border-stone-200 shadow-2xs">
            <span className="text-[10px] text-stone-500">Saldo:</span>
            <span className="text-xs font-bold text-[#173D32] tabular-nums">
              {formatCurrency(availableBalance, currency)}
            </span>
          </div>
        </div>

        {/* Right Controls: Filters, Network Badge, Install, Add CTA */}
        <div className="flex items-center justify-between sm:justify-end gap-2">
          {/* Quick Filter Presets */}
          {showDateFilter && (
            <div className="flex items-center bg-white p-1 rounded-xl border border-stone-200/90 shadow-2xs text-xs overflow-x-auto">
              <Calendar className="w-3.5 h-3.5 text-stone-400 ml-1.5 mr-1 hidden sm:block shrink-0" />
              {filterOptions.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setDateFilter(opt.id)}
                  className={`px-2.5 py-1 rounded-lg font-medium transition whitespace-nowrap text-xs ${
                    dateFilter === opt.id
                      ? 'bg-[#173D32] text-white shadow-2xs'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}

          <div className="hidden sm:block">
            <NetworkStatusBadge />
          </div>

          <div className="hidden md:block">
            <PWAInstallButton compact={true} />
          </div>

          {/* Scan Receipt Button */}
          {onOpenScanner && canCreateTransaction && (
            <button
              onClick={onOpenScanner}
              className="flex items-center gap-1.5 px-3 py-1.5 sm:px-3 sm:py-2 rounded-xl border border-stone-200 bg-white text-stone-700 font-semibold text-xs hover:bg-stone-50 active:scale-95 shadow-2xs transition shrink-0"
              title="Pindai struk fisik dengan kamera untuk isi nominal otomatis"
            >
              <Camera className="w-3.5 h-3.5 text-[#173D32]" />
              <span className="hidden sm:inline">Pindai Struk</span>
              <span className="sm:hidden">Scan</span>
            </button>
          )}

          {/* Quick Add CTA */}
          <button
            onClick={onOpenAddModal}
            disabled={!canCreateTransaction}
            className="flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-[#173D32] text-white font-semibold text-xs sm:text-sm hover:bg-[#123027] active:scale-95 shadow-sm transition shrink-0 disabled:opacity-50"
          >
            <Plus className="w-4 h-4 text-[#D9F99D]" />
            <span className="hidden sm:inline">Catat Transaksi</span>
            <span className="sm:hidden">Catat</span>
          </button>
        </div>
      </div>
    </header>
  );
};
