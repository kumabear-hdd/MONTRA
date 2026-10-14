/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { SpaceIcon } from '../spaces/SpaceIcon';
import type { SpaceType } from '../../types/finance';
import { parseCurrencyInput } from '../../utils/currency';
import { ArrowRight, CheckCircle2, Lock, Sparkles, Users, Wallet } from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  userName: string;
  onComplete: (spaceData: {
    name: string;
    description: string;
    icon: string;
    color: string;
    type: SpaceType;
    openingBalance: number;
  }) => Promise<void>;
}

const AVAILABLE_ICONS = ['Wallet', 'Home', 'Briefcase', 'Users', 'Palmtree', 'PiggyBank', 'Sparkles'];
const AVAILABLE_COLORS = ['#173D32', '#0284C7', '#059669', '#7C3AED', '#D97706', '#E11D48'];

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  userName,
  onComplete,
}) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState('Keuangan Pribadi');
  const [description, setDescription] = useState('Ruang utama untuk mencatat belanja harian dan tabungan.');
  const [type, setType] = useState<SpaceType>('personal');
  const [icon, setIcon] = useState('Wallet');
  const [color, setColor] = useState('#173D32');
  const [openingBalanceStr, setOpeningBalanceStr] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFinish = async () => {
    setIsSubmitting(true);
    try {
      const openingBalance = openingBalanceStr ? parseCurrencyInput(openingBalanceStr) : 0;
      await onComplete({
        name: name.trim() || 'Keuangan Pribadi',
        description: description.trim(),
        icon,
        color,
        type,
        openingBalance,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {}} // User should complete onboarding to establish their first boundary
      title={step === 1 ? `Selamat Datang, ${userName}!` : 'Buat Ruang Keuangan Pertamamu'}
      subtitle={
        step === 1
          ? 'Montra membantu Anda mengambil kendali penuh atas pemasukan, pengeluaran, dan tabungan.'
          : 'Ruang (Space) adalah batas independen untuk saldo, anggaran, dan transaksi Anda.'
      }
      maxWidth="md"
    >
      {step === 1 ? (
        <div className="space-y-6 py-2">
          <div className="p-6 rounded-3xl bg-[#173D32] text-white relative overflow-hidden">
            <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-40 h-40 rounded-full bg-[#D9F99D]/20 blur-xl pointer-events-none" />
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-[#D9F99D] text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Montra Beta Version</span>
            </div>
            <h3 className="text-xl font-black">Prinsip Multi-Space Montra</h3>
            <p className="text-xs text-stone-200 mt-2 leading-relaxed">
              Bayangkan Montra seperti satu rumah dengan banyak kamar. Anda dapat memisahkan keuangan pribadi, anggaran rumah tangga bersama, hingga tabungan liburan dalam ruang yang terisolasi rapi.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/80">
              <div className="flex items-center gap-2 font-bold text-stone-800 mb-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Saldo Awal Rp0 Bersih</span>
              </div>
              <p className="text-stone-500 text-[11px]">
                Tanpa transaksi demo atau data palsu. Anda bebas mulai dari nol atau mengisi saldo awal.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/80">
              <div className="flex items-center gap-2 font-bold text-stone-800 mb-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Pindai Struk Instan</span>
              </div>
              <p className="text-stone-500 text-[11px]">
                Gunakan kamera ponsel untuk memindai struk belanja dengan bantuan AI OCR.
              </p>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={() => setStep(2)}
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-[#173D32] text-white text-xs font-bold hover:bg-[#123027] transition shadow-xs flex items-center justify-center gap-2"
            >
              <span>Lanjut: Siapkan Ruang Pertama</span>
              <ArrowRight className="w-4 h-4 text-[#D9F99D]" />
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4 py-2">
          {/* Space Name */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">Nama Ruang Keuangan</label>
            <input
              type="text"
              required
              placeholder="Contoh: Keuangan Pribadi"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#173D32]/20 focus:border-[#173D32] transition"
            />
          </div>

          {/* Space Type */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5">Tipe Ruang</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setType('personal');
                  if (name === 'Rumah Tangga Bersama') setName('Keuangan Pribadi');
                }}
                className={`p-3 rounded-2xl border text-left transition flex items-start gap-2.5 ${
                  type === 'personal'
                    ? 'border-[#173D32] bg-[#173D32]/5 ring-1 ring-[#173D32]'
                    : 'border-stone-200 hover:bg-stone-50'
                }`}
              >
                <div className="p-2 rounded-xl bg-emerald-100 text-[#173D32] shrink-0">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-stone-900">Personal (Pribadi)</h4>
                  <p className="text-[10px] text-stone-500 mt-0.5">Hanya dapat diakses oleh Anda sendiri.</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setType('shared');
                  if (name === 'Keuangan Pribadi') setName('Rumah Tangga Bersama');
                }}
                className={`p-3 rounded-2xl border text-left transition flex items-start gap-2.5 ${
                  type === 'shared'
                    ? 'border-[#173D32] bg-[#173D32]/5 ring-1 ring-[#173D32]'
                    : 'border-stone-200 hover:bg-stone-50'
                }`}
              >
                <div className="p-2 rounded-xl bg-blue-100 text-blue-800 shrink-0">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-stone-900">Shared (Bersama)</h4>
                  <p className="text-[10px] text-stone-500 mt-0.5">Dapat mengundang anggota keluarga.</p>
                </div>
              </button>
            </div>
          </div>

          {/* Optional Opening Balance */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-stone-700">
                Saldo Awal (Opsional)
              </label>
              <span className="text-[11px] text-stone-400">Default: Rp0</span>
            </div>
            <div className="relative">
              <input
                type="text"
                inputMode="numeric"
                placeholder="Contoh: 1.000.000 atau kosongkan untuk Rp0"
                value={
                  openingBalanceStr
                    ? parseCurrencyInput(openingBalanceStr).toLocaleString('id-ID')
                    : ''
                }
                onChange={(e) => {
                  const num = e.target.value.replace(/[^0-9]/g, '');
                  setOpeningBalanceStr(num);
                }}
                className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#173D32]/20 focus:border-[#173D32] tabular-nums transition"
              />
            </div>
            <p className="text-[10px] text-stone-400 mt-1">
              Saldo awal tidak dihitung sebagai pemasukan baru, melainkan basis saldo awal akun.
            </p>
          </div>

          {/* Icon & Color Selection */}
          <div className="grid grid-cols-2 gap-4 pt-1">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">Ikon Ruang</label>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_ICONS.map((ic) => (
                  <button
                    key={ic}
                    type="button"
                    onClick={() => setIcon(ic)}
                    className={`p-2 rounded-xl border transition ${
                      icon === ic
                        ? 'border-[#173D32] bg-[#173D32] text-[#D9F99D]'
                        : 'border-stone-200 hover:bg-stone-50 text-stone-700'
                    }`}
                  >
                    <SpaceIcon name={ic} className="w-4 h-4" />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">Warna Aksen</label>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`w-7 h-7 rounded-full border-2 transition ${
                      color === c ? 'border-stone-900 scale-110 shadow-xs' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 flex items-center justify-between gap-3 border-t border-stone-100">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="px-4 py-2 rounded-xl border border-stone-200 text-stone-600 text-xs font-semibold hover:bg-stone-50 transition"
            >
              Kembali
            </button>
            <button
              type="button"
              onClick={handleFinish}
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-[#173D32] text-white text-xs font-bold hover:bg-[#123027] transition shadow-xs flex items-center gap-2 disabled:opacity-50"
            >
              <span>{isSubmitting ? 'Menyiapkan...' : 'Mulai Gunakan Montra'}</span>
              <ArrowRight className="w-4 h-4 text-[#D9F99D]" />
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
};
