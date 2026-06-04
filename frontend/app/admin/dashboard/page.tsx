'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import {
  Shield, Building2, Users, ShoppingBag,
  TrendingUp, Star, Megaphone, LogOut,
  Trash2, ArrowUpRight, BarChart2
} from 'lucide-react';

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [entreprises, setEntreprises] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [onglet, setOnglet] = useState<'stats' | 'entreprises' | 'clients'>('stats');
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) { router.push('/admin'); return; }
    fetchAll(token);
  }, []);

  const fetchAll = async (token: string) => {
    try {
      const [statsRes, entreprisesRes, clientsRes] = await Promise.all([
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/entreprises`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/clients`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      setStats(statsRes.data);
      setEntreprises(entreprisesRes.data.entreprises);
      setClients(clientsRes.data.clients);
    } catch (err) {
      router.push('/admin');
    } finally {
      setChargement(false);
    }
  };

  const handleSupprimer = async (id: number) => {
    if (!confirm('Supprimer cette entreprise ?')) return;
    const token = localStorage.getItem('admin_token');
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/entreprises/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEntreprises(entreprises.filter(e => e.id !== id));
    } catch (err) {
      alert('❌ Erreur lors de la suppression');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    router.push('/admin');
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-3">
          <p className="text-gray-400 text-xs mb-1">{label}</p>
          <p className="text-white font-bold">{parseInt(payload[0].value).toLocaleString()} FCFA</p>
        </div>
      );
    }
    return null;
  };

  if (chargement) {
    return (
      <div className="min-h-screen bg-[#080808] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-indigo-500/30 border-t-indigo-400 rounded-full animate-spin" />
      </div>
    );
  }

  const statCards = [
    { icon: Building2, label: 'Entreprises', value: stats?.statistiques?.total_entreprises, color: 'text-blue-400 bg-blue-400/10' },
    { icon: Users, label: 'Clients', value: stats?.statistiques?.total_clients, color: 'text-green-400 bg-green-400/10' },
    { icon: ShoppingBag, label: 'Transactions', value: stats?.statistiques?.total_transactions, color: 'text-yellow-400 bg-yellow-400/10' },
    { icon: TrendingUp, label: 'Chiffre d\'affaires', value: `${(stats?.statistiques?.chiffre_affaires || 0).toLocaleString()} FCFA`, color: 'text-purple-400 bg-purple-400/10' },
    { icon: Star, label: 'Points distribués', value: stats?.statistiques?.total_points, color: 'text-orange-400 bg-orange-400/10' },
    { icon: Megaphone, label: 'Campagnes', value: stats?.statistiques?.total_campagnes, color: 'text-pink-400 bg-pink-400/10' },
  ];

  return (
    <div className="min-h-screen bg-[#080808]">

      {/* Navbar */}
      <nav className="border-b border-white/[0.06] px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-center justify-center">
            <Shield size={16} className="text-indigo-400" />
          </div>
          <div>
            <p className="text-white font-bold text-sm">Panel Administration</p>
            <p className="text-gray-600 text-xs">FidélisationPro</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-gray-600 hover:text-red-400 transition-colors text-sm"
        >
          <LogOut size={16} />
          Déconnexion
        </button>
      </nav>

      <div className="px-8 py-8 max-w-7xl mx-auto">

        {/* Onglets */}
        <div className="flex gap-1 mb-8 bg-white/[0.03] border border-white/[0.06] rounded-xl p-1 w-fit">
          {[
            { key: 'stats', label: 'Statistiques', icon: BarChart2 },
            { key: 'entreprises', label: 'Entreprises', icon: Building2 },
            { key: 'clients', label: 'Clients', icon: Users },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setOnglet(tab.key as any)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                onglet === tab.key
                  ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                  : 'text-gray-600 hover:text-gray-300'
              }`}
            >
              <tab.icon size={15} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Stats */}
        {onglet === 'stats' && (
          <div>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {statCards.map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-[#0d0d0d] border border-white/[0.06] rounded-2xl p-6 hover:border-white/[0.10] transition-all"
                >
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${stat.color}`}>
                    <stat.icon size={20} />
                  </div>
                  <p className="text-2xl font-bold text-white mb-1">{stat.value}</p>
                  <p className="text-gray-600 text-sm">{stat.label}</p>
                </motion.div>
              ))}
            </div>

            <div className="bg-[#0d0d0d] border border-white/[0.06] rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-white font-semibold">Évolution globale</h3>
                  <p className="text-gray-600 text-xs mt-0.5">7 derniers jours</p>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-600 bg-white/[0.04] px-3 py-1.5 rounded-lg">
                  <div className="w-2 h-2 bg-indigo-400 rounded-full" />
                  Montant FCFA
                </div>
              </div>
              {stats?.evolution?.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={stats.evolution}>
                    <defs>
                      <linearGradient id="colorAdmin" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(val) => new Date(val).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}
                      tick={{ fill: '#4b5563', fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis tick={{ fill: '#4b5563', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="montant" stroke="#6366f1" strokeWidth={2} fill="url(#colorAdmin)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[250px] flex items-center justify-center">
                  <p className="text-gray-700 text-sm">Pas encore de données</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Entreprises */}
        {onglet === 'entreprises' && (
          <div className="space-y-3">
            <p className="text-gray-600 text-sm mb-4">{entreprises.length} entreprise(s) inscrite(s)</p>
            {entreprises.map((e: any, i: number) => (
              <motion.div
                key={e.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-[#0d0d0d] border border-white/[0.06] rounded-2xl p-6 hover:border-white/[0.10] transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-xl flex items-center justify-center border border-indigo-500/20">
                      <span className="text-indigo-400 font-bold">{e.nom[0]}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <p className="text-white font-semibold">{e.nom}</p>
                        <span className="text-xs bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded-full">
                          {e.plan_abonnement}
                        </span>
                      </div>
                      <p className="text-gray-600 text-xs">{e.email} • {e.secteur}</p>
                      <div className="flex items-center gap-6 mt-3">
                        {[
                          { label: 'Clients', value: e.total_clients },
                          { label: 'Transactions', value: e.total_transactions },
                          { label: 'CA (FCFA)', value: parseInt(e.chiffre_affaires).toLocaleString() },
                        ].map((stat, j) => (
                          <div key={j}>
                            <p className="text-white font-bold text-sm">{stat.value}</p>
                            <p className="text-gray-700 text-xs">{stat.label}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleSupprimer(e.id)}
                    className="w-9 h-9 bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 hover:border-red-500/20 text-red-500/40 hover:text-red-400 rounded-xl flex items-center justify-center transition-all ml-4"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Clients */}
        {onglet === 'clients' && (
          <div>
            <p className="text-gray-600 text-sm mb-4">{clients.length} client(s) inscrit(s)</p>
            <div className="bg-[#0d0d0d] border border-white/[0.06] rounded-2xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    {['Client', 'Contact', 'QR Code', 'Points', 'Transactions', 'Inscrit le'].map((h) => (
                      <th key={h} className="text-left px-6 py-4 text-xs font-medium text-gray-600 uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {clients.map((c: any, i: number) => (
                    <motion.tr
                      key={c.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.03 }}
                      className="hover:bg-white/[0.02] transition-all"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg flex items-center justify-center">
                            <span className="text-white text-xs font-bold">
                              {c.nom[0]}{c.prenom[0]}
                            </span>
                          </div>
                          <span className="text-white text-sm font-medium">{c.nom} {c.prenom}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-500 text-sm">{c.email}</td>
                      <td className="px-6 py-4 text-gray-600 text-xs font-mono">{c.qr_code}</td>
                      <td className="px-6 py-4">
                        <span className="bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 text-xs font-bold px-3 py-1 rounded-full">
                          {c.points_total} pts
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-500 text-sm">{c.total_transactions}</td>
                      <td className="px-6 py-4 text-gray-600 text-xs">
                        {new Date(c.created_at).toLocaleDateString('fr-FR')}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}