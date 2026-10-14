import React from 'react';
import {
  ArrowDownLeft,
  ArrowLeftRight,
  ArrowRight,
  ArrowUpRight,
  Building,
  CheckCircle2,
  Clock,
  Layers,
  PiggyBank,
  Plus,
  ShieldCheck,
  TrendingUp,
  Users,
  Wallet,
} from 'lucide-react';
import { SpaceIcon } from '../components/spaces/SpaceIcon';
import type { CurrencyCode, FinancialSpace, SpaceTransfer, ViewTab } from '../types/finance';
import { formatCurrency } from '../utils/currency';
import { formatFriendlyDate } from '../utils/date';

interface OverviewViewProps {
  globalOverviewData: {
    space: FinancialSpace;
    balance: number;
    income: number;
    expense: number;
    netCashFlow: number;
    monthBudget: number;
    monthExpense: number;
    budgetUtilization: number;
    goalsTarget: number;
    goalsSaved: number;
    goalsProgress: number;
  }[];
  totalGlobalNetWorth: number;
  totalGlobalIncome: number;
  totalGlobalExpense: number;
  allTransfers: SpaceTransfer[];
  spaces: FinancialSpace[];
  onSelectSpace: (spaceId: string) => void;
  onOpenCreateSpace: () => void;
  onOpenTransferModal: () => void;
  setActiveTab: (tab: ViewTab) => void;
  currency: CurrencyCode;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  globalOverviewData,
  totalGlobalNetWorth,
  totalGlobalIncome,
  totalGlobalExpense,
  allTransfers,
  spaces,
  onSelectSpace,
  onOpenCreateSpace,
  onOpenTransferModal,
  setActiveTab,
  currency,
}) => {
  const netGlobalFlow = totalGlobalIncome - totalGlobalExpense;

  const handleEnterSpace = (spaceId: string) => {
    onSelectSpace(spaceId);
    setActiveTab('dashboard');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-14">
      {/* Hero Header Card: Global Aggregate Net Worth */}
      <div className="p-6 sm:p-7 rounded-3xl bg-[#173D32] text-white shadow-sm relative overflow-hidden flex flex-col justify-between">
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-56 h-56 rounded-full bg-[#D9F99D]/10 pointer-events-none blur-2xl" />
        <div className="absolute -left-12 -bottom-12 w-48 h-48 rounded-full bg-[#255E4E]/40 pointer-events-none blur-xl" />

        <div>
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-[#D9F99D] text-xs font-semibold backdrop-blur-xs">
              <Layers className="w-3.5 h-3.5" />
              <span>Ringkasan Multiruang (Global Aggregate)</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenTransferModal}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-xs transition"
              >
                <ArrowLeftRight className="w-3.5 h-3.5 text-[#D9F99D]" />
                <span>Transfer Antar-Ruang</span>
              </button>
              <button
                onClick={onOpenCreateSpace}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#D9F99D] text-[#173D32] text-xs font-bold hover:bg-[#cbf583] transition shadow-xs"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span>+ Buat Ruang</span>
              </button>
            </div>
          </div>

          <p className="text-xs sm:text-sm font-medium text-stone-300">Total Akumulasi Saldo Seluruh Ruang</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mt-1 mb-2 tabular-nums">
            {formatCurrency(totalGlobalNetWorth, currency)}
          </h2>
          <p className="text-xs text-stone-300/80 max-w-2xl leading-relaxed">
            * Ringkasan agregat dari {globalOverviewData.length} ruang keuangan aktif. Dana pada setiap ruang tetap terisolasi secara mandiri dan tidak bercampur.
          </p>
        </div>

        {/* Global External Cash Flow Metrics (Excluding internal inter-space transfers) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-6 pt-5 border-t border-white/10 text-xs">
          <div className="bg-white/5 rounded-2xl p-3">
            <span className="text-stone-300 block text-[11px]">Total Pemasukan Eksternal</span>
            <span className="text-sm font-bold text-[#D9F99D] tabular-nums mt-0.5 block">
              +{formatCurrency(totalGlobalIncome, currency)}
            </span>
          </div>
          <div className="bg-white/5 rounded-2xl p-3">
            <span className="text-stone-300 block text-[11px]">Total Pengeluaran Eksternal</span>
            <span className="text-sm font-bold text-rose-300 tabular-nums mt-0.5 block">
              -{formatCurrency(totalGlobalExpense, currency)}
            </span>
          </div>
          <div className="col-span-2 sm:col-span-1 bg-white/5 rounded-2xl p-3">
            <span className="text-stone-300 block text-[11px]">Arus Kas Bersih Gabungan</span>
            <span
              className={`text-sm font-bold tabular-nums mt-0.5 block ${
                netGlobalFlow >= 0 ? 'text-emerald-300' : 'text-rose-300'
              }`}
            >
              {netGlobalFlow >= 0 ? '+' : ''}
              {formatCurrency(netGlobalFlow, currency)}
            </span>
          </div>
        </div>
      </div>

      {/* Grid of Independent Financial Spaces */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-[#173D32] flex items-center gap-2">
              <Building className="w-4 h-4 text-[#173D32]" />
              <span>Daftar Ruang Keuangan Mandiri ({globalOverviewData.length})</span>
            </h3>
            <p className="text-xs text-stone-500">
              Pilih ruang untuk membuka dashboard terisolasi, anggaran, dan laporan spesifik
            </p>
          </div>
          <button
            onClick={() => setActiveTab('spaces')}
            className="text-xs font-semibold text-[#173D32] hover:underline"
          >
            Kelola Ruang & Anggota →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {globalOverviewData.map((item) => {
            const { space } = item;
            const isShared = space.type === 'shared';

            return (
              <div
                key={space.id}
                className="p-5 sm:p-6 rounded-3xl bg-white border border-stone-200/80 hover:border-stone-300 shadow-2xs hover:shadow-xs transition flex flex-col justify-between group"
              >
                <div>
                  {/* Space Card Top */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-xs"
                        style={{ backgroundColor: space.color || '#173D32' }}
                      >
                        <SpaceIcon name={space.icon} className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-stone-900 text-sm group-hover:text-[#173D32] transition">
                          {space.name}
                        </h4>
                        <span
                          className={`inline-block text-[9px] font-bold px-1.5 py-0.2 rounded uppercase tracking-wider mt-0.5 ${
                            isShared
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}
                        >
                          {isShared ? `Shared (${space.members?.length || 1} Anggota)` : 'Personal (Privat)'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Independent Balance */}
                  <div className="p-3.5 bg-stone-50 rounded-2xl mb-4">
                    <span className="text-[11px] text-stone-400 block font-medium">Saldo Ruang Ini:</span>
                    <p className="text-xl font-bold text-stone-900 tabular-nums mt-0.5">
                      {formatCurrency(item.balance, currency)}
                    </p>
                    <div className="flex justify-between items-center text-[10px] text-stone-500 mt-1 pt-1 border-t border-stone-200/60">
                      <span>Masuk: +{formatCurrency(item.income, currency)}</span>
                      <span>Keluar: -{formatCurrency(item.expense, currency)}</span>
                    </div>
                  </div>

                  {/* Monthly Budget & Savings Progress */}
                  <div className="space-y-2 text-xs">
                    {item.monthBudget > 0 ? (
                      <div>
                        <div className="flex justify-between text-[11px] mb-1">
                          <span className="text-stone-500">Anggaran Bulanan:</span>
                          <span className="font-semibold text-stone-700">
                            {item.budgetUtilization}% terpakai
                          </span>
                        </div>
                        <div className="w-full bg-stone-100 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              item.budgetUtilization >= 100
                                ? 'bg-rose-500'
                                : item.budgetUtilization >= 75
                                ? 'bg-amber-500'
                                : 'bg-[#173D32]'
                            }`}
                            style={{ width: `${Math.min(100, item.budgetUtilization)}%` }}
                          />
                        </div>
                      </div>
                    ) : (
                      <p className="text-[11px] text-stone-400 italic">Belum ada anggaran bulanan aktif.</p>
                    )}

                    {item.goalsTarget > 0 && (
                      <div>
                        <div className="flex justify-between text-[11px] mb-1">
                          <span className="text-stone-500">Target Tabungan:</span>
                          <span className="font-semibold text-[#173D32]">{item.goalsProgress}%</span>
                        </div>
                        <div className="w-full bg-stone-100 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-600 rounded-full"
                            style={{ width: `${Math.min(100, item.goalsProgress)}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Enter Space CTA */}
                <div className="mt-5 pt-3 border-t border-stone-100">
                  <button
                    onClick={() => handleEnterSpace(space.id)}
                    className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-[#173D32] text-white font-semibold text-xs hover:bg-[#123027] active:scale-98 transition shadow-2xs"
                  >
                    <span>Buka Ruang {space.name}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Cross-Space Transfers History */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white border border-stone-200/80 shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-[#173D32] flex items-center gap-2">
              <ArrowLeftRight className="w-4 h-4 text-[#173D32]" />
              <span>Mutasi Transfer Antar-Ruang (Internal Movements)</span>
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Perpindahan dana internal antar ruang keuangan tanpa duplikasi catatan pendapatan/biaya
            </p>
          </div>
          <button
            onClick={onOpenTransferModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-200 text-stone-700 text-xs font-semibold hover:bg-stone-50 transition"
          >
            <Plus className="w-3.5 h-3.5 text-[#173D32]" />
            <span>Transfer Baru</span>
          </button>
        </div>

        {allTransfers.length > 0 ? (
          <div className="divide-y divide-stone-100 border border-stone-200/70 rounded-2xl overflow-hidden bg-white text-xs">
            {allTransfers.slice(0, 8).map((trf) => {
              const src = spaces.find((s) => s.id === trf.sourceSpaceId);
              const dst = spaces.find((s) => s.id === trf.destSpaceId);

              return (
                <div
                  key={trf.id}
                  className="flex items-center justify-between p-3.5 hover:bg-stone-50 transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-emerald-50 text-[#173D32]">
                      <ArrowLeftRight className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 font-bold text-stone-900">
                        <span>{src?.name || 'Ruang Asal'}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-stone-400" />
                        <span>{dst?.name || 'Ruang Tujuan'}</span>
                      </div>
                      <p className="text-[11px] text-stone-500 mt-0.5">
                        {formatFriendlyDate(trf.date)} • {trf.description}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-bold text-stone-900 tabular-nums text-sm">
                      {formatCurrency(trf.amount, currency)}
                    </span>
                    <span className="text-[10px] text-emerald-700 font-semibold block uppercase">
                      Terselesaikan
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 bg-stone-50 rounded-2xl border border-dashed border-stone-200">
            <p className="text-xs text-stone-500 font-medium">Belum ada mutasi transfer antar-ruang.</p>
            <button
              onClick={onOpenTransferModal}
              className="mt-2 text-xs text-[#173D32] font-bold hover:underline"
            >
              + Buat Transfer Saldo Pertama
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
