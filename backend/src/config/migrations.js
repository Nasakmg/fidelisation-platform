const pool = require('./db');

const createTables = async () => {
  try {
    // Table des clients
    await pool.query(`
      CREATE TABLE IF NOT EXISTS clients (
        id SERIAL PRIMARY KEY,
        nom VARCHAR(100) NOT NULL,
        prenom VARCHAR(100) NOT NULL,
        email VARCHAR(150) UNIQUE NOT NULL,
        telephone VARCHAR(20) UNIQUE NOT NULL,
        mot_de_passe VARCHAR(255) NOT NULL,
        qr_code VARCHAR(255) UNIQUE,
        points_total INTEGER DEFAULT 0,
        date_naissance DATE,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅ Table clients créée');

    // Table des entreprises
    await pool.query(`
      CREATE TABLE IF NOT EXISTS entreprises (
        id SERIAL PRIMARY KEY,
        nom VARCHAR(150) NOT NULL,
        email VARCHAR(150) UNIQUE NOT NULL,
        telephone VARCHAR(20),
        mot_de_passe VARCHAR(255) NOT NULL,
        secteur VARCHAR(100),
        adresse TEXT,
        logo VARCHAR(255),
        plan_abonnement VARCHAR(50) DEFAULT 'starter',
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅ Table entreprises créée');

    // Table des transactions
    await pool.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id SERIAL PRIMARY KEY,
        client_id INTEGER REFERENCES clients(id),
        entreprise_id INTEGER REFERENCES entreprises(id),
        montant DECIMAL(10,2) NOT NULL,
        points_gagnes INTEGER NOT NULL,
        type_achat VARCHAR(100),
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅ Table transactions créée');

    // Table des campagnes
    await pool.query(`
      CREATE TABLE IF NOT EXISTS campagnes (
        id SERIAL PRIMARY KEY,
        entreprise_id INTEGER REFERENCES entreprises(id),
        titre VARCHAR(200) NOT NULL,
        message TEXT NOT NULL,
        canal VARCHAR(50) NOT NULL,
        statut VARCHAR(50) DEFAULT 'brouillon',
        date_envoi TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅ Table campagnes créée');

    // Table des notifications
    await pool.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        client_id INTEGER REFERENCES clients(id),
        message TEXT NOT NULL,
        canal VARCHAR(50) NOT NULL,
        statut VARCHAR(50) DEFAULT 'envoyé',
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅ Table notifications créée');

    console.log('🎉 Toutes les tables sont créées avec succès !');
    process.exit(0);

  } catch (err) {
    console.error('❌ Erreur lors de la création des tables :', err.message);
    process.exit(1);
  }
};

createTables();