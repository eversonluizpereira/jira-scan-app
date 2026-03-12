'use client';
import { useEffect, useRef, useState } from 'react';

interface Props {
  onScan: (result: string) => void;
  onClose: () => void;
}

export default function QRScanner({ onScan, onClose }: Props) {
  const [error, setError] = useState('');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const scannerRef = useRef<any>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let scanner: any = null;

    async function start() {
      try {
        const { Html5QrcodeScanner } = await import('html5-qrcode');
        if (!mountedRef.current) return;

        scanner = new Html5QrcodeScanner(
          'qr-reader',
          { fps: 10, qrbox: { width: 260, height: 260 }, rememberLastUsedCamera: true },
          false,
        );

        scanner.render(
          (text: string) => {
            onScan(text);
          },
          () => { /* ignore scan errors */ },
        );

        scannerRef.current = scanner;
      } catch (e) {
        if (mountedRef.current) setError(String(e));
      }
    }

    start();

    return () => {
      mountedRef.current = false;
      scannerRef.current?.clear().catch(() => {});
    };
  }, [onScan]);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between px-4 py-3 bg-slate-800">
          <span className="text-white font-semibold">Escanear QR Code</span>
          <button
            onClick={onClose}
            className="text-white text-2xl leading-none hover:text-slate-300"
          >
            ×
          </button>
        </div>
        {error ? (
          <div className="p-6 text-red-600 text-sm">{error}</div>
        ) : (
          <div id="qr-reader" className="w-full" />
        )}
      </div>
    </div>
  );
}
