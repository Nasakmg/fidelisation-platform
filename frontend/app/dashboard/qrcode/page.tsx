'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { ArrowLeft, QrCode, Download } from 'lucide-react';

export default function QRCodeEntreprisePage() {
  const { token, entreprise } = useAuth();
  const router = useRouter();
  const [qrData, setQrData] = useState<any>(null);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    if (!token) { router.push('/'); return; }
    fetchQRCode();
  }, [token]);

  const fetchQRCode = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/dashboard/qrcode-entreprise`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setQrData(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setChargement(false);
    }
  };

  const handleDownload = () => {
    const svg = document.querySelector('#qr-entreprise svg') as SVGElement;
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([svgData], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `QRCode-${entreprise?.nom || 'entreprise'}.svg`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-[#080808]">

      {/* Header */}
      <div className="border-b border-white/[0.06] px-6 py-4 flex items-center gap-4">
        <motion.button
          whileHover={{ x: -3 }}
          onClick={() => router.push('/dashboard')}
          className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors"
        >
          <ArrowLeft size={18} />
          <span className="text-sm">Retour</span>
        </motion.button>
        <div className="w-px h-5 bg-white/10" />
        <div className="flex items-center gap-2">
          <QrCode size={18} className="text-yellow-400" />
          <h1 className="text-white font-semibold">QR Code Entreprise</h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#0d0d0d] border border-white/[0.06] rounded-2xl p-8 text-center"
        >
          <h2 className="text-white font-bold text-xl mb-2">{entreprise?.nom}</h2>
          <p className="text-gray-500 text-sm mb-8">
            Affichez ce QR code dans votre boutique pour que les clients puissent vous identifier
          </p>

          {/* QR Code */}
          <div id="qr-entreprise" className="flex justify-center mb-6">
            <div className="bg-white p-6 rounded-2xl shadow-lg">
              {qrData && (
                <QRCodeSVG
                  value={qrData.qr_code}
                  size={220}
                  level="H"
                  includeMargin={false}
                />
              )}
            </div>
          </div>

          {/* Code texte */}
          <div className="bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 mb-6">
            <p className="font-mono text-yellow-400 font-bold text-sm">
              {qrData?.qr_code}
            </p>
          </div>

          {/* Info */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 mb-6 text-left">
            <p className="text-blue-400 text-sm font-medium mb-2">💡 Comment utiliser ce QR Code ?</p>
            <ul className="text-gray-400 text-xs space-y-1">
              <li>• Imprimez-le et affichez-le à la caisse</li>
              <li>• Les clients peuvent le scanner pour s'enregistrer</li>
              <li>• Utilisez-le dans vos supports marketing</li>
            </ul>
          </div>

          {/* Bouton télécharger */}
          <button
            onClick={handleDownload}
            className="w-full flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-3.5 rounded-xl transition-all"
          >
            <Download size={18} />
            Télécharger le QR Code
          </button>
        </motion.div>
      </div>
    </div>
  );
}