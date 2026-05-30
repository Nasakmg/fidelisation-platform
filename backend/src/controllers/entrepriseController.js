const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Inscription entreprise
const inscrireEntreprise = async (req, res) => {
  const { nom, email, telephone, mot_de_passe, secteur, adresse } = req.body;

  try {
    const existe = await pool.query(
      'SELECT id FROM entreprises WHERE email = $1', [email]
    );
    if (existe.rows.length > 0) {
      return res.status(400).json({ message: '❌ Email déjà utilisé' });
    }

    const hash = await bcrypt.hash(mot_de_passe, 10);

    const result = await pool.query(
      `INSERT INTO entreprises (nom, email, telephone, mot_de_passe, secteur, adresse)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, nom, email, secteur, plan_abonnement`,
      [nom, email, telephone, hash, secteur, adresse]
    );

    const entreprise = result.rows[0];

    const token = jwt.sign(
      { id: entreprise.id, role: 'entreprise' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: '✅ Entreprise créée avec succès !',
      token,
      entreprise
    });

  } catch (err) {
    res.status(500).json({ message: '❌ Erreur serveur', error: err.message });
  }
};

// Connexion entreprise
const connecterEntreprise = async (req, res) => {
  const { email, mot_de_passe } = req.body;

  try {
    const result = await pool.query(
      'SELECT * FROM entreprises WHERE email = $1', [email]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ message: '❌ Email ou mot de passe incorrect' });
    }

    const entreprise = result.rows[0];
    const valide = await bcrypt.compare(mot_de_passe, entreprise.mot_de_passe);

    if (!valide) {
      return res.status(400).json({ message: '❌ Email ou mot de passe incorrect' });
    }

    const token = jwt.sign(
      { id: entreprise.id, role: 'entreprise' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: '✅ Connexion réussie !',
      token,
      entreprise: {
        id: entreprise.id,
        nom: entreprise.nom,
        email: entreprise.email,
        secteur: entreprise.secteur,
        plan_abonnement: entreprise.plan_abonnement
      }
    });

  } catch (err) {
    res.status(500).json({ message: '❌ Erreur serveur', error: err.message });
  }
};

module.exports = { inscrireEntreprise, connecterEntreprise };