'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer
} from 'recharts';

export default function DashboardPage() {
    const { token, entreprise, logout } = useAuth();
    const router = useRouter();
    const [stats, setStats] = useState<any>(null);
    const [chargement, setChargement] = useState(true);

    useEffect(() => {
        if (!token) {
            router.push('/');
            return;
        }
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

    const handleLogout = () => {
        logout();
        router.push('/');
    };

    if (chargement) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Chargement...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100">

            {/* Navbar */}
            <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="bg-blue-600 w-10 h-10 rounded-xl flex items-center justify-center">
                        <span className="text-white text-lg">🎯</span>
                    </div>
                    <div>
                        <h1 className="font-bold text-gray-800">{entreprise?.nom}</h1>
                        <p className="text-xs text-gray-500">{entreprise?.secteur}</p>
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    className="text-red-500 hover:text-red-700 text-sm font-medium"
                >
                    Déconnexion
                </button>
            </nav>

            <div className="max-w-7xl mx-auto px-6 py-8">

                {/* Titre */}
                <h2 className="text-2xl font-bold text-gray-800 mb-6">
                    Tableau de bord
                </h2>
                {/* Boutons d'action */}
                <div className="flex gap-4 mb-6">
                    <button
                        onClick={() => router.push('/dashboard/scanner')}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2 transition"
                    >
                        <span>📱</span> Scanner QR Code
                    </button>
                    <button
                        onClick={() => router.push('/dashboard/clients')}
                        className="bg-white hover:bg-gray-50 text-gray-800 px-6 py-3 rounded-xl font-medium flex items-center gap-2 border transition"
                    >
                        <span>👥</span> Mes Clients
                    </button>
                    <button
                        onClick={() => router.push('/dashboard/campagnes')}
                        className="bg-white hover:bg-gray-50 text-gray-800 px-6 py-3 rounded-xl font-medium flex items-center gap-2 border transition"
                    >
                        <span>📢</span> Campagnes
                    </button>
                </div>

                {/* Cartes statistiques */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-2xl p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-3xl">👥</span>
                            <span className="bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded-full">Clients</span>
                        </div>
                        <p className="text-3xl font-bold text-gray-800">
                            {stats?.statistiques?.total_clients || 0}
                        </p>
                        <p className="text-gray-500 text-sm mt-1">Clients uniques</p>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-3xl">🛍️</span>
                            <span className="bg-green-100 text-green-600 text-xs px-2 py-1 rounded-full">Ventes</span>
                        </div>
                        <p className="text-3xl font-bold text-gray-800">
                            {stats?.statistiques?.total_transactions || 0}
                        </p>
                        <p className="text-gray-500 text-sm mt-1">Transactions</p>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-3xl">💰</span>
                            <span className="bg-yellow-100 text-yellow-600 text-xs px-2 py-1 rounded-full">CA</span>
                        </div>
                        <p className="text-3xl font-bold text-gray-800">
                            {stats?.statistiques?.chiffre_affaires?.toLocaleString() || 0}
                        </p>
                        <p className="text-gray-500 text-sm mt-1">FCFA générés</p>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-3xl">⭐</span>
                            <span className="bg-purple-100 text-purple-600 text-xs px-2 py-1 rounded-full">Points</span>
                        </div>
                        <p className="text-3xl font-bold text-gray-800">
                            {stats?.statistiques?.total_points_distribues || 0}
                        </p>
                        <p className="text-gray-500 text-sm mt-1">Points distribués</p>
                    </div>
                </div>

                {/* Graphique */}
                <div className="bg-white rounded-2xl p-6 shadow-sm mb-8">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">
                        📈 Transactions des 7 derniers jours
                    </h3>
                    {stats?.graphique_semaine?.length > 0 ? (
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={stats.graphique_semaine}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="date"
                                    tickFormatter={(val) => new Date(val).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}
                                />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="total_montant" fill="#2563eb" radius={[4, 4, 0, 0]} name="Montant (FCFA)" />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <p className="text-gray-400 text-center py-8">Pas encore de données</p>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    {/* Top clients */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">🏆 Top Clients</h3>
                        {stats?.top_clients?.length > 0 ? (
                            <div className="space-y-3">
                                {stats.top_clients.map((client: any, index: number) => (
                                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                                        <div className="flex items-center gap-3">
                                            <span className="text-lg">{index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}</span>
                                            <div>
                                                <p className="font-medium text-gray-800">{client.nom} {client.prenom}</p>
                                                <p className="text-xs text-gray-500">{client.nombre_achats} achats</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-blue-600">{parseInt(client.total_depense).toLocaleString()} FCFA</p>
                                            <p className="text-xs text-gray-500">{client.points_total} pts</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-400 text-center py-8">Pas encore de clients</p>
                        )}
                    </div>

                    {/* Transactions récentes */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">🕐 Transactions Récentes</h3>
                        {stats?.transactions_recentes?.length > 0 ? (
                            <div className="space-y-3">
                                {stats.transactions_recentes.map((t: any, index: number) => (
                                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                                        <div>
                                            <p className="font-medium text-gray-800">{t.nom} {t.prenom}</p>
                                            <p className="text-xs text-gray-500">{t.type_achat} • {new Date(t.created_at).toLocaleDateString('fr-FR')}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-gray-800">{parseFloat(t.montant).toLocaleString()} FCFA</p>
                                            <p className="text-xs text-green-600">+{t.points_gagnes} pts</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-400 text-center py-8">Pas encore de transactions</p>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
}