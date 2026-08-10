const firebaseAdmin = require('firebase-admin');
const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getMessaging } = require('firebase-admin/messaging');
const path = require('path');

let isInitialized = false;

const initAdmin = () => {
  if (isInitialized || getApps().length > 0) {
    return true;
  }

  try {
    const serviceAccountPath = path.join(__dirname, 'fidelitewalletperso-789d16de0a70.json');
    const serviceAccount = require(serviceAccountPath);

    initializeApp({
      credential: cert(serviceAccount)
    });

    isInitialized = true;
    console.log('✅ Firebase Admin connecté avec succès !');
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
    console.log('⚠️ Aucun token valide après filtrage');
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