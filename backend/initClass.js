const path = require('path');
const { google } = require('googleapis');

(async () => {
  console.log("⏳ Chargement du nouveau fichier JSON (e69dfc8f4c8a)...");

  // Pointage direct vers le nouveau fichier JSON que vous venez de télécharger
  const keyFilePath = path.join(__dirname, 'src', 'config', 'fidelitewalletperso-e69dfc8f4c8a.json');

  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: keyFilePath,
      scopes: ['https://www.googleapis.com/auth/wallet_object.issuer'],
    });

    const client = google.walletobjects({ version: 'v1', auth });

    const ISSUER_ID = process.env.GOOGLE_WALLET_ISSUER_ID || '3388000000023148271';
    const classId = `${ISSUER_ID}.fidelisation_card`;

    console.log("⏳ Envoi de la requête de création de classe à Google...");

    const res = await client.loyaltyclass.insert({
      requestBody: {
        id: classId,
        issuerName: 'E-Wallet',
        programName: 'Programme de Fidélité',
        reviewStatus: 'UNDER_REVIEW'
      }
    });

    console.log('🎉 CLASSE CRÉÉE AVEC SUCCÈS SUR GOOGLE ! ID:', res.data.id);
  } catch (err) {
    if (err.status === 409 || err.code === 409) {
      console.log('✅ La classe existe déjà sur les serveurs de Google !');
    } else {
      console.error('❌ Erreur lors de la création :', err.message || err);
    }
  }
  process.exit(0);
})();