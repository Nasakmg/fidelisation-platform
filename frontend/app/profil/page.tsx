'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useClientAuth } from '../context/ClientAuthContext';
import { motion } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';

import {
  LogOut, Star, Crown, Wallet,
  History, ChevronRight, Sparkles
} from 'lucide-react';

export default function ProfilPage() {
  const { clientToken, clientLogout } = useClientAuth();
  const router = useRouter();
  const [client, setClient] = useState<any>(null);
  const [walletLoading, setWalletLoading] = useState(false);
  const [chargement, setChargement] = useState(true);

useEffect(() => {
  if (!clientToken) { router.push('/client'); return; }
  fetchProfil();

  if (typeof window !== 'undefined' && 'Notification' in window) {
    import('../firebase').then(async ({ requestNotificationPermission }) => {
      const fcmToken = await requestNotificationPermission();
      if (fcmToken) {
        try {
          await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL}/api/clients/fcm-token`,
            { token: fcmToken },
            { headers: { Authorization: `Bearer ${clientToken}` } }
          );
        } catch (err) {
          console.error(err);
        }
      }
    }).catch(() => {});
  }
}, [clientToken]);
  const fetchProfil = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/clients/profil`,
        { headers: { Authorization: `Bearer ${clientToken}` } }
      );
      setClient(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setChargement(false);
    }
  };

  const handleGoogleWallet = async () => {
    setWalletLoading(true);
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/clients/wallet`,
        { headers: { Authorization: `Bearer ${clientToken}` } }
      );
      window.open(response.data.lien_wallet, '_blank');
    } catch (err) {
      console.error(err);
    } finally {
      setWalletLoading(false);
    }
  };

  const getBadge = (points: number) => {
    if (points >= 500) return { label: 'VIP', icon: Crown, color: 'text-yellow-400', bg: 'bg-yellow-400/10 border-yellow-400/20' };
    if (points >= 200) return { label: 'Gold', icon: Star, color: 'text-orange-400', bg: 'bg-orange-400/10 border-orange-400/20' };
    if (points >= 100) return { label: 'Silver', icon: Star, color: 'text-gray-300', bg: 'bg-gray-300/10 border-gray-300/20' };
    return { label: 'Bronze', icon: Star, color: 'text-amber-600', bg: 'bg-amber-600/10 border-amber-600/20' };
  };

  const getProchainNiveau = (points: number) => {
    if (points < 100) return { label: 'Silver', manque: 100 - points, total: 100 };
    if (points < 200) return { label: 'Gold', manque: 200 - points, total: 200 };
    if (points < 500) return { label: 'VIP', manque: 500 - points, total: 500 };
    return null;
  };

  if (chargement) {
    return (
      <div className="min-h-screen bg-[#080808] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-yellow-500/30 border-t-yellow-400 rounded-full animate-spin" />
      </div>
    );
  }

  const badge = getBadge(client?.points_total || 0);
  const BadgeIcon = badge.icon;
  const prochainNiveau = getProchainNiveau(client?.points_total || 0);
  const progression = prochainNiveau
    ? ((client?.points_total / prochainNiveau.total) * 100)
    : 100;

  return (
    <div className="min-h-screen bg-[#080808] pb-10">

      <div className="relative bg-gradient-to-b from-yellow-500/10 to-transparent pt-12 pb-20 px-6 text-center">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(234,179,8,0.12)_0%,transparent_70%)]" />

        <div className="flex items-center justify-center gap-2 mb-8 relative z-10">
          <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center">
            <Sparkles size={14} className="text-black" />
          </div>
          <span className="text-white font-bold">E-Wallet</span>
        </div>

        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="relative z-10"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-yellow-500/20">
            <span className="text-black font-bold text-2xl">
              {client?.nom[0]}{client?.prenom[0]}
            </span>
          </div>
          <h1 className="text-white text-xl font-bold mb-1">
            {client?.nom} {client?.prenom}
          </h1>
          <p className="text-gray-500 text-sm mb-3">{client?.email}</p>
          <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm font-medium ${badge.bg} ${badge.color}`}>
            <BadgeIcon size={13} />
            {badge.label}
          </div>
        </motion.div>
      </div>

      <div className="px-4 -mt-10 space-y-4 max-w-md mx-auto">

        {/* Points */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#0d0d0d] border border-white/[0.08] rounded-2xl p-6 shadow-xl"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-gray-500 text-sm">Vos points fidélité</p>
              <p className="text-4xl font-bold text-white mt-1">
                {client?.points_total}
                <span className="text-yellow-400 text-lg ml-1">pts</span>
              </p>
            </div>
            <div className="w-14 h-14 bg-yellow-400/10 border border-yellow-400/20 rounded-2xl flex items-center justify-center">
              <Star size={24} className="text-yellow-400" />
            </div>
          </div>
          {prochainNiveau && (
            <div>
              <div className="flex justify-between text-xs text-gray-600 mb-2">
                <span>Progression vers {prochainNiveau.label}</span>
                <span>{prochainNiveau.manque} pts restants</span>
              </div>
              <div className="w-full bg-white/[0.06] rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progression}%` }}
                  transition={{ duration: 1, delay: 0.3 }}
                  className="h-2 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full"
                />
              </div>
            </div>
          )}
        </motion.div>

        {/* QR Code */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[#0d0d0d] border border-white/[0.08] rounded-2xl p-6"
        >
          <h3 className="text-white font-semibold mb-1">Votre QR Code</h3>
          <p className="text-gray-600 text-xs mb-5">
            Présentez ce code en caisse pour gagner des points
          </p>
          <div className="flex flex-col items-center">
            <div className="bg-white p-4 rounded-2xl shadow-lg mb-4">
              <QRCodeSVG
                value={client?.qr_code || ''}
                size={180}
                level="H"
                includeMargin={false}
              />
            </div>
            <div className="flex items-center gap-2 bg-white/[0.04] border border-white/[0.06] rounded-xl px-4 py-2">
              <span className="font-mono text-yellow-400 text-sm font-bold">
                {client?.qr_code}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Google Wallet */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          onClick={handleGoogleWallet}
          disabled={walletLoading}
          className="w-full bg-black hover:bg-gray-900 border border-white/[0.08] text-white font-semibold py-4 rounded-2xl flex items-center justify-center gap-3 transition-all disabled:opacity-50"
        >
          {walletLoading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <Wallet size={20} className="text-blue-400" />
              <span>Ajouter à Google Wallet</span>
              <ChevronRight size={16} className="text-gray-600 ml-auto" />
            </>
          )}
        </motion.button>

        {/* Infos */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-[#0d0d0d] border border-white/[0.08] rounded-2xl p-4"
        >
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3">
              <History size={16} className="text-gray-600" />
              <span className="text-gray-400 text-sm">Membre depuis</span>
            </div>
            <span className="text-white text-sm font-medium">
              {new Date(client?.created_at).toLocaleDateString('fr-FR', {
                day: 'numeric', month: 'long', year: 'numeric'
              })}
            </span>
          </div>
          <div className="border-t border-white/[0.04] mt-2 pt-2 flex items-center justify-between py-2">
            <div className="flex items-center gap-3">
              <Star size={16} className="text-gray-600" />
              <span className="text-gray-400 text-sm">Statut</span>
            </div>
            <span className={`text-sm font-bold ${badge.color}`}>{badge.label}</span>
          </div>
        </motion.div>

        {/* Déconnexion */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          onClick={() => { clientLogout(); router.push('/client'); }}
          className="w-full flex items-center justify-center gap-2 text-gray-600 hover:text-red-400 py-3 transition-colors text-sm"
        >
          <LogOut size={16} />
          Déconnexion
        </motion.button>
      </div>
    </div>
  );
}