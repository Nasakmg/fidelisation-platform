'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useAuth } from './context/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [erreur, setErreur] = useState('');
  const [chargement, setChargement] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setChargement(true);
    setErreur('');

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/entreprises/connexion`,
        { email, mot_de_passe: motDePasse }
      );
      login(response.data.token, response.data.entreprise);
      router.push('/dashboard');
    } catch (err: any) {
      setErreur(err.response?.data?.message || '❌ Erreur de connexion');
    } finally {
      setChargement(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="bg-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl">🎯</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">FidélisationPro</h1>
          <p className="text-gray-500 mt-1">Espace Entreprise</p>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="contact@entreprise.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mot de passe
            </label>
            <input
              type="password"
              value={motDePasse}
              onChange={(e) => setMotDePasse(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
              required
            />
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
            {chargement ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Pas encore de compte ?{' '}
          <a href="/inscription" className="text-blue-600 hover:underline font-medium">
            Créer un compte
          </a>
        </p>
      </div>
    </div>
  );
}