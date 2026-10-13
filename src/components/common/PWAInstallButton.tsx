import React, { useState } from 'react';
import { Download, Share, Smartphone, X } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

export const PWAInstallButton: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running inside standalone PWA mode, suppress install button
  if (isInstalled) {
    return null;
  }

  if (isInstallable) {
    return (
      <button
        onClick={install}
        className={`flex items-center gap-2 font-medium transition rounded-xl ${
          compact
            ? 'px-3 py-1.5 text-xs bg-[#173D32] text-[#D9F99D] hover:bg-[#123027] shadow-sm'
            : 'px-4 py-2.5 text-sm bg-[#173D32] text-white hover:bg-[#123027] shadow'
        }`}
        title="Pasang Montra ke perangkat Anda (Install PWA)"
      >
        <Download className="w-4 h-4 text-[#D9F99D]" />
        <span>Install App</span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className={`flex items-center gap-2 font-medium transition rounded-xl border border-stone-300 text-stone-700 bg-white hover:bg-stone-50 ${
            compact ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm'
          }`}
        >
          <Smartphone className="w-4 h-4 text-[#173D32]" />
          <span>Install iOS</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-stone-200">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-[#173D32]" />
                  <h3 className="text-base font-bold text-stone-900">Install on iPhone / iPad</h3>
                </div>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="rounded-lg p-1 text-stone-400 hover:text-stone-700 hover:bg-stone-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-4 space-y-3 text-sm text-stone-600">
                <div className="flex items-start gap-3 p-3 bg-stone-50 rounded-xl">
                  <div className="p-2 bg-white rounded-lg text-[#173D32] shadow-xs">
                    <Share className="w-5 h-5" />
                  </div>
                  <p>
                    1. Tekan tombol <strong>Bagikan (Share)</strong> di bagian bawah Safari.
                  </p>
                </div>
                <div className="flex items-start gap-3 p-3 bg-stone-50 rounded-xl">
                  <div className="p-2 bg-white rounded-lg text-[#173D32] shadow-xs font-bold text-xs">
                    [+]
                  </div>
                  <p>
                    2. Gulir ke bawah lalu pilih <strong>Tambah ke Layar Utama (Add to Home Screen)</strong>.
                  </p>
                </div>
                <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs">
                  Aplikasi Montra akan dapat dibuka secara mandiri tanpa bilah browser dan bekerja offline!
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full rounded-xl bg-[#173D32] py-2.5 text-sm font-semibold text-white hover:bg-[#123027] transition"
              >
                Mengerti
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
