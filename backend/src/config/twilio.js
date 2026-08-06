const twilio = require('twilio');

const client = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

const envoyerSMS = async (telephone, message) => {
  if (!client) {
    console.log('ℹ️ Twilio non configuré');
    return { success: false, error: 'Twilio non configuré' };
  }

  try {
    let numeroFormate = telephone.toString().trim();
    
    // Formatage intelligent du numéro
    if (numeroFormate.startsWith('0')) {
      numeroFormate = '+33' + numeroFormate.slice(1); // France
    } else if (numeroFormate.startsWith('7') && numeroFormate.length === 9) {
      numeroFormate = '+221' + numeroFormate; // Sénégal
    } else if (numeroFormate.startsWith('2') && numeroFormate.length === 8) {
      numeroFormate = '+225' + numeroFormate; // Côte d'Ivoire
    } else if (!numeroFormate.startsWith('+')) {
      numeroFormate = '+221' + numeroFormate; // Par défaut Sénégal
    }

    console.log(`📱 Envoi SMS à ${numeroFormate}...`);

    const result = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: numeroFormate
    });

    console.log(`✅ SMS envoyé à ${numeroFormate}: ${result.sid}`);
    return { success: true, sid: result.sid };

  } catch (err) {
    console.error(`❌ Erreur SMS:`, err.message);
    return { success: false, error: err.message };
  }
};

module.exports = { envoyerSMS };