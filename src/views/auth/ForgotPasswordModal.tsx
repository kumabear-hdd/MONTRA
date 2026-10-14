/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Modal } from '../../components/common/Modal';
import { useAuth } from '../../contexts/AuthContext';
import { CheckCircle2, Eye, EyeOff, KeyRound, Mail, ShieldAlert } from 'lucide-react';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { forgotPassword, resetPassword } = useAuth();
  const [step, setStep] = useState<'request' | 'reset' | 'success'>('request');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [previewCode, setPreviewCode] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Masukkan alamat email Anda.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await forgotPassword(email.trim());
      if (res.success) {
        if (res.previewCode) {
          setPreviewCode(res.previewCode);
          setCode(res.previewCode); // Pre-fill for beta evaluation convenience
        }
        setStep('reset');
      } else {
        setError(res.error || 'Gagal mengirim instruksi pemulihan.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !newPassword) {
      setError('Kode verifikasi dan kata sandi baru wajib diisi.');
      return;
    }
    if (newPassword.length < 8) {
      setError('Kata sandi baru minimal 8 karakter.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Konfirmasi kata sandi baru tidak cocok.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await resetPassword(email.trim(), code.trim(), newPassword, confirmPassword);
      if (res.success) {
        setStep('success');
      } else {
        setError(res.error || 'Gagal mereset kata sandi.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetModal = () => {
    setStep('request');
    setEmail('');
    setCode('');
    setPreviewCode(null);
    setNewPassword('');
    setConfirmPassword('');
    setError(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleResetModal}
      title={
        step === 'request'
          ? 'Lupa Kata Sandi'
          : step === 'reset'
          ? 'Verifikasi & Sandi Baru'
          : 'Sandi Berhasil Diperbarui'
      }
      subtitle={
        step === 'request'
          ? 'Masukkan email akun Montra Anda untuk menerima kode pemulihan.'
          : step === 'reset'
          ? `Masukkan kode 6 digit yang dikirim ke ${email}.`
          : 'Kata sandi Anda telah diperbarui. Silakan masuk kembali.'
      }
      maxWidth="sm"
    >
      {error && (
        <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {step === 'request' && (
        <form onSubmit={handleRequestSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">Alamat Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                placeholder="nama@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#173D32]/20 focus:border-[#173D32] transition"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={handleResetModal}
              className="px-4 py-2 rounded-xl border border-stone-200 text-stone-600 text-xs font-semibold hover:bg-stone-50 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl bg-[#173D32] text-white text-xs font-semibold hover:bg-[#123027] transition shadow-xs disabled:opacity-50"
            >
              {loading ? 'Mengirim...' : 'Kirim Kode Pemulihan'}
            </button>
          </div>
        </form>
      )}

      {step === 'reset' && (
        <form onSubmit={handleResetSubmit} className="space-y-4">
          {previewCode && (
            <div className="p-3 bg-lime-50 border border-lime-200 rounded-xl text-xs text-[#173D32]">
              <span className="font-bold">Kode Verifikasi Beta:</span>{' '}
              <span className="font-mono text-sm tracking-widest font-extrabold">{previewCode}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">Kode Verifikasi 6 Digit</label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                required
                maxLength={6}
                placeholder="123456"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm font-mono tracking-widest font-bold text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#173D32]/20 focus:border-[#173D32] transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">Kata Sandi Baru</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Minimal 8 karakter kombinasi"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#173D32]/20 focus:border-[#173D32] transition pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">Konfirmasi Sandi Baru</label>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              placeholder="Ulangi kata sandi baru"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#173D32]/20 focus:border-[#173D32] transition"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={() => setStep('request')}
              className="px-4 py-2 rounded-xl border border-stone-200 text-stone-600 text-xs font-semibold hover:bg-stone-50 transition"
            >
              Kembali
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl bg-[#173D32] text-white text-xs font-semibold hover:bg-[#123027] transition shadow-xs disabled:opacity-50"
            >
              {loading ? 'Memproses...' : 'Simpan Sandi Baru'}
            </button>
          </div>
        </form>
      )}

      {step === 'success' && (
        <div className="text-center py-4 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <p className="text-xs text-stone-600">
            Kata sandi akun Anda berhasil diganti. Anda sekarang dapat masuk menggunakan kredensial baru.
          </p>
          <button
            onClick={() => {
              handleResetModal();
              onSuccess();
            }}
            className="w-full py-2.5 rounded-xl bg-[#173D32] text-white text-xs font-bold hover:bg-[#123027] transition shadow-xs"
          >
            Masuk Sekarang
          </button>
        </div>
      )}
    </Modal>
  );
};
