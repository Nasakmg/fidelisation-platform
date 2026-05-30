'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

export default function ClientsPage() {
  const { token } = useAuth();
  const router = useRouter();
  const [clients, setClients] = useState<any[]>([]);
  const [chargement, setChargement] = useState(true);
  const [recherche, setRecherche] = useState('');

  useEffect(() => {
    if (!token) {
      router.push('/');
      return;
    }
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

  const clientsFiltres = clients.filter(c =>
    `${c.nom} ${c.prenom} ${c.email} ${c.telephone}`
      .toLowerCase()
      .includes(recherche.toLowerCase())
  );

  const getBadge = (points: number) => {
    if (points >= 500) return { label: '👑 VIP', color: 'bg-yellow-100 text-yellow-700' };
    if (points >= 200) return { label: '⭐ Gold', color: 'bg-orange-100 text-orange-700' };
    if (points >= 100) return { label: '🥈 Silver', color: 'bg-gray-100 text-gray-700' };
    return { label: '🥉 Bronze', color: 'bg-amber-100 text-amber-700' };
  };

  return (
    <div className="min-h-screen bg-gray-100">

      {/* Navbar */}
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 w-10 h-10 rounded-xl flex items-center justify-center">
            <span className="text-white text-lg">🎯</span>
          </div>
          <h1 className="font-bold text-gray-800">Gestion des Clients</h1>
        </div>
        <button
          onClick={() => router.push('/dashboard')}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          ← Retour
        </button>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Mes Clients</h2>
            <p className="text-gray-500 text-sm mt-1">
              {clients.length} client(s) au total
            </p>
          </div>

          {/* Barre de recherche */}
          <div className="relative w-full md:w-80">
            <span className="absolute left-3 top-3 text-gray-400">🔍</span>
            <input
              type="text"
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
              placeholder="Rechercher un client..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Liste clients */}
        {chargement ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Chargement...</p>
          </div>
        ) : clientsFiltres.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center">
            <span className="text-5xl">👥</span>
            <p className="text-gray-500 mt-4">Aucun client trouvé</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {clientsFiltres.map((client: any) => {
              const badge = getBadge(client.points_total);
              return (
                <div key={client.id} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition">

                  {/* Header carte client */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-bold text-lg">
                          {client.nom[0]}{client.prenom[0]}
                        </span>
                      </div>
                      <div>
                        <p className="font-bold text-gray-800">
                          {client.nom} {client.prenom}
                        </p>
                        <p className="text-xs text-gray-500">{client.email}</p>
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${badge.color}`}>
                      {badge.label}
                    </span>
                  </div>

                  {/* Infos */}
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Téléphone</span>
                      <span className="font-medium text-gray-800">{client.telephone}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Achats</span>
                      <span className="font-medium text-gray-800">{client.nombre_achats} fois</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Total dépensé</span>
                      <span className="font-medium text-gray-800">
                        {parseInt(client.total_depense).toLocaleString()} FCFA
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Dernier achat</span>
                      <span className="font-medium text-gray-800">
                        {new Date(client.dernier_achat).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  </div>

                  {/* Points */}
                  <div className="bg-blue-50 rounded-xl px-4 py-3 flex justify-between items-center">
                    <span className="text-blue-600 text-sm font-medium">Points fidélité</span>
                    <span className="text-blue-700 font-bold text-lg">
                      {client.points_total} pts
                    </span>
                  </div>

                  {/* QR Code */}
                  <div className="mt-3 bg-gray-50 rounded-xl px-4 py-2">
                    <p className="text-xs text-gray-500 font-mono text-center">
                      {client.qr_code}
                    </p>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}