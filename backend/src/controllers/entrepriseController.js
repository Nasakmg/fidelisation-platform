const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Inscription entreprise
const inscrireEntreprise = async (req, res) => {
  const { nom, email, telephone, mot_de_passe, secteur, adresse, pays } = req.body;
  
  // Déterminer la devise selon le pays
  const { getDevise } = require('../config/devises');
  const deviseInfo = getDevise(pays || 'Sénégal');

  try {
    const existe = await pool.query(
      'SELECT id FROM entreprises WHERE email = $1', [email]
    );
    if (existe.rows.length > 0) {
      return res.status(400).json({ message: '❌ Email déjà utilisé' });
    }

    const hash = await bcrypt.hash(String(mot_de_passe), 10);

    const result = await pool.query(
      `INSERT INTO entreprises (nom, email, telephone, mot_de_passe, secteur, adresse, pays, devise, symbole_devise)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
       RETURNING id, nom, email, secteur, plan_abonnement, pays, devise, symbole_devise`,
      [nom, email, telephone, hash, secteur, adresse, 
       pays || 'Sénégal', deviseInfo.code, deviseInfo.symbole]
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
  const emailNormalise = String(email || '').trim().toLowerCase();

  try {
    if (!emailNormalise || !mot_de_passe) {
      return res.status(400).json({ message: '❌ Email et mot de passe requis' });
    }

    const result = await pool.query(
      'SELECT * FROM entreprises WHERE LOWER(TRIM(email)) = $1', [emailNormalise]
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
        plan_abonnement: entreprise.plan_abonnement,
        pays: entreprise.pays,
        devise: entreprise.devise,
        symbole_devise: entreprise.symbole_devise
      }
    });

  } catch (err) {
    res.status(500).json({ message: '❌ Erreur serveur', error: err.message });
  }
};

// Liste des clients de l'entreprise
const getClients = async (req, res) => {
  const entreprise_id = req.user.id;

  try {
    const result = await pool.query(
      `SELECT DISTINCT c.id, c.nom, c.prenom, c.email, c.telephone,
              c.qr_code, c.points_total, c.created_at,
              COUNT(t.id) as nombre_achats,
              SUM(t.montant) as total_depense,
              MAX(t.created_at) as dernier_achat
       FROM clients c
       JOIN transactions t ON c.id = t.client_id
       WHERE t.entreprise_id = $1
       GROUP BY c.id
       ORDER BY total_depense DESC`,
      [entreprise_id]
    );

    res.json({
      total: result.rows.length,
      clients: result.rows
    });

  } catch (err) {
    res.status(500).json({ message: '❌ Erreur serveur', error: err.message });
  }
};

module.exports = { inscrireEntreprise, connecterEntreprise, getClients };

