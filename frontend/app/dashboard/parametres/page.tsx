'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { ArrowLeft, Image as ImageIcon, Save } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function ParametresPage() {
  const { token } = useAuth();
  const router = useRouter();
  const [iconUrl, setIconUrl] = useState('');
  const [chargement, setChargement] = useState(true);
  const [enregistrement, setEnregistrement] = useState(false);
  const [message, setMessage] = useState('');
  const [erreur, setErreur] = useState('');
  let previewUrl = '';
  try {
    const parsedUrl = new URL(iconUrl);
    if (parsedUrl.protocol === 'https:') previewUrl = iconUrl;
  } catch {}

  useEffect(() => {
    if (!token) {
      router.replace('/');
      return;
    }

    axios.get(`${API_URL}/api/entreprises/notification-icon`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(response => {
      setIconUrl(response.data.notification_icon || '');
    }).catch(error => {
      setErreur(error.response?.data?.message || 'Impossible de charger les paramètres.');
    }).finally(() => setChargement(false));
  }, [token, router]);

  const enregistrer = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setEnregistrement(true);
    setMessage('');
    setErreur('');

    try {
      const response = await axios.patch(
        `${API_URL}/api/entreprises/notification-icon`,
        { notification_icon: iconUrl },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIconUrl(response.data.notification_icon || '');
      setMessage(response.data.message);
    } catch {
      setErreur('Enregistrement impossible.');
    } finally {
      setEnregistrement(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#080808] text-white lg:pl-64">
      <header className="flex items-center gap-4 border-b border-white/[0.06] px-6 py-5 lg:px-8">
        <button
          type="button"
          onClick={() => router.push('/dashboard')}
          aria-label="Retour au tableau de bord"
          className="text-gray-500 transition-colors hover:text-white"
        >
          <ArrowLeft size={19} />
        </button>
        <h1 className="text-lg font-semibold">Paramètres boutique</h1>
      </header>

      <section className="max-w-3xl px-6 py-8 lg:px-8">
        <h2 className="mb-2 text-base font-semibold">Icône des notifications</h2>
        <p className="mb-6 text-sm text-gray-500">
          Choisissez l’image affichée avec les notifications push de votre boutique.
        </p>

        {chargement ? (
          <div className="h-32 animate-pulse rounded-lg bg-white/[0.04]" />
        ) : (
          <form onSubmit={enregistrer} className="space-y-5">
            <div className="flex items-center gap-4">
              <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-white/[0.04]">
                {previewUrl ? (
                  <Image src={previewUrl} alt="Aperçu de l’icône" width={64} height={64} unoptimized className="size-full object-cover" />
                ) : (
                  <ImageIcon size={24} className="text-gray-600" />
                )}
              </div>
              <label className="min-w-0 flex-1 space-y-2 text-sm text-gray-400">
                URL HTTPS de l’image
                <input
                  type="url"
                  value={iconUrl}
                  onChange={event => setIconUrl(event.target.value)}
                  maxLength={2048}
                  placeholder="https://exemple.com/icone.png"
                  className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm text-white outline-none transition-colors focus:border-yellow-400/50"
                />
              </label>
            </div>

            {message && <p role="status" className="text-sm text-green-400">{message}</p>}
            {erreur && <p role="alert" className="text-sm text-red-400">{erreur}</p>}

            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={enregistrement || chargement}
                className="inline-flex items-center gap-2 rounded-lg bg-yellow-400 px-4 py-2.5 text-sm font-semibold text-black transition-colors hover:bg-yellow-300 disabled:opacity-50"
              >
                <Save size={16} />
                {enregistrement ? 'Enregistrement…' : 'Enregistrer'}
              </button>
              <button
                type="button"
                disabled={enregistrement || !iconUrl}
                onClick={() => setIconUrl('')}
                className="rounded-lg border border-white/10 px-4 py-2.5 text-sm text-gray-400 transition-colors hover:text-white disabled:opacity-40"
              >
                Utiliser l’icône par défaut
              </button>
            </div>
          </form>
        )}
      </section>
    </main>
  );
}