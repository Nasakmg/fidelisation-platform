const express = require('express');
const router = express.Router();
const {
  connecterAdmin,
  getEntreprises,
  getAllClients,
  getStatsGlobales,
  supprimerEntreprise
} = require('../controllers/adminController');
const { verifyAdmin } = require('../middleware/auth');

router.post('/connexion', connecterAdmin);
router.get('/stats', verifyAdmin, getStatsGlobales);
router.get('/entreprises', verifyAdmin, getEntreprises);
router.get('/clients', verifyAdmin, getAllClients);
router.delete('/entreprises/:id', verifyAdmin, supprimerEntreprise);

module.exports = router;