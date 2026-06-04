'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  QrCode, ArrowLeft, CheckCircle,
  User, Star, ShoppingBag, Zap
} from 'lucide-react';

export default function ScannerPage() {
  const { token } = useAuth();
  const router = useRouter();
  const [qrCode, setQrCode] = useState('');
  const [montant, setMontant] = useState('');
  const [typeAchat, setTypeAchat] = useState('');
  const [resultat, setResultat] = useState<any>(null);
  const [erreur, setErreur] = useState('');
  const [chargement, setChargement] = useState(false);

  const typesAchat = [
    { value: 'Vêtements', icon: '👗' },
    { value: 'Alimentation', icon: '🛒' },
    { value: 'Électronique', icon: '📱' },
    { value: 'Beauté', icon: '💄' },
    { value: 'Pharmacie', icon: '💊' },
    { value: 'Autre', icon: '📦' },
  ];

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    setChargement(true);
    setErreur('');
    setResultat(null);

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/transactions/scanner`,
        {
          qr_code: qrCode,
          montant: parseFloat(montant),
          type_achat: typeAchat
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setResultat(response.data);
      setQrCode('');
      setMontant('');
      setTypeAchat('');
    } catch (err: any) {
      setErreur(err.response?.data?.message || '❌ Erreur lors du scan');
    } finally {
      setChargement(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080808]">

      {/* Header */}
      <div className="border-b border-white/[0.06] px-8 py-5 flex items-center gap-4">
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
          <h1 className="text-white font-semibold">Scanner QR Code</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-8 py-12">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="w-20 h-20 bg-yellow-400/10 border border-yellow-400/20 rounded-3xl flex items-center justify-center mx-auto mb-4">
            <QrCode size={36} className="text-yellow-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Valider un achat</h2>
          <p className="text-gray-500 text-sm">
            Scannez le QR code du client et entrez le montant de l'achat
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[#0d0d0d] border border-white/[0.06] rounded-2xl p-8"
        >
          <form onSubmit={handleScan} className="space-y-6">

            {/* QR Code input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400">QR Code client</label>
              <div className="relative">
                <QrCode size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" />
                <input
                  type="text"
                  value={qrCode}
                  onChange={(e) => setQrCode(e.target.value.toUpperCase())}
                  className="w-full bg-white/[0.04] border border-white/[0.08] text-white rounded-xl pl-11 pr-4 py-3.5 focus:outline-none focus:border-yellow-500/50 transition-all placeholder:text-gray-700 font-mono"
                  placeholder="USR-XXXXXXXXXX"
                  required
                />
              </div>
            </div>

            {/* Montant */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400">Montant de l'achat</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 text-sm font-medium">FCFA</span>
                <input
                  type="number"
                  value={montant}
                  onChange={(e) => setMontant(e.target.value)}
                  className="w-full bg-white/[0.04] border border-white/[0.08] text-white rounded-xl pl-16 pr-4 py-3.5 focus:outline-none focus:border-yellow-500/50 transition-all placeholder:text-gray-700 text-lg font-semibold"
                  placeholder="0"
                  min="0"
                  required
                />
              </div>
              {montant && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-yellow-400/70 text-xs flex items-center gap-1"
                >
                  <Zap size={12} />
                  {Math.floor(parseFloat(montant) / 100)} points seront ajoutés
                </motion.p>
              )}
            </div>

            {/* Type d'achat */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400">Type d'achat</label>
              <div className="grid grid-cols-3 gap-2">
                {typesAchat.map((type) => (
                  <motion.button
                    key={type.value}
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setTypeAchat(type.value)}
                    className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-all text-sm ${
                      typeAchat === type.value
                        ? 'bg-yellow-400/10 border-yellow-400/40 text-yellow-400'
                        : 'bg-white/[0.03] border-white/[0.06] text-gray-500 hover:border-white/[0.12] hover:text-gray-300'
                    }`}
                  >
                    <span>{type.icon}</span>
                    <span className="font-medium">{type.value}</span>
                  </motion.button>
                ))}
              </div>
            </div>

            <AnimatePresence>
              {erreur && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm"
                >
                  {erreur}
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              type="submit"
              disabled={chargement || !typeAchat}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {chargement ? (
                <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              ) : (
                <>
                  <CheckCircle size={18} />
                  <span>Valider l'achat</span>
                </>
              )}
            </motion.button>
          </form>
        </motion.div>

        {/* Résultat */}
        <AnimatePresence>
          {resultat && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="mt-6 bg-[#0d0d0d] border border-green-500/20 rounded-2xl p-8"
            >
              <div className="text-center mb-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200 }}
                  className="w-16 h-16 bg-green-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4"
                >
                  <CheckCircle size={32} className="text-green-400" />
                </motion.div>
                <h3 className="text-xl font-bold text-white">Transaction réussie !</h3>
              </div>

              <div className="space-y-3">
                {[
                  { icon: User, label: 'Client', value: `${resultat.client.nom} ${resultat.client.prenom}`, color: 'text-blue-400' },
                  { icon: Zap, label: 'Points gagnés', value: `+${resultat.points_gagnes} pts`, color: 'text-yellow-400' },
                  { icon: Star, label: 'Total points', value: `${resultat.nouveau_total} pts`, color: 'text-purple-400' },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center justify-between bg-white/[0.03] rounded-xl px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <item.icon size={16} className="text-gray-600" />
                      <span className="text-gray-400 text-sm">{item.label}</span>
                    </div>
                    <span className={`font-bold text-sm ${item.color}`}>{item.value}</span>
                  </motion.div>
                ))}
              </div>

              <motion.button
                whileHover={{ scale: 1.01 }}
                onClick={() => setResultat(null)}
                className="w-full mt-4 border border-white/[0.08] text-gray-400 hover:text-white py-3 rounded-xl text-sm transition-all"
              >
                Nouveau scan
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}