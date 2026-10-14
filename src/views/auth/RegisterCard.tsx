/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  Check,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  ShieldAlert,
  User,
  UserPlus,
  X,
} from 'lucide-react';

interface RegisterCardProps {
  onSwitchToLogin: () => void;
  onOpenTerms: () => void;
}

export const RegisterCard: React.FC<RegisterCardProps> = ({
  onSwitchToLogin,
  onOpenTerms,
}) => {
  const { register, isLoading, error, clearError } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [clientError, setClientError] = useState<string | null>(null);
  const [registeredSuccess, setRegisteredSuccess] = useState(false);

  // Live Password Validation rules
  const hasMinLength = password.length >= 8;
  const hasLetters = /[A-Za-z]/.test(password);
  const hasNumbers = /[0-9]/.test(password);
  const passwordsMatch = password.length > 0 && password === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setClientError(null);
    clearError();

    if (!name.trim()) {
      setClientError('Nama lengkap wajib diisi.');
      return;
    }

    if (!hasMinLength || !hasLetters || !hasNumbers) {
      setClientError('Kata sandi harus minimal 8 karakter dan kombinasi huruf serta angka.');
      return;
    }

    if (password !== confirmPassword) {
      setClientError('Konfirmasi kata sandi tidak cocok.');
      return;
    }

    if (!termsAccepted) {
      setClientError('Anda harus menyetujui Ketentuan Layanan & Kebijakan Privasi Montra.');
      return;
    }

    const success = await register({
      name: name.trim(),
      email: email.trim(),
      password,
      confirmPassword,
      termsAccepted,
    });

    if (success) {
      setRegisteredSuccess(true);
    }
  };

  if (registeredSuccess) {
    return (
      <div className="bg-white rounded-3xl p-8 border border-stone-200/80 shadow-sm text-center space-y-4 animate-fadeIn">
        <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-[#173D32] flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-[#173D32]">Akun Montra Berhasil Dibuat!</h3>
        <p className="text-xs text-stone-500 max-w-sm mx-auto leading-relaxed">
          Selamat datang di Montra. Akun Anda telah siap dengan status saldo bersih Rp0 untuk pencatatan mandiri.
        </p>
        <button
          onClick={onSwitchToLogin}
          className="w-full py-3 rounded-2xl bg-[#173D32] text-white font-bold text-xs hover:bg-[#123027] transition shadow-xs"
        >
          Lanjut ke Montra
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-sm">
      <div className="mb-6 text-center sm:text-left">
        <h2 className="text-2xl font-black text-[#173D32]">Buat Akun Montra</h2>
        <p className="text-xs text-stone-500 mt-1">
          Mulai atur keuangan mandiri dan bersama dengan isolasi data yang aman.
        </p>
      </div>

      {(clientError || error) && (
        <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5 animate-fadeIn">
          <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600" />
          <span className="font-medium">{clientError || error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Full Name Field */}
        <div>
          <label className="block text-xs font-bold text-stone-700 mb-1.5">Nama Lengkap</label>
          <div className="relative">
            <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              required
              autoComplete="name"
              placeholder="Contoh: Daffa Ariq"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setClientError(null);
              }}
              className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl text-xs font-medium text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#173D32]/20 focus:border-[#173D32] transition"
            />
          </div>
        </div>

        {/* Email Field */}
        <div>
          <label className="block text-xs font-bold text-stone-700 mb-1.5">Alamat Email</label>
          <div className="relative">
            <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
            <input
              type="email"
              required
              autoComplete="email"
              placeholder="nama@email.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setClientError(null);
                if (error) clearError();
              }}
              className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl text-xs font-medium text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#173D32]/20 focus:border-[#173D32] transition"
            />
          </div>
        </div>

        {/* Password Field */}
        <div>
          <label className="block text-xs font-bold text-stone-700 mb-1.5">Kata Sandi</label>
          <div className="relative">
            <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              autoComplete="new-password"
              placeholder="Minimal 8 karakter kombinasi"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setClientError(null);
              }}
              className="w-full pl-10 pr-11 py-3 bg-stone-50 border border-stone-200 rounded-2xl text-xs font-medium text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#173D32]/20 focus:border-[#173D32] transition"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-3 text-stone-400 hover:text-stone-600 transition"
              title={showPassword ? 'Sembunyikan sandi' : 'Tampilkan sandi'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* Password Strength Checklist */}
          {password.length > 0 && (
            <div className="mt-2 p-2.5 rounded-xl bg-stone-50 border border-stone-200/60 grid grid-cols-3 gap-1 text-[11px]">
              <div
                className={`flex items-center gap-1 font-medium ${
                  hasMinLength ? 'text-emerald-700 font-bold' : 'text-stone-400'
                }`}
              >
                {hasMinLength ? <Check className="w-3 h-3 text-emerald-600" /> : <X className="w-3 h-3" />}
                <span>Min 8 Karakter</span>
              </div>
              <div
                className={`flex items-center gap-1 font-medium ${
                  hasLetters ? 'text-emerald-700 font-bold' : 'text-stone-400'
                }`}
              >
                {hasLetters ? <Check className="w-3 h-3 text-emerald-600" /> : <X className="w-3 h-3" />}
                <span>Ada Huruf</span>
              </div>
              <div
                className={`flex items-center gap-1 font-medium ${
                  hasNumbers ? 'text-emerald-700 font-bold' : 'text-stone-400'
                }`}
              >
                {hasNumbers ? <Check className="w-3 h-3 text-emerald-600" /> : <X className="w-3 h-3" />}
                <span>Ada Angka</span>
              </div>
            </div>
          )}
        </div>

        {/* Confirm Password Field */}
        <div>
          <label className="block text-xs font-bold text-stone-700 mb-1.5">Konfirmasi Kata Sandi</label>
          <div className="relative">
            <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              autoComplete="new-password"
              placeholder="Ulangi kata sandi di atas"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setClientError(null);
              }}
              className={`w-full pl-10 pr-10 py-3 bg-stone-50 border rounded-2xl text-xs font-medium text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#173D32]/20 transition ${
                confirmPassword.length > 0
                  ? passwordsMatch
                    ? 'border-emerald-400 focus:border-emerald-500'
                    : 'border-rose-400 focus:border-rose-500'
                  : 'border-stone-200 focus:border-[#173D32]'
              }`}
            />
            {confirmPassword.length > 0 && (
              <span className="absolute right-3.5 top-3.5">
                {passwordsMatch ? (
                  <Check className="w-4 h-4 text-emerald-600" />
                ) : (
                  <X className="w-4 h-4 text-rose-500" />
                )}
              </span>
            )}
          </div>
        </div>

        {/* Terms and Privacy Policy Checkbox */}
        <div className="pt-1">
          <label className="flex items-start gap-2.5 cursor-pointer text-xs text-stone-600 leading-snug">
            <input
              type="checkbox"
              checked={termsAccepted}
              onChange={(e) => {
                setTermsAccepted(e.target.checked);
                setClientError(null);
              }}
              className="w-4 h-4 mt-0.5 text-[#173D32] rounded border-stone-300 focus:ring-[#173D32] accent-[#173D32] shrink-0"
            />
            <span>
              Saya menyetujui{' '}
              <button
                type="button"
                onClick={onOpenTerms}
                className="font-bold text-[#173D32] hover:underline"
              >
                Ketentuan Layanan
              </button>{' '}
              dan{' '}
              <button
                type="button"
                onClick={onOpenTerms}
                className="font-bold text-[#173D32] hover:underline"
              >
                Kebijakan Privasi
              </button>{' '}
              Montra.
            </span>
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full mt-2 py-3 rounded-2xl bg-[#173D32] text-white font-bold text-xs hover:bg-[#123027] active:scale-[0.99] transition shadow-sm flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-[#D9F99D]" />
              <span>Membuat Akun Baru...</span>
            </>
          ) : (
            <>
              <UserPlus className="w-4 h-4 text-[#D9F99D]" />
              <span>Daftar Akun Montra</span>
            </>
          )}
        </button>
      </form>

      {/* Footer Switch */}
      <div className="mt-6 pt-5 border-t border-stone-100 text-center text-xs text-stone-500">
        <span>Sudah memiliki akun Montra? </span>
        <button
          onClick={onSwitchToLogin}
          className="font-bold text-[#173D32] hover:underline cursor-pointer"
        >
          Masuk di Sini
        </button>
      </div>
    </div>
  );
};
