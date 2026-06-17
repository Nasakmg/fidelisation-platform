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
router.get('/campagnes', verifyAdmin, getCampagnesGlobales);
router.post('/notification-globale', verifyAdmin, envoyerNotificationGlobale);

module.exports = router;