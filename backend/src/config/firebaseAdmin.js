let admin;

try {
  admin = require('firebase-admin');
} catch (err) {
  console.log('ℹ️ firebase-admin non disponible');
}

const initAdmin = () => {
  if (!admin) return null;
  if (admin.apps && admin.apps.length > 0) return admin;
  
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
      })
    });
    console.log('✅ Firebase Admin initialisé');
  } catch (err) {
    console.log('ℹ️ Firebase Admin erreur:', err.message);
  }
  return admin;
};

const envoyerNotificationPush = async (tokens, titre, message) => {
  if (!tokens || tokens.length === 0) return;
  
  const adminInstance = initAdmin();
  if (!adminInstance) return;

  try {
    const response = await adminInstance.messaging().sendEachForMulticast({
      notification: { title: titre, body: message },
      tokens
    });
    console.log(`✅ ${response.successCount} notifications push envoyées`);
    return response;
  } catch (err) {
    console.error('❌ Erreur Push:', err.message);
  }
};

module.exports = { envoyerNotificationPush };