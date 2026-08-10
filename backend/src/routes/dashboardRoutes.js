const express = require('express');
const router = express.Router();
const {
  getDashboardEntreprise,
  getPassagesQuotidiens,
  getHistoriqueComplet,
  getQRCodeEntreprise
} = require('../controllers/dashboardController');
const { getClients } = require('../controllers/entrepriseController');
const { verifyToken } = require('../middleware/auth');

router.get('/entreprise', verifyToken, getDashboardEntreprise);
router.get('/passages', verifyToken, getPassagesQuotidiens);
router.get('/historique', verifyToken, getHistoriqueComplet);
router.get('/qrcode-entreprise', verifyToken, getQRCodeEntreprise);
router.get('/clients', verifyToken, getClients);

module.exports = router;