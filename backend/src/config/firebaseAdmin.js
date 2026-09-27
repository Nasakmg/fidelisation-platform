const firebaseAdmin = require('firebase-admin');
const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getMessaging } = require('firebase-admin/messaging');
const path = require('path');
const fs = require('fs');
const pool = require('./db');

let isInitialized = false;

const initAdmin = () => {
  if (isInitialized || getApps().length > 0) {
    return true;
  }

  try {
    // Priorité aux credentials configurés dans l'environnement (local ou Render).
    const privateKey = (process.env.FIREBASE_PRIVATE_KEY || '')
      .replace(/\\n/g, '\n')
      .replace(/^"|"$/g, '');

    if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && privateKey) {
      initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey
        })
      });
      isInitialized = true;
      console.log('✅ Firebase Admin connecté via variables d\'environnement !');
      return true;
    }

    const serviceAccountPath = path.join(__dirname, 'fidelitewalletperso-789d16de0a70.json');

    // Secours local : fichier JSON présent
    if (fs.existsSync(serviceAccountPath)) {
      const serviceAccount = require(serviceAccountPath);
      initializeApp({ credential: cert(serviceAccount) });
      isInitialized = true;
      console.log('✅ Firebase Admin connecté via fichier JSON !');
      return true;
    }

    throw new Error('Credentials Firebase manquants. Configurez FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL et FIREBASE_PRIVATE_KEY.');
  } catch (err) {
    console.error('❌ Erreur initialisation Firebase Admin:', err.message);
    return false;
  }
};

const envoyerNotificationPush = async (tokens, titre, message, nomEntreprise = 'Plateforme de fidélisation') => {
  if (!tokens || tokens.length === 0) return;

  const ok = initAdmin();
  if (!ok) {
    throw new Error('Firebase Admin n\'est pas initialisé. Vérifiez les credentials Firebase.');
  }

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
    if (response.failureCount > 0) {
      const invalidTokens = [];
      response.responses.forEach((result, index) => {
        if (!result.success) {
          console.error(`❌ Token FCM rejeté (${index}):`, result.error?.code, result.error?.message);
          if (
            result.error?.code === 'messaging/registration-token-not-registered' ||
            result.error?.code === 'messaging/invalid-registration-token'
          ) {
            invalidTokens.push(tokens[index]);
          }
        }
      });

      for (const token of invalidTokens) {
        await pool.query('DELETE FROM fcm_tokens WHERE token = $1', [token]);
      }
      if (invalidTokens.length > 0) {
        console.log(`🧹 ${invalidTokens.length} token(s) FCM invalide(s) supprimé(s)`);
      }
    }
    return response;
  } catch (err) {
    console.error('❌ Erreur Push:', err.message);
  }
};

module.exports = { envoyerNotificationPush };