'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from './context/AuthContext';
import {
  ArrowDown, ArrowRight, BellRing, ChartNoAxesCombined, Check,
  Gift, Menu, QrCode, Smartphone, Sparkles, Users, X
} from 'lucide-react';

const avantages = [
  {
    icon: QrCode,
    title: 'Une carte, un QR code',
    description: 'Vos clients présentent leur code personnel pour cumuler leurs points en quelques secondes.'
  },
  {
    icon: BellRing,
    title: 'Des campagnes qui touchent',
    description: 'Envoyez vos offres par email, notification push ou laissez vos clients choisir leur canal.'
  },
  {
    icon: ChartNoAxesCombined,
    title: 'Votre activité en un coup d’œil',
    description: 'Suivez les visites, les achats et la fidélité de vos clients depuis un tableau de bord simple.'
  },
  {
    icon: Smartphone,
    title: 'Dans leur portefeuille',
    description: 'Vos clients retrouvent leurs cartes de fidélité dans Google Wallet ou Apple Wallet.'
  }
];

const etapes = [
  ['01', 'Créez votre espace', 'Inscrivez votre entreprise et configurez votre boutique.'],
  ['02', 'Invitez vos clients', 'Partagez votre QR code : l’inscription client est rapide et gratuite.'],
  ['03', 'Fidélisez durablement', 'Récompensez les achats et faites revenir vos clients avec vos campagnes.']
];

interface DemandeInscription {
  nom: string;
  email: string;
  telephone: string;
}

