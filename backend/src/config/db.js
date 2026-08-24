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

const ensureFcmTokensTable = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS fcm_tokens (
        id SERIAL PRIMARY KEY,
        client_id INTEGER REFERENCES clients(id) ON DELETE CASCADE,
        token TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(client_id, token)
      );
    `);
    console.log('✅ Table fcm_tokens vérifiée/créée');
  } catch (err) {
    console.error('❌ Erreur création table fcm_tokens :', err.message);
    throw err;
  }
};

// Reconnexion automatique
const connectWithRetry = async () => {
  try {
    await pool.query('SELECT NOW()');
    console.log('✅ Base de données connectée !');
    await ensureFcmTokensTable();
  } catch (err) {
    console.error('❌ Connexion DB échouée, nouvelle tentative dans 5s...');
    setTimeout(connectWithRetry, 5000);
  }
};

connectWithRetry();

// Ping automatique toutes les 5 minutes pour maintenir Supabase actif
setInterval(async () => {
  try {
    await pool.query('SELECT 1');
    console.log('✅ Ping Supabase OK');
  } catch (err) {
    console.error('❌ Ping Supabase échoué:', err.message);
  }
}, 5 * 60 * 1000);

module.exports = pool;