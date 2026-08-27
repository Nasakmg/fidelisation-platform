const path = require('path');
const fs = require('fs');
const { google } = require('googleapis');
const jwt = require('jsonwebtoken');

const ISSUER_ID = process.env.GOOGLE_WALLET_ISSUER_ID || '3388000000023148271';
const CLASS_ID = `${ISSUER_ID}.fidelisation_card`;

// 1. Récupération des identifiants
const getCredentials = () => {
  let creds = null;

  if (process.env.GOOGLE_SERVICE_ACCOUNT_BASE64) {
    try {
      const base64Str = process.env.GOOGLE_SERVICE_ACCOUNT_BASE64.trim();
      const decoded = Buffer.from(base64Str, 'base64').toString('utf8');
      creds = JSON.parse(decoded);
    } catch (err) {
      console.error('❌ Erreur décodage Base64:', err.message);
    }
  }

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

  if (!creds) return null;

  let rawKey = process.env.GOOGLE_PRIVATE_KEY || creds.private_key;
  if (rawKey) {
    creds.private_key = rawKey.replace(/\\n/g, '\n').trim();
  }

  return creds;
};

// 2. Initialisation Google Wallet
const creerClasseCarte = async () => {
  const creds = getCredentials();
  if (!creds) return null;

  try {
    const auth = new google.auth.GoogleAuth({
      credentials: creds,
      scopes: ['https://www.googleapis.com/auth/wallet_object.issuer'],
    });
    console.log("✅ Client Google Wallet prêt");
    return google.walletobjects({ version: 'v1', auth });
  } catch (error) {
    console.error("❌ Erreur Google Wallet:", error.message);
    return null;
  }
};

// 3. Génération du Lien Wallet (JWT Complet)
const genererLienWallet = async (client) => {
  const creds = getCredentials();
  if (!creds || !creds.client_email || !creds.private_key) {
    throw new Error('Identifiants Google Wallet invalides ou manquants.');
  }

  // Identifiant unique de la carte client
  const cleanQrCode = (client.qr_code || String(client.id)).replace(/[^a-zA-Z0-9]/g, '');
  const objectId = `${ISSUER_ID}.USR_${cleanQrCode}_${client.id}`;

  const claims = {
    iss: creds.client_email,
    aud: 'google',
    origins: [process.env.FRONTEND_URL || 'https://fidelisation-platform.vercel.app'],
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
          accountId: client.qr_code || String(client.id),
          barcode: {
            type: 'QR_CODE',
            value: client.qr_code || String(client.id),
            alternateText: client.qr_code || String(client.id),
          },
          loyaltyPoints: {
            balance: { int: parseInt(client.points_total) || 0 },
            label: 'Points'
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