const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const inscrireClient = async (req, res) => {
  const { nom, prenom, email, telephone, mot_de_passe, date_naissance, entreprise_qr } = req.body;

  try {
    console.log('Body reçu:', req.body);

    const existe = await pool.query(
      'SELECT id FROM clients WHERE email = $1 OR telephone = $2', [email, telephone]
    );
    if (existe.rows.length > 0) {
      return res.status(400).json({ message: '❌ Email ou téléphone déjà utilisé' });
    }

    const hash = await bcrypt.hash(String(mot_de_passe), 10);
    const qr_code = 'USR-' + crypto.randomBytes(6).toString('hex').toUpperCase();

    const result = await pool.query(
      `INSERT INTO clients (nom, prenom, email, telephone, mot_de_passe, qr_code, date_naissance)
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       RETURNING id, nom, prenom, email, qr_code, points_total`,
      [nom, prenom, email, telephone, hash, qr_code, date_naissance || null]
    );

    const client = result.rows[0];

    // Lier automatiquement le client à la boutique si QR boutique fourni
    if (entreprise_qr) {
      try {
        const parts = entreprise_qr.split('-');
        const entreprise_id = parts[1];
        if (entreprise_id) {
          await pool.query(
            `INSERT INTO client_entreprise (client_id, entreprise_id)
             VALUES ($1, $2) ON CONFLICT DO NOTHING`,
            [client.id, entreprise_id]
          );
          console.log(`✅ Client ${client.id} lié à l'entreprise ${entreprise_id}`);
        }
      } catch (err) {
        console.log('ℹ️ Liaison entreprise ignorée:', err.message);
      }
    }

    const token = jwt.sign(
      { id: client.id, role: 'client' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: '✅ Compte créé avec succès !',
      token,
      client
    });

  } catch (err) {
    res.status(500).json({ message: '❌ Erreur serveur', error: err.message });
  }
};

const connecterClient = async (req, res) => {
  const { email, mot_de_passe } = req.body;

  try {
    const result = await pool.query(
      'SELECT * FROM clients WHERE email = $1 OR telephone = $1', [email]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ message: '❌ Identifiants incorrects' });
    }

    const client = result.rows[0];
    const valide = await bcrypt.compare(mot_de_passe, client.mot_de_passe);

    if (!valide) {
      return res.status(400).json({ message: '❌ Identifiants incorrects' });
    }

    const token = jwt.sign(
      { id: client.id, role: 'client' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: '✅ Connexion réussie !',
      token,
      client: {
        id: client.id,
        nom: client.nom,
        prenom: client.prenom,
        email: client.email,
        qr_code: client.qr_code,
        points_total: client.points_total
      }
    });

  } catch (err) {
    res.status(500).json({ message: '❌ Erreur serveur', error: err.message });
  }
};

const profilClient = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT c.id, c.nom, c.prenom, c.email, c.telephone, 
              c.qr_code, c.points_total, c.created_at,
              array_agg(DISTINCT e.nom) FILTER (WHERE e.nom IS NOT NULL) as boutiques
       FROM clients c
       LEFT JOIN client_entreprise ce ON c.id = ce.client_id
       LEFT JOIN entreprises e ON ce.entreprise_id = e.id
       WHERE c.id = $1
       GROUP BY c.id`,
      [req.user.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: '❌ Erreur serveur', error: err.message });
  }
};

module.exports = { inscrireClient, connecterClient, profilClient };