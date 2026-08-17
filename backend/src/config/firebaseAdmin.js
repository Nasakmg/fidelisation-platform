const firebaseAdmin = require('firebase-admin');
const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getMessaging } = require('firebase-admin/messaging');
const path = require('path');
const fs = require('fs');

let isInitialized = false;

const initAdmin = () => {
  if (isInitialized || getApps().length > 0) {
    return true;
  }

  try {
    const serviceAccountPath = path.join(__dirname, 'fidelitewalletperso-789d16de0a70.json');

    // 1. Cas Local : Fichier JSON présent
    if (fs.existsSync(serviceAccountPath)) {
      const serviceAccount = require(serviceAccountPath);
      initializeApp({ credential: cert(serviceAccount) });
      isInitialized = true;
      console.log('✅ Firebase Admin connecté via fichier JSON !');
      return true;
    }

    // 2. Cas Render / Production : Variables .env
    const privateKey = (process.env.FIREBASE_PRIVATE_KEY || '')
      .replace(/\\n/g, '\n')
      .replace(/^"|"$/g, '');

    if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !privateKey) {
      throw new Error('Variables d\'environnement Firebase manquantes dans Render.');
    }

    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: privateKey
      })
    });

    isInitialized = true;
    console.log('✅ Firebase Admin connecté via variables Render !');
    return true;
  } catch (err) {
    console.error('❌ Erreur initialisation Firebase Admin:', err.message);
    return false;
  }
};

const envoyerNotificationPush = async (tokens, titre, message, nomEntreprise = 'Plateforme de fidélisation') => {
  if (!tokens || tokens.length === 0) return;

  const ok = initAdmin();
  if (!ok) return;

  // On combine le titre de la campagne et le contenu du message
  const contenuNotification = titre ? `${titre}\n${message}` : message;

  try {
    const multicastMessage = {
      notification: {
        title: nomEntreprise, // Nom de l'entreprise comme titre principal
        body: contenuNotification, // Titre de la campagne + message
      },
      webpush: {
        notification: {
          title: nomEntreprise,
          body: contenuNotification,
          icon: 'https://fidelisation-platform.vercel.app/icon-192.png',
          requireInteraction: true,
          vibrate: [200, 100, 200],
          badge: 'https://fidelisation-platform.vercel.app/icon-192.png',
        },
        fcmOptions: {
          link: 'https://fidelisation-platform.vercel.app/profil',
        },
      },
      tokens,
    };

    const response = await getMessaging().sendEachForMulticast(multicastMessage);
    console.log(`✅ ${response.successCount} push envoyé(s) pour l'entreprise : ${nomEntreprise}`);
    return response;
  } catch (err) {
    console.error('❌ Erreur Push:', err.message);
  }
};

module.exports = { envoyerNotificationPush };