const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  },
  // Garder la connexion active
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000,
  connectionTimeoutMillis: 30000,
  idleTimeoutMillis: 30000,
  max: 10
});

// Reconnecter automatiquement
pool.on('error', (err) => {
  console.error('❌ Erreur pool PostgreSQL :', err.message);
});

// Tester la connexion
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Erreur de connexion DB :', err.message);
  } else {
    console.log('✅ Base de données connectée ! Heure serveur :', res.rows[0].now);
  }
});

module.exports = pool;