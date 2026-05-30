const express = require('express');
const router = express.Router();
const { getDashboardEntreprise } = require('../controllers/dashboardController');
const verifyToken = require('../middleware/auth');

router.get('/entreprise', verifyToken, getDashboardEntreprise);

module.exports = router;