const path = require('path');
const fs = require('fs');
const { google } = require('googleapis');

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

// 2. Initialisation du client Google Wallet & Création de la classe
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
    console.log("✅ Classe carte Google Wallet prête");
    return walletClient;
  } catch (error) {
    console.error("❌ Erreur lors de l'initialisation de Google Wallet :", error.message);
    return null;
  }
};

// 3. EXPORTS : Exportation explicite de toutes les fonctions requises par index.js et les routes
module.exports = {
  getCredentials,
  creerClasseCarte,
};