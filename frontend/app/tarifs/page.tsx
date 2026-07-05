'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Check, Sparkles, Zap, Crown, ArrowRight } from 'lucide-react';

export default function TarifsPage() {
  const [plans, setPlans] = useState<any[]>([]);
  const [frequence, setFrequence] = useState<'mensuel' | 'trimestriel' | 'annuel'>('mensuel');
  const router = useRouter();

  useEffect(() => {
    axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/abonnements/plans`)
      .then(r => setPlans(r.data))
      .catch(console.error);
  }, []);

  const getPrix = (plan: any) => {
    if (frequence === 'mensuel') return plan.prix_mensuel;
    if (frequence === 'trimestriel') return plan.prix_trimestriel;
    return plan.prix_annuel;
  };

  const getReduction = () => {
    if (frequence === 'trimestriel') return '-11%';
    if (frequence === 'annuel') return '-20%';
    return null;
  };

  const getPlanIcon = (nom: string) => {
    if (nom === 'Starter') return Zap;
    if (nom === 'Business') return Sparkles;
    return Crown;
  };

  const getPlanColor = (nom: string) => {
    if (nom === 'Starter') return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
    if (nom === 'Business') return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
    return 'text-purple-400 bg-purple-400/10 border-purple-400/20';
  };

  const features = {
    'Starter': [
      '500 clients maximum',
      '10 campagnes/mois',
      'SMS & Email',
      'QR Code client',
      'Dashboard basique',
      'Support email',
    ],
    'Business': [
      '2 000 clients maximum',
      'Campagnes illimitées',
      'SMS, Email & Push',
      'Google Wallet',
      'Dashboard avancé',
      'Statistiques détaillées',
      'Support prioritaire',
    ],
    'Enterprise': [
      'Clients illimités',
      'Campagnes illimitées',
      'Tous les canaux',
      'Google & Apple Wallet',
      'API accès complet',
      'Manager dédié',
      'Formation incluse',
      'SLA garanti',
    ],
  };

  return (
    <div className="min-h-screen bg-[#080808]">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(234,179,8,0.06)_0%,transparent_60%)]" />

      {/* Header */}
      <div className="relative z-10 text-center pt-16 pb-12 px-4">
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="w-9 h-9 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-xl flex items-center justify-center">
            <Sparkles size={16} className="text-black" />
          </div>
          <span className="text-white font-bold text-lg">E-Wallet</span>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="inline-flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 rounded-full px-4 py-2 mb-6">
            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
            <span className="text-yellow-400 text-sm font-medium">14 jours d'essai gratuit</span>
          </div>

          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">
            Des tarifs simples et
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">
              transparents
            </span>
          </h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            Choisissez le plan adapté à votre business. Sans engagement, résiliable à tout moment.
          </p>
        </motion.div>

        {/* Toggle fréquence */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center justify-center gap-2 mt-8"
        >
          <div className="flex items-center gap-1 bg-white/[0.04] border border-white/[0.08] rounded-xl p-1">
            {(['mensuel', 'trimestriel', 'annuel'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFrequence(f)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  frequence === f
                    ? 'bg-yellow-400 text-black'
                    : 'text-gray-400 hover:text-white'
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
        </motion.div>
      </div>

      {/* Plans */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan, i) => {
            const Icon = getPlanIcon(plan.nom);
            const colorClass = getPlanColor(plan.nom);
            const isPopular = plan.nom === 'Business';
            const planFeatures = features[plan.nom as keyof typeof features] || [];

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`relative bg-[#0d0d0d] border rounded-2xl p-8 ${
                  isPopular
                    ? 'border-yellow-400/30 shadow-lg shadow-yellow-400/10'
                    : 'border-white/[0.06]'
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-yellow-400 text-black text-xs font-bold px-4 py-1 rounded-full">
                      ⭐ Le plus populaire
                    </span>
                  </div>
                )}

                {/* Plan header */}
                <div className="mb-6">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center border mb-4 ${colorClass}`}>
                    <Icon size={22} />
                  </div>
                  <h3 className="text-white font-bold text-xl mb-1">{plan.nom}</h3>
                  <p className="text-gray-500 text-sm">
                    {plan.nom === 'Starter' && 'Idéal pour démarrer'}
                    {plan.nom === 'Business' && 'Pour les boutiques actives'}
                    {plan.nom === 'Enterprise' && 'Pour les grandes enseignes'}
                  </p>
                </div>

                {/* Prix */}
                <div className="mb-6">
                  <div className="flex items-end gap-2">
                    <span className="text-4xl font-bold text-white">
                      {getPrix(plan).toLocaleString()}
                    </span>
                    <span className="text-gray-500 mb-1">FCFA</span>
                  </div>
                  <p className="text-gray-600 text-xs mt-1">
                    {frequence === 'mensuel' && 'par mois'}
                    {frequence === 'trimestriel' && 'par trimestre (3 mois)'}
                    {frequence === 'annuel' && 'par an (12 mois)'}
                  </p>
                  {frequence !== 'mensuel' && (
                    <p className="text-green-400 text-xs mt-1">
                      soit {Math.round(getPrix(plan) / (frequence === 'trimestriel' ? 3 : 12)).toLocaleString()} FCFA/mois
                    </p>
                  )}
                </div>

                {/* Features */}
                <div className="space-y-3 mb-8">
                  {planFeatures.map((feature, j) => (
                    <div key={j} className="flex items-center gap-3">
                      <div className="w-5 h-5 bg-green-500/10 border border-green-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                        <Check size={11} className="text-green-400" />
                      </div>
                      <span className="text-gray-300 text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <button
                  onClick={() => router.push(`/inscription?plan=${plan.id}&frequence=${frequence}`)}
                  className={`w-full py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${
                    isPopular
                      ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black'
                      : 'bg-white/[0.06] hover:bg-white/[0.10] text-white border border-white/[0.08]'
                  }`}
                >
                  Commencer l'essai gratuit
                  <ArrowRight size={16} />
                </button>
              </motion.div>
            );
          })}
        </div>

        {/* Garantie */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 text-center"
        >
          <div className="inline-flex items-center gap-6 bg-white/[0.03] border border-white/[0.06] rounded-2xl px-8 py-4">
            {[
              { emoji: '🔒', text: 'Paiement sécurisé' },
              { emoji: '✅', text: '14 jours gratuits' },
              { emoji: '🔄', text: 'Sans engagement' },
              { emoji: '💬', text: 'Support inclus' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <span>{item.emoji}</span>
                <span className="text-gray-400 text-sm">{item.text}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}