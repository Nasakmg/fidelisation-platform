const path = require('path');
const fs = require('fs');
const { google } = require('googleapis');
const jwt = require('jsonwebtoken');

const ISSUER_ID = process.env.GOOGLE_WALLET_ISSUER_ID || '3388000000023148271';
const CLASS_ID = `${ISSUER_ID}.fidelisation_card`;

const getCredentials = () => {
  let creds = null;

  const localJsonPath = path.join(__dirname, 'fidelitewalletperso-789d16de0a70.json');
  if (fs.existsSync(localJsonPath)) {
    try {
      creds = JSON.parse(fs.readFileSync(localJsonPath, 'utf8'));
    } catch (err) {
      console.error('❌ Erreur lecture fichier JSON local:', err.message);
    }
  }

  let rawPrivateKey = process.env.GOOGLE_PRIVATE_KEY || (creds ? creds.private_key : null);

  if (!rawPrivateKey) {
    console.error('❌ Aucune clé privée Google Wallet trouvée !');
    return null;
  }

  const formattedPrivateKey = rawPrivateKey
    .replace(/\\n/g, '\n')
    .replace(/"/g, '')
    .trim();

  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || (creds ? creds.client_email : 'walletperso@fidelitewalletperso.iam.gserviceaccount.com');

  return {
    client_email: clientEmail,
    private_key: formattedPrivateKey,
  };
};

const creerClasseCarte = async () => {
  const creds = getCredentials();
  if (!creds) {
    console.log("⚠️ Identifiants Google Wallet introuvables");
    return null;
  }

  try {
    const auth = new google.auth.GoogleAuth({
      credentials: creds,
      scopes: ['https://www.googleapis.com/auth/wallet_object.issuer'],
    });
    console.log("✅ Client Google Wallet prêt");
    return google.walletobjects({ version: 'v1', auth });
  } catch (error) {
    console.error("❌ Erreur Google Wallet init:", error.message);
    return null;
  }
};

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
          accountId: String(client.id),
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