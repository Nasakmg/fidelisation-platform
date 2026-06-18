'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import { ArrowLeft, Users, ShoppingBag, TrendingUp, Calendar } from 'lucide-react';

export default function PassagesPage() {
  const { token } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    if (!token) { router.push('/'); return; }
    fetchPassages();
  }, [token]);

  const fetchPassages = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/dashboard/passages`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setData(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setChargement(false);
    }
  };

  if (chargement) {
    return (
      <div className="min-h-screen bg-[#080808] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-yellow-500/30 border-t-yellow-400 rounded-full animate-spin" />
      </div>
    );
  }

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
          <Calendar size={18} className="text-yellow-400" />
          <h1 className="text-white font-semibold">Passages Quotidiens</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">

        {/* Stats aujourd'hui */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            {
              icon: ShoppingBag,
              label: "Passages aujourd'hui",
              value: data?.aujourdhui?.passages_aujourdhui || 0,
              color: 'bg-blue-500/10 text-blue-400'
            },
            {
              icon: Users,
              label: "Clients uniques",
              value: data?.aujourdhui?.clients_aujourdhui || 0,
              color: 'bg-green-500/10 text-green-400'
            },
            {
              icon: TrendingUp,
              label: "Montant du jour",
              value: `${parseInt(data?.aujourdhui?.montant_aujourdhui || 0).toLocaleString()} FCFA`,
              color: 'bg-yellow-500/10 text-yellow-400'
            },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-[#0d0d0d] border border-white/[0.06] rounded-2xl p-6"
            >
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${stat.color}`}>
                <stat.icon size={20} />
              </div>
              <p className="text-2xl font-bold text-white mb-1">{stat.value}</p>
              <p className="text-gray-500 text-sm">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Historique 30 jours */}
        <div className="bg-[#0d0d0d] border border-white/[0.06] rounded-2xl p-6">
          <h2 className="text-white font-semibold mb-6">📅 Historique des 30 derniers jours</h2>

          {data?.historique_30_jours?.length > 0 ? (
            <div className="space-y-3">
              {data.historique_30_jours.map((jour: any, i: number) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="flex items-center justify-between p-4 bg-white/[0.02] rounded-xl hover:bg-white/[0.04] transition-all border border-white/[0.04]"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-yellow-400/10 rounded-xl flex items-center justify-center">
                      <Calendar size={16} className="text-yellow-400" />
                    </div>
                    <div>
                      <p className="text-white font-medium">
                        {new Date(jour.date).toLocaleDateString('fr-FR', {
                          weekday: 'long', day: 'numeric', month: 'long'
                        })}
                      </p>
                      <p className="text-gray-600 text-xs">
                        {jour.clients_uniques} client(s) unique(s)
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-bold">{jour.nombre_passages} passages</p>
                    <p className="text-yellow-400 text-xs">
                      {parseInt(jour.total_montant).toLocaleString()} FCFA
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <span className="text-4xl">📅</span>
              <p className="text-gray-600 mt-4">Aucun passage enregistré</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}