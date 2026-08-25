const jwt = require('jsonwebtoken');
const { GoogleAuth } = require('google-auth-library');

const ISSUER_ID = process.env.GOOGLE_WALLET_ISSUER_ID;
const CLASS_ID = `${ISSUER_ID}.fidelisation_card`;

// Récupération des identifiants depuis le .env
const getCredentials = () => {
  const email = process.env.FIREBASE_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (!email || !privateKey) {
    console.error('❌ FIREBASE_CLIENT_EMAIL ou FIREBASE_PRIVATE_KEY manquant dans le .env');
    return null;
  }

  // Nettoyage et conversion des sauts de ligne de la clé privée
  privateKey = privateKey
    .replace(/\\n/g, '\n')
    .replace(/^"|"$/g, '')
    .trim();

  return {
    client_email: email,
    private_key: privateKey,
  };
};

// Initialisation de la classe de carte sur Google Wallet
const creerClasseCarte = async () => {
  const credentials = getCredentials();
  if (!credentials) {
    console.log('ℹ️ Google Wallet non configuré');
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
      programName: 'Carte de Fidélité E-Wallet',
      programLogo: {
        sourceUri: {
          uri: 'https://w7.pngwing.com/pngs/313/559/png-transparent-google-wallet-logo-thumbnail-tech-companies-thumbnail.png',
        },
        contentDescription: {
          defaultValue: {
            language: 'fr',
            value: 'Logo E-Wallet',
          },
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

// Génération du lien Google Wallet avec QR Code
const genererLienWallet = async (client) => {
  const credentials = getCredentials();
  if (!credentials) {
    throw new Error('Google Wallet non configuré sur ce serveur');
  }

  try {
    const objectId = `${ISSUER_ID}.${client.qr_code}`;

    const objetCarte = {
      id: objectId,
      classId: CLASS_ID,
      state: 'ACTIVE',
      barcode: {
        type: 'QR_CODE',
        value: client.qr_code,
        alternateText: client.qr_code,
      },
      cardTitle: {
        defaultValue: { language: 'fr', value: 'E-Wallet' },
      },
      header: {
        defaultValue: { language: 'fr', value: `${client.nom} ${client.prenom}` },
      },
      textModulesData: [
        {
          header: 'Points fidélité',
          body: `${client.points_total} points`,
          id: 'points',
        },
        {
          header: 'Membre depuis',
          body: new Date(client.created_at).toLocaleDateString('fr-FR'),
          id: 'membre',
        },
      ],
      loyaltyPoints: {
        balance: { int: client.points_total },
        label: 'Points',
      },
    };

    const claims = {
      iss: credentials.client_email,
      aud: 'google',
      origins: ['https://fidelisation-platform.vercel.app', 'http://localhost:3000'],
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