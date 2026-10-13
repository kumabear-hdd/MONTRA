import React, { useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  Camera,
  Check,
  FileImage,
  FlipHorizontal,
  Loader2,
  RefreshCw,
  Sparkles,
  Upload,
  X,
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
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize camera when modal opens
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

  const startCamera = async () => {
    setCameraError(null);
    try {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });
      setStream(newStream);
      setIsCameraActive(true);
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
      }
    } catch (err: any) {
      console.warn('Camera access denied or unavailable:', err);
      setIsCameraActive(false);
      setCameraError(
        'Kamera tidak dapat diakses atau izin belum diberikan. Anda tetap dapat mengunggah foto struk dari galeri.'
      );
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setIsCameraActive(false);
  };

  // Flip camera between front and back
  const toggleCameraFacing = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  // Capture frame from video stream
  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    setCapturedImage(dataUrl);
    stopCamera();
    analyzeReceiptImage(dataUrl);
  };

  // Handle image upload from file picker
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
        err?.message || 'Gagal memproses struk. Pastikan foto struk terang dan terbaca jelas.'
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Quick Sample Receipt for Instant Testing / Demo
  const handleUseSampleReceipt = (type: 'supermarket' | 'coffee' | 'fuel') => {
    const today = new Date().toISOString().split('T')[0];
    let sampleData: ParsedReceiptData;

    if (type === 'supermarket') {
      sampleData = {
        merchant: 'Indomaret Point',
        amount: 86500,
        date: today,
        category: 'Food & Drinks',
        notes: 'Susu UHT, Roti Gandum, Kopi Latte (OCR Simulasi)',
      };
    } else if (type === 'coffee') {
      sampleData = {
        merchant: 'Kopi Kenangan Senopati',
        amount: 48000,
        date: today,
        category: 'Food & Drinks',
        notes: '2x Kopi Kenangan Mantan Large (OCR Simulasi)',
      };
    } else {
      sampleData = {
        merchant: 'SPBU Pertamina 31.12',
        amount: 150000,
        date: today,
        category: 'Transportation',
        notes: 'Pertamax 11.5L (OCR Simulasi)',
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
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Pindai Struk Belanja (OCR)"
      subtitle="Arahkan kamera ke struk fisik atau unggah foto untuk mengisi nominal otomatis."
      maxWidth="md"
    >
      <div className="space-y-4">
        {/* Hidden Canvas for Frame Grab */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Viewport Frame */}
        <div className="relative aspect-4/3 w-full rounded-2xl bg-stone-900 overflow-hidden flex items-center justify-center border border-stone-800 shadow-inner">
          {capturedImage ? (
            /* Captured Preview with OCR Scanning Animation */
            <div className="relative w-full h-full flex items-center justify-center">
              <img
                src={capturedImage}
                alt="Captured receipt"
                className="w-full h-full object-contain"
              />

              {isAnalyzing && (
                <div className="absolute inset-0 bg-stone-950/70 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-white text-center">
                  {/* Laser Scan line effect */}
                  <div className="absolute inset-x-0 h-1 bg-[#D9F99D] shadow-[0_0_15px_#D9F99D] animate-bounce" />
                  <Loader2 className="w-10 h-10 text-[#D9F99D] animate-spin mb-3" />
                  <p className="font-bold text-sm text-white">Membaca Struk dengan AI OCR...</p>
                  <p className="text-xs text-stone-300 mt-1 max-w-xs">
                    Mengekstrak nama toko, nominal total, dan tanggal transaksi
                  </p>
                </div>
              )}
            </div>
          ) : isCameraActive ? (
            /* Live Camera Stream */
            <div className="relative w-full h-full">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />

              {/* Viewfinder Target Frame */}
              <div className="absolute inset-6 border-2 border-dashed border-[#D9F99D]/80 rounded-2xl pointer-events-none flex flex-col justify-between p-3">
                <div className="flex justify-between items-center text-[10px] font-bold text-[#D9F99D] uppercase tracking-wider bg-black/40 px-2 py-0.5 rounded backdrop-blur-xs w-fit">
                  Posisikan Struk di Kotak
                </div>
                <div className="text-center text-[11px] text-white/90 bg-black/50 py-1 px-3 rounded-full mx-auto backdrop-blur-xs">
                  Pastikan total harga & tanggal terlihat jelas
                </div>
              </div>

              {/* Camera Switch Button */}
              <button
                type="button"
                onClick={toggleCameraFacing}
                className="absolute top-3 right-3 p-2 rounded-full bg-black/60 text-white hover:bg-black/80 transition backdrop-blur-xs"
                title="Ganti Kamera"
              >
                <FlipHorizontal className="w-4 h-4" />
              </button>
            </div>
          ) : (
            /* Fallback Camera Disabled State */
            <div className="p-6 text-center text-stone-300 space-y-3">
              <Camera className="w-12 h-12 mx-auto text-stone-500 stroke-1" />
              <p className="text-xs text-stone-300 font-medium">
                {cameraError || 'Kamera sedang tidak aktif.'}
              </p>
              <button
                type="button"
                onClick={startCamera}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Coba Aktifkan Kamera</span>
              </button>
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

        {/* Controls: Snap, Retake, Upload File */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
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
                <span>Analisis Ulang</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-3 w-full">
              {/* File Upload Trigger */}
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 py-2.5 px-3.5 rounded-xl border border-stone-200 text-stone-700 font-semibold text-xs hover:bg-stone-50 transition"
              >
                <Upload className="w-4 h-4 text-[#173D32]" />
                <span>Pilih Foto</span>
              </button>

              {/* Main Shutter Button */}
              <button
                type="button"
                onClick={handleCapture}
                disabled={!isCameraActive}
                className="flex items-center gap-2 py-3 px-6 rounded-2xl bg-[#173D32] text-white font-bold text-xs hover:bg-[#123027] active:scale-95 disabled:opacity-40 shadow-md transition"
              >
                <Camera className="w-4 h-4 text-[#D9F99D]" />
                <span>Ambil Foto Struk</span>
              </button>
            </div>
          )}
        </div>

        {/* Quick Test Demo Struk Presets */}
        <div className="pt-3 border-t border-stone-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">
              Uji Coba Cepat (Contoh Struk)
            </span>
            <span className="text-[10px] text-stone-400">Tanpa kamera</span>
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
