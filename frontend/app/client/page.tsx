'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useClientAuth } from '../context/ClientAuthContext';
import { Mail, Lock, ArrowRight, Sparkles, UserCircle } from 'lucide-react';

export default function ClientLoginPage() {
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [erreur, setErreur] = useState('');
  const [chargement, setChargement] = useState(false);
  const { clientLogin } = useClientAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setChargement(true);
    setErreur('');
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/clients/connexion`,
        { email, mot_de_passe: motDePasse }
      );
      clientLogin(response.data.token, response.data.client);
      router.push('/profil');
    } catch (err: any) {
      setErreur(err.response?.data?.message || '❌ Erreur de connexion');
    } finally {
      setChargement(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080808] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(234,179,8,0.06)_0%,transparent_70%)]" />
      <div className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="w-9 h-9 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-xl flex items-center justify-center">
              <Sparkles size={16} className="text-black" />
            </div>
            <span className="text-white font-bold text-lg">FidélisationPro</span>
          </div>
          <div className="w-16 h-16 bg-yellow-400/10 border border-yellow-400/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <UserCircle size={32} className="text-yellow-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">Espace Client</h1>
          <p className="text-gray-600 text-sm">Connectez-vous pour voir vos points</p>
        </div>

        <div className="bg-[#0d0d0d] border border-white/[0.06] rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/[0.04] border border-white/[0.08] text-white rounded-xl pl-11 pr-4 py-3.5 focus:outline-none focus:border-yellow-500/50 transition-all placeholder:text-gray-700 text-sm"
                  placeholder="votre@email.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Mot de passe</label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" />
                <input
                  type="password"
                  value={motDePasse}
                  onChange={(e) => setMotDePasse(e.target.value)}
                  className="w-full bg-white/[0.04] border border-white/[0.08] text-white rounded-xl pl-11 pr-4 py-3.5 focus:outline-none focus:border-yellow-500/50 transition-all placeholder:text-gray-700 text-sm"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {erreur && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm"
              >
                {erreur}
              </motion.div>
            )}

            <motion.button
              type="submit"
              disabled={chargement}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 mt-2"
            >
              {chargement ? (
                <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              ) : (
                <>
                  <span>Voir mes points</span>
                  <ArrowRight size={18} />
                </>
              )}
            </motion.button>
          </form>

          <p className="text-center text-gray-600 text-sm mt-6">
            Pas encore de compte ?{' '}
            <a href="/client/inscription" className="text-yellow-400 hover:text-yellow-300 font-medium transition-colors">
              S'inscrire gratuitement
            </a>
          </p>
        </div>

        <p className="text-center text-gray-700 text-xs mt-4">
          <a href="/" className="hover:text-gray-500 transition-colors">
            Vous êtes une entreprise ? →
          </a>
        </p>
      </motion.div>
    </div>
  );
}