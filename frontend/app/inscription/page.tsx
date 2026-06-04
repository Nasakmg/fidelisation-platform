'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { motion } from 'framer-motion';
import {
  Building2, Mail, Phone, Lock,
  MapPin, Briefcase, ArrowRight,
  Sparkles, CheckCircle
} from 'lucide-react';

export default function InscriptionPage() {
  const [formData, setFormData] = useState({
    nom: '', email: '', telephone: '',
    mot_de_passe: '', secteur: '', adresse: ''
  });
  const [erreur, setErreur] = useState('');
  const [succes, setSucces] = useState(false);
  const [chargement, setChargement] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setChargement(true);
    setErreur('');
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/entreprises/inscription`,
        formData
      );
      setSucces(true);
      setTimeout(() => router.push('/'), 2000);
    } catch (err: any) {
      setErreur(err.response?.data?.message || '❌ Erreur lors de l\'inscription');
    } finally {
      setChargement(false);
    }
  };

  const secteurs = [
    'Vêtements', 'Restauration', 'Épicerie',
    'Pharmacie', 'Électronique', 'Beauté & Cosmétiques',
    'Téléphonie', 'Librairie', 'Sport', 'Autre'
  ];

  const avantages = [
    'Carte de fidélité digitale',
    'QR Code unique par client',
    'Campagnes marketing ciblées',
    'Dashboard statistiques',
    'Intégration Google Wallet',
  ];

  if (succes) {
    return (
      <div className="min-h-screen bg-[#080808] flex items-center justify-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <div className="w-20 h-20 bg-green-500/10 border border-green-500/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} className="text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Compte créé !</h2>
          <p className="text-gray-500">Redirection vers la connexion...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080808] flex overflow-hidden">

      {/* Left Panel */}
      <motion.div
        initial={{ opacity: 0, x: -60 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
        className="hidden lg:flex flex-col justify-between w-5/12 p-16 relative"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#0f0f0f] via-[#111] to-[#0a0a0a]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(234,179,8,0.08)_0%,transparent_60%)]" />
        <div className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px),
                             linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }}
        />

        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-xl flex items-center justify-center">
              <Sparkles size={20} className="text-black" />
            </div>
            <span className="text-white font-bold text-xl">FidélisationPro</span>
          </div>
        </div>

        <div className="relative z-10">
          <h1 className="text-4xl font-bold text-white leading-tight mb-6">
            Rejoignez les
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">
              meilleures entreprises
            </span>
          </h1>
          <p className="text-gray-400 mb-10">
            Créez votre compte gratuitement et commencez à fidéliser vos clients dès aujourd'hui.
          </p>

          <div className="space-y-3">
            {avantages.map((avantage, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="flex items-center gap-3"
              >
                <div className="w-5 h-5 bg-yellow-400/10 border border-yellow-400/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircle size={12} className="text-yellow-400" />
                </div>
                <span className="text-gray-300 text-sm">{avantage}</span>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="relative z-10 border border-white/[0.06] rounded-2xl p-5 bg-white/[0.02]">
          <div className="flex items-center gap-2 mb-2">
            {[...Array(5)].map((_, i) => (
              <span key={i} className="text-yellow-400 text-sm">★</span>
            ))}
          </div>
          <p className="text-gray-300 text-sm mb-3">
            "En 2 mois, nous avons fidélisé plus de 500 clients grâce à FidélisationPro."
          </p>
          <p className="text-gray-600 text-xs">Moussa Sow — Restaurant Le Savoureux, Dakar</p>
        </div>
      </motion.div>

      {/* Right Panel — Form */}
      <motion.div
        initial={{ opacity: 0, x: 60 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
        className="flex-1 flex items-center justify-center p-8 bg-[#0d0d0d] relative overflow-y-auto"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(234,179,8,0.03)_0%,transparent_70%)]" />

        <div className="w-full max-w-md relative z-10 py-8">

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">Créer un compte</h2>
            <p className="text-gray-500">Espace Entreprise — Gratuit</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Nom */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nom de l'entreprise
              </label>
              <div className="relative">
                <Building2 size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" />
                <input
                  type="text"
                  name="nom"
                  value={formData.nom}
                  onChange={handleChange}
                  className="w-full bg-white/[0.04] border border-white/[0.08] text-white rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:border-yellow-500/50 transition-all placeholder:text-gray-700 text-sm"
                  placeholder="Boutique Prestige Dakar"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-white/[0.04] border border-white/[0.08] text-white rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:border-yellow-500/50 transition-all placeholder:text-gray-700 text-sm"
                  placeholder="contact@entreprise.com"
                  required
                />
              </div>
            </div>

            {/* Téléphone */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Téléphone</label>
              <div className="relative">
                <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" />
                <input
                  type="text"
                  name="telephone"
                  value={formData.telephone}
                  onChange={handleChange}
                  className="w-full bg-white/[0.04] border border-white/[0.08] text-white rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:border-yellow-500/50 transition-all placeholder:text-gray-700 text-sm"
                  placeholder="771234567"
                  required
                />
              </div>
            </div>

            {/* Secteur */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                Secteur d'activité
              </label>
              <div className="relative">
                <Briefcase size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" />
                <select
                  name="secteur"
                  value={formData.secteur}
                  onChange={handleChange}
                  className="w-full bg-white/[0.04] border border-white/[0.08] text-white rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:border-yellow-500/50 transition-all text-sm appearance-none"
                  required
                >
                  <option value="" className="bg-[#111]">Choisir un secteur</option>
                  {secteurs.map(s => (
                    <option key={s} value={s} className="bg-[#111]">{s}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Adresse */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Adresse</label>
              <div className="relative">
                <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" />
                <input
                  type="text"
                  name="adresse"
                  value={formData.adresse}
                  onChange={handleChange}
                  className="w-full bg-white/[0.04] border border-white/[0.08] text-white rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:border-yellow-500/50 transition-all placeholder:text-gray-700 text-sm"
                  placeholder="Plateau, Dakar"
                />
              </div>
            </div>

            {/* Mot de passe */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                Mot de passe
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" />
                <input
                  type="password"
                  name="mot_de_passe"
                  value={formData.mot_de_passe}
                  onChange={handleChange}
                  className="w-full bg-white/[0.04] border border-white/[0.08] text-white rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:border-yellow-500/50 transition-all placeholder:text-gray-700 text-sm"
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
                  <span>Créer mon compte gratuitement</span>
                  <ArrowRight size={18} />
                </>
              )}
            </motion.button>
          </form>

          <p className="text-center text-gray-600 text-sm mt-6">
            Déjà un compte ?{' '}
            <a href="/" className="text-yellow-400 hover:text-yellow-300 font-medium transition-colors">
              Se connecter
            </a>
          </p>
        </div>
      </motion.div>
    </div>
  );
}