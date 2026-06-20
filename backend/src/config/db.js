const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000,
  connectionTimeoutMillis: 30000,
  idleTimeoutMillis: 30000,
  max: 5
});

pool.on('error', (err) => {
  console.error('❌ Erreur pool PostgreSQL :', err.message);
});

// Reconnexion automatique
const connectWithRetry = async () => {
  try {
    await pool.query('SELECT NOW()');
    console.log('✅ Base de données connectée !');
  } catch (err) {
    console.error('❌ Connexion DB échouée, nouvelle tentative dans 5s...');
    setTimeout(connectWithRetry, 5000);
  }
};

connectWithRetry();

module.exports = pool;