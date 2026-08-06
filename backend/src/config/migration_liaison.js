const pool = require('./db');

const addLiaisonTable = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS client_entreprise (
        id SERIAL PRIMARY KEY,
        client_id INTEGER REFERENCES clients(id) ON DELETE CASCADE,
        entreprise_id INTEGER REFERENCES entreprises(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(client_id, entreprise_id)
      );
    `);
    console.log('✅ Table client_entreprise créée');
    process.exit(0);
  } catch (err) {
    console.error('❌ Erreur:', err.message);
    process.exit(1);
  }
};

addLiaisonTable();