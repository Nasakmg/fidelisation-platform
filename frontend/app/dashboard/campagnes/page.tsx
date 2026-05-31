'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

export default function CampagnesPage() {
  const { token } = useAuth();
  const router = useRouter();
  const [campagnes, setCampagnes] = useState<any[]>([]);
  const [chargement, setChargement] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [envoi, setEnvoi] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    titre: '',
    message: '',
    canal: 'push'
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
    } catch (err) {
      console.error(err);
    }
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
    } catch (err) {
      console.error(err);
    }
  };

  const getCanalIcon = (canal: string) => {
    if (canal === 'push') return '🔔';
    if (canal === 'sms') return '📱';
    if (canal === 'email') return '📧';
    return '📢';
  };

  const getStatutColor = (statut: string) => {
    if (statut === 'envoyée') return 'bg-green-100 text-green-700';
    return 'bg-yellow-100 text-yellow-700';
  };

  return (
    <div className="min-h-screen bg-gray-100">

      {/* Navbar */}
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 w-10 h-10 rounded-xl flex items-center justify-center">
            <span className="text-white text-lg">🎯</span>
          </div>
          <h1 className="font-bold text-gray-800">Campagnes Marketing</h1>
        </div>
        <button
          onClick={() => router.push('/dashboard')}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          ← Retour
        </button>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-8">

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Mes Campagnes</h2>
            <p className="text-gray-500 text-sm mt-1">{campagnes.length} campagne(s)</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2 transition"
          >
            <span>➕</span> Nouvelle campagne
          </button>
        </div>

        {/* Formulaire création */}
        {showForm && (
          <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              📢 Créer une campagne
            </h3>
            <form onSubmit={handleCreer} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Titre de la campagne
                </label>
                <input
                  type="text"
                  value={formData.titre}
                  onChange={(e) => setFormData({...formData, titre: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: Promotion Spéciale Ramadan"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Canal d'envoi
                </label>
                <select
                  value={formData.canal}
                  onChange={(e) => setFormData({...formData, canal: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="push">🔔 Notification Push</option>
                  <option value="sms">📱 SMS</option>
                  <option value="email">📧 Email</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: 🎉 Profitez de -20% sur tous nos articles ce weekend !"
                  rows={4}
                  required
                />
                <p className="text-xs text-gray-400 mt-1">
                  {formData.message.length}/160 caractères
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition"
                >
                  ✅ Créer
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium transition"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Liste campagnes */}
        {chargement ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : campagnes.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center">
            <span className="text-5xl">📢</span>
            <p className="text-gray-500 mt-4 text-lg font-medium">Aucune campagne</p>
            <p className="text-gray-400 text-sm mt-1">
              Créez votre première campagne marketing
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {campagnes.map((campagne: any) => (
              <div key={campagne.id} className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">{getCanalIcon(campagne.canal)}</span>
                      <h3 className="font-bold text-gray-800 text-lg">{campagne.titre}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatutColor(campagne.statut)}`}>
                        {campagne.statut}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-3">{campagne.message}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      <span>Canal : {campagne.canal}</span>
                      <span>Créée le : {new Date(campagne.created_at).toLocaleDateString('fr-FR')}</span>
                      {campagne.date_envoi && (
                        <span>Envoyée le : {new Date(campagne.date_envoi).toLocaleDateString('fr-FR')}</span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 ml-4">
                    {campagne.statut === 'brouillon' && (
                      <button
                        onClick={() => handleEnvoyer(campagne.id)}
                        disabled={envoi === campagne.id}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition disabled:opacity-50"
                      >
                        {envoi === campagne.id ? 'Envoi...' : '🚀 Envoyer'}
                      </button>
                    )}
                    <button
                      onClick={() => handleSupprimer(campagne.id)}
                      className="bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-lg text-sm font-medium transition"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}