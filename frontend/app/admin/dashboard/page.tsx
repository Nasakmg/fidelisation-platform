'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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
    if (!confirm('Supprimer cette entreprise et toutes ses données ?')) return;
    const token = localStorage.getItem('admin_token');
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/entreprises/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEntreprises(entreprises.filter(e => e.id !== id));
      alert('✅ Entreprise supprimée !');
    } catch (err) {
      alert('❌ Erreur lors de la suppression');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    router.push('/admin');
  };

  if (chargement) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">

      {/* Navbar */}
      <nav className="bg-gray-900 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="bg-white w-10 h-10 rounded-xl flex items-center justify-center">
            <span className="text-gray-900 text-lg">⚙️</span>
          </div>
          <div>
            <h1 className="font-bold text-white">Panel Administration</h1>
            <p className="text-gray-400 text-xs">FidélisationPro</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="text-red-400 hover:text-red-300 text-sm font-medium"
        >
          Déconnexion
        </button>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* Onglets */}
        <div className="flex gap-2 mb-8 bg-white rounded-2xl p-2 shadow-sm w-fit">
          {[
            { key: 'stats', label: '📊 Statistiques' },
            { key: 'entreprises', label: '🏪 Entreprises' },
            { key: 'clients', label: '👥 Clients' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setOnglet(tab.key as any)}
              className={`px-6 py-2 rounded-xl font-medium text-sm transition ${
                onglet === tab.key
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Stats globales */}
        {onglet === 'stats' && (
          <div>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {[
                { label: 'Entreprises', value: stats?.statistiques?.total_entreprises, icon: '🏪', color: 'bg-blue-50 text-blue-600' },
                { label: 'Clients', value: stats?.statistiques?.total_clients, icon: '👥', color: 'bg-green-50 text-green-600' },
                { label: 'Transactions', value: stats?.statistiques?.total_transactions, icon: '🛍️', color: 'bg-yellow-50 text-yellow-600' },
                { label: 'Chiffre d\'affaires', value: `${stats?.statistiques?.chiffre_affaires?.toLocaleString()} FCFA`, icon: '💰', color: 'bg-purple-50 text-purple-600' },
                { label: 'Points distribués', value: stats?.statistiques?.total_points, icon: '⭐', color: 'bg-orange-50 text-orange-600' },
                { label: 'Campagnes', value: stats?.statistiques?.total_campagnes, icon: '📢', color: 'bg-pink-50 text-pink-600' },
              ].map((stat, i) => (
                <div key={i} className="bg-white rounded-2xl p-6 shadow-sm">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${stat.color}`}>
                    <span className="text-2xl">{stat.icon}</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                  <p className="text-gray-500 text-sm mt-1">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Graphique évolution */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                📈 Évolution des 7 derniers jours
              </h3>
              {stats?.evolution?.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={stats.evolution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(val) => new Date(val).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}
                    />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="montant" fill="#111827" radius={[4, 4, 0, 0]} name="Montant (FCFA)" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-gray-400 text-center py-8">Pas encore de données</p>
              )}
            </div>
          </div>
        )}

        {/* Liste entreprises */}
        {onglet === 'entreprises' && (
          <div className="space-y-4">
            <p className="text-gray-500 text-sm mb-4">{entreprises.length} entreprise(s)</p>
            {entreprises.map((e: any) => (
              <div key={e.id} className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="bg-blue-100 w-10 h-10 rounded-xl flex items-center justify-center">
                        <span className="text-blue-600 font-bold">{e.nom[0]}</span>
                      </div>
                      <div>
                        <p className="font-bold text-gray-800">{e.nom}</p>
                        <p className="text-xs text-gray-500">{e.email} • {e.secteur}</p>
                      </div>
                      <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">
                        {e.plan_abonnement}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-4 mt-4">
                      <div className="bg-gray-50 rounded-xl p-3 text-center">
                        <p className="font-bold text-gray-800">{e.total_clients}</p>
                        <p className="text-xs text-gray-500">Clients</p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-3 text-center">
                        <p className="font-bold text-gray-800">{e.total_transactions}</p>
                        <p className="text-xs text-gray-500">Transactions</p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-3 text-center">
                        <p className="font-bold text-gray-800">
                          {parseInt(e.chiffre_affaires).toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500">FCFA</p>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleSupprimer(e.id)}
                    className="ml-4 bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-lg text-sm font-medium transition"
                  >
                    🗑️ Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Liste clients */}
        {onglet === 'clients' && (
          <div>
            <p className="text-gray-500 text-sm mb-4">{clients.length} client(s)</p>
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Client</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Contact</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">QR Code</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Points</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Transactions</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Inscrit le</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {clients.map((c: any) => (
                    <tr key={c.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="bg-blue-100 w-8 h-8 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 text-xs font-bold">
                              {c.nom[0]}{c.prenom[0]}
                            </span>
                          </div>
                          <span className="font-medium text-gray-800">{c.nom} {c.prenom}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{c.email}</td>
                      <td className="px-6 py-4 text-xs font-mono text-gray-500">{c.qr_code}</td>
                      <td className="px-6 py-4">
                        <span className="bg-blue-100 text-blue-700 text-sm font-bold px-3 py-1 rounded-full">
                          {c.points_total} pts
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{c.total_transactions}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(c.created_at).toLocaleDateString('fr-FR')}
                      </td>
                    </tr>
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