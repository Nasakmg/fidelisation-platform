'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import {
  Users, ShoppingBag, TrendingUp, Star,
  QrCode, Megaphone, LogOut, Sparkles,
  ArrowUpRight, Bell, Settings, ChevronRight,
  Menu, X
} from 'lucide-react';

const Sidebar = ({ entreprise, onLogout }: any) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const navItems = [
    { icon: TrendingUp, label: 'Dashboard', path: '/dashboard', active: true },
    { icon: QrCode, label: 'Scanner', path: '/dashboard/scanner' },
    { icon: Users, label: 'Clients', path: '/dashboard/clients' },
    { icon: Megaphone, label: 'Campagnes', path: '/dashboard/campagnes' },
    { icon: Settings, label: 'Paramètres', path: '/dashboard/parametres' },
  ];

  return (
    <>
      {/* Mobile navbar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-[#0d0d0d] border-b border-white/[0.06] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center">
            <Sparkles size={14} className="text-black" />
          </div>
          <span className="text-white font-bold text-sm">FidélisationPro</span>
        </div>
        <button
          onClick={() => setOpen(!open)}
          className="text-gray-400 hover:text-white transition-colors"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {open && (
        <div className="lg:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setOpen(false)} />
      )}

      <div className={`lg:hidden fixed top-0 left-0 h-full w-72 bg-[#0d0d0d] border-r border-white/[0.06] z-50 transform transition-transform duration-300 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 border-b border-white/[0.06] mt-14">
          <div className="flex items-center gap-3 p-3 bg-white/[0.03] rounded-xl border border-white/[0.06]">
            <div className="w-9 h-9 bg-gradient-to-br from-yellow-400/20 to-yellow-600/20 rounded-lg flex items-center justify-center">
              <span className="text-yellow-400 font-bold text-sm">{entreprise?.nom?.[0]}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{entreprise?.nom}</p>
              <p className="text-gray-600 text-xs">{entreprise?.secteur}</p>
            </div>
          </div>
        </div>
        <nav className="p-3">
          {navItems.map((item, i) => (
            <button
              key={i}
              onClick={() => { router.push(item.path); setOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl mb-1 transition-all text-left ${
                item.active
                  ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                  : 'text-gray-500 hover:text-gray-300 hover:bg-white/[0.04]'
              }`}
            >
              <item.icon size={18} />
              <span className="text-sm font-medium">{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-white/[0.06]">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:text-red-400 hover:bg-red-500/5 transition-all"
          >
            <LogOut size={18} />
            <span className="text-sm font-medium">Déconnexion</span>
          </button>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex fixed left-0 top-0 h-full w-64 bg-[#0d0d0d] border-r border-white/[0.06] flex-col z-50">
        <div className="p-6 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center">
              <Sparkles size={16} className="text-black" />
            </div>
            <div>
              <p className="text-white font-bold text-sm">FidélisationPro</p>
              <p className="text-gray-600 text-xs">Espace Entreprise</p>
            </div>
          </div>
        </div>

        <div className="p-4 mx-3 mt-4 bg-white/[0.03] rounded-xl border border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-yellow-400/20 to-yellow-600/20 rounded-lg flex items-center justify-center">
              <span className="text-yellow-400 font-bold text-sm">{entreprise?.nom?.[0]}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{entreprise?.nom}</p>
              <p className="text-gray-600 text-xs truncate">{entreprise?.secteur}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 mt-2">
          {navItems.map((item, i) => (
            <motion.button
              key={i}
              whileHover={{ x: 4 }}
              onClick={() => router.push(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl mb-1 transition-all text-left ${
                item.active
                  ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                  : 'text-gray-500 hover:text-gray-300 hover:bg-white/[0.04]'
              }`}
            >
              <item.icon size={18} />
              <span className="text-sm font-medium">{item.label}</span>
              {item.active && <ChevronRight size={14} className="ml-auto" />}
            </motion.button>
          ))}
        </nav>

        <div className="p-3 border-t border-white/[0.06]">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:text-red-400 hover:bg-red-500/5 transition-all"
          >
            <LogOut size={18} />
            <span className="text-sm font-medium">Déconnexion</span>
          </button>
        </div>
      </div>
    </>
  );
};

const StatCard = ({ icon: Icon, label, value, sub, color, delay }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="bg-[#0d0d0d] border border-white/[0.06] rounded-2xl p-6 hover:border-white/[0.12] transition-all group"
  >
    <div className="flex items-start justify-between mb-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>
        <Icon size={20} />
      </div>
      <div className="flex items-center gap-1 text-green-400 text-xs bg-green-400/10 px-2 py-1 rounded-full">
        <ArrowUpRight size={12} />
        <span>Live</span>
      </div>
    </div>
    <p className="text-3xl font-bold text-white mb-1">{value}</p>
    <p className="text-gray-500 text-sm">{label}</p>
    {sub && <p className="text-gray-700 text-xs mt-1">{sub}</p>}
  </motion.div>
);

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

export default function DashboardPage() {
  const { token, entreprise, logout } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    if (!token) { router.push('/'); return; }
    fetchDashboard();
  }, [token]);

  const fetchDashboard = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/dashboard/entreprise`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setStats(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setChargement(false);
    }
  };

  const handleLogout = () => { logout(); router.push('/'); };

  if (chargement) {
    return (
      <div className="min-h-screen bg-[#080808] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-yellow-500/30 border-t-yellow-400 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 text-sm">Chargement du dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080808]">
      <Sidebar entreprise={entreprise} onLogout={handleLogout} />

      <div className="lg:ml-64 pt-16 lg:pt-0 p-8">

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-10"
        >
          <div>
            <h1 className="text-2xl font-bold text-white">Tableau de bord</h1>
            <p className="text-gray-600 text-sm mt-1">
              {new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/dashboard/scanner')}
              className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-black font-semibold px-5 py-2.5 rounded-xl transition-all text-sm"
            >
              <QrCode size={16} />
              Scanner QR
            </motion.button>
            <button className="w-10 h-10 bg-white/[0.05] border border-white/[0.08] rounded-xl flex items-center justify-center text-gray-400 hover:text-white transition-all">
              <Bell size={18} />
            </button>
          </div>
        </motion.div>

        <div className="grid grid-cols-4 gap-4 mb-8">
          <StatCard icon={Users} label="Clients uniques" value={stats?.statistiques?.total_clients || 0} color="bg-blue-500/10 text-blue-400" delay={0.1} />
          <StatCard icon={ShoppingBag} label="Transactions" value={stats?.statistiques?.total_transactions || 0} color="bg-green-500/10 text-green-400" delay={0.2} />
          <StatCard icon={TrendingUp} label="Chiffre d'affaires" value={`${(stats?.statistiques?.chiffre_affaires || 0).toLocaleString()}`} sub="FCFA générés" color="bg-yellow-500/10 text-yellow-400" delay={0.3} />
          <StatCard icon={Star} label="Points distribués" value={stats?.statistiques?.total_points_distribues || 0} color="bg-purple-500/10 text-purple-400" delay={0.4} />
        </div>

        <div className="grid grid-cols-3 gap-6 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="col-span-2 bg-[#0d0d0d] border border-white/[0.06] rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-white font-semibold">Évolution des ventes</h3>
                <p className="text-gray-600 text-xs mt-0.5">7 derniers jours</p>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-600 bg-white/[0.04] px-3 py-1.5 rounded-lg">
                <div className="w-2 h-2 bg-yellow-400 rounded-full" />
                Montant FCFA
              </div>
            </div>
            {stats?.graphique_semaine?.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={stats.graphique_semaine}>
                  <defs>
                    <linearGradient id="colorMontant" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#EAB308" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#EAB308" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="date" tickFormatter={(val) => new Date(val).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })} tick={{ fill: '#4b5563', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#4b5563', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="total_montant" stroke="#EAB308" strokeWidth={2} fill="url(#colorMontant)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[220px] flex items-center justify-center">
                <p className="text-gray-700 text-sm">Pas encore de données</p>
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-[#0d0d0d] border border-white/[0.06] rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-white font-semibold">Top Clients</h3>
              <button onClick={() => router.push('/dashboard/clients')} className="text-yellow-400 text-xs hover:text-yellow-300 transition-colors">Voir tout →</button>
            </div>
            <div className="space-y-3">
              {stats?.top_clients?.length > 0 ? (
                stats.top_clients.slice(0, 5).map((client: any, i: number) => (
                  <motion.div key={i} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.7 + i * 0.1 }} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/[0.03] transition-all">
                    <div className="relative">
                      <div className="w-9 h-9 bg-gradient-to-br from-gray-700 to-gray-800 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">{client.nom[0]}{client.prenom[0]}</span>
                      </div>
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#0d0d0d] rounded-full flex items-center justify-center">
                        <span className="text-[9px]">{i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}</span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">{client.nom} {client.prenom}</p>
                      <p className="text-gray-600 text-xs">{client.points_total} pts</p>
                    </div>
                    <p className="text-yellow-400 text-xs font-medium">{parseInt(client.total_depense).toLocaleString()}</p>
                  </motion.div>
                ))
              ) : (
                <p className="text-gray-700 text-sm text-center py-8">Pas encore de clients</p>
              )}
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-[#0d0d0d] border border-white/[0.06] rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-white font-semibold">Transactions récentes</h3>
              <p className="text-gray-600 text-xs mt-0.5">Dernières activités</p>
            </div>
            <motion.button whileHover={{ scale: 1.02 }} onClick={() => router.push('/dashboard/scanner')} className="flex items-center gap-2 text-sm text-yellow-400 hover:text-yellow-300 transition-colors">
              Nouvelle transaction →
            </motion.button>
          </div>

          {stats?.transactions_recentes?.length > 0 ? (
            <div className="space-y-2">
              {stats.transactions_recentes.map((t: any, i: number) => (
                <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 + i * 0.05 }} className="flex items-center justify-between p-4 rounded-xl hover:bg-white/[0.03] transition-all border border-transparent hover:border-white/[0.06]">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-green-500/10 rounded-xl flex items-center justify-center">
                      <ShoppingBag size={16} className="text-green-400" />
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">{t.nom} {t.prenom}</p>
                      <p className="text-gray-600 text-xs">{t.type_achat} • {new Date(t.created_at).toLocaleDateString('fr-FR')}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-semibold">{parseFloat(t.montant).toLocaleString()} FCFA</p>
                    <p className="text-green-400 text-xs">+{t.points_gagnes} pts</p>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-white/[0.03] rounded-2xl flex items-center justify-center mx-auto mb-4">
                <ShoppingBag size={24} className="text-gray-700" />
              </div>
              <p className="text-gray-600 text-sm">Aucune transaction pour le moment</p>
              <button onClick={() => router.push('/dashboard/scanner')} className="mt-4 text-yellow-400 text-sm hover:text-yellow-300 transition-colors">
                Scanner votre premier client →
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}