const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const { google } = require('googleapis');

const ISSUER_ID = process.env.GOOGLE_WALLET_ISSUER_ID || '3388000000023148271';
const CLASS_ID = `${ISSUER_ID}.carte_fidelite`;

const getCredentials = () => {
  // 1. Variable d'environnement sur Render / Vercel (Production)
  if (process.env.GOOGLE_PRIVATE_KEY && process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL) {
    return {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n').replace(/"/g, '').trim()
    };
  }

  // 2. Fichier JSON local (Développement)
  const localJsonPath = path.join(__dirname, 'fidelitewalletperso-e69dfc8f4c8a.json');
  if (fs.existsSync(localJsonPath)) {
    try {
      const creds = JSON.parse(fs.readFileSync(localJsonPath, 'utf8'));
      return {
        client_email: creds.client_email,
        private_key: creds.private_key.replace(/\\n/g, '\n').replace(/"/g, '').trim()
      };
    } catch (err) {
      console.error('❌ Erreur lecture JSON local:', err.message);
    }
  }

  return null;
};

// Fonction d'initialisation du client Google API pour créer les classes
const creerClasseCarte = async () => {
  const creds = getCredentials();
  if (!creds) {
    console.error('❌ Identifiants Google Wallet indisponibles pour creerClasseCarte');
    return null;
  }

  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: creds.client_email,
        private_key: creds.private_key,
      },
      scopes: ['https://www.googleapis.com/auth/wallet_object.issuer'],
    });

    return google.walletobjects({ version: 'v1', auth });
  } catch (err) {
    console.error('❌ Erreur authentification Google Wallet:', err.message);
    return null;
  }
};

// Génération du lien JWT pour l'ajout de la carte par les clients
const genererLienWallet = async (client) => {
  const creds = getCredentials();
  if (!creds || !creds.client_email || !creds.private_key) {
    throw new Error('Identifiants Google Wallet invalides ou manquants.');
  }

  const cleanCode = String(client.qr_code || client.id).replace(/[^a-zA-Z0-9_-]/g, '');
  const objectId = `${ISSUER_ID}.USR_${cleanCode}_${Date.now()}`;

  const claims = {
    iss: creds.client_email,
    aud: 'google',
    origins: [
      'https://fidelisation-platform.vercel.app',
      'http://localhost:3000'
    ],
    typ: 'savetowallet',
    payload: {
      loyaltyObjects: [
        {
          id: objectId,
          classId: CLASS_ID,
          state: 'ACTIVE',
          programName: 'Programme de Fidélité',
          issuerName: 'E-Wallet',
          accountName: `${client.prenom || ''} ${client.nom || ''}`.trim() || 'Client',
          accountId: String(client.id || cleanCode),
          barcode: {
            type: 'QR_CODE',
            value: String(client.qr_code || client.id),
            alternateText: String(client.qr_code || client.id),
          },
          loyaltyPoints: {
            label: 'Points',
            balance: { string: String(client.points_total || 0) }
          }
        },
      ],
    },
  };

  const token = jwt.sign(claims, creds.private_key, { algorithm: 'RS256' });
  return `https://pay.google.com/gp/v/save/${token}`;
};

module.exports = {
  getCredentials,
  creerClasseCarte,
  genererLienWallet,
};