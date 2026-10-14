import React, { useRef, useState } from 'react';
import {
  AlertTriangle,
  Check,
  Coins,
  Database,
  Download,
  FileSpreadsheet,
  Globe,
  HardDrive,
  Info,
  RefreshCw,
  Save,
  ShieldAlert,
  Smartphone,
  Trash2,
  Upload,
  Wallet,
} from 'lucide-react';
import { PWAInstallButton } from '../components/common/PWAInstallButton';
import { db } from '../db/db';
import { usePWAInstall } from '../hooks/usePWAInstall';
import type { AppSettings, CurrencyCode, FinancialSpace, Transaction } from '../types/finance';
import { CURRENCY_CONFIG, formatCurrency, parseCurrencyInput } from '../utils/currency';

interface SettingsViewProps {
  settings: AppSettings;
  activeSpace?: FinancialSpace;
  transactions: Transaction[];
  onSetOpeningBalance: (val: number) => Promise<void>;
  onSetCurrency: (curr: CurrencyCode) => Promise<void>;
  onResetSampleData: () => Promise<void>;
  onClearAllData: () => Promise<void>;
  availableBalance: number;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  activeSpace,
  transactions,
  onSetOpeningBalance,
  onSetCurrency,
  onResetSampleData,
  onClearAllData,
  availableBalance,
}) => {
  const { isInstalled } = usePWAInstall();

  // Opening balance form state per active space
  const [openingBalanceInput, setOpeningBalanceInput] = useState<string>(
    (activeSpace?.openingBalance ?? 0).toString()
  );
  const [openingBalanceSuccess, setOpeningBalanceSuccess] = useState(false);
  const [isSavingBalance, setIsSavingBalance] = useState(false);

  // Sync opening balance when active space changes
  React.useEffect(() => {
    if (activeSpace) {
      setOpeningBalanceInput(activeSpace.openingBalance.toString());
    }
  }, [activeSpace?.id, activeSpace?.openingBalance]);

  // Currency select state
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyCode>(settings.currency);

  // Clear confirmation modal state
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSaveOpeningBalance = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseCurrencyInput(openingBalanceInput);
    try {
      setIsSavingBalance(true);
      await onSetOpeningBalance(val);
      setOpeningBalanceSuccess(true);
      setTimeout(() => setOpeningBalanceSuccess(false), 3000);
    } finally {
      setIsSavingBalance(false);
    }
  };

  const handleCurrencyChange = async (newCurr: CurrencyCode) => {
    setSelectedCurrency(newCurr);
    await onSetCurrency(newCurr);
  };

  // Export full JSON Backup
  const handleExportJSON = async () => {
    const allTx = await db.transactions.toArray();
    const allBudgets = await db.budgets.toArray();
    const allGoals = await db.savingsGoals.toArray();
    const allLogs = await db.savingsLogs.toArray();

    const backupData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      appName: 'Montra',
      settings,
      transactions: allTx,
      budgets: allBudgets,
      savingsGoals: allGoals,
      savingsLogs: allLogs,
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `montra_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Export CSV
  const handleExportCSV = () => {
    if (transactions.length === 0) return;
    const headers = ['ID', 'Tipe', 'Judul', 'Kategori', 'Nominal', 'Tanggal', 'Catatan'];
    const rows = transactions.map((tx) => [
      tx.id,
      tx.type,
      `"${tx.title.replace(/"/g, '""')}"`,
      `"${tx.category}"`,
      tx.amount,
      tx.date,
      `"${(tx.notes || '').replace(/"/g, '""')}"`,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encoded = encodeURI(csvContent);
    const link = document.createElement('a');
    link.href = encoded;
    link.download = `montra_transaksi_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  // Import JSON Backup
  const handleImportJSON = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const parsed = JSON.parse(text);

      if (parsed.transactions && Array.isArray(parsed.transactions)) {
        await db.transactions.clear();
        await db.transactions.bulkPut(parsed.transactions);
      }
      if (parsed.budgets && Array.isArray(parsed.budgets)) {
        await db.budgets.clear();
        await db.budgets.bulkPut(parsed.budgets);
      }
      if (parsed.savingsGoals && Array.isArray(parsed.savingsGoals)) {
        await db.savingsGoals.clear();
        await db.savingsGoals.bulkPut(parsed.savingsGoals);
      }
      if (parsed.savingsLogs && Array.isArray(parsed.savingsLogs)) {
        await db.savingsLogs.clear();
        await db.savingsLogs.bulkPut(parsed.savingsLogs);
      }
      if (parsed.settings?.openingBalance !== undefined) {
        await onSetOpeningBalance(parsed.settings.openingBalance);
      }

      setStatusMessage('Data berhasil dipulihkan dari file backup!');
      setTimeout(() => setStatusMessage(null), 4000);
    } catch (err: any) {
      alert('Format file cadangan tidak valid: ' + err.message);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      {/* Top Header Card */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white border border-stone-200/80 shadow-2xs">
        <h2 className="text-xl font-bold text-[#173D32]">Pengaturan Akun & Aplikasi</h2>
        <p className="text-xs text-stone-500 mt-0.5">
          Kelola saldo awal, format mata uang, cadangan data, dan mode offline PWA
        </p>

        {statusMessage && (
          <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-semibold flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>{statusMessage}</span>
          </div>
        )}
      </div>

      {/* 1. Opening Balance Section (Crucial requirement & Acceptance Test 1) */}
      <div className="p-6 rounded-3xl bg-white border border-stone-200/80 shadow-2xs space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-50 text-[#173D32]">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#173D32]">
              Saldo Awal Ruang: {activeSpace?.name || 'Ruang Aktif'}
            </h3>
            <p className="text-xs text-stone-500">
              Saldo awal kas atau rekening mandiri untuk ruang ini saat Anda pertama kali mulai mencatat.
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveOpeningBalance} className="space-y-3 pt-2">
          <div className="max-w-md">
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Nominal Saldo Awal {activeSpace ? `(${activeSpace.name})` : ''} ({selectedCurrency})
            </label>
            <div className="relative">
              <input
                type="text"
                inputMode="numeric"
                value={
                  openingBalanceInput
                    ? parseCurrencyInput(openingBalanceInput).toLocaleString('id-ID')
                    : ''
                }
                onChange={(e) => {
                  const num = e.target.value.replace(/[^0-9]/g, '');
                  setOpeningBalanceInput(num);
                }}
                className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-base font-bold text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#173D32]/20 focus:border-[#173D32] tabular-nums"
                placeholder="Contoh: 500.000"
              />
            </div>
            <p className="text-[11px] text-stone-400 mt-1">
              * Saldo awal tidak dihitung sebagai pemasukan baru, melainkan menjadi basis saldo riil.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={isSavingBalance}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#173D32] text-white font-semibold text-xs hover:bg-[#123027] active:scale-98 shadow-sm transition"
            >
              <Save className="w-4 h-4 text-[#D9F99D]" />
              <span>{isSavingBalance ? 'Menyimpan...' : 'Simpan Saldo Awal'}</span>
            </button>

            {openingBalanceSuccess && (
              <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                <Check className="w-4 h-4" /> Saldo awal tersimpan!
              </span>
            )}
          </div>
        </form>

        <div className="mt-3 p-3 bg-stone-50 rounded-2xl flex items-center justify-between text-xs">
          <span className="text-stone-500">Saldo Tersedia Saat Ini:</span>
          <span className="font-bold text-[#173D32] text-sm tabular-nums">
            {formatCurrency(availableBalance, selectedCurrency)}
          </span>
        </div>
      </div>

      {/* 2. Currency Selector */}
      <div className="p-6 rounded-3xl bg-white border border-stone-200/80 shadow-2xs space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-lime-50 text-[#173D32]">
            <Coins className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#173D32]">Format Mata Uang</h3>
            <p className="text-xs text-stone-500">
              Pilih simbol mata uang untuk penulisan seluruh angka finansial.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
          {Object.entries(CURRENCY_CONFIG).map(([code, conf]) => (
            <button
              key={code}
              type="button"
              onClick={() => handleCurrencyChange(code as CurrencyCode)}
              className={`p-3.5 rounded-2xl border text-left transition ${
                selectedCurrency === code
                  ? 'bg-emerald-50/70 border-[#173D32] shadow-2xs font-bold text-[#173D32]'
                  : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-extrabold">{conf.symbol}</span>
                <span className="text-[10px] uppercase font-semibold text-stone-400">{code}</span>
              </div>
              <p className="text-xs text-stone-500 truncate">{conf.label}</p>
            </button>
          ))}
        </div>
      </div>

      {/* 3. PWA & Offline Storage Status */}
      <div className="p-6 rounded-3xl bg-white border border-stone-200/80 shadow-2xs space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-blue-50 text-blue-700">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#173D32]">Status PWA & Penyimpanan Offline</h3>
            <p className="text-xs text-stone-500">
              Aplikasi berjalan offline-first menggunakan IndexedDB di browser perangkat Anda.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <div className="p-3.5 bg-stone-50 rounded-2xl text-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-stone-500">Mode Penyimpanan:</span>
              <span className="font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                IndexedDB (Aktif)
              </span>
            </div>
            <p className="text-[11px] text-stone-400">
              Data disimpan secara privat di perangkat Anda tanpa risiko kebocoran cloud.
            </p>
          </div>

          <div className="p-3.5 bg-stone-50 rounded-2xl text-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-stone-500">Status PWA:</span>
              <span className="font-bold text-stone-800">
                {isInstalled ? 'Terpasang (Standalone)' : 'Siap Dipasang'}
              </span>
            </div>
            <div className="pt-1">
              <PWAInstallButton compact={true} />
            </div>
          </div>
        </div>

        <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200/70 text-xs text-amber-900 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p>
            <strong>Catatan Keamanan Data:</strong> Karena Montra menggunakan penyimpanan offline-first di
            IndexedDB, data tidak akan tersinkron otomatis jika Anda membuka browser lain atau menghapus cache
            browser. Gunakan tombol <strong>Ekspor Cadangan (JSON/CSV)</strong> di bawah ini secara berkala.
          </p>
        </div>
      </div>

      {/* 4. Data Backup, Export & Restore */}
      <div className="p-6 rounded-3xl bg-white border border-stone-200/80 shadow-2xs space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-purple-50 text-purple-700">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#173D32]">Cadangan & Pemulihan Data</h3>
            <p className="text-xs text-stone-500">
              Unduh cadangan data Anda ke format JSON atau CSV dan pulihkan kapan saja.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          {/* Export JSON */}
          <button
            onClick={handleExportJSON}
            className="flex items-center justify-center gap-2 p-3 rounded-2xl border border-stone-200 text-stone-700 font-semibold text-xs hover:bg-stone-50 transition"
          >
            <Download className="w-4 h-4 text-[#173D32]" />
            <span>Unduh Cadangan JSON</span>
          </button>

          {/* Export CSV */}
          <button
            onClick={handleExportCSV}
            className="flex items-center justify-center gap-2 p-3 rounded-2xl border border-stone-200 text-stone-700 font-semibold text-xs hover:bg-stone-50 transition"
          >
            <FileSpreadsheet className="w-4 h-4 text-[#173D32]" />
            <span>Ekspor Semua ke CSV</span>
          </button>

          {/* Import JSON */}
          <div>
            <input
              type="file"
              ref={fileInputRef}
              accept=".json"
              onChange={handleImportJSON}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center justify-center gap-2 p-3 rounded-2xl border border-stone-200 text-stone-700 font-semibold text-xs hover:bg-stone-50 transition"
            >
              <Upload className="w-4 h-4 text-[#173D32]" />
              <span>Pulihkan dari JSON</span>
            </button>
          </div>
        </div>
      </div>

      {/* 5. Danger Zone & Reset */}
      <div className="p-6 rounded-3xl bg-white border border-rose-200/80 shadow-2xs space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-rose-50 text-rose-700">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-rose-950">Zona Data & Pengujian</h3>
            <p className="text-xs text-stone-500">
              Reset data ke contoh bawaan atau hapus seluruh catatan untuk mulai dari awal.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={async () => {
              if (confirm('Muat ulang data contoh starter Montra? Data lama akan digantikan.')) {
                await onResetSampleData();
                setStatusMessage('Data contoh starter berhasil dimuat!');
                setTimeout(() => setStatusMessage(null), 3000);
              }
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold transition"
          >
            <RefreshCw className="w-4 h-4 text-stone-500" />
            <span>Muat Data Contoh Starter</span>
          </button>

          <button
            onClick={() => setShowClearConfirm(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold transition"
          >
            <Trash2 className="w-4 h-4 text-rose-600" />
            <span>Bersihkan Seluruh Data</span>
          </button>
        </div>

        {/* Clear Confirmation Guard */}
        {showClearConfirm && (
          <div className="p-4 bg-rose-50/70 border border-rose-200 rounded-2xl space-y-3 mt-3">
            <p className="text-xs text-rose-900 font-semibold">
              Ketik kata <span className="font-mono bg-rose-200 px-1.5 py-0.5 rounded">HAPUS</span> untuk
              mengonfirmasi penghapusan seluruh transaksi, anggaran, dan target tabungan.
            </p>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Ketik HAPUS..."
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                className="px-3 py-2 bg-white border border-rose-300 rounded-xl text-xs font-mono uppercase"
              />
              <button
                disabled={confirmText !== 'HAPUS'}
                onClick={async () => {
                  await onClearAllData();
                  setShowClearConfirm(false);
                  setConfirmText('');
                  setStatusMessage('Semua data berhasil dibersihkan.');
                  setTimeout(() => setStatusMessage(null), 3000);
                }}
                className="px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold hover:bg-rose-700 disabled:opacity-40 transition"
              >
                Konfirmasi Hapus
              </button>
              <button
                onClick={() => {
                  setShowClearConfirm(false);
                  setConfirmText('');
                }}
                className="px-3 py-2 text-stone-500 text-xs hover:text-stone-800"
              >
                Batal
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
