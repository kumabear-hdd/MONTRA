/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { MontraLogo } from '../../components/common/MontraLogo';
import { ForgotPasswordModal } from './ForgotPasswordModal';
import { LoginCard } from './LoginCard';
import { RegisterCard } from './RegisterCard';
import { TermsModal } from './TermsModal';
import { Camera, CheckCircle2, Layers, Lock, ShieldCheck, Sparkles } from 'lucide-react';

interface AuthViewProps {
  initialMode?: 'login' | 'register';
}

export const AuthView: React.FC<AuthViewProps> = ({ initialMode = 'login' }) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F6F7F4] flex flex-col justify-center py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left / Info Showcase Column (Desktop) */}
        <div className="lg:col-span-6 space-y-6">
          <div>
            <MontraLogo size={44} showTagline={true} />
            <h1 className="text-3xl sm:text-4xl font-black text-[#173D32] tracking-tight mt-6 leading-tight">
              Satu Aplikasi untuk Semua Ruang Finansial Anda
            </h1>
            <p className="text-stone-600 text-sm mt-3 leading-relaxed">
              Kelola anggaran mandiri, tabungan impian, hingga iuran rumah tangga bersama secara terisolasi dan transparan.
            </p>
          </div>

          <div className="space-y-3.5 pt-2">
            <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-white border border-stone-200/80 shadow-2xs">
              <div className="p-2 rounded-xl bg-lime-100 text-[#173D32] shrink-0">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-stone-900">Multi-Space Finance Isolation</h4>
                <p className="text-[11px] text-stone-500 mt-0.5">
                  Setiap ruang memiliki saldo, transaksi, anggaran, dan anggota yang independen.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-white border border-stone-200/80 shadow-2xs">
              <div className="p-2 rounded-xl bg-emerald-100 text-[#173D32] shrink-0">
                <Camera className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-stone-900">Pindai Struk dengan AI OCR</h4>
                <p className="text-[11px] text-stone-500 mt-0.5">
                  Foto struk belanja, biarkan AI mengekstrak nominal, toko, dan kategori dalam hitungan detik.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-white border border-stone-200/80 shadow-2xs">
              <div className="p-2 rounded-xl bg-amber-100 text-amber-800 shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-stone-900">Data Bersih & Tanpa Data Palsu (Beta)</h4>
                <p className="text-[11px] text-stone-500 mt-0.5">
                  Dimulai dari saldo Rp0 bersih. Data tersimpan aman dan terisolasi untuk akun Anda.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-stone-500">
            <span className="flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Standalone PWA Ready
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5 font-medium">
              <Lock className="w-3.5 h-3.5 text-stone-600" /> Enkripsi Kredensial
            </span>
          </div>
        </div>

        {/* Right / Auth Form Column */}
        <div className="lg:col-span-6 w-full">
          {mode === 'login' ? (
            <LoginCard
              onSwitchToRegister={() => setMode('register')}
              onOpenForgotPassword={() => setIsForgotModalOpen(true)}
            />
          ) : (
            <RegisterCard
              onSwitchToLogin={() => setMode('login')}
              onOpenTerms={() => setIsTermsModalOpen(true)}
            />
          )}
        </div>
      </div>

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        isOpen={isForgotModalOpen}
        onClose={() => setIsForgotModalOpen(false)}
        onSuccess={() => setMode('login')}
      />

      {/* Terms & Privacy Policy Modal */}
      <TermsModal
        isOpen={isTermsModalOpen}
        onClose={() => setIsTermsModalOpen(false)}
      />
    </div>
  );
};
