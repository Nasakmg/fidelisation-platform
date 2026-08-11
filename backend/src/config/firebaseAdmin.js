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

const envoyerNotificationPush = async (tokens, titre, message) => {
  if (!tokens || !Array.isArray(tokens) || tokens.length === 0) {
    console.log('⚠️ Aucun token FCM fourni');
    return { successCount: 0, failureCount: 0 };
  }

  const tokensValides = tokens.filter(t => typeof t === 'string' && t.trim() !== '');
  if (tokensValides.length === 0) {
    return { successCount: 0, failureCount: 0 };
  }

  const isReady = initAdmin();
  if (!isReady) {
    console.error('❌ Firebase Admin non disponible');
    return { successCount: 0, failureCount: tokensValides.length };
  }

  try {
    const multicastMessage = {
      notification: {
        title: titre || 'Notification',
        body: message || ''
      },
      tokens: tokensValides
    };

    console.log(`🔔 Envoi Push FCM à ${tokensValides.length} appareil(s)...`);
    const response = await getMessaging().sendEachForMulticast(multicastMessage);
    console.log(`✅ ${response.successCount} push envoyé(s) avec succès !`);
    return response;
  } catch (err) {
    console.error('❌ Erreur lors de l\'envoi Push:', err.message);
    return { successCount: 0, failureCount: tokensValides.length };
  }
};

module.exports = { envoyerNotificationPush };