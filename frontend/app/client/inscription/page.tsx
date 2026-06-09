'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useClientAuth } from '../../context/ClientAuthContext';
import {
  User, Mail, Phone, Lock,
  ArrowRight, Sparkles, CheckCircle
} from 'lucide-react';

export default function ClientInscriptionPage() {
  const [formData, setFormData] = useState({
    nom: '', prenom: '', email: '',
    telephone: '', mot_de_passe: ''
  });
  const [erreur, setErreur] = useState('');
  const [succes, setSucces] = useState(false);
  const [chargement, setChargement] = useState(false);
  const { clientLogin } = useClientAuth();
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setChargement(true);
    setErreur('');
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/clients/inscription`,
        formData
      );
      clientLogin(response.data.token, response.data.client);
      setSucces(true);
      setTimeout(() => router.push('/profil'), 1500);
    } catch (err: any) {
      setErreur(err.response?.data?.message || '❌ Erreur inscription');
    } finally {
      setChargement(false);
    }
  };

  if (succes) {
    return (
      <div className="min-h-screen bg-[#080808] flex items-center justify-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center p-8"
        >
          <div className="w-20 h-20 bg-green-500/10 border border-green-500/20 rounded-3xl flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={40} className="text-green-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Compte créé !</h2>
          <p className="text-gray-500 text-sm">Redirection...</p>
        </motion.div>
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
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="w-9 h-9 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-xl flex items-center justify-center">
              <Sparkles size={16} className="text-black" />
            </div>
            <span className="text-white font-bold text-lg">FidélisationPro</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">Créer mon compte</h1>
          <p className="text-gray-500 text-sm">Accédez à votre carte de fidélité</p>
        </div>

        {/* Form */}
        <div className="bg-[#0d0d0d] border border-white/[0.06] rounded-2xl p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { name: 'nom', label: 'Nom', placeholder: 'Diallo', icon: User },
              { name: 'prenom', label: 'Prénom', placeholder: 'Amadou', icon: User },
              { name: 'email', label: 'Email', placeholder: 'amadou@gmail.com', icon: Mail, type: 'email' },
              { name: 'telephone', label: 'Téléphone', placeholder: '771234567', icon: Phone, type: 'tel' },
              { name: 'mot_de_passe', label: 'Mot de passe', placeholder: '••••••••', icon: Lock, type: 'password' },
            ].map((field) => (
              <div key={field.name} className="space-y-1">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {field.label}
                </label>
                <div className="relative">
                  <field.icon size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
                  <input
                    type={field.type || 'text'}
                    name={field.name}
                    value={formData[field.name as keyof typeof formData]}
                    onChange={handleChange}
                    className="w-full bg-white/[0.04] border border-white/[0.08] text-white rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-yellow-500/50 transition-all placeholder:text-gray-700 text-sm"
                    placeholder={field.placeholder}
                    required
                  />
                </div>
              </div>
            ))}

            {erreur && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-3 py-2 rounded-xl text-xs">
                {erreur}
              </div>
            )}

            <motion.button
              type="submit"
              disabled={chargement}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 mt-2"
            >
              {chargement ? (
                <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              ) : (
                <>
                  <span>Créer mon compte</span>
                  <ArrowRight size={16} />
                </>
              )}
            </motion.button>
          </form>

          <p className="text-center text-gray-600 text-xs mt-4">
            Déjà un compte ?{' '}
            <a href="/client" className="text-yellow-400 font-medium">Se connecter</a>
          </p>
        </div>
      </motion.div>
    </div>
  );
}