export default function VitrinePage() {
  const router = useRouter();
  const { setInscriptionBrouillon } = useAuth();
  const [menuOuvert, setMenuOuvert] = useState(false);
  const [demande, setDemande] = useState<DemandeInscription>({
    nom: '',
    email: '',
    telephone: ''
  });
  const [erreur, setErreur] = useState('');

  const continuerInscription = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErreur('');
    setInscriptionBrouillon(demande);
    router.push('/inscription');
  };

  return (
    <main className="min-h-screen overflow-hidden bg-[#080808] text-white">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/[0.06] bg-[#080808]/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
          <Link href="/" className="flex items-center gap-2.5" aria-label="E-Wallet, accueil">
            <span className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-300 to-yellow-600">
              <Sparkles size={17} className="text-black" />
            </span>
            <span className="text-lg font-bold tracking-tight">E-Wallet</span>
          </Link>

          <nav className="hidden items-center gap-8 text-sm text-gray-400 md:flex" aria-label="Navigation principale">
            <a href="#fonctionnalites" className="transition-colors hover:text-white">Fonctionnalités</a>
            <a href="#comment-ca-marche" className="transition-colors hover:text-white">Comment ça marche</a>
            <a href="#inscription" className="transition-colors hover:text-white">Pour les entreprises</a>
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <Link href="/connexion" className="rounded-xl px-4 py-2.5 text-sm font-medium text-gray-300 transition-colors hover:text-white">
              Connexion
            </Link>
            <Link href="/inscription" className="rounded-xl bg-yellow-400 px-4 py-2.5 text-sm font-bold text-black transition-colors hover:bg-yellow-300">
              Créer mon espace
            </Link>
          </div>

          <button
            type="button"
            className="flex size-10 items-center justify-center rounded-lg border border-white/10 md:hidden"
            aria-label={menuOuvert ? 'Fermer le menu' : 'Ouvrir le menu'}
            aria-expanded={menuOuvert}
            onClick={() => setMenuOuvert(!menuOuvert)}
          >
            {menuOuvert ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
        {menuOuvert && (
          <nav className="space-y-1 border-t border-white/[0.06] bg-[#0d0d0d] p-4 md:hidden" aria-label="Navigation mobile">
            <a href="#fonctionnalites" onClick={() => setMenuOuvert(false)} className="block rounded-lg px-3 py-3 text-sm text-gray-300">Fonctionnalités</a>
            <a href="#comment-ca-marche" onClick={() => setMenuOuvert(false)} className="block rounded-lg px-3 py-3 text-sm text-gray-300">Comment ça marche</a>
            <a href="#inscription" onClick={() => setMenuOuvert(false)} className="block rounded-lg px-3 py-3 text-sm text-gray-300">Pour les entreprises</a>
            <Link href="/connexion" className="block rounded-lg px-3 py-3 text-sm text-yellow-300">Connexion entreprise</Link>
          </nav>
        )}
      </header>

      <section className="relative flex min-h-[760px] items-center px-5 pb-24 pt-32 sm:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_55%_20%,rgba(234,179,8,0.12)_0%,transparent_52%)]" />
        <div className="absolute right-[-12rem] top-40 size-[30rem] rounded-full border border-yellow-400/[0.07] sm:right-[-5rem]" />
        <div className="absolute right-[-8rem] top-56 size-[22rem] rounded-full border border-yellow-400/[0.08]" />

        <div className="relative mx-auto grid w-full max-w-7xl items-center gap-16 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-yellow-400/20 bg-yellow-400/[0.06] px-4 py-2 text-xs font-medium text-yellow-200">
              <Sparkles size={14} />
              La fidélité de vos clients, simplement
            </div>
            <h1 className="max-w-3xl text-5xl font-bold leading-[1.08] tracking-tight sm:text-6xl lg:text-7xl">
              Faites de chaque visite une
              <span className="mt-2 block bg-gradient-to-r from-yellow-300 to-yellow-600 bg-clip-text text-transparent">
                bonne raison de revenir.
              </span>
            </h1>
            <p className="mt-7 max-w-xl text-base leading-7 text-gray-400 sm:text-lg">
              E-Wallet aide votre entreprise à récompenser ses clients, suivre son activité et partager ses offres, sans carte papier.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link href="#inscription" className="inline-flex items-center justify-center gap-2 rounded-xl bg-yellow-400 px-6 py-3.5 font-bold text-black transition-colors hover:bg-yellow-300">
                Inscrire mon entreprise
                <ArrowRight size={17} />
              </Link>
              <Link href="/connexion" className="inline-flex items-center justify-center rounded-xl border border-white/10 px-6 py-3.5 font-semibold text-white transition-colors hover:bg-white/[0.05]">
                J’ai déjà un compte
              </Link>
            </div>
            <p className="mt-5 text-xs text-gray-600">Inscription en ligne · Accès immédiat à votre espace entreprise</p>
          </div>

          <div className="relative mx-auto w-full max-w-lg">
            <div className="absolute inset-8 rounded-full bg-yellow-400/10 blur-3xl" />
            <div className="relative rounded-[2rem] border border-white/10 bg-[#101010] p-5 shadow-2xl shadow-black/50 sm:p-7">
              <div className="flex items-center justify-between border-b border-white/[0.07] pb-5">
                <div>
                  <p className="text-xs text-gray-500">Espace entreprise</p>
                  <p className="mt-1 text-lg font-semibold">Votre boutique, en un regard</p>
                </div>
                <span className="flex size-10 items-center justify-center rounded-xl bg-yellow-400/10 text-yellow-300">
                  <ChartNoAxesCombined size={20} />
                </span>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-white/[0.06] bg-white/[0.025] p-4">
                  <Users size={17} className="text-yellow-300" />
                  <p className="mt-5 text-2xl font-bold">Clients</p>
                  <p className="mt-1 text-xs text-gray-500">Une communauté fidèle</p>
                </div>
                <div className="rounded-2xl border border-white/[0.06] bg-white/[0.025] p-4">
                  <QrCode size={17} className="text-yellow-300" />
                  <p className="mt-5 text-2xl font-bold">QR code</p>
                  <p className="mt-1 text-xs text-gray-500">Un passage, des points</p>
                </div>
              </div>
              <div className="mt-3 rounded-2xl border border-yellow-400/15 bg-gradient-to-r from-yellow-400/[0.08] to-transparent p-5">
                <div className="flex items-center gap-3">
                  <span className="flex size-10 items-center justify-center rounded-xl bg-yellow-400 text-black"><Gift size={19} /></span>
                  <div>
                    <p className="text-sm font-semibold">Une offre, au bon moment</p>
                    <p className="mt-1 text-xs text-gray-500">Email ou notification push</p>
                  </div>
                  <Check size={17} className="ml-auto text-green-400" />
                </div>
              </div>
            </div>
          </div>
        </div>
        <a href="#fonctionnalites" aria-label="Découvrir les fonctionnalités" className="absolute bottom-8 left-1/2 flex -translate-x-1/2 items-center gap-2 text-xs text-gray-600 transition-colors hover:text-gray-300">
          Découvrir E-Wallet
          <ArrowDown size={14} />
        </a>
      </section>

      <section id="fonctionnalites" className="scroll-mt-24 border-t border-white/[0.05] px-5 py-24 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-yellow-400">Tout ce qu’il faut</p>
            <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">Une expérience fidélité pensée pour votre quotidien.</h2>
            <p className="mt-4 leading-7 text-gray-500">Moins de gestion manuelle, plus de liens durables avec les personnes qui font vivre votre entreprise.</p>
          </div>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {avantages.map(({ icon: Icon, title, description }) => (
              <article key={title} className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6 transition-colors hover:border-yellow-400/20">
                <span className="flex size-11 items-center justify-center rounded-xl border border-yellow-400/15 bg-yellow-400/[0.07] text-yellow-300">
                  <Icon size={20} />
                </span>
                <h3 className="mt-6 font-semibold">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-gray-500">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="comment-ca-marche" className="scroll-mt-24 border-y border-white/[0.05] bg-[#0b0b0b] px-5 py-24 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-yellow-400">Simple à démarrer</p>
            <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">En trois étapes, votre programme est lancé.</h2>
          </div>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {etapes.map(([numero, titre, description]) => (
              <article key={numero} className="border-t border-yellow-400/25 pt-5">
                <span className="font-mono text-sm text-yellow-400">{numero}</span>
                <h3 className="mt-5 text-xl font-semibold">{titre}</h3>
                <p className="mt-3 max-w-sm text-sm leading-6 text-gray-500">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="inscription" className="scroll-mt-24 px-5 py-24 sm:px-8">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div className="pt-3">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-yellow-400">Rejoignez E-Wallet</p>
            <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">Prêt à faire revenir vos clients ?</h2>
            <p className="mt-5 max-w-lg leading-7 text-gray-400">
              Laissez vos coordonnées pour démarrer. Vous serez redirigé vers le formulaire sécurisé de création de compte, puis directement vers votre espace entreprise.
            </p>
            <ul className="mt-8 space-y-3 text-sm text-gray-400">
              <li className="flex items-center gap-3"><Check size={16} className="text-yellow-400" /> Créez votre compte en ligne</li>
              <li className="flex items-center gap-3"><Check size={16} className="text-yellow-400" /> Retrouvez vos informations déjà renseignées</li>
              <li className="flex items-center gap-3"><Check size={16} className="text-yellow-400" /> Accédez à votre tableau de bord après inscription</li>
            </ul>
          </div>

          <form onSubmit={continuerInscription} className="rounded-3xl border border-white/[0.08] bg-[#0e0e0e] p-6 sm:p-8">
            <h3 className="text-xl font-semibold">Commencer mon inscription</h3>
            <p className="mt-2 text-sm text-gray-500">Ces informations seront reprises dans le formulaire de création de compte.</p>
            <div className="mt-7 space-y-5">
              <div>
                <label htmlFor="lead-nom" className="mb-2 block text-sm font-medium text-gray-300">Nom de l’entreprise</label>
                <input
                  id="lead-nom"
                  name="nom"
                  type="text"
                  autoComplete="organization"
                  required
                  value={demande.nom}
                  onChange={event => setDemande({ ...demande, nom: event.target.value })}
                  placeholder="Ex. Boutique Awa"
                  className="w-full rounded-xl border border-white/10 bg-white/[0.035] px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-gray-700 focus:border-yellow-400/50"
                />
              </div>
              <div>
                <label htmlFor="lead-email" className="mb-2 block text-sm font-medium text-gray-300">Email professionnel</label>
                <input
                  id="lead-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={demande.email}
                  onChange={event => setDemande({ ...demande, email: event.target.value })}
                  placeholder="vous@entreprise.com"
                  className="w-full rounded-xl border border-white/10 bg-white/[0.035] px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-gray-700 focus:border-yellow-400/50"
                />
              </div>
              <div>
                <label htmlFor="lead-telephone" className="mb-2 block text-sm font-medium text-gray-300">Téléphone</label>
                <input
                  id="lead-telephone"
                  name="telephone"
                  type="tel"
                  autoComplete="tel"
                  required
                  value={demande.telephone}
                  onChange={event => setDemande({ ...demande, telephone: event.target.value })}
                  placeholder="+221 77 000 00 00"
                  className="w-full rounded-xl border border-white/10 bg-white/[0.035] px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-gray-700 focus:border-yellow-400/50"
                />
              </div>
              {erreur && <p role="alert" className="text-sm text-red-400">{erreur}</p>}
              <button type="submit" className="flex w-full items-center justify-center gap-2 rounded-xl bg-yellow-400 px-5 py-3.5 font-bold text-black transition-colors hover:bg-yellow-300">
                Continuer vers la création de compte
                <ArrowRight size={17} />
              </button>
              <p className="text-center text-xs leading-5 text-gray-600">
                Vos coordonnées seront reprises dans le formulaire d’inscription. Elles ne sont pas ajoutées à l’adresse web.
              </p>
            </div>
          </form>
        </div>
      </section>

      <footer className="border-t border-white/[0.06] px-5 py-8 sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 text-xs text-gray-600 sm:flex-row">
          <Link href="/" className="flex items-center gap-2 font-semibold text-gray-300">
            <Sparkles size={15} className="text-yellow-400" />
            E-Wallet
          </Link>
          <p>La fidélité client, simplement.</p>
          <div className="flex gap-5">
            <Link href="/connexion" className="transition-colors hover:text-white">Connexion entreprise</Link>
            <Link href="/client" className="transition-colors hover:text-white">Espace client</Link>
            <Link href="/admin" className="transition-colors hover:text-white">Administration</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
