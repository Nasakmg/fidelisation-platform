'use client';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import { Crown, Check, ArrowLeft, Zap, Sparkles, AlertTriangle } from 'lucide-react';

export default function AbonnementPage() {
  const { token } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [abonnement, setAbonnement] = useState<any>(null);
  const [plans, setPlans] = useState<any[]>([]);
  const [frequence, setFrequence] = useState<'mensuel' | 'trimestriel' | 'annuel'>('mensuel');
  const [chargement, setChargement] = useState(true);
  const [paiementLoading, setPaiementLoading] = useState<number | null>(null);
  const success = searchParams.get('success');

  useEffect(() => {
    if (!token) { router.push('/'); return; }
    fetchData();
  }, [token]);

  const fetchData = async () => {
    try {
      const [abonnementRes, plansRes] = await Promise.all([
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/abonnements/mon-abonnement`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/abonnements/plans`)
      ]);
      setAbonnement(abonnementRes.data);
      setPlans(plansRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setChargement(false);
    }
  };

  const handlePaiement = async (plan_id: number) => {
    setPaiementLoading(plan_id);
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/abonnements/paiement`,
        { plan_id, frequence },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      window.location.href = response.data.payment_url;
    } catch (err: any) {
      alert(err.response?.data?.message || '❌ Erreur paiement');
    } finally {
      setPaiementLoading(null);
    }
  };

  const getJoursRestants = () => {
    if (!abonnement?.date_fin) return 0;
    const diff = new Date(abonnement.date_fin).getTime() - new Date().getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  const getPrix = (plan: any) => {
    if (frequence === 'mensuel') return plan.prix_mensuel;
    if (frequence === 'trimestriel') return plan.prix_trimestriel;
    return plan.prix_annuel;
  };

  if (chargement) {
    return (
      <div className="min-h-screen bg-[#080808] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-yellow-500/30 border-t-yellow-400 rounded-full animate-spin" />
      </div>
    );
  }

  const joursRestants = getJoursRestants();

  return (
    <div className="min-h-screen bg-[#080808]">

      {/* Header */}
      <div className="border-b border-white/[0.06] px-6 py-4 flex items-center gap-4">
        <button onClick={() => router.push('/dashboard')} className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors">
          <ArrowLeft size={18} />
          <span className="text-sm">Retour</span>
        </button>
        <div className="w-px h-5 bg-white/10" />
        <div className="flex items-center gap-2">
          <Crown size={18} className="text-yellow-400" />
          <h1 className="text-white font-semibold">Mon Abonnement</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">

        {/* Message succès */}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-500/10 border border-green-500/20 rounded-2xl p-4 mb-6 flex items-center gap-3"
          >
            <Check size={20} className="text-green-400" />
            <p className="text-green-400 font-medium">🎉 Paiement réussi ! Votre abonnement est activé.</p>
          </motion.div>
        )}

        {/* Abonnement actuel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#0d0d0d] border border-white/[0.06] rounded-2xl p-6 mb-8"
        >
          <h2 className="text-white font-bold text-lg mb-4">Abonnement actuel</h2>

          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                abonnement?.statut === 'actif'
                  ? 'bg-yellow-400/10 border border-yellow-400/20'
                  : 'bg-blue-400/10 border border-blue-400/20'
              }`}>
                {abonnement?.statut === 'actif' ? (
                  <Crown size={24} className="text-yellow-400" />
                ) : (
                  <Zap size={24} className="text-blue-400" />
                )}
              </div>
              <div>
                <p className="text-white font-bold text-xl">
                  {abonnement?.plan_nom || 'Starter'}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    abonnement?.statut === 'actif'
                      ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                      : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                  }`}>
                    {abonnement?.statut === 'trial' ? '🎁 Essai gratuit' : '✅ Actif'}
                  </span>
                  {abonnement?.frequence && (
                    <span className="text-gray-600 text-xs">{abonnement.frequence}</span>
                  )}
                </div>
              </div>
            </div>

            <div className="text-right">
              {joursRestants <= 7 && (
                <div className="flex items-center gap-2 text-orange-400 mb-2">
                  <AlertTriangle size={16} />
                  <span className="text-sm font-medium">Expire dans {joursRestants} jours</span>
                </div>
              )}
              {abonnement?.date_fin && (
                <p className="text-gray-500 text-sm">
                  Valide jusqu'au {new Date(abonnement.date_fin).toLocaleDateString('fr-FR')}
                </p>
              )}
            </div>
          </div>

          {/* Barre de progression trial */}
          {abonnement?.statut === 'trial' && (
            <div className="mt-4">
              <div className="flex justify-between text-xs text-gray-600 mb-2">
                <span>Période d'essai</span>
                <span>{joursRestants} jours restants</span>
              </div>
              <div className="w-full bg-white/[0.06] rounded-full h-2">
                <div
                  className="h-2 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full"
                  style={{ width: `${(joursRestants / 14) * 100}%` }}
                />
              </div>
            </div>
          )}
        </motion.div>

        {/* Choisir un plan */}
        <h2 className="text-white font-bold text-lg mb-4">
          {abonnement?.statut === 'actif' ? 'Changer de plan' : 'Choisir un plan'}
        </h2>

        {/* Toggle fréquence */}
        <div className="flex items-center gap-1 bg-white/[0.04] border border-white/[0.08] rounded-xl p-1 w-fit mb-6">
          {(['mensuel', 'trimestriel', 'annuel'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFrequence(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                frequence === f ? 'bg-yellow-400 text-black' : 'text-gray-400 hover:text-white'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
              {f !== 'mensuel' && (
                <span className={`ml-1 text-xs ${frequence === f ? 'text-black/70' : 'text-green-400'}`}>
                  {f === 'trimestriel' ? '-11%' : '-20%'}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plans.map((plan, i) => {
            const isActuel = abonnement?.plan_nom === plan.nom && abonnement?.statut === 'actif';
            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`bg-[#0d0d0d] border rounded-2xl p-6 ${
                  isActuel ? 'border-yellow-400/30' : 'border-white/[0.06]'
                }`}
              >
                <h3 className="text-white font-bold text-lg mb-1">{plan.nom}</h3>
                <div className="flex items-end gap-1 mb-4">
                  <span className="text-3xl font-bold text-white">{getPrix(plan).toLocaleString()}</span>
                  <span className="text-gray-500 text-sm mb-1">FCFA</span>
                </div>

                {isActuel ? (
                  <div className="w-full py-3 rounded-xl bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 text-sm font-medium text-center">
                    ✅ Plan actuel
                  </div>
                ) : (
                  <button
                    onClick={() => handlePaiement(plan.id)}
                    disabled={paiementLoading === plan.id}
                    className="w-full py-3 rounded-xl bg-white/[0.06] hover:bg-white/[0.10] border border-white/[0.08] text-white text-sm font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {paiementLoading === plan.id ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Souscrire</span>
                        <span className="text-gray-500">→</span>
                      </>
                    )}
                  </button>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Info paiement */}
        <div className="mt-6 bg-white/[0.02] border border-white/[0.06] rounded-xl p-4">
          <p className="text-gray-500 text-xs text-center">
            💳 Paiement sécurisé via CinetPay — Wave, Orange Money, MTN Money acceptés
          </p>
        </div>
      </div>
    </div>
  );
}