const path = require('path');
const fs = require('fs');
const { google } = require('googleapis');
const jwt = require('jsonwebtoken');

const ISSUER_ID = process.env.GOOGLE_WALLET_ISSUER_ID || '3388000000023148271';
const CLASS_ID = `${ISSUER_ID}.fidelisation_card`;

const getCredentials = () => {
  let creds = null;

  // 1. Tenter depuis le fichier JSON local si présent
  const localJsonPath = path.join(__dirname, 'fidelitewalletperso-789d16de0a70.json');
  if (fs.existsSync(localJsonPath)) {
    try {
      creds = JSON.parse(fs.readFileSync(localJsonPath, 'utf8'));
    } catch (err) {
      console.error('❌ Erreur lecture fichier JSON local:', err.message);
    }
  }

  // 2. Extraire la clé privée depuis l'environnement Render s'il y a lieu
  let rawPrivateKey = process.env.GOOGLE_PRIVATE_KEY;
  
  if (!rawPrivateKey && creds) {
    rawPrivateKey = creds.private_key;
  }

  if (!rawPrivateKey) {
    console.error('❌ Aucune clé privée Google Wallet trouvée !');
    return null;
  }

  // Normalisation critique des saut de lignes \n
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
    // OBLIGATOIRE : Définir explicitement l'origine Vercel
    origins: [
      'https://fidelisation-platform.vercel.app'
    ],
    typ: 'savetowallet',
    payload: {
      loyaltyObjects: [
        {
          id: objectId,
          // OBLIGATOIRE : Pointeur exact vers la classe active
          classId: `${ISSUER_ID}.fidelisation_card`,
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