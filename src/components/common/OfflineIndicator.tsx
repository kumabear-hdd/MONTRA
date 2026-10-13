import React, { useEffect, useState } from 'react';
import { CheckCircle2, Wifi, WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();
  const [showReconnected, setShowReconnected] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setWasOffline(true);
    } else if (wasOffline) {
      setShowReconnected(true);
      const timer = setTimeout(() => {
        setShowReconnected(false);
        setWasOffline(false);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, wasOffline]);

  if (!isOnline) {
    return (
      <div className="fixed bottom-20 md:bottom-5 right-4 md:right-6 z-50 flex items-center gap-2.5 rounded-2xl bg-amber-600/95 text-white px-4 py-2.5 shadow-xl backdrop-blur-xs text-xs font-medium border border-amber-500/50 animate-bounce duration-1000">
        <WifiOff className="w-4 h-4 text-amber-200 shrink-0" />
        <div>
          <p className="font-semibold">Mode Offline Aktif</p>
          <p className="text-[11px] text-amber-100">Semua perubahan tersimpan lokal (IndexedDB)</p>
        </div>
      </div>
    );
  }

  if (showReconnected) {
    return (
      <div className="fixed bottom-20 md:bottom-5 right-4 md:right-6 z-50 flex items-center gap-2.5 rounded-2xl bg-[#173D32]/95 text-white px-4 py-2.5 shadow-xl backdrop-blur-xs text-xs font-medium border border-[#2E6957]">
        <CheckCircle2 className="w-4 h-4 text-[#D9F99D] shrink-0" />
        <div>
          <p className="font-semibold">Kembali Terhubung</p>
          <p className="text-[11px] text-stone-200">Koneksi internet pulih</p>
        </div>
      </div>
    );
  }

  return null;
};

export const NetworkStatusBadge: React.FC = () => {
  const isOnline = useOnlineStatus();
  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border ${
        isOnline
          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
          : 'bg-amber-50 text-amber-800 border-amber-200'
      }`}
      title={isOnline ? 'Perangkat terhubung ke internet' : 'Perangkat sedang offline, data aman di IndexedDB'}
    >
      {isOnline ? (
        <>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <Wifi className="w-3 h-3 text-emerald-600" />
          <span>Online</span>
        </>
      ) : (
        <>
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          <WifiOff className="w-3 h-3 text-amber-600" />
          <span>Offline</span>
        </>
      )}
    </div>
  );
};
