const jwt = require('jsonwebtoken');
const { GoogleAuth } = require('google-auth-library');

const ISSUER_ID = process.env.GOOGLE_WALLET_ISSUER_ID;
const CLASS_ID = `${ISSUER_ID}.fidelisation_card`;

const getCredentials = () => {
  // 1. Essai via la variable JSON complète
  if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
    try {
      let rawEnv = process.env.GOOGLE_SERVICE_ACCOUNT_JSON.trim();
      
      // Nettoyage des guillemets superflus entourant la chaîne si présents
      if ((rawEnv.startsWith('"') && rawEnv.endsWith('"')) || (rawEnv.startsWith("'") && rawEnv.endsWith("'"))) {
        rawEnv = rawEnv.slice(1, -1);
      }

      const creds = JSON.parse(rawEnv);
      if (creds && creds.private_key) {
        creds.private_key = creds.private_key.replace(/\\n/g, '\n');
      }
      return creds;
    } catch (err) {
      console.error('❌ Erreur parsing GOOGLE_SERVICE_ACCOUNT_JSON:', err.message);
    }
  }

  // 2. Fallback via variables séparées
  const email = process.env.FIREBASE_CLIENT_EMAIL || process.env.GOOGLE_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_PRIVATE_KEY || process.env.GOOGLE_PRIVATE_KEY;

  if (!email || !privateKey) {
    console.error('❌ Aucun identifiant Google Wallet valide trouvé dans l’environnement');
    return null;
  }

  privateKey = privateKey
    .replace(/\\n/g, '\n')
    .replace(/^["']|["']$/g, '')
    .trim();

  return { client_email: email, private_key: privateKey };
};

const creerClasseCarte = async () => {
  const credentials = getCredentials();
  if (!credentials) return;

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