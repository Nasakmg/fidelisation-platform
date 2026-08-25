const jwt = require('jsonwebtoken');
const { GoogleAuth } = require('google-auth-library');

const ISSUER_ID = process.env.GOOGLE_WALLET_ISSUER_ID;
const CLASS_ID = `${ISSUER_ID}.fidelisation_card`;

const getCredentials = () => {
  const email = process.env.FIREBASE_CLIENT_EMAIL || process.env.GOOGLE_CLIENT_EMAIL;
  let rawKey = process.env.FIREBASE_PRIVATE_KEY || process.env.GOOGLE_PRIVATE_KEY;

  if (!email || !rawKey) {
    console.error('❌ Email ou clé privée introuvable dans l’environnement');
    return null;
  }

  // Nettoyage critique de la clé RSA pour Node.js / OpenSSL
  let formattedKey = rawKey
    .trim()
    .replace(/^["']|["']$/g, '') // Retire d'éventuels guillemets autour de la clé
    .replace(/\\n/g, '\n')       // Convertit \n texte en vrais retours à la ligne
    .replace(/\r/g, '');         // Supprime les retours chariot Windows

  return {
    client_email: email,
    private_key: formattedKey,
  };
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