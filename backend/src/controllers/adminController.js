const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Connexion Admin
const connecterAdmin = async (req, res) => {
  const { email, mot_de_passe } = req.body;
  try {
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

// Stats globales
const getStatsGlobales = async (req, res) => {
  try {
    const [entreprises, clients, transactions, campagnes, abonnements] = await Promise.all([
      pool.query('SELECT COUNT(*) as total FROM entreprises'),
      pool.query('SELECT COUNT(*) as total FROM clients'),
      pool.query(`SELECT COUNT(*) as total, COALESCE(SUM(montant), 0) as chiffre_affaires, COALESCE(SUM(points_gagnes), 0) as total_points FROM transactions`),
      pool.query('SELECT COUNT(*) as total FROM campagnes'),
      pool.query(`SELECT COUNT(*) as total FROM abonnements WHERE statut = 'actif'`)
    ]);

    // Stats quotidiennes entrées/sorties
    const quotidien = await pool.query(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as transactions,
        COUNT(DISTINCT client_id) as clients_uniques,
        SUM(montant) as montant_total,
        SUM(points_gagnes) as points_distribues
      FROM transactions
      WHERE created_at >= NOW() - INTERVAL '7 days'
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `);

    // Entreprises en attente de validation
    const enAttente = await pool.query(`
      SELECT COUNT(*) as total FROM entreprises WHERE statut = 'en_attente'
    `).catch(() => ({ rows: [{ total: 0 }] }));

    const evolution = await pool.query(`
      SELECT DATE(created_at) as date, COUNT(*) as transactions, SUM(montant) as montant
      FROM transactions
      WHERE created_at >= NOW() - INTERVAL '7 days'
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `);

    res.json({
      statistiques: {
        total_entreprises: parseInt(entreprises.rows[0].total),
        total_clients: parseInt(clients.rows[0].total),
        total_transactions: parseInt(transactions.rows[0].total),
        chiffre_affaires: parseFloat(transactions.rows[0].chiffre_affaires),
        total_points: parseInt(transactions.rows[0].total_points),
        total_campagnes: parseInt(campagnes.rows[0].total),
        abonnements_actifs: parseInt(abonnements.rows[0].total),
        entreprises_en_attente: parseInt(enAttente.rows[0].total)
      },
      stats_quotidiennes: quotidien.rows,
      evolution: evolution.rows
    });
  } catch (err) {
    res.status(500).json({ message: '❌ Erreur serveur', error: err.message });
  }
};

// Liste toutes les entreprises avec statut
const getEntreprises = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT e.id, e.nom, e.email, e.telephone, e.secteur,
             e.adresse, e.plan_abonnement, e.created_at,
             COALESCE(e.statut, 'actif') as statut,
             COUNT(DISTINCT t.client_id) as total_clients,
             COUNT(t.id) as total_transactions,
             COALESCE(SUM(t.montant), 0) as chiffre_affaires,
             a.statut as abonnement_statut,
             a.date_fin as abonnement_fin,
             p.nom as plan_nom
      FROM entreprises e
      LEFT JOIN transactions t ON e.id = t.entreprise_id
      LEFT JOIN abonnements a ON e.id = a.entreprise_id
      LEFT JOIN plans p ON a.plan_id = p.id
      GROUP BY e.id, a.statut, a.date_fin, p.nom
      ORDER BY e.created_at DESC
    `);

    res.json({
      total: result.rows.length,
      entreprises: result.rows
    });
  } catch (err) {
    res.status(500).json({ message: '❌ Erreur serveur', error: err.message });
  }
};

// Valider une entreprise
const validerEntreprise = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query(
      `UPDATE entreprises SET statut = 'actif' WHERE id = $1`,
      [id]
    );
    res.json({ message: '✅ Entreprise validée !' });
  } catch (err) {
    res.status(500).json({ message: '❌ Erreur serveur', error: err.message });
  }
};

// Suspendre une entreprise
const suspendreEntreprise = async (req, res) => {
  const { id } = req.params;
  const { raison } = req.body;
  try {
    await pool.query(
      `UPDATE entreprises SET statut = 'suspendu' WHERE id = $1`,
      [id]
    );
    res.json({ message: '✅ Entreprise suspendue !' });
  } catch (err) {
    res.status(500).json({ message: '❌ Erreur serveur', error: err.message });
  }
};

// Supprimer une entreprise
const supprimerEntreprise = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM notifications WHERE client_id IN (SELECT DISTINCT client_id FROM transactions WHERE entreprise_id = $1)', [id]);
    await pool.query('DELETE FROM campagnes WHERE entreprise_id = $1', [id]);
    await pool.query('DELETE FROM transactions WHERE entreprise_id = $1', [id]);
    await pool.query('DELETE FROM abonnements WHERE entreprise_id = $1', [id]);
    await pool.query('DELETE FROM entreprises WHERE id = $1', [id]);
    res.json({ message: '✅ Entreprise supprimée !' });
  } catch (err) {
    res.status(500).json({ message: '❌ Erreur serveur', error: err.message });
  }
};

// Tous les clients
const getAllClients = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT c.id, c.nom, c.prenom, c.email, c.telephone,
             c.qr_code, c.points_total, c.created_at,
             COUNT(t.id) as total_transactions,
             COALESCE(SUM(t.montant), 0) as total_depense
      FROM clients c
      LEFT JOIN transactions t ON c.id = t.client_id
      GROUP BY c.id
      ORDER BY c.created_at DESC
    `);

    res.json({
      total: result.rows.length,
      clients: result.rows
    });
  } catch (err) {
    res.status(500).json({ message: '❌ Erreur serveur', error: err.message });
  }
};

// Campagnes globales admin
const getCampagnesGlobales = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT c.*, e.nom as entreprise_nom, e.secteur
      FROM campagnes c
      JOIN entreprises e ON c.entreprise_id = e.id
      ORDER BY c.created_at DESC
      LIMIT 50
    `);

    res.json({
      total: result.rows.length,
      campagnes: result.rows
    });
  } catch (err) {
    res.status(500).json({ message: '❌ Erreur serveur', error: err.message });
  }
};

// Envoyer notification globale à tous les clients
const envoyerNotificationGlobale = async (req, res) => {
  const { message, canal } = req.body;
  try {
    const clients = await pool.query('SELECT id FROM clients');

    for (const client of clients.rows) {
      await pool.query(
        `INSERT INTO notifications (client_id, message, canal, statut)
         VALUES ($1, $2, $3, 'envoyé')`,
        [client.id, message, canal]
      );
    }

    res.json({
      message: `✅ Notification envoyée à ${clients.rows.length} client(s) !`,
      nombre: clients.rows.length
    });
  } catch (err) {
    res.status(500).json({ message: '❌ Erreur serveur', error: err.message });
  }
};

module.exports = {
  connecterAdmin,
  getStatsGlobales,
  getEntreprises,
  validerEntreprise,
  suspendreEntreprise,
  supprimerEntreprise,
  getAllClients,
  getCampagnesGlobales,
  envoyerNotificationGlobale
};