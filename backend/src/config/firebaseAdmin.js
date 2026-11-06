const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getMessaging } = require('firebase-admin/messaging');
const { Storage } = require('@google-cloud/storage');
const path = require('path');
const fs = require('fs');
const pool = require('./db');
const crypto = require('crypto');

let isInitialized = false;
let storageClient = null;

const getServiceAccountCredentials = () => {
  const privateKey = (process.env.FIREBASE_PRIVATE_KEY || '')
    .replace(/\\n/g, '\n')
    .replace(/^"|"$/g, '');

  if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && privateKey) {
    return {
      project_id: process.env.FIREBASE_PROJECT_ID,
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      private_key: privateKey
    };
  }

  const serviceAccountPath = path.join(__dirname, 'fidelitewalletperso-789d16de0a70.json');
  if (fs.existsSync(serviceAccountPath)) {
    return JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
  }

  return null;
};

const initAdmin = () => {
  if (isInitialized || getApps().length > 0) {
    return true;
  }

  try {
    const serviceAccount = getServiceAccountCredentials();
    if (serviceAccount) {
      initializeApp({
        credential: cert({
          projectId: serviceAccount.project_id || serviceAccount.projectId,
          clientEmail: serviceAccount.client_email || serviceAccount.clientEmail,
          privateKey: serviceAccount.private_key || serviceAccount.privateKey
        })
      });
      isInitialized = true;
      console.log('✅ Firebase Admin connecté.');
      return true;
    }

    throw new Error('Credentials Firebase manquants. Configurez FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL et FIREBASE_PRIVATE_KEY.');
  } catch (err) {
    console.error('❌ Erreur initialisation Firebase Admin:', err.message);
    return false;
  }
};

const getStorageClient = () => {
  if (storageClient) return storageClient;

  const serviceAccount = getServiceAccountCredentials();
  if (!serviceAccount?.client_email || !serviceAccount?.private_key) {
    throw new Error('Identifiants Firebase Storage manquants.');
  }

  storageClient = new Storage({
    projectId: serviceAccount.project_id || process.env.FIREBASE_PROJECT_ID,
    credentials: {
      client_email: serviceAccount.client_email,
      private_key: serviceAccount.private_key.replace(/\\n/g, '\n').replace(/^"|"$/g, '')
    }
  });
  return storageClient;
};

const televerserIconeEntreprise = async (entrepriseId, buffer, contentType) => {
  const bucketName = process.env.FIREBASE_STORAGE_BUCKET
    || 'fidelitewalletperso.firebasestorage.app';
  const token = crypto.randomBytes(32).toString('hex');
  const objectPath = `notification-icons/${entrepriseId}/${crypto.randomBytes(16).toString('hex')}`;
  const file = getStorageClient().bucket(bucketName).file(objectPath);

  await file.save(buffer, {
    resumable: false,
    metadata: {
      contentType,
      cacheControl: 'public, max-age=3600',
      metadata: { firebaseStorageDownloadTokens: token }
    }
  });

  return {
    objectPath,
    url: `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encodeURIComponent(objectPath)}?alt=media&token=${token}`
  };
};

const supprimerIconeEntreprise = async (objectPath) => {
  const bucketName = process.env.FIREBASE_STORAGE_BUCKET
    || 'fidelitewalletperso.firebasestorage.app';
  await getStorageClient().bucket(bucketName).file(objectPath).delete({ ignoreNotFound: true });
};

const envoyerNotificationPush = async (
  tokens,
  titre,
  message,
  nomEntreprise = 'Plateforme de fidélisation',
  iconeEntreprise = null
) => {
  if (!tokens || tokens.length === 0) return;

  const ok = initAdmin();
  if (!ok) {
    throw new Error('Firebase Admin n\'est pas initialisé. Vérifiez les credentials Firebase.');
  }

  const contenuNotification = titre ? `${titre}\n${message}` : message;
  const icon = iconeEntreprise || 'https://fidelisation-platform.vercel.app/icon.svg';

  try {
    const multicastMessage = {
      data: {
        title: nomEntreprise,
        body: contenuNotification,
        icon,
        link: 'https://fidelisation-platform.vercel.app/profil'
      },
      webpush: {
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
    throw err;
  }
};

module.exports = {
  envoyerNotificationPush,
  televerserIconeEntreprise,
  supprimerIconeEntreprise
};