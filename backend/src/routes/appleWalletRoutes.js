const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { PKPass } = require('passkit-generator');
const { verifyToken } = require('../middleware/auth');
const pool = require('../config/db');

const getCertificates = () => {
  const {
    APPLE_CERT_PEM_BASE64,
    APPLE_KEY_PEM_BASE64,
    APPLE_WWDR_BASE64,
    APPLE_CERT_PASSWORD
  } = process.env;

  if (!APPLE_CERT_PASSWORD) {
    throw new Error('APPLE_CERT_PASSWORD est manquant');
  }

  if (APPLE_CERT_PEM_BASE64 && APPLE_KEY_PEM_BASE64 && APPLE_WWDR_BASE64) {
    return {
      wwdr: Buffer.from(APPLE_WWDR_BASE64, 'base64'),
      signerCert: Buffer.from(APPLE_CERT_PEM_BASE64, 'base64'),
      signerKey: Buffer.from(APPLE_KEY_PEM_BASE64, 'base64'),
      signerKeyPassphrase: APPLE_CERT_PASSWORD
    };
  }

  const certPath = path.join(__dirname, '../../certificates.pem');
  const keyPath = path.join(__dirname, '../../private-key-encrypted.pem');
  const wwdrPath = path.join(__dirname, '../../WWDR.pem');

  if (!fs.existsSync(certPath) || !fs.existsSync(keyPath) || !fs.existsSync(wwdrPath)) {
    throw new Error('Certificats Apple absents : configurez APPLE_CERT_PEM_BASE64, APPLE_KEY_PEM_BASE64 et APPLE_WWDR_BASE64 sur Render');
  }

  return {
    wwdr: fs.readFileSync(wwdrPath),
    signerCert: fs.readFileSync(certPath),
    signerKey: fs.readFileSync(keyPath),
    signerKeyPassphrase: APPLE_CERT_PASSWORD
  };
};

const getTemplatePath = () => {
  const templatePath = path.join(__dirname, '../../passTemplate.pass');
  if (!fs.existsSync(path.join(templatePath, 'pass.json'))) {
    throw new Error('Template Apple Wallet absent : passTemplate.pass/pass.json');
  }
  return templatePath;
};

router.get('/generate', verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM clients WHERE id = $1',
      [req.user.id]
    );
    const client = result.rows[0];
    if (!client) {
      return res.status(404).json({ message: '❌ Client introuvable' });
    }

    const pass = await PKPass.from(
      {
        model: getTemplatePath(),
        certificates: getCertificates()
      },
      {
        serialNumber: `EWALLET-${client.id}-${Date.now()}`,
        // Champs dynamiques
        storeCard: {
          primaryFields: [
            {
              key: 'points',
              label: 'Points fidélité',
              value: String(client.points_total),
              textAlignment: 'PKTextAlignmentCenter'
            }
          ],
          secondaryFields: [
            {
              key: 'name',
              label: 'Titulaire',
              value: `${client.nom} ${client.prenom}`
            }
          ],
          auxiliaryFields: [
            {
              key: 'member_since',
              label: 'Membre depuis',
              value: new Date(client.created_at).toLocaleDateString('fr-FR')
            }
          ],
          backFields: [
            {
              key: 'qr_code',
              label: 'Votre QR Code',
              value: client.qr_code
            }
          ]
        },
        barcode: {
          message: client.qr_code,
          format: 'PKBarcodeFormatQR',
          messageEncoding: 'iso-8859-1'
        }
      }
    );

    const buffer = pass.getAsBuffer();

    res.set({
      'Content-Type': 'application/vnd.apple.pkpass',
      'Content-Disposition': `attachment; filename="ewallet-${client.qr_code}.pkpass"`,
      'Content-Length': buffer.length
    });

    res.send(buffer);

  } catch (err) {
    console.error('❌ Erreur Apple Wallet:', err.message);
    res.status(500).json({
      message: '❌ La carte Apple Wallet n’a pas pu être générée.',
      error: err.message
    });
  }
});

module.exports = router;