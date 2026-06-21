const express = require('express');
const router = express.Router();
const {
  getPlans,
  getMonAbonnement,
  initierPaiement,
  webhookCinetPay
} = require('../controllers/abonnementController');
const { verifyToken } = require('../middleware/auth');

router.get('/plans', getPlans);
router.get('/mon-abonnement', verifyToken, getMonAbonnement);
router.post('/paiement', verifyToken, initierPaiement);
router.post('/webhook', webhookCinetPay);

// Infos boutique par QR code (public)
router.get('/boutique-info', async (req, res) => {
  const { qr } = req.query;
  try {
    // Extraire l'ID entreprise du QR code (ENT-1-BOUTIQUEDAKARMODE)
    const parts = qr.split('-');
    const entreprise_id = parts[1];

    const pool = require('../config/db');
    const result = await pool.query(
      'SELECT id, nom, secteur, adresse FROM entreprises WHERE id = $1',
      [entreprise_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Boutique introuvable' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: '❌ Erreur', error: err.message });
  }
});

module.exports = router;