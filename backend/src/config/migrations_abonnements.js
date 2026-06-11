const pool = require('./db');

const createAbonnementsTables = async () => {
  try {

    // Table des plans
    await pool.query(`
      CREATE TABLE IF NOT EXISTS plans (
        id SERIAL PRIMARY KEY,
        nom VARCHAR(50) NOT NULL,
        prix_mensuel INTEGER NOT NULL,
        prix_trimestriel INTEGER NOT NULL,
        prix_annuel INTEGER NOT NULL,
        max_clients INTEGER DEFAULT -1,
        max_campagnes INTEGER DEFAULT -1,
        features JSONB,
        actif BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅ Table plans créée');

    // Table des abonnements
    await pool.query(`
      CREATE TABLE IF NOT EXISTS abonnements (
        id SERIAL PRIMARY KEY,
        entreprise_id INTEGER REFERENCES entreprises(id),
        plan_id INTEGER REFERENCES plans(id),
        statut VARCHAR(50) DEFAULT 'trial',
        frequence VARCHAR(20) DEFAULT 'mensuel',
        date_debut TIMESTAMP DEFAULT NOW(),
        date_fin TIMESTAMP,
        date_renouvellement TIMESTAMP,
        montant_paye INTEGER,
        transaction_id VARCHAR(255),
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅ Table abonnements créée');

    // Table des paiements
    await pool.query(`
      CREATE TABLE IF NOT EXISTS paiements (
        id SERIAL PRIMARY KEY,
        entreprise_id INTEGER REFERENCES entreprises(id),
        abonnement_id INTEGER REFERENCES abonnements(id),
        montant INTEGER NOT NULL,
        devise VARCHAR(10) DEFAULT 'XOF',
        statut VARCHAR(50) DEFAULT 'en_attente',
        transaction_id VARCHAR(255),
        methode VARCHAR(50),
        cinetpay_data JSONB,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅ Table paiements créée');

    // Insérer les plans par défaut
    await pool.query(`
      INSERT INTO plans (nom, prix_mensuel, prix_trimestriel, prix_annuel, max_clients, max_campagnes, features)
      VALUES 
        ('Starter', 15000, 40000, 144000, 500, 10, '{"sms": true, "email": true, "wallet": false, "api": false}'),
        ('Business', 35000, 95000, 336000, 2000, -1, '{"sms": true, "email": true, "wallet": true, "api": false}'),
        ('Enterprise', 75000, 200000, 720000, -1, -1, '{"sms": true, "email": true, "wallet": true, "api": true}')
      ON CONFLICT DO NOTHING;
    `);
    console.log('✅ Plans insérés');

    // Ajouter trial pour les entreprises existantes
    await pool.query(`
      INSERT INTO abonnements (entreprise_id, plan_id, statut, date_fin)
      SELECT e.id, p.id, 'trial', NOW() + INTERVAL '14 days'
      FROM entreprises e
      CROSS JOIN plans p
      WHERE p.nom = 'Starter'
      AND NOT EXISTS (
        SELECT 1 FROM abonnements a WHERE a.entreprise_id = e.id
      );
    `);
    console.log('✅ Trials créés pour les entreprises existantes');

    console.log('🎉 Migration abonnements terminée !');
    process.exit(0);

  } catch (err) {
    console.error('❌ Erreur :', err.message);
    process.exit(1);
  }
};

createAbonnementsTables();