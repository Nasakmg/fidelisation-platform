const express = require('express');
const router = express.Router();
const { inscrireClient, connecterClient, profilClient } = require('../controllers/clientController');
const { verifyToken } = require('../middleware/auth');
const { genererLienWallet } = require('../config/googleWallet');

router.post('/inscription', inscrireClient);
router.post('/connexion', connecterClient);
router.get('/profil', verifyToken, profilClient);

// Route Google Wallet
router.get('/wallet', verifyToken, async (req, res) => {
  try {
    const pool = require('../config/db');
    const result = await pool.query(
      'SELECT * FROM clients WHERE id = $1',
      [req.user.id]
    );
    const client = result.rows[0];
    const lien = await genererLienWallet(client);
    res.json({ lien_wallet: lien });
  } catch (err) {
    res.status(500).json({ message: '❌ Erreur Google Wallet', error: err.message });
  }
});

// Sauvegarder token FCM
router.post('/fcm-token', verifyToken, async (req, res) => {
  const { token } = req.body;
  const client_id = req.user.id;
  try {
    await pool.query(
      `INSERT INTO fcm_tokens (client_id, token) 
       VALUES ($1, $2) 
       ON CONFLICT (client_id, token) DO NOTHING`,
      [client_id, token]
    );
    res.json({ message: '✅ Token FCM sauvegardé' });
  } catch (err) {
    res.status(500).json({ message: '❌ Erreur', error: err.message });
  }
});
module.exports = router;