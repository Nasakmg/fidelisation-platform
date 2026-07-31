'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { formaterMontant } from '../../../utils/devise';
import { motion } from 'framer-motion';
import { ArrowLeft, Search, Filter, ShoppingBag, Download } from 'lucide-react';

export default function HistoriquePage() {
  const { token, entreprise } = useAuth();
  const router = useRouter();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [chargement, setChargement] = useState(true);
  const [filtres, setFiltres] = useState({
    date_debut: '',
    date_fin: '',
    recherche: ''
  });

  useEffect(() => {
    if (!token) { router.push('/'); return; }
    fetchHistorique();
  }, [token, page]);

  const fetchHistorique = async () => {
    setChargement(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(filtres.date_debut && { date_debut: filtres.date_debut }),
        ...(filtres.date_fin && { date_fin: filtres.date_fin }),
      });

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/dashboard/historique?${params}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTransactions(response.data.transactions);
      setTotal(response.data.total);
      setPages(response.data.pages);
    } catch (err) {
      console.error(err);
    } finally {
      setChargement(false);
    }
  };

  const transactionsFiltrees = transactions.filter(t =>
    `${t.nom} ${t.prenom} ${t.email} ${t.telephone} ${t.qr_code}`
      .toLowerCase()
      .includes(filtres.recherche.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#080808]">

      {/* Header */}
      <div className="border-b border-white/[0.06] px-6 py-4 flex items-center justify-between">
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
            <ShoppingBag size={18} className="text-yellow-400" />
            <h1 className="text-white font-semibold">Historique & Traçabilité</h1>
          </div>
        </div>
        <span className="text-gray-500 text-sm">{total} transaction(s)</span>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">

        {/* Filtres */}
        <div className="bg-[#0d0d0d] border border-white/[0.06] rounded-2xl p-4 mb-6 flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-48">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
            <input
              type="text"
              value={filtres.recherche}
              onChange={(e) => setFiltres({...filtres, recherche: e.target.value})}
              placeholder="Rechercher un client..."
              className="w-full bg-white/[0.04] border border-white/[0.08] text-white rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-yellow-500/50 placeholder:text-gray-700"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={15} className="text-gray-600" />
            <input
              type="date"
              value={filtres.date_debut}
              onChange={(e) => setFiltres({...filtres, date_debut: e.target.value})}
              className="bg-white/[0.04] border border-white/[0.08] text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-yellow-500/50"
            />
            <span className="text-gray-600">→</span>
            <input
              type="date"
              value={filtres.date_fin}
              onChange={(e) => setFiltres({...filtres, date_fin: e.target.value})}
              className="bg-white/[0.04] border border-white/[0.08] text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-yellow-500/50"
            />
          </div>
          <button
            onClick={() => { setPage(1); fetchHistorique(); }}
            className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold px-4 py-2.5 rounded-xl text-sm transition-all"
          >
            Filtrer
          </button>
        </div>

        {/* Table */}
        <div className="bg-[#0d0d0d] border border-white/[0.06] rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.06]">
                {['Client', 'Contact', 'Type achat', 'Montant', 'Points', 'Date & Heure'].map((h) => (
                  <th key={h} className="text-left px-5 py-4 text-xs font-medium text-gray-600 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {chargement ? (
                <tr>
                  <td colSpan={6} className="text-center py-12">
                    <div className="w-8 h-8 border-2 border-yellow-500/30 border-t-yellow-400 rounded-full animate-spin mx-auto" />
                  </td>
                </tr>
              ) : transactionsFiltrees.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-600">
                    Aucune transaction trouvée
                  </td>
                </tr>
              ) : (
                transactionsFiltrees.map((t: any, i: number) => (
                  <motion.tr
                    key={t.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.02 }}
                    className="hover:bg-white/[0.02] transition-all"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-xs font-bold">{t.nom[0]}{t.prenom[0]}</span>
                        </div>
                        <div>
                          <p className="text-white text-sm font-medium">{t.nom} {t.prenom}</p>
                          <p className="text-gray-600 text-xs font-mono">{t.qr_code}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-gray-400 text-sm">{t.email}</p>
                      <p className="text-gray-600 text-xs">{t.telephone}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span className="bg-white/[0.06] text-gray-300 text-xs px-2 py-1 rounded-lg">
                        {t.type_achat}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-white font-semibold">{formaterMontant(t.montant, entreprise?.pays || 'Sénégal')}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-green-400 font-medium">+{t.points_gagnes} pts</span>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-gray-400 text-sm">
                        {new Date(t.created_at).toLocaleDateString('fr-FR')}
                      </p>
                      <p className="text-gray-600 text-xs">
                        {new Date(t.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-white/[0.04] border border-white/[0.08] text-gray-400 rounded-xl text-sm disabled:opacity-30 hover:text-white transition-all"
            >
              ← Précédent
            </button>
            <span className="text-gray-500 text-sm">Page {page} / {pages}</span>
            <button
              onClick={() => setPage(p => Math.min(pages, p + 1))}
              disabled={page === pages}
              className="px-4 py-2 bg-white/[0.04] border border-white/[0.08] text-gray-400 rounded-xl text-sm disabled:opacity-30 hover:text-white transition-all"
            >
              Suivant →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}