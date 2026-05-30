const express = require('express');
const router = express.Router();
const { inscrireEntreprise, connecterEntreprise } = require('../controllers/entrepriseController');

router.post('/inscription', inscrireEntreprise);
router.post('/connexion', connecterEntreprise);

module.exports = router;