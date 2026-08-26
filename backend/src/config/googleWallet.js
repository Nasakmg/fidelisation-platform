const path = require('path');
const fs = require('fs');
const { google } = require('googleapis');
const jwt = require('jsonwebtoken');

// 1. Récupération des identifiants
const getCredentials = () => {
  let creds = null;

  // Production (Render via variable Base64)
  if (process.env.GOOGLE_SERVICE_ACCOUNT_BASE64) {
    try {
      const base64Str = process.env.GOOGLE_SERVICE_ACCOUNT_BASE64.trim();
      const decoded = Buffer.from(base64Str, 'base64').toString('utf8');
      creds = JSON.parse(decoded);
    } catch (err) {
      console.error('❌ Erreur décodage Base64:', err.message);
    }
  }

  // Développement (Local)
  if (!creds) {
    const localJsonPath = path.join(__dirname, 'fidelitewalletperso-789d16de0a70.json');
    if (fs.existsSync(localJsonPath)) {
      try {
        creds = JSON.parse(fs.readFileSync(localJsonPath, 'utf8'));
      } catch (err) {
        console.error('❌ Erreur lecture fichier local:', err.message);
      }
    }
  }

  if (!creds) {
    console.warn('⚠️ Aucun identifiant Google Service Account valide trouvé.');
    return null;
  }

  // Correction du format de la clé privée PEM
  let rawKey = process.env.GOOGLE_PRIVATE_KEY || creds.private_key;
  if (rawKey) {
    creds.private_key = rawKey.replace(/\\n/g, '\n').trim();
  }

  return creds;
};

// 2. Initialisation du client Google Wallet
const creerClasseCarte = async () => {
  const creds = getCredentials();
  if (!creds) {
    console.error("❌ Impossible d'initialiser Google Wallet : Identifiants introuvables.");
    return null;
  }

  try {
    const auth = new google.auth.GoogleAuth({
      credentials: creds,
      scopes: ['https://www.googleapis.com/auth/wallet_object.issuer'],
    });

    const walletClient = google.walletobjects({ version: 'v1', auth });
    console.log("✅ Client Google Wallet prêt");
    return walletClient;
  } catch (error) {
    console.error("❌ Erreur lors de l'initialisation de Google Wallet :", error.message);
    return null;
  }
};

// 3. Génération du lien d'ajout à Google Wallet (JWT)
const genererLienWallet = async (client) => {
  const creds = getCredentials();
  const issuerId = process.env.GOOGLE_WALLET_ISSUER_ID || '3388000000023148271';

  if (!creds || !creds.client_email || !creds.private_key) {
    throw new Error('Identifiants Google Wallet invalides ou manquants.');
  }

  // Identifiants uniques pour l'objet et la classe
  const classId = `${issuerId}.fidelisation_card`;
  const objectId = `${issuerId}.${client.id}_${Date.now()}`;

  // Structure du Payload exigée par Google Pay API
  const claims = {
    iss: creds.client_email,
    aud: 'google',
    origins: [process.env.FRONTEND_URL || 'https://fidelisation-platform.vercel.app'],
    typ: 'savetowallet',
    payload: {
      genericObjects: [
        {
          id: objectId,
          classId: classId,
          state: 'ACTIVE',
          header: {
            defaultValue: {
              language: 'fr-FR',
              value: `${client.prenom || ''} ${client.nom || ''}`.trim() || 'Client',
            },
          },
          barcode: {
            type: 'QR_CODE',
            value: client.qr_code || String(client.id),
            alternateText: client.qr_code || String(client.id),
          },
        },
      ],
    },
  };

  // Signature du jeton JWT avec la clé privée
  const token = jwt.sign(claims, creds.private_key, { algorithm: 'RS256' });

  // URL finale vers Google Pay
  return `https://pay.google.com/gp/v/save/${token}`;
};


// Fonction pour créer/s'assurer que la classe existe
const assurerExistenceClasse = async (walletClient, issuerId, classId) => {
  try {
    await walletClient.genericclass.get({ resourceId: classId });
  } catch (err) {
    if (err.status === 404) {
      // La classe n'existe pas, on la crée
      await walletClient.genericclass.insert({
        requestBody: {
          id: classId,
          classTemplateInfo: {
            cardTemplateInfo: {
              cardTitle: {
                defaultValue: { language: 'fr-FR', value: 'Carte de Fidélité' }
              }
            }
          }
        }
      });
      console.log('✅ Classe Google Wallet créée automatiquement');
    }
  }
};


// 4. EXPORTS : Exportation de toutes les fonctions
module.exports = {
  getCredentials,
  creerClasseCarte,
  genererLienWallet,
};