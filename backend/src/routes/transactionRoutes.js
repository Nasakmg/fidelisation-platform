const express = require('express');
const router = express.Router();
const {
  scannerQRCode,
  historiqueEntreprise,
  historiqueClient
} = require('../controllers/transactionController');
const { verifyToken } = require('../middleware/auth');

// Entreprise scanne le QR code d'un client
router.post('/scanner', verifyToken, scannerQRCode);

// Historique des transactions
router.get('/entreprise/historique', verifyToken, historiqueEntreprise);
router.get('/client/historique', verifyToken, historiqueClient);

module.exports = router;