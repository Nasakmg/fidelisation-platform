const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const envoyerEmail = async (destinataire, sujet, message) => {
  try {
    const result = await resend.emails.send({
      from: 'E-Wallet <onboarding@resend.dev>',
      to: destinataire,
      subject: sujet,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
        </head>
        <body style="margin:0;padding:0;background-color:#080808;font-family:Arial,sans-serif;">
          <div style="max-width:600px;margin:0 auto;padding:40px 20px;">
            
            <!-- Header -->
            <div style="text-align:center;margin-bottom:32px;">
              <div style="display:inline-block;background:#EAB308;padding:12px 20px;border-radius:12px;margin-bottom:16px;">
                <span style="font-size:24px;">🎯</span>
              </div>
              <h1 style="color:#ffffff;font-size:24px;margin:0;">E-Wallet</h1>
            </div>

            <!-- Content -->
            <div style="background:#0d0d0d;border:1px solid rgba(255,255,255,0.08);border-radius:20px;padding:32px;">
              <p style="color:#e5e7eb;font-size:16px;line-height:1.6;margin:0 0 24px 0;">
                ${message}
              </p>
              
              <!-- CTA Button -->
              <div style="text-align:center;margin-top:24px;">
                <a href="https://fidelisation-platform.vercel.app/client" 
                   style="display:inline-block;background:#EAB308;color:#000000;font-weight:bold;padding:14px 28px;border-radius:12px;text-decoration:none;font-size:15px;">
                  Voir mes points →
                </a>
              </div>
            </div>

            <!-- Footer -->
            <div style="text-align:center;margin-top:24px;">
              <p style="color:#4b5563;font-size:12px;">
                Vous recevez cet email car vous êtes membre E-Wallet.
              </p>
            </div>
          </div>
        </body>
        </html>
      `
    });

    console.log(`✅ Email envoyé à ${destinataire} : ${result.data?.id}`);
    return { success: true, id: result.data?.id };

  } catch (err) {
    console.error(`❌ Erreur email à ${destinataire} :`, err.message);
    return { success: false, error: err.message };
  }
};

module.exports = { envoyerEmail };