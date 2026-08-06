const { Resend } = require('resend');

let resendClient = null;

const getResendClient = () => {
  if (!resendClient) {
    if (!process.env.RESEND_API_KEY) {
      console.error('❌ RESEND_API_KEY manquant dans .env');
      return null;
    }
    resendClient = new Resend(process.env.RESEND_API_KEY);
  }
  return resendClient;
};

const envoyerEmail = async (destinataire, sujet, message) => {
  const client = getResendClient();
  if (!client) {
    return { success: false, error: 'Resend non configuré' };
  }

  try {
    const result = await client.emails.send({
      from: 'E-Wallet <onboarding@resend.dev>',
      to: [destinataire],
      subject: sujet,
      html: `
        <!DOCTYPE html>
        <html>
        <body style="margin:0;padding:0;background:#080808;font-family:Arial,sans-serif;">
          <div style="max-width:600px;margin:0 auto;padding:40px 20px;">
            <div style="text-align:center;margin-bottom:32px;">
              <div style="background:#EAB308;display:inline-block;padding:12px 20px;border-radius:12px;">
                <span style="font-size:24px;font-weight:bold;color:#000;">🎯 E-Wallet</span>
              </div>
            </div>
            <div style="background:#0d0d0d;border:1px solid rgba(255,255,255,0.08);border-radius:20px;padding:32px;">
              <p style="color:#e5e7eb;font-size:16px;line-height:1.6;margin:0 0 24px 0;">
                ${message}
              </p>
              <div style="text-align:center;margin-top:24px;">
                <a href="https://fidelisation-platform.vercel.app/client" 
                   style="background:#EAB308;color:#000;font-weight:bold;padding:14px 28px;border-radius:12px;text-decoration:none;font-size:15px;display:inline-block;">
                  Voir mes points →
                </a>
              </div>
            </div>
            <p style="color:#4b5563;font-size:12px;text-align:center;margin-top:24px;">
              E-Wallet — Programme de fidélité digital
            </p>
          </div>
        </body>
        </html>
      `
    });

    if (result.error) {
      console.error(`❌ Erreur Resend:`, result.error);
      return { success: false, error: result.error.message };
    }

    console.log(`✅ Email envoyé à ${destinataire}`);
    return { success: true, id: result.data?.id };

  } catch (err) {
    console.error(`❌ Exception Resend:`, err.message);
    return { success: false, error: err.message };
  }
};

module.exports = { envoyerEmail };