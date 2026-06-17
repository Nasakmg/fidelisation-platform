const pool = require('./db');

const addStatutColumn = async () => {
  try {
    await pool.query(`
      ALTER TABLE entreprises 
      ADD COLUMN IF NOT EXISTS statut VARCHAR(50) DEFAULT 'en_attente'
    `);
    console.log('✅ Colonne statut ajoutée');

    // Les entreprises existantes sont déjà actives
    await pool.query(`
      UPDATE entreprises SET statut = 'actif' WHERE statut = 'en_attente'
    `);
    console.log('✅ Entreprises existantes mises à jour');

    process.exit(0);
  } catch (err) {
    console.error('❌ Erreur :', err.message);
    process.exit(1);
  }
};

addStatutColumn();