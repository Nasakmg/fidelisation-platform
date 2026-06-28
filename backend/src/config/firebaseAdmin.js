const admin = require('firebase-admin');

// Initialiser Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
    })
  });
}

const envoyerNotificationPush = async (tokens, titre, message) => {
  if (!tokens || tokens.length === 0) return;

  try {
    const notification = {
      notification: {
        title: titre,
        body: message,
      },
      tokens: tokens,
    };

    const response = await admin.messaging().sendEachForMulticast(notification);
    console.log(`✅ ${response.successCount} notifications envoyées`);
    return response;
  } catch (err) {
    console.error('❌ Erreur Push:', err.message);
  }
};

module.exports = { envoyerNotificationPush };