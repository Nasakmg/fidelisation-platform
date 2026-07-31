'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, ArrowRight, Sparkles, QrCode, CheckCircle, X, Zap } from 'lucide-react';
import { calculerPoints, getDevise } from '../../utils/devise';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function VendeurPage() {
  const [etape, setEtape] = useState<'login' | 'scanner'>('login');
  const [token, setToken] = useState('');
  const [entreprise, setEntreprise] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [erreurLogin, setErreurLogin] = useState('');
  const [chargementLogin, setChargementLogin] = useState(false);

  // Scanner states
  const [qrCode, setQrCode] = useState('');
  const [montant, setMontant] = useState('');
  const [typeAchat, setTypeAchat] = useState('');
  const [resultat, setResultat] = useState<any>(null);
  const [erreurScan, setErreurScan] = useState('');
  const [chargementScan, setChargementScan] = useState(false);
  const [showCamera, setShowCamera] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setChargementLogin(true);
    setErreurLogin('');
    try {
      const response = await axios.post(`${API_URL}/api/entreprises/connexion`, {
        email, mot_de_passe: motDePasse
      });
      setToken(response.data.token);
      setEntreprise(response.data.entreprise);
      setEtape('scanner');
    } catch (err: any) {
      setErreurLogin(err.response?.data?.message || '❌ Erreur connexion');
    } finally {
      setChargementLogin(false);
    }
  };

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    setChargementScan(true);
    setErreurScan('');
    setResultat(null);
    try {
      const response = await axios.post(
        `${API_URL}/api/transactions/scanner`,
        { qr_code: qrCode, montant: parseFloat(montant), type_achat: typeAchat },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setResultat(response.data);
      setQrCode('');
      setMontant('');
      setTypeAchat('');
    } catch (err: any) {
      setErreurScan(err.response?.data?.message || '❌ Erreur');
    } finally {
      setChargementScan(false);
    }
  };

  const startCamera = async () => {
    setShowCamera(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      setTimeout(() => {
        const video = document.getElementById('camera-video') as HTMLVideoElement;
        if (video) {
          video.srcObject = stream;
          video.play();
          scanQRFromVideo(video, stream);
        }
      }, 500);

    } catch (err) {
      console.error(err);
      setErreurScan('❌ Impossible d\'accéder à la caméra. Vérifiez les permissions.');
      setShowCamera(false);
    }
  };

  const scanQRFromVideo = (video: HTMLVideoElement, stream: MediaStream) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    let scanning = true;

    const scan = () => {
      if (!scanning) return;

      if (video.readyState === video.HAVE_ENOUGH_DATA && video.videoWidth > 0) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx?.drawImage(video, 0, 0);

        const imageData = ctx?.getImageData(0, 0, canvas.width, canvas.height);

        if (imageData) {
          // @ts-ignore
          import('jsqr').then(({ default: jsQR }) => {
            const code = jsQR(imageData.data, imageData.width, imageData.height, {
              inversionAttempts: 'dontInvert'
            });

            if (code) {
              scanning = false;
              const result = code.data.trim().toUpperCase();
              setQrCode(result);
              stream.getTracks().forEach(t => t.stop());
              setShowCamera(false);
              return;
            }
          });
        }
      }

      if (scanning) {
        requestAnimationFrame(scan);
      }
    };

    requestAnimationFrame(scan);
  };

  const stopCamera = () => {
    const video = document.getElementById('camera-video') as HTMLVideoElement;
    if (video?.srcObject) {
      (video.srcObject as MediaStream).getTracks().forEach(t => t.stop());
      video.srcObject = null;
    }
    setShowCamera(false);
  };

  const typesAchat = [
    { value: 'Vêtements', emoji: '👗' },
    { value: 'Alimentation', emoji: '🛒' },
    { value: 'Électronique', emoji: '📱' },
    { value: 'Beauté', emoji: '💄' },
    { value: 'Pharmacie', emoji: '💊' },
    { value: 'Autre', emoji: '📦' },
  ];

  // ============ PAGE LOGIN ============
  if (etape === 'login') {
    return (
      <div className="min-h-screen bg-[#080808] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(234,179,8,0.08)_0%,transparent_60%)]" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm relative z-10"
        >
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-xl flex items-center justify-center">
                <Sparkles size={18} className="text-black" />
              </div>
              <span className="text-white font-bold text-xl">E-Wallet</span>
            </div>
            <h1 className="text-2xl font-bold text-white mb-1">Espace Vendeur</h1>
            <p className="text-gray-500 text-sm">Connectez-vous pour scanner</p>
          </div>

          <div className="bg-[#0d0d0d] border border-white/[0.06] rounded-2xl p-6">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Email</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white/[0.04] border border-white/[0.08] text-white rounded-xl pl-10 pr-4 py-3.5 focus:outline-none focus:border-yellow-500/50 transition-all placeholder:text-gray-700 text-sm"
                    placeholder="contact@entreprise.com"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Mot de passe</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
                  <input
                    type="password"
                    value={motDePasse}
                    onChange={(e) => setMotDePasse(e.target.value)}
                    className="w-full bg-white/[0.04] border border-white/[0.08] text-white rounded-xl pl-10 pr-4 py-3.5 focus:outline-none focus:border-yellow-500/50 transition-all placeholder:text-gray-700 text-sm"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              {erreurLogin && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-3 py-2 rounded-xl text-xs">
                  {erreurLogin}
                </div>
              )}

              <motion.button
                type="submit"
                disabled={chargementLogin}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-bold py-4 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {chargementLogin ? (
                  <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Accéder au scanner</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </motion.button>
            </form>
          </div>
        </motion.div>
      </div>
    );
  }

  // ============ PAGE SCANNER ============
  return (
    <div className="min-h-screen bg-[#080808]">

      {/* Header */}
      <div className="bg-[#0d0d0d] border-b border-white/[0.06] px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center">
            <Sparkles size={14} className="text-black" />
          </div>
          <div>
            <p className="text-white font-semibold text-sm">{entreprise?.nom}</p>
            <p className="text-gray-600 text-xs">Mode vendeur</p>
          </div>
        </div>
        <button
          onClick={() => { setEtape('login'); setToken(''); }}
          className="text-gray-600 hover:text-red-400 text-xs transition-colors"
        >
          Déconnexion
        </button>
      </div>

      <div className="p-4 max-w-sm mx-auto">

        {/* Résultat succès */}
        <AnimatePresence>
          {resultat && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="bg-[#0d0d0d] border border-green-500/20 rounded-2xl p-6 mb-4"
            >
              <div className="text-center mb-4">
                <div className="w-14 h-14 bg-green-500/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <CheckCircle size={28} className="text-green-400" />
                </div>
                <h3 className="text-white font-bold text-lg">Transaction réussie !</h3>
              </div>
              <div className="space-y-2">
                {[
                  { label: 'Client', value: `${resultat.client.nom} ${resultat.client.prenom}` },
                  { label: 'Points gagnés', value: `+${resultat.points_gagnes} pts`, color: 'text-yellow-400' },
                  { label: 'Total points', value: `${resultat.nouveau_total} pts`, color: 'text-blue-400' },
                ].map((item, i) => (
                  <div key={i} className="flex justify-between items-center bg-white/[0.03] rounded-xl px-3 py-2.5">
                    <span className="text-gray-500 text-sm">{item.label}</span>
                    <span className={`font-bold text-sm ${item.color || 'text-white'}`}>{item.value}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setResultat(null)}
                className="w-full mt-4 border border-white/[0.08] text-gray-400 py-3 rounded-xl text-sm"
              >
                Nouveau scan
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Formulaire scan */}
        {!resultat && (
          <div className="bg-[#0d0d0d] border border-white/[0.06] rounded-2xl p-5">
            <h2 className="text-white font-bold text-lg mb-1">Scanner un client</h2>
            <p className="text-gray-600 text-xs mb-5">Scannez le QR code ou entrez-le manuellement</p>

            <form onSubmit={handleScan} className="space-y-4">

              {/* QR Code */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">QR Code client</label>
                <div className="relative">
                  <QrCode size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
                  <input
                    type="text"
                    value={qrCode}
                    onChange={(e) => setQrCode(e.target.value.toUpperCase())}
                    className="w-full bg-white/[0.04] border border-white/[0.08] text-white rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-yellow-500/50 transition-all placeholder:text-gray-700 font-mono text-sm"
                    placeholder="USR-XXXXXXXXXX"
                    required
                  />
                </div>

                {/* Bouton caméra */}
                <button
                  type="button"
                  onClick={startCamera}
                  className="w-full flex items-center justify-center gap-2 bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 py-3 rounded-xl text-sm font-medium transition-all hover:bg-yellow-400/20"
                >
                  <span>📷</span>
                  <span>Scanner avec la caméra</span>
                </button>
              </div>

              {/* Montant */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Montant ({entreprise?.symbole_devise || getDevise(entreprise?.pays || 'Sénégal').symbole})
                </label>
                <input
                  type="number"
                  value={montant}
                  onChange={(e) => setMontant(e.target.value)}
                  className="w-full bg-white/[0.04] border border-white/[0.08] text-white rounded-xl px-4 py-3 focus:outline-none focus:border-yellow-500/50 transition-all placeholder:text-gray-700 text-lg font-bold"
                  placeholder="0"
                  min="0"
                  required
                />
                {montant && (
                  <p className="text-yellow-400/70 text-xs flex items-center gap-1">
                    <Zap size={11} />
                    {calculerPoints(parseFloat(montant), entreprise?.pays || 'Sénégal')} points seront ajoutés
                  </p>
                )}
              </div>

              {/* Type achat */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Type d'achat</label>
                <div className="grid grid-cols-3 gap-2">
                  {typesAchat.map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setTypeAchat(type.value)}
                      className={`flex flex-col items-center gap-1 py-3 rounded-xl border transition-all text-xs ${typeAchat === type.value
                          ? 'bg-yellow-400/10 border-yellow-400/40 text-yellow-400'
                          : 'bg-white/[0.03] border-white/[0.06] text-gray-500'
                        }`}
                    >
                      <span className="text-lg">{type.emoji}</span>
                      <span>{type.value}</span>
                    </button>
                  ))}
                </div>
              </div>

              {erreurScan && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-3 py-2 rounded-xl text-xs">
                  {erreurScan}
                </div>
              )}

              <button
                type="submit"
                disabled={chargementScan || !typeAchat}
                className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-bold py-4 rounded-xl flex items-center justify-center gap-2 disabled:opacity-40 transition-all"
              >
                {chargementScan ? (
                  <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                ) : (
                  <>
                    <CheckCircle size={18} />
                    <span>Valider l'achat</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Camera Modal */}
      <AnimatePresence>
        {showCamera && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-50 flex flex-col"
          >
            <div className="flex items-center justify-between p-4 bg-black/50">
              <h3 className="text-white font-semibold">Scanner QR Code</h3>
              <button onClick={stopCamera} className="text-white">
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 relative">
              <video
                id="camera-video"
                className="w-full h-full object-cover"
                playsInline
                muted
              />

              {/* Overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative w-64 h-64">
                  <div className="absolute top-0 left-0 w-10 h-10 border-t-4 border-l-4 border-yellow-400 rounded-tl-lg" />
                  <div className="absolute top-0 right-0 w-10 h-10 border-t-4 border-r-4 border-yellow-400 rounded-tr-lg" />
                  <div className="absolute bottom-0 left-0 w-10 h-10 border-b-4 border-l-4 border-yellow-400 rounded-bl-lg" />
                  <div className="absolute bottom-0 right-0 w-10 h-10 border-b-4 border-r-4 border-yellow-400 rounded-br-lg" />
                  <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-yellow-400/60 animate-pulse" />
                </div>
              </div>

              <p className="absolute bottom-8 left-0 right-0 text-center text-white text-sm">
                Centrez le QR code dans le cadre
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}