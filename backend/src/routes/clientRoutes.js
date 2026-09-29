const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { 
  inscrireClient, 
  connecterClient, 
  lierClientBoutique,
  profilClient, 
  genererLienWallet 
} = require('../controllers/clientController');
const { verifyToken } = require('../middleware/auth');

// Routes d'authentification et profil
router.post('/inscription', inscrireClient);
router.post('/connexion', connecterClient);
router.post('/boutique/liaison', verifyToken, lierClientBoutique);
router.get('/profil', verifyToken, profilClient);

// Route Google Wallet : autorise POST et GET pour éviter tout conflit
router.post('/wallet', verifyToken, genererLienWallet);
router.get('/wallet', verifyToken, genererLienWallet);

// Sauvegarder token FCM
router.post('/fcm-token', verifyToken, async (req, res) => {
  const { token } = req.body;
  const client_id = req.user.id;

  if (req.user?.role !== 'client') {
    return res.status(403).json({ message: '❌ Route réservée aux clients' });
  }

  if (!token || typeof token !== 'string' || !token.trim()) {
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

    const insertResult = await pool.query(
      `INSERT INTO fcm_tokens (client_id, token)
       VALUES ($1, $2)
       ON CONFLICT (client_id, token) DO NOTHING
       RETURNING id`,
      [client_id, token.trim()]
    );

    const countResult = await pool.query(
      'SELECT COUNT(*)::integer AS total FROM fcm_tokens WHERE client_id = $1',
      [client_id]
    );
    console.log(`✅ Token FCM ${insertResult.rows.length ? 'enregistré' : 'déjà présent'} pour client ${client_id}`);
    res.json({
      message: '✅ Token FCM sauvegardé',
      enregistre: true,
      nouveau: insertResult.rows.length > 0,
      nombre_tokens_client: countResult.rows[0].total
    });
  } catch (err) {
    console.error('❌ Erreur FCM token:', err.message);
    console.error(err.stack);
    res.status(500).json({ message: '❌ Erreur', error: err.message });
  }
});

module.exports = router;