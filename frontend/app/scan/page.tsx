'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useClientAuth } from '../context/ClientAuthContext';
import { Sparkles, ArrowRight, QrCode, Star, CheckCircle } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

function ScanContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { clientToken, clientLogin } = useClientAuth();
  const boutiqueQR = searchParams.get('boutique');

  const [etape, setEtape] = useState<'accueil' | 'connexion' | 'inscription' | 'succes'>('accueil');
  const [boutique, setBoutique] = useState<any>(null);
  const [client, setClient] = useState<any>(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState('');

  // Connexion
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');

  // Inscription
  const [formData, setFormData] = useState({
    nom: '', prenom: '', email: '', telephone: '', mot_de_passe: ''
  });

  useEffect(() => {
    if (boutiqueQR) {
      fetchBoutique();
    } else {
      setChargement(false);
    }
  }, [boutiqueQR]);

  useEffect(() => {
    // Si déjà connecté → aller directement au succès
    if (clientToken && boutique) {
      fetchProfilClient();
    }
  }, [clientToken, boutique]);

  const fetchBoutique = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/abonnements/boutique-info?qr=${boutiqueQR}`
      );
      setBoutique(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setChargement(false);
    }
  };

  const fetchProfilClient = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/clients/profil`, {
        headers: { Authorization: `Bearer ${clientToken}` }
      });
      setClient(response.data);
      setEtape('succes');
    } catch (err) {
      console.error(err);
    }
  };

  const handleConnexion = async (e: React.FormEvent) => {
    e.preventDefault();
    setErreur('');
    try {
      const response = await axios.post(`${API_URL}/api/clients/connexion`, {
        email, mot_de_passe: motDePasse
      });
      clientLogin(response.data.token, response.data.client);
      setClient(response.data.client);
      setEtape('succes');
    } catch (err: any) {
      setErreur(err.response?.data?.message || '❌ Erreur connexion');
    }
  };

  const handleInscription = async (e: React.FormEvent) => {
    e.preventDefault();
    setErreur('');
    try {
      const response = await axios.post(`${API_URL}/api/clients/inscription`, formData);
      clientLogin(response.data.token, response.data.client);
      setClient(response.data.client);
      setEtape('succes');
    } catch (err: any) {
      setErreur(err.response?.data?.message || '❌ Erreur inscription');
    }
  };

  if (chargement) {
    return (
      <div className="min-h-screen bg-[#080808] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-yellow-500/30 border-t-yellow-400 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080808] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(234,179,8,0.08)_0%,transparent_60%)]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm relative z-10"
      >
        {/* Logo */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-9 h-9 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-xl flex items-center justify-center">
              <Sparkles size={16} className="text-black" />
            </div>
            <span className="text-white font-bold text-lg">E-Wallet</span>
          </div>

          {boutique && (
            <div className="bg-white/[0.05] border border-white/[0.08] rounded-2xl p-4 mb-2">
              <p className="text-gray-400 text-xs mb-1">Vous êtes chez</p>
              <p className="text-white font-bold text-xl">{boutique.nom}</p>
              <p className="text-gray-500 text-sm">{boutique.secteur}</p>
            </div>
          )}
        </div>

        <AnimatePresence mode="wait">

          {/* ACCUEIL */}
          {etape === 'accueil' && (
            <motion.div
              key="accueil"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-[#0d0d0d] border border-white/[0.06] rounded-2xl p-6"
            >
              <h2 className="text-white font-bold text-xl mb-2 text-center">
                Programme de Fidélité
              </h2>
              <p className="text-gray-500 text-sm text-center mb-6">
                Gagnez des points à chaque achat !
              </p>

              <div className="space-y-3 mb-6">
                {[
                  { emoji: '🎯', text: 'QR Code personnel unique' },
                  { emoji: '⭐', text: '10 points par 1 000 FCFA dépensés' },
                  { emoji: '🎁', text: 'Promotions exclusives réservées' },
                  { emoji: '👑', text: 'Statuts Bronze, Silver, Gold, VIP' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 bg-white/[0.03] rounded-xl px-4 py-3">
                    <span className="text-xl">{item.emoji}</span>
                    <span className="text-gray-300 text-sm">{item.text}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-3">
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setEtape('inscription')}
                  className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-bold py-3.5 rounded-xl flex items-center justify-center gap-2"
                >
                  <span>Créer mon compte</span>
                  <ArrowRight size={16} />
                </motion.button>

                <button
                  onClick={() => setEtape('connexion')}
                  className="w-full bg-white/[0.05] border border-white/[0.08] text-gray-300 py-3.5 rounded-xl text-sm font-medium hover:bg-white/[0.08] transition-all"
                >
                  J'ai déjà un compte
                </button>
              </div>
            </motion.div>
          )}

          {/* CONNEXION */}
          {etape === 'connexion' && (
            <motion.div
              key="connexion"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-[#0d0d0d] border border-white/[0.06] rounded-2xl p-6"
            >
              <button
                onClick={() => setEtape('accueil')}
                className="text-gray-500 text-sm mb-4 flex items-center gap-1 hover:text-white transition-colors"
              >
                ← Retour
              </button>

              <h2 className="text-white font-bold text-xl mb-6">Connexion</h2>

              <form onSubmit={handleConnexion} className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white/[0.04] border border-white/[0.08] text-white rounded-xl px-4 py-3 mt-1 focus:outline-none focus:border-yellow-500/50 transition-all placeholder:text-gray-700 text-sm"
                    placeholder="votre@email.com"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Mot de passe</label>
                  <input
                    type="password"
                    value={motDePasse}
                    onChange={(e) => setMotDePasse(e.target.value)}
                    className="w-full bg-white/[0.04] border border-white/[0.08] text-white rounded-xl px-4 py-3 mt-1 focus:outline-none focus:border-yellow-500/50 transition-all placeholder:text-gray-700 text-sm"
                    placeholder="••••••••"
                    required
                  />
                </div>

                {erreur && (
                  <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-3 py-2 rounded-xl text-xs">
                    {erreur}
                  </div>
                )}

                <motion.button
                  type="submit"
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-bold py-3.5 rounded-xl"
                >
                  Se connecter
                </motion.button>
              </form>

              <p className="text-center text-gray-600 text-xs mt-4">
                Pas de compte ?{' '}
                <button onClick={() => setEtape('inscription')} className="text-yellow-400 font-medium">
                  S'inscrire
                </button>
              </p>
            </motion.div>
          )}

          {/* INSCRIPTION */}
          {etape === 'inscription' && (
            <motion.div
              key="inscription"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-[#0d0d0d] border border-white/[0.06] rounded-2xl p-6"
            >
              <button
                onClick={() => setEtape('accueil')}
                className="text-gray-500 text-sm mb-4 flex items-center gap-1 hover:text-white transition-colors"
              >
                ← Retour
              </button>

              <h2 className="text-white font-bold text-xl mb-2">Créer mon compte</h2>
              <p className="text-gray-500 text-xs mb-6">Inscription rapide — moins d'1 minute !</p>

              <form onSubmit={handleInscription} className="space-y-3">
                {[
                  { name: 'nom', label: 'Nom', placeholder: 'Diallo' },
                  { name: 'prenom', label: 'Prénom', placeholder: 'Fatoumata' },
                  { name: 'email', label: 'Email', placeholder: 'fatoumata@gmail.com', type: 'email' },
                  { name: 'telephone', label: 'Téléphone', placeholder: '771234567', type: 'tel' },
                  { name: 'mot_de_passe', label: 'Mot de passe', placeholder: '••••••••', type: 'password' },
                ].map((field) => (
                  <div key={field.name}>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {field.label}
                    </label>
                    <input
                      type={field.type || 'text'}
                      value={formData[field.name as keyof typeof formData]}
                      onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                      className="w-full bg-white/[0.04] border border-white/[0.08] text-white rounded-xl px-4 py-3 mt-1 focus:outline-none focus:border-yellow-500/50 transition-all placeholder:text-gray-700 text-sm"
                      placeholder={field.placeholder}
                      required
                    />
                  </div>
                ))}

                {erreur && (
                  <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-3 py-2 rounded-xl text-xs">
                    {erreur}
                  </div>
                )}

                <motion.button
                  type="submit"
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 mt-2"
                >
                  <span>Créer mon compte</span>
                  <ArrowRight size={16} />
                </motion.button>
              </form>
            </motion.div>
          )}

          {/* SUCCÈS */}
          {etape === 'succes' && client && (
            <motion.div
              key="succes"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-[#0d0d0d] border border-green-500/20 rounded-2xl p-6"
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-green-500/10 border border-green-500/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <CheckCircle size={32} className="text-green-400" />
                </div>
                <h2 className="text-white font-bold text-xl mb-1">
                  Bonjour {client.prenom} ! 👋
                </h2>
                <p className="text-gray-500 text-sm">
                  Montrez ce QR Code à l'agent
                </p>
              </div>

              {/* QR Code */}
              <div className="bg-white p-4 rounded-2xl flex justify-center mb-4">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${client.qr_code}`}
                  alt="QR Code"
                  width={180}
                  height={180}
                />
              </div>

              {/* Points */}
              <div className="bg-yellow-400/10 border border-yellow-400/20 rounded-xl p-4 text-center mb-4">
                <p className="text-gray-400 text-xs mb-1">Vos points fidélité</p>
                <p className="text-3xl font-bold text-yellow-400">{client.points_total}</p>
                <p className="text-gray-500 text-xs">points</p>
              </div>

              <div className="flex items-center gap-2 bg-white/[0.04] rounded-xl px-4 py-2 mb-4">
                <QrCode size={14} className="text-gray-600" />
                <span className="font-mono text-yellow-400 text-xs font-bold">{client.qr_code}</span>
              </div>

              <button
                onClick={() => router.push('/profil')}
                className="w-full border border-white/[0.08] text-gray-400 hover:text-white py-3 rounded-xl text-sm transition-all"
              >
                Voir mon profil complet →
              </button>
            </motion.div>
          )}

        </AnimatePresence>
      </motion.div>
    </div>
  );
}

export default function ScanPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#080808] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-yellow-500/30 border-t-yellow-400 rounded-full animate-spin" />
      </div>
    }>
      <ScanContent />
    </Suspense>
  );
}