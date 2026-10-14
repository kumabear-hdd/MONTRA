/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Eye, EyeOff, Loader2, Lock, LogIn, Mail, ShieldAlert } from 'lucide-react';

interface LoginCardProps {
  onSwitchToRegister: () => void;
  onOpenForgotPassword: () => void;
}

export const LoginCard: React.FC<LoginCardProps> = ({
  onSwitchToRegister,
  onOpenForgotPassword,
}) => {
  const { login, isLoading, error, clearError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    await login({
      email: email.trim(),
      password,
      rememberMe,
    });
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-sm">
      <div className="mb-6 text-center sm:text-left">
        <h2 className="text-2xl font-black text-[#173D32]">Selamat Datang Kembali</h2>
        <p className="text-xs text-stone-500 mt-1">
          Masuk ke akun Montra Anda untuk mengelola keuangan pribadi & keluarga.
        </p>
      </div>

      {error && (
        <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5 animate-fadeIn">
          <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600" />
          <span className="font-medium">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
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
                if (error) clearError();
              }}
              className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl text-xs font-medium text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#173D32]/20 focus:border-[#173D32] transition"
            />
          </div>
        </div>

        {/* Password Field */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-bold text-stone-700">Kata Sandi</label>
            <button
              type="button"
              onClick={onOpenForgotPassword}
              className="text-xs font-semibold text-[#173D32] hover:underline"
            >
              Lupa Kata Sandi?
            </button>
          </div>
          <div className="relative">
            <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              autoComplete="current-password"
              placeholder="Masukkan kata sandi Anda"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) clearError();
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
        </div>

        {/* Remember Me Checkbox */}
        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center gap-2 cursor-pointer text-xs text-stone-600">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 text-[#173D32] rounded border-stone-300 focus:ring-[#173D32] accent-[#173D32]"
            />
            <span className="font-medium">Ingat sesi saya di perangkat ini</span>
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full mt-2 py-3 rounded-2xl bg-[#173D32] text-white font-bold text-xs hover:bg-[#123027] active:scale-[0.99] transition shadow-sm flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-[#D9F99D]" />
              <span>Memproses Masuk...</span>
            </>
          ) : (
            <>
              <LogIn className="w-4 h-4 text-[#D9F99D]" />
              <span>Masuk ke Montra</span>
            </>
          )}
        </button>
      </form>

      {/* Footer Switch */}
      <div className="mt-6 pt-5 border-t border-stone-100 text-center text-xs text-stone-500">
        <span>Belum memiliki akun Montra? </span>
        <button
          onClick={onSwitchToRegister}
          className="font-bold text-[#173D32] hover:underline cursor-pointer"
        >
          Daftar Sekarang
        </button>
      </div>
    </div>
  );
};
