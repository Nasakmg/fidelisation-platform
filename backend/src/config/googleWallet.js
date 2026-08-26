const path = require('path');
const fs = require('fs');

const getCredentials = () => {
  let creds = null;

  // 1. Production (Render via variable Base64)
  if (process.env.GOOGLE_SERVICE_ACCOUNT_BASE64) {
    try {
      const base64Str = process.env.GOOGLE_SERVICE_ACCOUNT_BASE64.trim();
      const decoded = Buffer.from(base64Str, 'base64').toString('utf8');
      creds = JSON.parse(decoded);
    } catch (err) {
      console.error('❌ Erreur décodage Base64:', err.message);
    }
  }

  // 2. Développement (Local)
  if (!creds) {
    const localJsonPath = path.join(__dirname, 'fidelitewalletperso-789d16de0a70.json');
    if (fs.existsSync(localJsonPath)) {
      try {
        creds = JSON.parse(fs.readFileSync(localJsonPath, 'utf8'));
      } catch (err) {
        console.error('❌ Erreur fichier local:', err.message);
      }
    }
  }

  // 3. Correction directe de la clé RSA
  if (creds) {
    let rawKey = process.env.GOOGLE_PRIVATE_KEY || creds.private_key;
    if (rawKey) {
      // Remplace les \n textuels par de vrais sauts de ligne OpenSSL
      creds.private_key = rawKey.replace(/\\n/g, '\n').trim();
    }
  }

  return creds;
};

module.exports = { getCredentials };