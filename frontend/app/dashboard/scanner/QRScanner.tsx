'use client';
import { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader } from '@zxing/library';

interface QRScannerProps {
  onScan: (result: string) => void;
  onClose: () => void;
}

export default function QRScanner({ onScan, onClose }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);
  const [erreur, setErreur] = useState('');

  useEffect(() => {
    readerRef.current = new BrowserMultiFormatReader();

    readerRef.current.decodeFromVideoDevice(
      null,
      videoRef.current!,
      (result, err) => {
        if (result) {
          onScan(result.getText().trim().toUpperCase());
          readerRef.current?.reset();
        }
      }
    ).catch((err) => {
      setErreur('Impossible d\'accéder à la caméra');
      console.error(err);
    });

    return () => {
      readerRef.current?.reset();
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black/95 z-50 flex flex-col items-center justify-center p-4">

      <div className="flex items-center justify-between w-full max-w-sm mb-4">
        <h3 className="text-white font-semibold text-lg">Scanner QR Code</h3>
        <button
          onClick={() => { readerRef.current?.reset(); onClose(); }}
          className="text-gray-400 hover:text-white text-3xl"
        >×</button>
      </div>

      <p className="text-gray-400 text-sm mb-4 text-center">
        Pointez la caméra vers le QR code du client
      </p>

      <div className="relative rounded-2xl overflow-hidden" style={{ width: 300, height: 300 }}>
        <video ref={videoRef} style={{ width: 300, height: 300, objectFit: 'cover' }} />

        {/* Coins décoratifs */}
        <div className="absolute top-3 left-3 w-8 h-8 border-t-2 border-l-2 border-yellow-400 rounded-tl-lg pointer-events-none" />
        <div className="absolute top-3 right-3 w-8 h-8 border-t-2 border-r-2 border-yellow-400 rounded-tr-lg pointer-events-none" />
        <div className="absolute bottom-3 left-3 w-8 h-8 border-b-2 border-l-2 border-yellow-400 rounded-bl-lg pointer-events-none" />
        <div className="absolute bottom-3 right-3 w-8 h-8 border-b-2 border-r-2 border-yellow-400 rounded-br-lg pointer-events-none" />

        {/* Ligne de scan animée */}
        <div className="absolute left-0 right-0 h-0.5 bg-yellow-400/60 animate-bounce" style={{ top: '50%' }} />
      </div>

      {erreur && (
        <p className="text-red-400 text-sm mt-4 text-center">{erreur}</p>
      )}

      <div className="mt-4 bg-white/[0.05] border border-white/[0.08] rounded-xl p-3 w-full max-w-sm">
        <p className="text-gray-400 text-xs text-center">
          💡 Centrez le QR code dans le cadre jaune
        </p>
      </div>

      <button
        onClick={() => { readerRef.current?.reset(); onClose(); }}
        className="mt-4 border border-white/[0.08] text-gray-400 hover:text-white py-3 px-8 rounded-xl text-sm transition-all"
      >
        Annuler
      </button>
    </div>
  );
}