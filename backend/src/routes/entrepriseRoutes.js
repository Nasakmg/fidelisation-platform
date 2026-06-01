const express = require('express');
const router = express.Router();
const { inscrireEntreprise, connecterEntreprise, getClients } = require('../controllers/entrepriseController');
const { verifyToken } = require('../middleware/auth');

router.post('/inscription', inscrireEntreprise);
router.post('/connexion', connecterEntreprise);
router.get('/clients', verifyToken, getClients);

module.exports = router;