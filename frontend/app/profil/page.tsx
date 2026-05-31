'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function ProfilPage() {
  const { token, logout } = useAuth();
  const router = useRouter();
  const [client, setClient] = useState<any>(null);
  const [lienWallet, setLienWallet] = useState<string | null>(null);
  const [chargement, setChargement] = useState(true);
  const [walletLoading, setWalletLoading] = useState(false);

  useEffect(() => {
    if (!token) { router.push('/'); return; }
    fetchProfil();
  }, [token]);

  const fetchProfil = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/clients/profil`,
        { headers: { Authorization: `Bearer ${token}` } }
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
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setLienWallet(response.data.lien_wallet);
      window.open(response.data.lien_wallet, '_blank');
    } catch (err) {
      console.error(err);
    } finally {
      setWalletLoading(false);
    }
  };

  const getBadge = (points: number) => {
    if (points >= 500) return { label: '👑 VIP', color: 'bg-yellow-100 text-yellow-700' };
    if (points >= 200) return { label: '⭐ Gold', color: 'bg-orange-100 text-orange-700' };
    if (points >= 100) return { label: '🥈 Silver', color: 'bg-gray-100 text-gray-700' };
    return { label: '🥉 Bronze', color: 'bg-amber-100 text-amber-700' };
  };

  if (chargement) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const badge = getBadge(client?.points_total || 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-700">

      {/* Header */}
      <div className="px-6 py-8 text-center">
        <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-blue-600 font-bold text-2xl">
            {client?.nom[0]}{client?.prenom[0]}
          </span>
        </div>
        <h1 className="text-white text-2xl font-bold">
          {client?.nom} {client?.prenom}
        </h1>
        <p className="text-blue-200 text-sm mt-1">{client?.email}</p>
        <span className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-medium ${badge.color}`}>
          {badge.label}
        </span>
      </div>

      {/* Carte fidélité */}
      <div className="mx-6 bg-white rounded-3xl p-6 shadow-2xl mb-6">

        {/* Points */}
        <div className="text-center mb-6">
          <p className="text-gray-500 text-sm">Vos points fidélité</p>
          <p className="text-5xl font-bold text-blue-600 mt-1">
            {client?.points_total}
          </p>
          <p className="text-gray-400 text-sm">points</p>
        </div>

        {/* QR Code */}
        <div className="bg-gray-50 rounded-2xl p-6 text-center mb-6">
          <p className="text-gray-500 text-sm mb-3">Votre QR Code</p>
          <div className="bg-white p-4 rounded-xl inline-block shadow-sm">
            <div className="w-32 h-32 bg-gray-200 rounded-lg flex items-center justify-center mx-auto">
              <span className="text-4xl">📱</span>
            </div>
          </div>
          <p className="font-mono text-gray-700 font-bold mt-3 text-lg">
            {client?.qr_code}
          </p>
          <p className="text-gray-400 text-xs mt-1">
            Présentez ce code en caisse
          </p>
        </div>

        {/* Bouton Google Wallet */}
        <button
          onClick={handleGoogleWallet}
          disabled={walletLoading}
          className="w-full bg-black hover:bg-gray-900 text-white font-semibold py-4 rounded-2xl flex items-center justify-center gap-3 transition disabled:opacity-50"
        >
          {walletLoading ? (
            <span>Chargement...</span>
          ) : (
            <>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
              </svg>
              <span>Ajouter à Google Wallet</span>
            </>
          )}
        </button>

      </div>

      {/* Infos membre */}
      <div className="mx-6 bg-white bg-opacity-20 rounded-2xl p-4 mb-6">
        <p className="text-white text-sm text-center">
          Membre depuis le {new Date(client?.created_at).toLocaleDateString('fr-FR')}
        </p>
      </div>

      {/* Déconnexion */}
      <div className="px-6 pb-8">
        <button
          onClick={() => { logout(); router.push('/'); }}
          className="w-full bg-white bg-opacity-20 hover:bg-opacity-30 text-white font-medium py-3 rounded-xl transition"
        >
          Déconnexion
        </button>
      </div>

    </div>
  );
}