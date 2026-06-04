'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Megaphone, Plus, Send,
  Trash2, Bell, MessageSquare, Mail,
  Clock, CheckCircle, X, Zap
} from 'lucide-react';

export default function CampagnesPage() {
  const { token } = useAuth();
  const router = useRouter();
  const [campagnes, setCampagnes] = useState<any[]>([]);
  const [chargement, setChargement] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [envoi, setEnvoi] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    titre: '', message: '', canal: 'push'
  });

  useEffect(() => {
    if (!token) { router.push('/'); return; }
    fetchCampagnes();
  }, [token]);

  const fetchCampagnes = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/campagnes`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCampagnes(response.data.campagnes);
    } catch (err) {
      console.error(err);
    } finally {
      setChargement(false);
    }
  };

  const handleCreer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/campagnes`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setFormData({ titre: '', message: '', canal: 'push' });
      setShowForm(false);
      fetchCampagnes();
    } catch (err) { console.error(err); }
  };

  const handleEnvoyer = async (id: number) => {
    setEnvoi(id);
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/campagnes/${id}/envoyer`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(response.data.message);
      fetchCampagnes();
    } catch (err: any) {
      alert(err.response?.data?.message || '❌ Erreur');
    } finally {
      setEnvoi(null);
    }
  };

  const handleSupprimer = async (id: number) => {
    if (!confirm('Supprimer cette campagne ?')) return;
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/api/campagnes/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchCampagnes();
    } catch (err) { console.error(err); }
  };

  const canaux = [
    { value: 'push', label: 'Push', icon: Bell, color: 'text-blue-400 bg-blue-400/10 border-blue-400/20' },
    { value: 'sms', label: 'SMS', icon: MessageSquare, color: 'text-green-400 bg-green-400/10 border-green-400/20' },
    { value: 'email', label: 'Email', icon: Mail, color: 'text-purple-400 bg-purple-400/10 border-purple-400/20' },
  ];

  const getCanalInfo = (canal: string) => canaux.find(c => c.value === canal) || canaux[0];

  return (
    <div className="min-h-screen bg-[#080808]">

      {/* Header */}
      <div className="border-b border-white/[0.06] px-8 py-5 flex items-center justify-between">
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
            <Megaphone size={18} className="text-yellow-400" />
            <h1 className="text-white font-semibold">Campagnes Marketing</h1>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-black font-semibold px-5 py-2.5 rounded-xl transition-all text-sm"
        >
          <Plus size={16} />
          Nouvelle campagne
        </motion.button>
      </div>

      <div className="px-8 py-8 max-w-4xl">

        {/* Modal création */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                className="bg-[#111] border border-white/[0.08] rounded-2xl p-8 w-full max-w-lg"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-white font-bold text-lg">Nouvelle campagne</h3>
                  <button
                    onClick={() => setShowForm(false)}
                    className="text-gray-600 hover:text-white transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={handleCreer} className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-400">Titre</label>
                    <input
                      type="text"
                      value={formData.titre}
                      onChange={(e) => setFormData({...formData, titre: e.target.value})}
                      className="w-full bg-white/[0.04] border border-white/[0.08] text-white rounded-xl px-4 py-3 focus:outline-none focus:border-yellow-500/50 transition-all placeholder:text-gray-700"
                      placeholder="Ex: Promotion Spéciale Ramadan"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-400">Canal d'envoi</label>
                    <div className="grid grid-cols-3 gap-2">
                      {canaux.map((c) => (
                        <button
                          key={c.value}
                          type="button"
                          onClick={() => setFormData({...formData, canal: c.value})}
                          className={`flex items-center justify-center gap-2 py-3 rounded-xl border transition-all text-sm font-medium ${
                            formData.canal === c.value ? c.color : 'bg-white/[0.03] border-white/[0.06] text-gray-600 hover:text-gray-300'
                          }`}
                        >
                          <c.icon size={15} />
                          {c.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-400">Message</label>
                    <textarea
                      value={formData.message}
                      onChange={(e) => setFormData({...formData, message: e.target.value})}
                      className="w-full bg-white/[0.04] border border-white/[0.08] text-white rounded-xl px-4 py-3 focus:outline-none focus:border-yellow-500/50 transition-all placeholder:text-gray-700 resize-none"
                      placeholder="🎉 Profitez de -20% sur tous nos articles ce weekend !"
                      rows={4}
                      required
                    />
                    <div className="flex justify-between">
                      <p className="text-gray-700 text-xs flex items-center gap-1">
                        <Zap size={11} />
                        Sera envoyé à tous vos clients
                      </p>
                      <p className="text-gray-700 text-xs">{formData.message.length}/160</p>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="flex-1 border border-white/[0.08] text-gray-400 hover:text-white py-3 rounded-xl text-sm transition-all"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-3 rounded-xl text-sm transition-all"
                    >
                      Créer la campagne
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Liste campagnes */}
        {chargement ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-2 border-yellow-500/30 border-t-yellow-400 rounded-full animate-spin" />
          </div>
        ) : campagnes.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="w-20 h-20 bg-white/[0.03] rounded-3xl flex items-center justify-center mx-auto mb-4">
              <Megaphone size={32} className="text-gray-700" />
            </div>
            <p className="text-gray-400 font-medium mb-2">Aucune campagne</p>
            <p className="text-gray-700 text-sm mb-6">Créez votre première campagne marketing</p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold px-6 py-3 rounded-xl text-sm transition-all"
            >
              Créer une campagne
            </button>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {campagnes.map((campagne: any, i: number) => {
              const canalInfo = getCanalInfo(campagne.canal);
              const CanalIcon = canalInfo.icon;
              return (
                <motion.div
                  key={campagne.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-[#0d0d0d] border border-white/[0.06] rounded-2xl p-6 hover:border-white/[0.10] transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center border ${canalInfo.color}`}>
                        <CanalIcon size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="text-white font-semibold">{campagne.titre}</h3>
                          <span className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border font-medium ${
                            campagne.statut === 'envoyée'
                              ? 'text-green-400 bg-green-400/10 border-green-400/20'
                              : 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20'
                          }`}>
                            {campagne.statut === 'envoyée' ? <CheckCircle size={11} /> : <Clock size={11} />}
                            {campagne.statut}
                          </span>
                        </div>
                        <p className="text-gray-500 text-sm mb-3 line-clamp-2">{campagne.message}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-700">
                          <span>Canal : {campagne.canal}</span>
                          <span>•</span>
                          <span>Créée le {new Date(campagne.created_at).toLocaleDateString('fr-FR')}</span>
                          {campagne.date_envoi && (
                            <>
                              <span>•</span>
                              <span>Envoyée le {new Date(campagne.date_envoi).toLocaleDateString('fr-FR')}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      {campagne.statut === 'brouillon' && (
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleEnvoyer(campagne.id)}
                          disabled={envoi === campagne.id}
                          className="flex items-center gap-2 bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 text-green-400 px-4 py-2 rounded-xl text-sm font-medium transition-all disabled:opacity-50"
                        >
                          {envoi === campagne.id ? (
                            <div className="w-4 h-4 border-2 border-green-400/30 border-t-green-400 rounded-full animate-spin" />
                          ) : (
                            <Send size={14} />
                          )}
                          {envoi === campagne.id ? 'Envoi...' : 'Envoyer'}
                        </motion.button>
                      )}
                      <button
                        onClick={() => handleSupprimer(campagne.id)}
                        className="w-9 h-9 bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 hover:border-red-500/20 text-red-500/50 hover:text-red-400 rounded-xl flex items-center justify-center transition-all"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}