const pool = require('./db');

const migrate = async () => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    await client.query(`
      ALTER TABLE clients
      ADD COLUMN IF NOT EXISTS mode_connexion VARCHAR(20) NOT NULL DEFAULT 'email'
    `);
    await client.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1
          FROM pg_constraint
          WHERE conname = 'clients_mode_connexion_check'
            AND conrelid = 'clients'::regclass
        ) THEN
          ALTER TABLE clients
          ADD CONSTRAINT clients_mode_connexion_check
          CHECK (mode_connexion IN ('email', 'telephone'));
        END IF;
      END $$
    `);
    await client.query(`
      ALTER TABLE entreprises
      ADD COLUMN IF NOT EXISTS notification_icon TEXT
    `);
    await client.query(`
      ALTER TABLE notifications
      ADD COLUMN IF NOT EXISTS campagne_id INTEGER
      REFERENCES campagnes(id) ON DELETE SET NULL
    `);
    await client.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS notifications_campaign_client_channel_unique
      ON notifications (campagne_id, client_id, canal)
      WHERE campagne_id IS NOT NULL
    `);
    await client.query('COMMIT');
    console.log('Migration de routage des campagnes terminée.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Échec migration de routage des campagnes:', err.message);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
    process.exit(process.exitCode || 0);
  }
};

migrate();