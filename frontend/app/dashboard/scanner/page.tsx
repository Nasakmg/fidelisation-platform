'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

export default function ScannerPage() {
  const { token } = useAuth();
  const router = useRouter();
  const [qrCode, setQrCode] = useState('');
  const [montant, setMontant] = useState('');
  const [typeAchat, setTypeAchat] = useState('');
  const [resultat, setResultat] = useState<any>(null);
  const [erreur, setErreur] = useState('');
  const [chargement, setChargement] = useState(false);

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    setChargement(true);
    setErreur('');
    setResultat(null);

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/transactions/scanner`,
        {
          qr_code: qrCode,
          montant: parseFloat(montant),
          type_achat: typeAchat
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setResultat(response.data);
      setQrCode('');
      setMontant('');
      setTypeAchat('');
    } catch (err: any) {
      setErreur(err.response?.data?.message || '❌ Erreur lors du scan');
    } finally {
      setChargement(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">

      {/* Navbar */}
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 w-10 h-10 rounded-xl flex items-center justify-center">
            <span className="text-white text-lg">🎯</span>
          </div>
          <h1 className="font-bold text-gray-800">Scanner QR Code</h1>
        </div>
        <button
          onClick={() => router.push('/dashboard')}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          ← Retour
        </button>
      </nav>

      <div className="max-w-lg mx-auto px-6 py-8">

        {/* Formulaire scan */}
        <div className="bg-white rounded-2xl shadow-sm p-8">
          <div className="text-center mb-8">
            <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">📱</span>
            </div>
            <h2 className="text-xl font-bold text-gray-800">Scanner un client</h2>
            <p className="text-gray-500 text-sm mt-1">
              Entrez le QR code du client et le montant de l'achat
            </p>
          </div>

          <form onSubmit={handleScan} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                QR Code client
              </label>
              <input
                type="text"
                value={qrCode}
                onChange={(e) => setQrCode(e.target.value.toUpperCase())}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                placeholder="USR-XXXXXXXXXX"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Montant (FCFA)
              </label>
              <input
                type="number"
                value={montant}
                onChange={(e) => setMontant(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="5000"
                min="0"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type d'achat
              </label>
              <select
                value={typeAchat}
                onChange={(e) => setTypeAchat(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Choisir le type</option>
                <option value="Vêtements">Vêtements</option>
                <option value="Alimentation">Alimentation</option>
                <option value="Électronique">Électronique</option>
                <option value="Beauté">Beauté</option>
                <option value="Pharmacie">Pharmacie</option>
                <option value="Autre">Autre</option>
              </select>
            </div>

            {erreur && (
              <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">
                {erreur}
              </div>
            )}

            <button
              type="submit"
              disabled={chargement}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition duration-200 disabled:opacity-50"
            >
              {chargement ? 'Traitement...' : '✅ Valider l\'achat'}
            </button>
          </form>
        </div>

        {/* Résultat */}
        {resultat && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-6 mt-6">
            <div className="text-center mb-4">
              <span className="text-5xl">🎉</span>
              <h3 className="text-xl font-bold text-green-800 mt-2">
                Points ajoutés !
              </h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center bg-white rounded-xl px-4 py-3">
                <span className="text-gray-600">Client</span>
                <span className="font-bold text-gray-800">
                  {resultat.client.nom} {resultat.client.prenom}
                </span>
              </div>
              <div className="flex justify-between items-center bg-white rounded-xl px-4 py-3">
                <span className="text-gray-600">Points gagnés</span>
                <span className="font-bold text-green-600">
                  +{resultat.points_gagnes} pts
                </span>
              </div>
              <div className="flex justify-between items-center bg-white rounded-xl px-4 py-3">
                <span className="text-gray-600">Total points</span>
                <span className="font-bold text-blue-600">
                  {resultat.nouveau_total} pts
                </span>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}