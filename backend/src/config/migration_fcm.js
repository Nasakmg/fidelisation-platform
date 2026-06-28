const pool = require('./db');

const addFCMTable = async () => {
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
    console.log('✅ Table fcm_tokens créée');
    process.exit(0);
  } catch (err) {
    console.error('❌ Erreur:', err.message);
    process.exit(1);
  }
};

addFCMTable();