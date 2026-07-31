const pool = require('./db');

const addDeviseColumn = async () => {
  try {
    await pool.query(`
      ALTER TABLE entreprises 
      ADD COLUMN IF NOT EXISTS pays VARCHAR(50) DEFAULT 'Sénégal',
      ADD COLUMN IF NOT EXISTS devise VARCHAR(10) DEFAULT 'XOF',
      ADD COLUMN IF NOT EXISTS symbole_devise VARCHAR(5) DEFAULT 'FCFA'
    `);
    console.log('✅ Colonnes devise ajoutées');
    process.exit(0);
  } catch (err) {
    console.error('❌ Erreur:', err.message);
    process.exit(1);
  }
};

addDeviseColumn();