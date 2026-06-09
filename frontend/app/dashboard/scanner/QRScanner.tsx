'use client';
import { useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

interface QRScannerProps {
  onScan: (result: string) => void;
  onClose: () => void;
}

export default function QRScanner({ onScan, onClose }: QRScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    scannerRef.current = new Html5Qrcode('qr-reader');

    scannerRef.current.start(
      { facingMode: 'environment' },
      {
        fps: 15,
        qrbox: { width: 280, height: 280 },
        aspectRatio: 1.0,
        disableFlip: false,
      },
      (decodedText) => {
        onScan(decodedText.trim().toUpperCase());
        scannerRef.current?.stop().catch(() => {});
      },
      () => {}
    ).catch((err) => {
      console.error('Erreur caméra:', err);
    });

    return () => {
      scannerRef.current?.stop().catch(() => {});
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black/95 z-50 flex flex-col items-center justify-center p-4">

      {/* Header */}
      <div className="flex items-center justify-between w-full max-w-sm mb-4">
        <h3 className="text-white font-semibold text-lg">Scanner QR Code</h3>
        <button
          onClick={() => {
            scannerRef.current?.stop().catch(() => {});
            onClose();
          }}
          className="text-gray-400 hover:text-white text-3xl leading-none"
        >
          ×
        </button>
      </div>

      {/* Instructions */}
      <p className="text-gray-400 text-sm mb-4 text-center">
        Pointez la caméra vers le QR code du client
      </p>

      {/* Scanner */}
      <div className="relative">
        <div
          id="qr-reader"
          style={{ width: '300px' }}
          className="rounded-2xl overflow-hidden"
        />

        {/* Overlay coins */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-yellow-400 rounded-tl-lg" />
          <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-yellow-400 rounded-tr-lg" />
          <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-yellow-400 rounded-bl-lg" />
          <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-yellow-400 rounded-br-lg" />
        </div>
      </div>

      {/* Conseils */}
      <div className="mt-6 bg-white/[0.05] border border-white/[0.08] rounded-xl p-4 w-full max-w-sm">
        <p className="text-gray-400 text-xs text-center leading-relaxed">
          💡 Conseils : Assurez-vous que le QR code est bien éclairé et centré dans le cadre. Rapprochez ou éloignez la caméra si nécessaire.
        </p>
      </div>

      <button
        onClick={() => {
          scannerRef.current?.stop().catch(() => {});
          onClose();
        }}
        className="mt-4 border border-white/[0.08] text-gray-400 hover:text-white py-3 px-8 rounded-xl text-sm transition-all"
      >
        Annuler
      </button>
    </div>
  );
}