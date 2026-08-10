const express = require('express');
const cors = require('cors');
require('dotenv').config();

const pool = require('./config/db');
const clientRoutes = require('./routes/clientRoutes');
const entrepriseRoutes = require('./routes/entrepriseRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const campagneRoutes = require('./routes/campagneRoutes');
const adminRoutes = require('./routes/adminRoutes');
const { creerClasseCarte } = require('./config/googleWallet');
const abonnementRoutes = require('./routes/abonnementRoutes');
const { initAdmin } = require('./config/firebaseAdmin');



const app = express();
const PORT = process.env.PORT || 5000;

// Middleware - ordre important !
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/clients', clientRoutes);
app.use('/api/entreprises', entrepriseRoutes);
app.use('/api/transactions', transactionRoutes);

// Route de test
app.get('/', (req, res) => {
  res.json({ message: '🚀 API Fidélisation opérationnelle !' });
});

app.get('/api/debug/db', async (req, res) => {
  try {
    const pool = require('./config/db');
    const result = await pool.query('SELECT 1 as ok');
    const tableInfo = await pool.query(
      `SELECT to_regclass('public.fcm_tokens') as fcm_tokens_table`);
    res.json({
      message: '✅ DB accessible',
      db_ok: result.rows[0].ok,
      fcm_tokens_table: tableInfo.rows[0].fcm_tokens_table
    });
  } catch (err) {
    console.error('❌ Erreur debug DB:', err.message);
    console.error(err.stack);
    res.status(500).json({ message: '❌ Erreur DB', error: err.message });
  }
});

app.get('/api/debug/firebase', (req, res) => {
  const missing = [];
  if (!process.env.FIREBASE_PROJECT_ID) missing.push('FIREBASE_PROJECT_ID');
  if (!process.env.FIREBASE_CLIENT_EMAIL) missing.push('FIREBASE_CLIENT_EMAIL');
  if (!process.env.FIREBASE_PRIVATE_KEY) missing.push('FIREBASE_PRIVATE_KEY');

  if (missing.length > 0) {
    return res.status(500).json({
      message: '❌ Variables Firebase manquantes',
      missing
    });
  }

  const adminInstance = initAdmin();
  if (!adminInstance) {
    return res.status(500).json({
      message: '❌ Impossible d\'initialiser Firebase Admin',
      details: 'Vérifiez les variables d\'environnement Firebase et le format de FIREBASE_PRIVATE_KEY'
    });
  }

  return res.json({
    message: '✅ Firebase Admin initialisé',
    projectId: process.env.FIREBASE_PROJECT_ID
  });
});

app.get('/api/debug/fcm-tokens', async (req, res) => {
  try {
    const totalTokens = await pool.query('SELECT COUNT(*) AS total FROM fcm_tokens');
    const byClient = await pool.query(
      `SELECT client_id, COUNT(*) AS token_count
       FROM fcm_tokens
       GROUP BY client_id
       ORDER BY token_count DESC
       LIMIT 50`
    );

    return res.json({
      message: '✅ Debug FCM tokens',
      total_tokens: Number(totalTokens.rows[0].total),
      tokens_by_client: byClient.rows
    });
  } catch (err) {
    console.error('❌ Erreur debug FCM tokens:', err.message);
    res.status(500).json({ message: '❌ Erreur debug FCM tokens', error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Serveur démarré sur le port ${PORT}`);
});
app.use('/api/dashboard', dashboardRoutes);

app.use('/api/campagnes', campagneRoutes);

app.use('/api/admin', adminRoutes);

app.use('/api/abonnements', abonnementRoutes);

creerClasseCarte();