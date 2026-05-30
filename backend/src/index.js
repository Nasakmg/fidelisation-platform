const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
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