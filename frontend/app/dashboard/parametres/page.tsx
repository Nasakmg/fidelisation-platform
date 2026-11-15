'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { ArrowLeft, Image as ImageIcon, Save } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const compresserIcone = async (fichier: File): Promise<File> => {
  const formatsImage = ['image/png', 'image/jpeg', 'image/webp', 'image/heic', 'image/heif', 'image/avif'];
  if (!formatsImage.includes(fichier.type)) {
    throw new Error('Choisissez une image PNG, JPEG, WebP ou HEIC.');
  }
  if (fichier.size > 15 * 1024 * 1024) {
    throw new Error('La photo ne doit pas dépasser 15 Mo.');
  }

  const image = await createImageBitmap(fichier);
  try {
    const tailleMax = 512;
    const facteur = Math.min(1, tailleMax / Math.max(image.width, image.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(image.width * facteur));
    canvas.height = Math.max(1, Math.round(image.height * facteur));
    const contexte = canvas.getContext('2d');
    if (!contexte) throw new Error('Impossible de traiter cette image.');
    contexte.drawImage(image, 0, 0, canvas.width, canvas.height);

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        resultat => resultat ? resolve(resultat) : reject(new Error('Compression de l’image impossible.')),
        'image/jpeg',
        0.85
      );
    });
    const nom = fichier.name.replace(/\.[^.]+$/, '') || 'icone';
    return new File([blob], `${nom}.jpg`, { type: 'image/jpeg' });
  } finally {
    image.close();
  }
};

export default function ParametresPage() {
  const { token } = useAuth();
  const router = useRouter();
  const [iconUrl, setIconUrl] = useState('');
  const [fichierIcone, setFichierIcone] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [chargement, setChargement] = useState(true);
  const [enregistrement, setEnregistrement] = useState(false);
  const [message, setMessage] = useState('');
  const [erreur, setErreur] = useState('');
  useEffect(() => {
    if (!previewUrl.startsWith('blob:')) return;
    return () => URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  useEffect(() => {
    if (!token) {
      router.replace('/connexion');
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
      const response = fichierIcone
        ? await axios.post(
          `${API_URL}/api/entreprises/notification-icon`,
          fichierIcone,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': fichierIcone.type
            }
          }
        )
        : await axios.patch(
          `${API_URL}/api/entreprises/notification-icon`,
          { notification_icon: iconUrl },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      setIconUrl(response.data.notification_icon || '');
      setFichierIcone(null);
      setPreviewUrl('');
      setMessage(response.data.message);
    } catch (error: unknown) {
      const messageErreur = axios.isAxiosError<{ message?: string }>(error)
        ? error.response?.data?.message
        : error instanceof Error ? error.message : undefined;
      setErreur(messageErreur || 'Enregistrement impossible.');
    } finally {
      setEnregistrement(false);
    }
  };

  const utiliserIconeParDefaut = async () => {
    setEnregistrement(true);
    setMessage('');
    setErreur('');
    try {
      const response = await axios.patch(
        `${API_URL}/api/entreprises/notification-icon`,
        { notification_icon: '' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIconUrl('');
      setFichierIcone(null);
      setPreviewUrl('');
      setMessage(response.data.message);
    } catch (error: unknown) {
      const messageErreur = axios.isAxiosError<{ message?: string }>(error)
        ? error.response?.data?.message
        : error instanceof Error ? error.message : undefined;
      setErreur(messageErreur || 'Suppression impossible.');
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
                {previewUrl || iconUrl ? (
                  <Image src={previewUrl || iconUrl} alt="Aperçu de l’icône" width={64} height={64} unoptimized className="size-full object-cover" />
                ) : (
                  <ImageIcon size={24} className="text-gray-600" />
                )}
              </div>
              <label className="min-w-0 flex-1 space-y-2 text-sm text-gray-400">
                Choisir une photo depuis votre appareil (compression automatique, 15 Mo maximum)
                <input
                  type="file"
                  accept="image/*"
                  onChange={async event => {
                    setMessage('');
                    setErreur('');
                    const input = event.currentTarget;
                    const fichier = input.files?.[0];
                    if (!fichier) {
                      setFichierIcone(null);
                      setPreviewUrl('');
                      return;
                    }
                    input.value = '';
                    try {
                      const iconeCompressee = await compresserIcone(fichier);
                      setFichierIcone(iconeCompressee);
                      setPreviewUrl(URL.createObjectURL(iconeCompressee));
                    } catch (error) {
                      input.value = '';
                      setFichierIcone(null);
                      setPreviewUrl('');
                      setErreur(error instanceof Error ? error.message : 'Traitement de l’image impossible.');
                    }
                  }}
                  className="block w-full text-sm text-gray-400 file:mr-3 file:rounded-lg file:border-0 file:bg-white/10 file:px-3 file:py-2 file:text-sm file:text-white"
                />
                {fichierIcone && <span className="block text-xs text-gray-500">{fichierIcone.name}</span>}
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
                disabled={enregistrement || (!iconUrl && !fichierIcone)}
                onClick={utiliserIconeParDefaut}
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