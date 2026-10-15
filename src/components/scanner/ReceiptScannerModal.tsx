/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  Camera,
  Check,
  FileImage,
  FlipHorizontal,
  Loader2,
  RefreshCw,
  Smartphone,
  Sparkles,
  Upload,
  X,
  Zap,
  ZapOff,
} from 'lucide-react';
import type { ExpenseCategory } from '../../types/finance';
import { Modal } from '../common/Modal';

export interface ParsedReceiptData {
  merchant: string;
  amount: number;
  date: string;
  category: ExpenseCategory;
  notes?: string;
}

interface ReceiptScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReceiptParsed: (data: ParsedReceiptData) => void;
}

export const ReceiptScannerModal: React.FC<ReceiptScannerModalProps> = ({
  isOpen,
  onClose,
  onReceiptParsed,
}) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [torchSupported, setTorchSupported] = useState<boolean>(false);
  const [isTorchOn, setIsTorchOn] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const nativeCameraInputRef = useRef<HTMLInputElement | null>(null);
  const galleryInputRef = useRef<HTMLInputElement | null>(null);

  // Helper to cleanly stop media tracks
  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch (e) {
          console.warn('Error stopping track:', e);
        }
      });
      setStream(null);
    }
    setIsCameraActive(false);
    setIsTorchOn(false);
    setTorchSupported(false);
  }, [stream]);

  // Safely attach stream to video element
  const attachStream = useCallback((videoEl: HTMLVideoElement | null, mediaStream: MediaStream | null) => {
    if (!videoEl || !mediaStream) return;
    try {
      if (videoEl.srcObject !== mediaStream) {
        videoEl.srcObject = mediaStream;
        videoEl.play().catch((err) => {
          console.warn('Video play interrupted or waiting for user gesture:', err);
        });
      }
    } catch (e) {
      console.warn('attachStream error:', e);
    }
  }, []);

  // Sync stream to video element whenever stream changes or component re-renders
  useEffect(() => {
    if (videoRef.current && stream) {
      attachStream(videoRef.current, stream);
    }
  }, [stream, isCameraActive, attachStream]);

  // Start live camera stream
  const startCamera = useCallback(async () => {
    setCameraError(null);
    setErrorMessage(null);

    // Stop existing stream first
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      setStream(null);
    }

    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setCameraError(
        'Kamera langsung tidak didukung pada browser ini. Silakan gunakan tombol "Kamera HP" atau unggah foto struk.'
      );
      setIsCameraActive(false);
      return;
    }

    try {
      let mediaStream: MediaStream;

      // Try back camera on mobile or default camera on desktop/laptop
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: facingMode },
          },
          audio: false,
        });
      } catch (idealErr) {
        console.warn('Ideal facingMode failed, falling back to basic video: true', idealErr);
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
      }

      setStream(mediaStream);
      setIsCameraActive(true);

      // Check torch capability
      const videoTrack = mediaStream.getVideoTracks()[0];
      if (videoTrack && typeof (videoTrack.getCapabilities as any) === 'function') {
        const capabilities = (videoTrack.getCapabilities as any)();
        if (capabilities && 'torch' in capabilities) {
          setTorchSupported(true);
        }
      }

      // If video ref is already mounted, attach immediately
      if (videoRef.current) {
        attachStream(videoRef.current, mediaStream);
      }
    } catch (err: any) {
      console.warn('Camera access denied or unavailable:', err);
      setIsCameraActive(false);
      const name = err?.name || '';
      if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
        setCameraError(
          'Izin kamera belum diberikan. Anda dapat memberikan izin kamera di browser, atau gunakan tombol "Kamera HP" untuk membuka kamera perangkat langsung.'
        );
      } else if (name === 'NotFoundError' || name === 'DevicesNotFoundError') {
        setCameraError(
          'Kamera tidak terdeteksi pada perangkat ini. Silakan gunakan tombol "Pilih Foto Struk".'
        );
      } else {
        setCameraError(
          'Kamera tidak dapat diaktifkan saat ini. Gunakan tombol "Kamera HP" untuk membuka kamera bawaan.'
        );
      }
    }
  }, [facingMode, stream, attachStream]);

  // Initialize or teardown camera on modal open/close
  useEffect(() => {
    if (isOpen && !capturedImage) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen, facingMode]);

  // Flip camera between front and back
  const toggleCameraFacing = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  // Toggle torch / flash
  const toggleTorch = async () => {
    if (!stream) return;
    const track = stream.getVideoTracks()[0];
    if (track && typeof (track.applyConstraints as any) === 'function') {
      try {
        const nextState = !isTorchOn;
        await (track.applyConstraints as any)({
          advanced: [{ torch: nextState }],
        });
        setIsTorchOn(nextState);
      } catch (e) {
        console.warn('Torch toggle error:', e);
      }
    }
  };

  // Capture frame from live video stream
  const handleCapture = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const width = video.videoWidth || 1280;
    const height = video.videoHeight || 720;
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, width, height);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    setCapturedImage(dataUrl);
    stopCamera();
    analyzeReceiptImage(dataUrl);
  };

  // Handle capture from native device camera input
  const handleNativeCameraFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setCapturedImage(result);
      stopCamera();
      analyzeReceiptImage(result);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Handle image upload from file picker (gallery)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setCapturedImage(result);
      stopCamera();
      analyzeReceiptImage(result);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Send to backend OCR API
  const analyzeReceiptImage = async (base64Url: string) => {
    setIsAnalyzing(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/scan-receipt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64Url,
          mimeType: 'image/jpeg',
        }),
      });

      const resJson = await response.json();

      if (!resJson.success) {
        throw new Error(resJson.error || 'Gagal mengenali rincian struk.');
      }

      const parsed: ParsedReceiptData = resJson.data;
      onReceiptParsed(parsed);
      handleClose();
    } catch (err: any) {
      setErrorMessage(
        err?.message || 'Gagal memproses struk. Pastikan struk diterangi cahaya dan nominal terlihat.'
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Quick Sample Receipt for instant testing
  const handleUseSampleReceipt = (type: 'supermarket' | 'coffee' | 'fuel') => {
    const today = new Date().toISOString().split('T')[0];
    let sampleData: ParsedReceiptData;

    if (type === 'supermarket') {
      sampleData = {
        merchant: 'Indomaret Point',
        amount: 86500,
        date: today,
        category: 'Food & Drinks',
        notes: 'Susu UHT, Roti Gandum, Kopi Latte (OCR Otomatis)',
      };
    } else if (type === 'coffee') {
      sampleData = {
        merchant: 'Kopi Kenangan Senopati',
        amount: 48000,
        date: today,
        category: 'Food & Drinks',
        notes: '2x Kopi Kenangan Mantan Large (OCR Otomatis)',
      };
    } else {
      sampleData = {
        merchant: 'SPBU Pertamina 31.12',
        amount: 150000,
        date: today,
        category: 'Transportation',
        notes: 'Pertamax 11.5L (OCR Otomatis)',
      };
    }

    onReceiptParsed(sampleData);
    handleClose();
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setErrorMessage(null);
    startCamera();
  };

  const handleClose = () => {
    stopCamera();
    setCapturedImage(null);
    setErrorMessage(null);
    setCameraError(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Pindai Struk Belanja (OCR)"
      subtitle="Arahkan kamera ke struk fisik atau ambil foto langsung untuk mengisi pengeluaran otomatis."
      maxWidth="md"
    >
      <div className="space-y-4">
        {/* Hidden Canvas for Live Video Frame Capture */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Hidden Native Camera Input (Triggers hardware camera directly on mobile) */}
        <input
          type="file"
          ref={nativeCameraInputRef}
          accept="image/*"
          capture="environment"
          onChange={handleNativeCameraFile}
          className="hidden"
        />

        {/* Hidden File Picker Input (Gallery / Documents) */}
        <input
          type="file"
          ref={galleryInputRef}
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />

        {/* Viewport Frame */}
        <div className="relative aspect-4/3 w-full rounded-2xl bg-stone-950 overflow-hidden flex items-center justify-center border border-stone-800 shadow-inner">
          {capturedImage ? (
            /* Captured Preview with OCR Scanning Animation */
            <div className="relative w-full h-full flex items-center justify-center bg-stone-900">
              <img
                src={capturedImage}
                alt="Captured receipt"
                className="w-full h-full object-contain"
              />

              {isAnalyzing && (
                <div className="absolute inset-0 bg-stone-950/75 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-white text-center">
                  {/* Laser Scan line effect */}
                  <div className="absolute inset-x-0 h-1 bg-[#D9F99D] shadow-[0_0_20px_#D9F99D] animate-pulse" />
                  <Loader2 className="w-10 h-10 text-[#D9F99D] animate-spin mb-3" />
                  <p className="font-bold text-sm text-white">Membaca Rincian Struk...</p>
                  <p className="text-xs text-stone-300 mt-1 max-w-xs">
                    Mengekstrak nama toko, nominal total harga, dan tanggal transaksi
                  </p>
                </div>
              )}
            </div>
          ) : isCameraActive ? (
            /* Live Camera Stream */
            <div className="relative w-full h-full bg-black">
              <video
                ref={(el) => {
                  videoRef.current = el;
                  if (el && stream) {
                    attachStream(el, stream);
                  }
                }}
                autoPlay
                playsInline
                muted
                onLoadedMetadata={() => {
                  videoRef.current?.play().catch(() => {});
                }}
                className="w-full h-full object-cover"
              />

              {/* Viewfinder Target Frame */}
              <div className="absolute inset-5 sm:inset-7 border-2 border-dashed border-[#D9F99D]/80 rounded-2xl pointer-events-none flex flex-col justify-between p-3">
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1.5 text-[10px] font-bold text-[#D9F99D] uppercase tracking-wider bg-black/60 px-2 py-0.5 rounded-full backdrop-blur-xs">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    Kamera Aktif
                  </span>
                </div>
                <div className="text-center text-[11px] font-medium text-white/95 bg-black/60 py-1 px-3 rounded-full mx-auto backdrop-blur-xs shadow-sm">
                  Posisikan struk, total harga & tanggal di dalam kotak
                </div>
              </div>

              {/* Top Controls Overlay: Switch Camera & Torch */}
              <div className="absolute top-3 right-3 flex items-center gap-2">
                {torchSupported && (
                  <button
                    type="button"
                    onClick={toggleTorch}
                    className={`p-2 rounded-full transition backdrop-blur-xs shadow-md ${
                      isTorchOn ? 'bg-[#D9F99D] text-[#173D32]' : 'bg-black/60 text-white hover:bg-black/80'
                    }`}
                    title={isTorchOn ? 'Matikan Lampu' : 'Nyalakan Lampu'}
                  >
                    {isTorchOn ? <Zap className="w-4 h-4 fill-current" /> : <ZapOff className="w-4 h-4" />}
                  </button>
                )}
                <button
                  type="button"
                  onClick={toggleCameraFacing}
                  className="p-2 rounded-full bg-black/60 text-white hover:bg-black/80 transition backdrop-blur-xs shadow-md"
                  title="Ganti Kamera Depan/Belakang"
                >
                  <FlipHorizontal className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            /* Fallback Camera Disabled State */
            <div className="p-6 text-center text-stone-300 space-y-3 max-w-sm">
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mx-auto text-[#D9F99D]">
                <Camera className="w-6 h-6 stroke-2" />
              </div>
              <p className="text-xs text-stone-300 font-medium leading-relaxed">
                {cameraError || 'Kamera langsung sedang tidak aktif.'}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={startCamera}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-semibold transition"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Aktifkan Kamera</span>
                </button>
                <button
                  type="button"
                  onClick={() => nativeCameraInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#D9F99D] text-[#173D32] text-xs font-bold shadow transition hover:bg-[#c9f182]"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Buka Kamera HP</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Error Feedback Alert */}
        {errorMessage && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-bold">Gagal Mengenali Struk</p>
              <p className="mt-0.5 text-rose-700">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Primary Action Buttons */}
        <div className="flex flex-col gap-2.5 pt-1">
          {capturedImage ? (
            <div className="flex items-center gap-2 w-full">
              <button
                type="button"
                onClick={handleRetake}
                disabled={isAnalyzing}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-stone-200 text-stone-700 font-semibold text-xs hover:bg-stone-50 disabled:opacity-50 transition"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Foto Ulang</span>
              </button>

              <button
                type="button"
                onClick={() => analyzeReceiptImage(capturedImage)}
                disabled={isAnalyzing}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#173D32] text-white font-semibold text-xs hover:bg-[#123027] disabled:opacity-50 shadow-sm transition"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#D9F99D]" />
                <span>Analisis Struk</span>
              </button>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 w-full">
              {/* Option A: Shutter button for Live Viewfinder */}
              {isCameraActive ? (
                <button
                  type="button"
                  onClick={handleCapture}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-5 rounded-2xl bg-[#173D32] text-white font-bold text-xs hover:bg-[#123027] active:scale-98 shadow-md transition"
                >
                  <Camera className="w-4 h-4 text-[#D9F99D]" />
                  <span>Ambil Foto Sekarang</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => nativeCameraInputRef.current?.click()}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-5 rounded-2xl bg-[#173D32] text-white font-bold text-xs hover:bg-[#123027] active:scale-98 shadow-md transition"
                >
                  <Camera className="w-4 h-4 text-[#D9F99D]" />
                  <span>Ambil Foto via Kamera</span>
                </button>
              )}

              {/* Option B: Direct native mobile camera shutter */}
              {isCameraActive && (
                <button
                  type="button"
                  onClick={() => nativeCameraInputRef.current?.click()}
                  className="flex items-center justify-center gap-1.5 py-3 px-4 rounded-2xl border border-stone-200 bg-stone-50 text-stone-700 font-semibold text-xs hover:bg-stone-100 transition"
                  title="Gunakan aplikasi kamera bawaan HP untuk resolusi maksimal"
                >
                  <Smartphone className="w-3.5 h-3.5 text-[#173D32]" />
                  <span>Kamera Bawaan HP</span>
                </button>
              )}

              {/* Option C: Gallery photo picker */}
              <button
                type="button"
                onClick={() => galleryInputRef.current?.click()}
                className="flex items-center justify-center gap-1.5 py-3 px-4 rounded-2xl border border-stone-200 text-stone-700 font-semibold text-xs hover:bg-stone-50 transition"
              >
                <Upload className="w-3.5 h-3.5 text-stone-600" />
                <span>Pilih Foto</span>
              </button>
            </div>
          )}
        </div>

        {/* Quick Test Demo Presets */}
        <div className="pt-3 border-t border-stone-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">
              Contoh Struk Cepat (Tanpa Kamera)
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleUseSampleReceipt('supermarket')}
              className="p-2 rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100 text-left transition"
            >
              <p className="text-[11px] font-bold text-stone-800 truncate">Indomaret</p>
              <p className="text-[10px] text-[#173D32] font-semibold">Rp86.500</p>
            </button>

            <button
              type="button"
              onClick={() => handleUseSampleReceipt('coffee')}
              className="p-2 rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100 text-left transition"
            >
              <p className="text-[11px] font-bold text-stone-800 truncate">Kopi Kenangan</p>
              <p className="text-[10px] text-[#173D32] font-semibold">Rp48.000</p>
            </button>

            <button
              type="button"
              onClick={() => handleUseSampleReceipt('fuel')}
              className="p-2 rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100 text-left transition"
            >
              <p className="text-[11px] font-bold text-stone-800 truncate">SPBU Bensin</p>
              <p className="text-[10px] text-[#173D32] font-semibold">Rp150.000</p>
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
