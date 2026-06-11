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

module.exports = router;