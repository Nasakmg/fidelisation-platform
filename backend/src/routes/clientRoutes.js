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

module.exports = router;