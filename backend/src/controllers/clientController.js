const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// Inscription client
const inscrireClient = async (req, res) => {
  const { nom, prenom, email, telephone, mot_de_passe, date_naissance } = req.body;

  try {
    // Vérifier si email existe déjà
    const existe = await pool.query(
      'SELECT id FROM clients WHERE email = $1', [email]
    );
    if (existe.rows.length > 0) {
      return res.status(400).json({ message: '❌ Email déjà utilisé' });
    }

    // Hasher le mot de passe
    const hash = await bcrypt.hash(String(mot_de_passe), 10);

    // Générer QR code unique
    const qr_code = 'USR-' + crypto.randomBytes(6).toString('hex').toUpperCase();

    // Insérer le client
    const result = await pool.query(
      `INSERT INTO clients (nom, prenom, email, telephone, mot_de_passe, qr_code, date_naissance)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, nom, prenom, email, qr_code, points_total`,
      [nom, prenom, email, telephone, hash, qr_code, date_naissance]
    );

    const client = result.rows[0];

    // Générer le token JWT
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

// Connexion client
const connecterClient = async (req, res) => {
  const { email, mot_de_passe } = req.body;

  try {
    const result = await pool.query(
      'SELECT * FROM clients WHERE email = $1', [email]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ message: '❌ Email ou mot de passe incorrect' });
    }

    const client = result.rows[0];
    const valide = await bcrypt.compare(mot_de_passe, client.mot_de_passe);

    if (!valide) {
      return res.status(400).json({ message: '❌ Email ou mot de passe incorrect' });
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

// Profil client (route protégée)
const profilClient = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, nom, prenom, email, telephone, qr_code, points_total, created_at FROM clients WHERE id = $1',
      [req.user.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: '❌ Erreur serveur', error: err.message });
  }
};

module.exports = { inscrireClient, connecterClient, profilClient };