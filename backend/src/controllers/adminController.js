const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Connexion Admin
const connecterAdmin = async (req, res) => {
  const { email, mot_de_passe } = req.body;

  try {
    // Admin hardcodé pour l'instant
    const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@fidelisation.com';
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123456';

    if (email !== ADMIN_EMAIL || mot_de_passe !== ADMIN_PASSWORD) {
      return res.status(400).json({ message: '❌ Identifiants incorrects' });
    }

    const token = jwt.sign(
      { id: 0, role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: '✅ Connexion admin réussie !',
      token,
      admin: { email: ADMIN_EMAIL, role: 'admin' }
    });

  } catch (err) {
    res.status(500).json({ message: '❌ Erreur serveur', error: err.message });
  }
};

// Liste toutes les entreprises
const getEntreprises = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT e.id, e.nom, e.email, e.telephone, e.secteur,
              e.adresse, e.plan_abonnement, e.created_at,
              COUNT(DISTINCT t.client_id) as total_clients,
              COUNT(t.id) as total_transactions,
              COALESCE(SUM(t.montant), 0) as chiffre_affaires
       FROM entreprises e
       LEFT JOIN transactions t ON e.id = t.entreprise_id
       GROUP BY e.id
       ORDER BY e.created_at DESC`
    );

    res.json({
      total: result.rows.length,
      entreprises: result.rows
    });

  } catch (err) {
    res.status(500).json({ message: '❌ Erreur serveur', error: err.message });
  }
};

// Liste tous les clients
const getAllClients = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT c.id, c.nom, c.prenom, c.email, c.telephone,
              c.qr_code, c.points_total, c.created_at,
              COUNT(t.id) as total_transactions
       FROM clients c
       LEFT JOIN transactions t ON c.id = t.client_id
       GROUP BY c.id
       ORDER BY c.created_at DESC`
    );

    res.json({
      total: result.rows.length,
      clients: result.rows
    });

  } catch (err) {
    res.status(500).json({ message: '❌ Erreur serveur', error: err.message });
  }
};

// Statistiques globales
const getStatsGlobales = async (req, res) => {
  try {
    const entreprisesCount = await pool.query(
      'SELECT COUNT(*) as total FROM entreprises'
    );
    const clientsCount = await pool.query(
      'SELECT COUNT(*) as total FROM clients'
    );
    const transactionsCount = await pool.query(
      `SELECT COUNT(*) as total,
              COALESCE(SUM(montant), 0) as chiffre_affaires,
              COALESCE(SUM(points_gagnes), 0) as total_points
       FROM transactions`
    );
    const campagnesCount = await pool.query(
      'SELECT COUNT(*) as total FROM campagnes'
    );

    // Évolution des 7 derniers jours
    const evolution = await pool.query(
      `SELECT DATE(created_at) as date,
              COUNT(*) as transactions,
              SUM(montant) as montant
       FROM transactions
       WHERE created_at >= NOW() - INTERVAL '7 days'
       GROUP BY DATE(created_at)
       ORDER BY date ASC`
    );

    res.json({
      statistiques: {
        total_entreprises: parseInt(entreprisesCount.rows[0].total),
        total_clients: parseInt(clientsCount.rows[0].total),
        total_transactions: parseInt(transactionsCount.rows[0].total),
        chiffre_affaires: parseFloat(transactionsCount.rows[0].chiffre_affaires),
        total_points: parseInt(transactionsCount.rows[0].total_points),
        total_campagnes: parseInt(campagnesCount.rows[0].total)
      },
      evolution: evolution.rows
    });

  } catch (err) {
    res.status(500).json({ message: '❌ Erreur serveur', error: err.message });
  }
};

// Supprimer une entreprise
const supprimerEntreprise = async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query('DELETE FROM campagnes WHERE entreprise_id = $1', [id]);
    await pool.query('DELETE FROM transactions WHERE entreprise_id = $1', [id]);
    await pool.query('DELETE FROM entreprises WHERE id = $1', [id]);

    res.json({ message: '✅ Entreprise supprimée !' });

  } catch (err) {
    res.status(500).json({ message: '❌ Erreur serveur', error: err.message });
  }
};

module.exports = {
  connecterAdmin,
  getEntreprises,
  getAllClients,
  getStatsGlobales,
  supprimerEntreprise
};