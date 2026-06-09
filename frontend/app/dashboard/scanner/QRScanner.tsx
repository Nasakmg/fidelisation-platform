'use client';
import { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

interface QRScannerProps {
  onScan: (result: string) => void;
  onClose: () => void;
}

export default function QRScanner({ onScan, onClose }: QRScannerProps) {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const [erreur, setErreur] = useState('');

  useEffect(() => {
    scannerRef.current = new Html5QrcodeScanner(
      'qr-reader',
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
      },
      false
    );

    scannerRef.current.render(
      (decodedText) => {
        onScan(decodedText);
        scannerRef.current?.clear();
      },
      (error) => {
        // Erreurs normales de scan — ignorer
      }
    );

    return () => {
      scannerRef.current?.clear().catch(() => {});
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#0d0d0d] border border-white/[0.08] rounded-2xl p-6 w-full max-w-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold">Scanner QR Code</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-white transition-colors text-2xl"
          >
            ×
          </button>
        </div>

        <p className="text-gray-500 text-xs mb-4 text-center">
          Pointez la caméra vers le QR code du client
        </p>

        <div
          id="qr-reader"
          className="rounded-xl overflow-hidden"
          style={{ width: '100%' }}
        />

        {erreur && (
          <p className="text-red-400 text-xs mt-2 text-center">{erreur}</p>
        )}

        <button
          onClick={onClose}
          className="w-full mt-4 border border-white/[0.08] text-gray-400 hover:text-white py-3 rounded-xl text-sm transition-all"
        >
          Annuler
        </button>
      </div>
    </div>
  );
}