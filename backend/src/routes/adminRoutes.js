const express = require('express');
const router = express.Router();
const {
  connecterAdmin,
  getStatsGlobales,
  getEntreprises,
  validerEntreprise,
  suspendreEntreprise,
  supprimerEntreprise,
  getAllClients,
  supprimerClientAdmin,
  getCampagnesGlobales,
  envoyerNotificationGlobale
} = require('../controllers/adminController');
const { verifyAdmin } = require('../middleware/auth');

router.post('/connexion', connecterAdmin);
router.get('/stats', verifyAdmin, getStatsGlobales);
router.get('/entreprises', verifyAdmin, getEntreprises);
router.put('/entreprises/:id/valider', verifyAdmin, validerEntreprise);
router.put('/entreprises/:id/suspendre', verifyAdmin, suspendreEntreprise);
router.delete('/entreprises/:id', verifyAdmin, supprimerEntreprise);
router.get('/clients', verifyAdmin, getAllClients);
router.delete('/clients/:id', verifyAdmin, supprimerClientAdmin);
router.get('/campagnes', verifyAdmin, getCampagnesGlobales);
router.post('/notification-globale', verifyAdmin, envoyerNotificationGlobale);
router.get('/fcm-tokens', verifyAdmin, async (req, res) => {
  const pool = require('../config/db');
  try {
    const result = await pool.query(`
      SELECT ft.*, c.nom, c.prenom, c.email
      FROM fcm_tokens ft
      JOIN clients c ON ft.client_id = c.id
    `);
    console.log('FCM Tokens:', result.rows);
    res.json({ total: result.rows.length, tokens: result.rows });
  } catch (err) {
    res.status(500).json({ message: '❌ Erreur', error: err.message });
  }
});

module.exports = router;