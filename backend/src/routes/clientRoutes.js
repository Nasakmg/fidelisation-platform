const express = require('express');
const router = express.Router();
const { inscrireClient, connecterClient, profilClient } = require('../controllers/clientController');
const verifyToken = require('../middleware/auth');

router.post('/inscription', inscrireClient);
router.post('/connexion', connecterClient);
router.get('/profil', verifyToken, profilClient);

module.exports = router;