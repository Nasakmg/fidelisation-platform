const express = require('express');
const router = express.Router();
const {
  creerCampagne,
  getCampagnes,
  envoyerCampagne,
  supprimerCampagne
} = require('../controllers/campagneController');
const { verifyToken } = require('../middleware/auth');
router.post('/', verifyToken, creerCampagne);
router.get('/', verifyToken, getCampagnes);
router.post('/:id/envoyer', verifyToken, envoyerCampagne);
router.delete('/:id', verifyToken, supprimerCampagne);

module.exports = router;