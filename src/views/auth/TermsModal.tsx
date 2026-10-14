/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Modal } from '../../components/common/Modal';
import { CheckCircle, ShieldCheck } from 'lucide-react';

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TermsModal: React.FC<TermsModalProps> = ({ isOpen, onClose }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Ketentuan Layanan & Kebijakan Privasi"
      subtitle="Komitmen Montra terhadap keamanan, privasi data, dan kebebasan finansial Anda."
      maxWidth="md"
    >
      <div className="space-y-4 text-xs text-stone-600 max-h-[60vh] overflow-y-auto pr-1">
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-[#173D32] shrink-0 mt-0.5" />
          <p className="text-emerald-950 font-medium leading-relaxed">
            Montra dirancang dengan prinsip <strong>Privacy-First & Strict Data Isolation</strong>. 
            Data keuangan, transaksi, dan saldo Anda tersimpan aman dan terisolasi khusus untuk akun Anda.
          </p>
        </div>

        <div>
          <h4 className="font-bold text-stone-900 text-sm mb-1">1. Privasi Data Keuangan</h4>
          <p className="leading-relaxed">
            Semua catatan keuangan, mutasi pengeluaran, pemasukan, dan target tabungan Anda adalah milik Anda sepenuhnya.
            Montra tidak menjual, memonetisasi, atau membagikan data transaksi personal Anda kepada pihak ketiga manapun untuk tujuan iklan atau profiling.
          </p>
        </div>

        <div>
          <h4 className="font-bold text-stone-900 text-sm mb-1">2. Isolasi Ruang Keuangan (Multi-Space)</h4>
          <p className="leading-relaxed">
            Ruang personal Anda bersifat rahasia dan hanya dapat diakses oleh Anda. Ruang kolaboratif (Shared) hanya dapat dilihat oleh anggota yang secara eksplisit diundang dan disetujui oleh pemilik ruang.
          </p>
        </div>

        <div>
          <h4 className="font-bold text-stone-900 text-sm mb-1">3. Keamanan Akun & Sandi</h4>
          <p className="leading-relaxed">
            Kata sandi Anda dienkripsi menggunakan algoritma cryptographic hashing standar industri dengan salt unik acak. Montra tidak pernah menyimpan kata sandi dalam teks biasa (plain text). Anda bertanggung jawab untuk menjaga kerahasiaan kredensial akun Anda.
          </p>
        </div>

        <div>
          <h4 className="font-bold text-stone-900 text-sm mb-1">4. Pindai Struk & Kecerdasan Buatan (AI OCR)</h4>
          <p className="leading-relaxed">
            Fitur OCR pemindaian struk diproses secara aman untuk mengekstrak nominal, tanggal, dan toko. Gambar struk tidak digunakan untuk melatih model publik.
          </p>
        </div>

        <div className="pt-2">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-[#173D32] text-white font-bold text-xs hover:bg-[#123027] transition shadow-xs flex items-center justify-center gap-2"
          >
            <CheckCircle className="w-4 h-4 text-[#D9F99D]" />
            <span>Saya Mengerti & Setuju</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};
