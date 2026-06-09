const { GoogleAuth } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const path = require('path');

const ISSUER_ID = process.env.GOOGLE_WALLET_ISSUER_ID;
const CLASS_ID = `${ISSUER_ID}.fidelisation_card`;

// Vérifier si le fichier de service account existe
const SERVICE_ACCOUNT_FILE = process.env.GOOGLE_SERVICE_ACCOUNT_FILE
  ? path.join(__dirname, '../../', process.env.GOOGLE_SERVICE_ACCOUNT_FILE)
  : null;
// Créer la classe de carte (à appeler une seule fois)
const creerClasseCarte = async () => {
  if (!SERVICE_ACCOUNT_FILE) {
    console.log('ℹ️ Google Wallet non configuré sur ce serveur');
    return;
  }
  try {
    const auth = new GoogleAuth({
      keyFile: SERVICE_ACCOUNT_FILE,
      scopes: ['https://www.googleapis.com/auth/wallet_object.issuer']
    });

    const client = await auth.getClient();
    const token = await client.getAccessToken();

    const classeData = {
      id: CLASS_ID,
      issuerName: 'FidélisationPro',
      programName: 'Carte de Fidélité',
      programLogo: {
        sourceUri: {
          uri: 'https://fidelisation-platform.vercel.app/logo.png'
        }
      },
      hexBackgroundColor: '#1d4ed8',
      reviewStatus: 'UNDER_REVIEW'
    };

    const response = await fetch(
      `https://walletobjects.googleapis.com/walletobjects/v1/loyaltyClass`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(classeData)
      }
    );

    const data = await response.json();
    console.log('✅ Classe carte créée :', data.id);
    return data;

  } catch (err) {
    console.log('ℹ️ Classe existe déjà ou erreur :', err.message);
  }
};

// Générer un lien Google Wallet pour un client
const genererLienWallet = async (client) => {
  if (!SERVICE_ACCOUNT_FILE) {
    throw new Error('Google Wallet non configuré');
  }
  try {
    const auth = new GoogleAuth({
      keyFile: SERVICE_ACCOUNT_FILE,
      scopes: ['https://www.googleapis.com/auth/wallet_object.issuer']
    });

    const serviceAccountKey = require(SERVICE_ACCOUNT_FILE);

    const objectId = `${ISSUER_ID}.${client.qr_code}`;

    const objetCarte = {
      id: objectId,
      classId: CLASS_ID,
      state: 'ACTIVE',
      heroImage: {
        sourceUri: {
          uri: 'https://fidelisation-platform.vercel.app/logo.png'
        }
      },
      textModulesData: [
        {
          header: 'Points fidélité',
          body: `${client.points_total} points`,
          id: 'points'
        },
        {
          header: 'Membre depuis',
          body: new Date(client.created_at).toLocaleDateString('fr-FR'),
          id: 'membre'
        }
      ],
      barcode: {
        type: 'QR_CODE',
        value: client.qr_code,
        alternateText: client.qr_code
      },
      cardTitle: {
        defaultValue: {
          language: 'fr',
          value: 'FidélisationPro'
        }
      },
      header: {
        defaultValue: {
          language: 'fr',
          value: `${client.nom} ${client.prenom}`
        }
      },
      loyaltyPoints: {
        balance: {
          int: client.points_total
        },
        label: 'Points'
      }
    };

    // Créer le JWT pour Google Wallet
    const claims = {
      iss: serviceAccountKey.client_email,
      aud: 'google',
      origins: ['https://fidelisation-platform.vercel.app'],
      typ: 'savetowallet',
      payload: {
        loyaltyObjects: [objetCarte]
      }
    };

    const token = jwt.sign(claims, serviceAccountKey.private_key, {
      algorithm: 'RS256'
    });

    const lienWallet = `https://pay.google.com/gp/v/save/${token}`;
    return lienWallet;

  } catch (err) {
    console.error('❌ Erreur Google Wallet :', err.message);
    throw err;
  }
};

module.exports = { creerClasseCarte, genererLienWallet };