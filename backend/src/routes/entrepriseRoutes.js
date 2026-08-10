const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { inscrireEntreprise, connecterEntreprise, getClients, supprimerClientEntreprise } = require('../controllers/entrepriseController');
const { verifyToken } = require('../middleware/auth');

router.post('/inscription', inscrireEntreprise);
router.post('/connexion', connecterEntreprise);
router.get('/clients', verifyToken, getClients);
router.delete('/clients/:id', verifyToken, supprimerClientEntreprise);

// Lier tous les clients existants à l'entreprise manuellement
router.post('/lier-clients', verifyToken, async (req, res) => {
  const entreprise_id = req.user.id;
  const pool = require('../config/db');
  
  try {
    const result = await pool.query(
      `INSERT INTO client_entreprise (client_id, entreprise_id)
       SELECT DISTINCT client_id, $1::integer 
       FROM transactions 
       WHERE entreprise_id = $1::integer
       ON CONFLICT DO NOTHING
       RETURNING client_id`,
      [entreprise_id]
    );
    
    console.log(`✅ ${result.rows.length} clients liés`);
    res.json({ 
      message: `✅ ${result.rows.length} clients liés !`,
      clients: result.rows 
    });
  } catch (err) {
    console.error('❌ Erreur:', err.message);
    res.status(500).json({ message: '❌ Erreur', error: err.message });
  }
});
module.exports = router;