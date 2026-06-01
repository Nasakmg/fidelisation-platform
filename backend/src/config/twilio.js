const twilio = require('twilio');

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const envoyerSMS = async (telephone, message) => {
  try {
    // Formater le numéro (ajouter +221 si numéro sénégalais)
    let numeroFormate = telephone;
    if (!telephone.startsWith('+')) {
      numeroFormate = '+221' + telephone;
    }

    const result = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: numeroFormate
    });

    console.log(`✅ SMS envoyé à ${numeroFormate} : ${result.sid}`);
    return { success: true, sid: result.sid };

  } catch (err) {
    console.error(`❌ Erreur SMS à ${telephone} :`, err.message);
    return { success: false, error: err.message };
  }
};

module.exports = { envoyerSMS };