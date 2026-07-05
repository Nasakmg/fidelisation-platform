'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import {
  Shield, Building2, Users, ShoppingBag, TrendingUp,
  Star, Megaphone, LogOut, Trash2, CheckCircle,
  XCircle, AlertTriangle, Bell, BarChart2, Send
} from 'lucide-react';

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [entreprises, setEntreprises] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [campagnes, setCampagnes] = useState<any[]>([]);
  const [onglet, setOnglet] = useState<'stats' | 'entreprises' | 'clients' | 'campagnes' | 'notifications'>('stats');
  const [chargement, setChargement] = useState(true);
  const [notifMessage, setNotifMessage] = useState('');
  const [notifCanal, setNotifCanal] = useState('push');
  const [notifLoading, setNotifLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) { router.push('/admin'); return; }
    fetchAll(token);
  }, []);

  const fetchAll = async (token: string) => {
    try {
      const [statsRes, entreprisesRes, clientsRes, campagnesRes] = await Promise.all([
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/stats`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/entreprises`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/clients`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/campagnes`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      setStats(statsRes.data);
      setEntreprises(entreprisesRes.data.entreprises);
      setClients(clientsRes.data.clients);
      setCampagnes(campagnesRes.data.campagnes);
    } catch (err) {
      router.push('/admin');
    } finally {
      setChargement(false);
    }
  };

  const handleValider = async (id: number) => {
    const token = localStorage.getItem('admin_token');
    try {
      await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/entreprises/${id}/valider`, {}, { headers: { Authorization: `Bearer ${token}` } });
      setEntreprises(entreprises.map(e => e.id === id ? { ...e, statut: 'actif' } : e));
    } catch (err) { alert('❌ Erreur'); }
  };

  const handleSuspendre = async (id: number) => {
    if (!confirm('Suspendre cette entreprise ?')) return;
    const token = localStorage.getItem('admin_token');
    try {
      await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/entreprises/${id}/suspendre`, {}, { headers: { Authorization: `Bearer ${token}` } });
      setEntreprises(entreprises.map(e => e.id === id ? { ...e, statut: 'suspendu' } : e));
    } catch (err) { alert('❌ Erreur'); }
  };

  const handleSupprimer = async (id: number) => {
    if (!confirm('Supprimer définitivement cette entreprise ?')) return;
    const token = localStorage.getItem('admin_token');
    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/entreprises/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setEntreprises(entreprises.filter(e => e.id !== id));
    } catch (err) { alert('❌ Erreur'); }
  };

  const handleNotificationGlobale = async (e: React.FormEvent) => {
    e.preventDefault();
    setNotifLoading(true);
    const token = localStorage.getItem('admin_token');
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/notification-globale`,
        { message: notifMessage, canal: notifCanal },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(response.data.message);
      setNotifMessage('');
    } catch (err) { alert('❌ Erreur'); }
    finally { setNotifLoading(false); }
  };

  const handleLogout = () => { localStorage.removeItem('admin_token'); router.push('/admin'); };

  const getStatutBadge = (statut: string) => {
    if (statut === 'actif') return 'bg-green-500/10 text-green-400 border-green-500/20';
    if (statut === 'suspendu') return 'bg-red-500/10 text-red-400 border-red-500/20';
    return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
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

  const tabs = [
    { key: 'stats', label: 'Statistiques', icon: BarChart2 },
    { key: 'entreprises', label: 'Entreprises', icon: Building2, badge: stats?.statistiques?.entreprises_en_attente },
    { key: 'clients', label: 'Clients', icon: Users },
    { key: 'campagnes', label: 'Campagnes', icon: Megaphone },
    { key: 'notifications', label: 'Notifications', icon: Bell },
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
            <p className="text-gray-600 text-xs">E-Wallet</p>
          </div>
        </div>
        <button onClick={handleLogout} className="flex items-center gap-2 text-gray-600 hover:text-red-400 transition-colors text-sm">
          <LogOut size={16} />Déconnexion
        </button>
      </nav>

      <div className="px-8 py-8 max-w-7xl mx-auto">

        {/* Onglets */}
        <div className="flex gap-1 mb-8 bg-white/[0.03] border border-white/[0.06] rounded-xl p-1 w-fit overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setOnglet(tab.key as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap relative ${
                onglet === tab.key ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'text-gray-600 hover:text-gray-300'
              }`}
            >
              <tab.icon size={15} />
              {tab.label}
              {tab.badge > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* STATS */}
        {onglet === 'stats' && (
          <div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {[
                { label: 'Entreprises', value: stats?.statistiques?.total_entreprises, icon: Building2, color: 'text-blue-400 bg-blue-400/10' },
                { label: 'Clients', value: stats?.statistiques?.total_clients, icon: Users, color: 'text-green-400 bg-green-400/10' },
                { label: 'Transactions', value: stats?.statistiques?.total_transactions, icon: ShoppingBag, color: 'text-yellow-400 bg-yellow-400/10' },
                { label: 'CA Global (FCFA)', value: stats?.statistiques?.chiffre_affaires?.toLocaleString(), icon: TrendingUp, color: 'text-purple-400 bg-purple-400/10' },
                { label: 'Points distribués', value: stats?.statistiques?.total_points, icon: Star, color: 'text-orange-400 bg-orange-400/10' },
                { label: 'Campagnes', value: stats?.statistiques?.total_campagnes, icon: Megaphone, color: 'text-pink-400 bg-pink-400/10' },
                { label: 'Abonnements actifs', value: stats?.statistiques?.abonnements_actifs, icon: CheckCircle, color: 'text-teal-400 bg-teal-400/10' },
                { label: 'En attente validation', value: stats?.statistiques?.entreprises_en_attente, icon: AlertTriangle, color: 'text-red-400 bg-red-400/10' },
              ].map((stat, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className="bg-[#0d0d0d] border border-white/[0.06] rounded-2xl p-5">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${stat.color}`}>
                    <stat.icon size={18} />
                  </div>
                  <p className="text-2xl font-bold text-white mb-1">{stat.value}</p>
                  <p className="text-gray-600 text-xs">{stat.label}</p>
                </motion.div>
              ))}
            </div>

            {/* Stats quotidiennes */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="bg-[#0d0d0d] border border-white/[0.06] rounded-2xl p-6">
                <h3 className="text-white font-semibold mb-4">📊 Évolution globale (7 jours)</h3>
                {stats?.evolution?.length > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={stats.evolution}>
                      <defs>
                        <linearGradient id="colorAdmin" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                      <XAxis dataKey="date" tickFormatter={(val) => new Date(val).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })} tick={{ fill: '#4b5563', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: '#4b5563', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Area type="monotone" dataKey="montant" stroke="#6366f1" strokeWidth={2} fill="url(#colorAdmin)" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : <p className="text-gray-700 text-center py-8">Pas de données</p>}
              </div>

              {/* Entrées/Sorties quotidiennes */}
              <div className="bg-[#0d0d0d] border border-white/[0.06] rounded-2xl p-6">
                <h3 className="text-white font-semibold mb-4">📅 Entrées/Sorties quotidiennes</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {stats?.stats_quotidiennes?.length > 0 ? (
                    stats.stats_quotidiennes.map((jour: any, i: number) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-white/[0.02] rounded-xl">
                        <div>
                          <p className="text-white text-sm font-medium">
                            {new Date(jour.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                          </p>
                          <p className="text-gray-600 text-xs">{jour.clients_uniques} clients uniques</p>
                        </div>
                        <div className="text-right">
                          <p className="text-yellow-400 font-bold text-sm">{jour.transactions} transactions</p>
                          <p className="text-gray-500 text-xs">{parseInt(jour.montant_total).toLocaleString()} FCFA</p>
                        </div>
                      </div>
                    ))
                  ) : <p className="text-gray-700 text-center py-8">Pas de données</p>}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ENTREPRISES */}
        {onglet === 'entreprises' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <p className="text-gray-500 text-sm">{entreprises.length} entreprise(s)</p>
              {stats?.statistiques?.entreprises_en_attente > 0 && (
                <div className="flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 px-3 py-1.5 rounded-lg">
                  <AlertTriangle size={14} className="text-yellow-400" />
                  <span className="text-yellow-400 text-sm">{stats.statistiques.entreprises_en_attente} en attente de validation</span>
                </div>
              )}
            </div>

            {entreprises.map((e: any, i: number) => (
              <motion.div key={e.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="bg-[#0d0d0d] border border-white/[0.06] rounded-2xl p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-xl flex items-center justify-center border border-indigo-500/20">
                      <span className="text-indigo-400 font-bold">{e.nom[0]}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1 flex-wrap">
                        <p className="text-white font-semibold">{e.nom}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${getStatutBadge(e.statut)}`}>
                          {e.statut === 'actif' ? '✅ Actif' : e.statut === 'suspendu' ? '🚫 Suspendu' : '⏳ En attente'}
                        </span>
                        {e.plan_nom && (
                          <span className="text-xs bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded-full">
                            {e.plan_nom}
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 text-xs mb-3">{e.email} • {e.secteur} • {e.adresse}</p>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { label: 'Clients', value: e.total_clients },
                          { label: 'Transactions', value: e.total_transactions },
                          { label: 'CA (FCFA)', value: parseInt(e.chiffre_affaires).toLocaleString() },
                        ].map((stat, j) => (
                          <div key={j} className="bg-white/[0.03] rounded-xl p-3 text-center">
                            <p className="text-white font-bold text-sm">{stat.value}</p>
                            <p className="text-gray-700 text-xs">{stat.label}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 ml-4">
                    {e.statut === 'en_attente' && (
                      <button onClick={() => handleValider(e.id)}
                        className="flex items-center gap-1.5 bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 text-green-400 px-3 py-2 rounded-xl text-xs font-medium transition-all">
                        <CheckCircle size={13} /> Valider
                      </button>
                    )}
                    {e.statut === 'actif' && (
                      <button onClick={() => handleSuspendre(e.id)}
                        className="flex items-center gap-1.5 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/20 text-orange-400 px-3 py-2 rounded-xl text-xs font-medium transition-all">
                        <XCircle size={13} /> Suspendre
                      </button>
                    )}
                    {e.statut === 'suspendu' && (
                      <button onClick={() => handleValider(e.id)}
                        className="flex items-center gap-1.5 bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 text-green-400 px-3 py-2 rounded-xl text-xs font-medium transition-all">
                        <CheckCircle size={13} /> Réactiver
                      </button>
                    )}
                    <button onClick={() => handleSupprimer(e.id)}
                      className="flex items-center gap-1.5 bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 text-red-500/50 hover:text-red-400 px-3 py-2 rounded-xl text-xs transition-all">
                      <Trash2 size={13} /> Supprimer
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* CLIENTS */}
        {onglet === 'clients' && (
          <div>
            <p className="text-gray-500 text-sm mb-4">{clients.length} client(s)</p>
            <div className="bg-[#0d0d0d] border border-white/[0.06] rounded-2xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    {['Client', 'Contact', 'QR Code', 'Points', 'Transactions', 'Total dépensé', 'Inscrit le'].map((h) => (
                      <th key={h} className="text-left px-5 py-4 text-xs font-medium text-gray-600 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {clients.map((c: any, i: number) => (
                    <motion.tr key={c.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                      className="hover:bg-white/[0.02] transition-all">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg flex items-center justify-center">
                            <span className="text-white text-xs font-bold">{c.nom[0]}{c.prenom[0]}</span>
                          </div>
                          <span className="text-white text-sm font-medium">{c.nom} {c.prenom}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-gray-500 text-xs">
                        <p>{c.email}</p>
                        <p>{c.telephone}</p>
                      </td>
                      <td className="px-5 py-4 text-gray-600 text-xs font-mono">{c.qr_code}</td>
                      <td className="px-5 py-4">
                        <span className="bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 text-xs font-bold px-2 py-1 rounded-full">
                          {c.points_total} pts
                        </span>
                      </td>
                      <td className="px-5 py-4 text-gray-500 text-sm">{c.total_transactions}</td>
                      <td className="px-5 py-4 text-gray-400 text-sm">{parseInt(c.total_depense).toLocaleString()} FCFA</td>
                      <td className="px-5 py-4 text-gray-600 text-xs">{new Date(c.created_at).toLocaleDateString('fr-FR')}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* CAMPAGNES GLOBALES */}
        {onglet === 'campagnes' && (
          <div className="space-y-3">
            <p className="text-gray-500 text-sm mb-4">{campagnes.length} campagne(s) sur la plateforme</p>
            {campagnes.map((c: any, i: number) => (
              <motion.div key={c.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                className="bg-[#0d0d0d] border border-white/[0.06] rounded-2xl p-5">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1 flex-wrap">
                      <p className="text-white font-semibold">{c.titre}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${
                        c.statut === 'envoyée' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                      }`}>{c.statut}</span>
                      <span className="text-xs bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded-full">
                        {c.entreprise_nom}
                      </span>
                    </div>
                    <p className="text-gray-500 text-sm mb-2">{c.message}</p>
                    <p className="text-gray-700 text-xs">Canal: {c.canal} • {new Date(c.created_at).toLocaleDateString('fr-FR')}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* NOTIFICATIONS GLOBALES */}
        {onglet === 'notifications' && (
          <div className="max-w-2xl">
            <div className="bg-[#0d0d0d] border border-white/[0.06] rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-center justify-center">
                  <Bell size={22} className="text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">Notification Globale</h3>
                  <p className="text-gray-500 text-sm">Envoyez un message à tous les clients</p>
                </div>
              </div>

              <form onSubmit={handleNotificationGlobale} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Canal</label>
                  <select
                    value={notifCanal}
                    onChange={(e) => setNotifCanal(e.target.value)}
                    className="w-full bg-white/[0.04] border border-white/[0.08] text-white rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500/50 transition-all"
                  >
                    <option value="push" className="bg-[#111]">🔔 Notification Push</option>
                    <option value="sms" className="bg-[#111]">📱 SMS</option>
                    <option value="email" className="bg-[#111]">📧 Email</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Message</label>
                  <textarea
                    value={notifMessage}
                    onChange={(e) => setNotifMessage(e.target.value)}
                    className="w-full bg-white/[0.04] border border-white/[0.08] text-white rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500/50 transition-all resize-none placeholder:text-gray-700"
                    placeholder="Message à envoyer à tous les clients de la plateforme..."
                    rows={4}
                    required
                  />
                </div>

                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3">
                  <p className="text-yellow-400 text-xs">
                    ⚠️ Ce message sera envoyé à <strong>tous les clients</strong> de la plateforme ({clients.length} clients).
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={notifLoading}
                  className="w-full bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
                >
                  {notifLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send size={18} />
                      Envoyer à tous les clients
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}