const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const { GoogleAuth } = require('google-auth-library');

const ISSUER_ID = process.env.GOOGLE_WALLET_ISSUER_ID;
const CLASS_ID = `${ISSUER_ID}.fidelisation_card`;

const getCredentials = () => {
  // 1. Production (Render) : Base64
  if (process.env.GOOGLE_SERVICE_ACCOUNT_BASE64) {
    try {
      const decoded = Buffer.from(process.env.GOOGLE_SERVICE_ACCOUNT_BASE64, 'base64').toString('utf8');
      const creds = JSON.parse(decoded);
      if (creds && creds.private_key) {
        creds.private_key = creds.private_key.replace(/\\n/g, '\n');
      }
      return creds;
    } catch (err) {
      console.error('❌ Erreur décodage Base64:', err.message);
    }
  }

  // 2. Production (Render) : JSON brut
  if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
    try {
      let rawEnv = process.env.GOOGLE_SERVICE_ACCOUNT_JSON.trim();
      if ((rawEnv.startsWith('"') && rawEnv.endsWith('"')) || (rawEnv.startsWith("'") && rawEnv.endsWith("'"))) {
        rawEnv = rawEnv.slice(1, -1);
      }
      const creds = JSON.parse(rawEnv);
      if (creds && creds.private_key) {
        creds.private_key = creds.private_key.replace(/\\n/g, '\n');
      }
      return creds;
    } catch (err) {
      console.error('❌ Erreur parsing JSON:', err.message);
    }
  }

  // 3. Fallback Variables séparées
  const email = process.env.FIREBASE_CLIENT_EMAIL || process.env.GOOGLE_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_PRIVATE_KEY || process.env.GOOGLE_PRIVATE_KEY;
  if (email && privateKey) {
    privateKey = privateKey.replace(/\\n/g, '\n').replace(/^["']|["']$/g, '').trim();
    return { client_email: email, private_key: privateKey };
  }

  // 4. Local : Lecture directe du fichier JSON local si présent
  const localJsonPath = path.join(__dirname, 'fidelitewalletperso-789d16de0a70.json');
  if (fs.existsSync(localJsonPath)) {
    try {
      const creds = JSON.parse(fs.readFileSync(localJsonPath, 'utf8'));
      if (creds && creds.private_key) {
        creds.private_key = creds.private_key.replace(/\\n/g, '\n');
      }
      return creds;
    } catch (err) {
      console.error('❌ Erreur lecture fichier JSON local:', err.message);
    }
  }

  return null;
};

const creerClasseCarte = async () => {
  const credentials = getCredentials();
  if (!credentials) {
    console.log('⚠️ Google Wallet désactivé : Clé d’accès introuvable');
    return;
  }

  try {
    const auth = new GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/wallet_object.issuer'],
    });
    const client = await auth.getClient();
    const token = await client.getAccessToken();

    const classeData = {
      id: CLASS_ID,
      issuerName: 'E-Wallet',
      programName: 'Carte de Fidélité',
      programLogo: {
        sourceUri: {
          uri: 'https://i.imgur.com/8Q73v2E.png',
        },
        contentDescription: {
          defaultValue: { language: 'fr', value: 'Logo' },
        },
      },
      hexBackgroundColor: '#EAB308',
      reviewStatus: 'UNDER_REVIEW',
    };

    const response = await fetch(`https://walletobjects.googleapis.com/walletobjects/v1/loyaltyClass`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(classeData),
    });

    const data = await response.json();
    if (data.error && data.error.code !== 409) {
      console.log('ℹ️ Classe carte Google Wallet:', data.error.message);
    } else {
      console.log('✅ Classe carte Google Wallet prête');
    }
  } catch (err) {
    console.log('ℹ️ Google Wallet init:', err.message);
  }
};

const genererLienWallet = async (client) => {
  const credentials = getCredentials();
  if (!credentials) {
    throw new Error('Google Wallet non configuré sur ce serveur');
  }

  try {
    const qrValue = (client.qr_code || String(client.id || '123456')).replace(/[^a-zA-Z0-9]/g, '');
    const objectId = `${ISSUER_ID}.${qrValue}_${Date.now()}`;
    const points = parseInt(client.points_total, 10) || 0;
    const nomClient = `${client.nom || ''} ${client.prenom || ''}`.trim() || 'Client E-Wallet';

    const objetCarte = {
      id: objectId,
      classId: CLASS_ID,
      state: 'ACTIVE',
      barcode: {
        type: 'QR_CODE',
        value: qrValue,
        alternateText: qrValue,
      },
      cardTitle: {
        defaultValue: { language: 'fr', value: 'E-Wallet' },
      },
      header: {
        defaultValue: { language: 'fr', value: nomClient },
      },
      loyaltyPoints: {
        balance: { int: points },
        label: 'Points',
      },
    };

    const claims = {
      iss: credentials.client_email,
      aud: 'google',
      origins: [],
      typ: 'savetowallet',
      payload: {
        loyaltyObjects: [objetCarte],
      },
    };

    const token = jwt.sign(claims, credentials.private_key, { algorithm: 'RS256' });
    return `https://pay.google.com/gp/v/save/${token}`;
  } catch (err) {
    console.error('❌ Erreur Google Wallet:', err.message);
    throw err;
  }
};

module.exports = { creerClasseCarte, genererLienWallet };