const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { inscrireClient, connecterClient, profilClient } = require('../controllers/clientController');
const { verifyToken } = require('../middleware/auth');
const { genererLienWallet } = require('../config/googleWallet');

router.post('/inscription', inscrireClient);
router.post('/connexion', connecterClient);
router.get('/profil', verifyToken, profilClient);

router.get('/wallet', verifyToken, async (req, res) => {
  try {
    const pool = require('../config/db');
    const result = await pool.query(
      'SELECT * FROM clients WHERE id = $1',
      [req.user.id]
    );
    const client = result.rows[0];

    if (!client) {
      return res.status(404).json({ message: '❌ Client introuvable' });
    }

    // Vérifier si Google Wallet est configuré
    if (!process.env.GOOGLE_SERVICE_ACCOUNT_FILE) {
      return res.status(503).json({
        message: '❌ Google Wallet non configuré sur ce serveur'
      });
    }

    const lien = await genererLienWallet(client);
    res.json({ lien_wallet: lien });
  } catch (err) {
    console.error('Erreur wallet:', err);
    res.status(500).json({
      message: '❌ Erreur Google Wallet',
      error: err.message
    });
  }
});

// Sauvegarder token FCM
router.post('/fcm-token', verifyToken, async (req, res) => {
  const { token } = req.body;
  const client_id = req.user.id;

  if (!token || typeof token !== 'string') {
    return res.status(400).json({
      message: '❌ Token FCM invalide ou manquant',
      error: 'Le champ token est requis et doit être une chaîne de caractères.'
    });
  }

  try {
    const clientResult = await pool.query(
      'SELECT id FROM clients WHERE id = $1',
      [client_id]
    );

    if (clientResult.rows.length === 0) {
      return res.status(404).json({
        message: '❌ Client introuvable',
        error: 'Impossible de trouver le client associé au token JWT.'
      });
    }

    console.log('📱 Enregistrement token FCM pour client:', client_id);

    await pool.query(
      `INSERT INTO fcm_tokens (client_id, token)
       VALUES ($1, $2)
       ON CONFLICT (client_id, token) DO NOTHING`,
      [client_id, token]
    );

    console.log('✅ Token FCM enregistré pour client:', client_id);
    res.json({ message: '✅ Token FCM sauvegardé' });
  } catch (err) {
    console.error('❌ Erreur FCM token:', err.message);
    console.error(err.stack);
    res.status(500).json({ message: '❌ Erreur', error: err.message });
  }
});

module.exports = router;
