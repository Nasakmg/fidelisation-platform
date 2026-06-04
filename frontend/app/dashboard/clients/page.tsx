'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Search, Users, Crown,
  Star, Phone, Mail, ShoppingBag,
  TrendingUp, Calendar, QrCode
} from 'lucide-react';

export default function ClientsPage() {
  const { token } = useAuth();
  const router = useRouter();
  const [clients, setClients] = useState<any[]>([]);
  const [chargement, setChargement] = useState(true);
  const [recherche, setRecherche] = useState('');
  const [filtre, setFiltre] = useState('tous');

  useEffect(() => {
    if (!token) { router.push('/'); return; }
    fetchClients();
  }, [token]);

  const fetchClients = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/entreprises/clients`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setClients(response.data.clients);
    } catch (err) {
      console.error(err);
    } finally {
      setChargement(false);
    }
  };

  const getBadge = (points: number) => {
    if (points >= 500) return { label: 'VIP', icon: Crown, color: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20' };
    if (points >= 200) return { label: 'Gold', icon: Star, color: 'text-orange-400 bg-orange-400/10 border-orange-400/20' };
    if (points >= 100) return { label: 'Silver', icon: Star, color: 'text-gray-300 bg-gray-300/10 border-gray-300/20' };
    return { label: 'Bronze', icon: Star, color: 'text-amber-600 bg-amber-600/10 border-amber-600/20' };
  };

  const clientsFiltres = clients.filter(c => {
    const matchRecherche = `${c.nom} ${c.prenom} ${c.email} ${c.telephone}`
      .toLowerCase().includes(recherche.toLowerCase());
    if (filtre === 'vip') return matchRecherche && c.points_total >= 500;
    if (filtre === 'gold') return matchRecherche && c.points_total >= 200 && c.points_total < 500;
    if (filtre === 'actifs') return matchRecherche && c.nombre_achats >= 2;
    return matchRecherche;
  });

  return (
    <div className="min-h-screen bg-[#080808]">

      {/* Header */}
      <div className="border-b border-white/[0.06] px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-4">
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
            <Users size={18} className="text-yellow-400" />
            <h1 className="text-white font-semibold">Gestion des Clients</h1>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-600 bg-white/[0.04] px-3 py-1.5 rounded-lg border border-white/[0.06]">
          <Users size={12} />
          <span>{clients.length} client(s)</span>
        </div>
      </div>

      <div className="px-8 py-8">

        {/* Filtres & Recherche */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between gap-4 mb-8"
        >
          {/* Recherche */}
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" />
            <input
              type="text"
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
              placeholder="Rechercher un client..."
              className="w-full bg-white/[0.04] border border-white/[0.08] text-white rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:border-yellow-500/50 transition-all placeholder:text-gray-700 text-sm"
            />
          </div>

          {/* Filtres */}
          <div className="flex items-center gap-2">
            {[
              { key: 'tous', label: 'Tous' },
              { key: 'vip', label: '👑 VIP' },
              { key: 'gold', label: '⭐ Gold' },
              { key: 'actifs', label: '🔥 Actifs' },
            ].map((f) => (
              <button
                key={f.key}
                onClick={() => setFiltre(f.key)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  filtre === f.key
                    ? 'bg-yellow-400/10 border border-yellow-400/30 text-yellow-400'
                    : 'bg-white/[0.03] border border-white/[0.06] text-gray-500 hover:text-gray-300'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Liste clients */}
        {chargement ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-2 border-yellow-500/30 border-t-yellow-400 rounded-full animate-spin" />
          </div>
        ) : clientsFiltres.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-white/[0.03] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Users size={24} className="text-gray-700" />
            </div>
            <p className="text-gray-600">Aucun client trouvé</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {clientsFiltres.map((client: any, i: number) => {
              const badge = getBadge(client.points_total);
              const BadgeIcon = badge.icon;
              return (
                <motion.div
                  key={client.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-[#0d0d0d] border border-white/[0.06] rounded-2xl p-6 hover:border-white/[0.12] transition-all group"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-5">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-gray-700 to-gray-800 rounded-xl flex items-center justify-center">
                        <span className="text-white font-bold">
                          {client.nom[0]}{client.prenom[0]}
                        </span>
                      </div>
                      <div>
                        <p className="text-white font-semibold">{client.nom} {client.prenom}</p>
                        <p className="text-gray-600 text-xs mt-0.5">{client.email}</p>
                      </div>
                    </div>
                    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium ${badge.color}`}>
                      <BadgeIcon size={11} />
                      {badge.label}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {[
                      { icon: ShoppingBag, label: 'Achats', value: `${client.nombre_achats}x` },
                      { icon: TrendingUp, label: 'Dépenses', value: `${parseInt(client.total_depense).toLocaleString()}` },
                      { icon: Calendar, label: 'Dernier achat', value: new Date(client.dernier_achat).toLocaleDateString('fr-FR') },
                      { icon: Phone, label: 'Téléphone', value: client.telephone },
                    ].map((stat, j) => (
                      <div key={j} className="bg-white/[0.03] rounded-xl p-3">
                        <div className="flex items-center gap-1.5 mb-1">
                          <stat.icon size={12} className="text-gray-600" />
                          <span className="text-gray-600 text-xs">{stat.label}</span>
                        </div>
                        <p className="text-white text-sm font-medium truncate">{stat.value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Points bar */}
                  <div className="bg-white/[0.03] rounded-xl p-3 mb-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-500 text-xs">Points fidélité</span>
                      <span className="text-yellow-400 font-bold text-sm">{client.points_total} pts</span>
                    </div>
                    <div className="w-full bg-white/[0.06] rounded-full h-1.5">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min((client.points_total / 500) * 100, 100)}%` }}
                        transition={{ delay: 0.3 + i * 0.05, duration: 0.8 }}
                        className="h-1.5 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full"
                      />
                    </div>
                    <p className="text-gray-700 text-xs mt-1">
                      {client.points_total < 500 ? `${500 - client.points_total} pts pour VIP` : '🎉 Statut VIP atteint !'}
                    </p>
                  </div>

                  {/* QR Code */}
                  <div className="flex items-center gap-2 text-gray-700 text-xs">
                    <QrCode size={12} />
                    <span className="font-mono">{client.qr_code}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}