const pool = require('../config/db');

const getDashboardEntreprise = async (req, res) => {
  const entreprise_id = req.user.id;

  try {
    // 1. Total des clients uniques
    const clientsResult = await pool.query(
      `SELECT COUNT(DISTINCT client_id) as total_clients
       FROM transactions
       WHERE entreprise_id = $1`,
      [entreprise_id]
    );

    // 2. Total des transactions
    const transactionsResult = await pool.query(
      `SELECT COUNT(*) as total_transactions,
              SUM(montant) as chiffre_affaires,
              SUM(points_gagnes) as total_points_distribues
       FROM transactions
       WHERE entreprise_id = $1`,
      [entreprise_id]
    );

    // 3. Transactions des 7 derniers jours
    const semainResult = await pool.query(
      `SELECT DATE(created_at) as date,
              COUNT(*) as nombre_transactions,
              SUM(montant) as total_montant
       FROM transactions
       WHERE entreprise_id = $1
       AND created_at >= NOW() - INTERVAL '7 days'
       GROUP BY DATE(created_at)
       ORDER BY date ASC`,
      [entreprise_id]
    );

    // 4. Top 5 clients les plus fidèles
    const topClientsResult = await pool.query(
      `SELECT c.nom, c.prenom, c.qr_code,
              COUNT(t.id) as nombre_achats,
              SUM(t.montant) as total_depense,
              c.points_total
       FROM transactions t
       JOIN clients c ON t.client_id = c.id
       WHERE t.entreprise_id = $1
       GROUP BY c.id, c.nom, c.prenom, c.qr_code, c.points_total
       ORDER BY total_depense DESC
       LIMIT 5`,
      [entreprise_id]
    );

    // 5. Transactions récentes
    const recentsResult = await pool.query(
      `SELECT t.id, t.montant, t.points_gagnes, t.type_achat, t.created_at,
              c.nom, c.prenom
       FROM transactions t
       JOIN clients c ON t.client_id = c.id
       WHERE t.entreprise_id = $1
       ORDER BY t.created_at DESC
       LIMIT 10`,
      [entreprise_id]
    );

    res.json({
      statistiques: {
        total_clients: parseInt(clientsResult.rows[0].total_clients),
        total_transactions: parseInt(transactionsResult.rows[0].total_transactions),
        chiffre_affaires: parseFloat(transactionsResult.rows[0].chiffre_affaires) || 0,
        total_points_distribues: parseInt(transactionsResult.rows[0].total_points_distribues) || 0
      },
      graphique_semaine: semainResult.rows,
      top_clients: topClientsResult.rows,
      transactions_recentes: recentsResult.rows
    });

  } catch (err) {
    res.status(500).json({ message: '❌ Erreur serveur', error: err.message });
  }
};



// Passages quotidiens des clients
const getPassagesQuotidiens = async (req, res) => {
  const entreprise_id = req.user.id;

  try {
    const result = await pool.query(
      `SELECT 
        DATE(t.created_at) as date,
        COUNT(*) as nombre_passages,
        COUNT(DISTINCT t.client_id) as clients_uniques,
        SUM(t.montant) as total_montant,
        SUM(t.points_gagnes) as total_points
       FROM transactions t
       WHERE t.entreprise_id = $1
       AND t.created_at >= NOW() - INTERVAL '30 days'
       GROUP BY DATE(t.created_at)
       ORDER BY date DESC`,
      [entreprise_id]
    );

    // Passages aujourd'hui
    const aujourdhui = await pool.query(
      `SELECT 
        COUNT(*) as passages_aujourdhui,
        COUNT(DISTINCT client_id) as clients_aujourdhui,
        COALESCE(SUM(montant), 0) as montant_aujourdhui
       FROM transactions
       WHERE entreprise_id = $1
       AND DATE(created_at) = CURRENT_DATE`,
      [entreprise_id]
    );

    res.json({
      aujourdhui: aujourdhui.rows[0],
      historique_30_jours: result.rows
    });

  } catch (err) {
    res.status(500).json({ message: '❌ Erreur serveur', error: err.message });
  }
};

// Historique et traçabilité complets
const getHistoriqueComplet = async (req, res) => {
  const entreprise_id = req.user.id;
  const { page = 1, limit = 20, client_id, date_debut, date_fin } = req.query;
  const offset = (page - 1) * limit;

  try {
    let whereClause = 'WHERE t.entreprise_id = $1';
      const params = [entreprise_id];
      let paramIndex = 2;

    if (client_id) {
      whereClause += ` AND t.client_id = $${paramIndex}`;
      params.push(client_id);
      paramIndex++;
    }

    if (date_debut) {
      whereClause += ` AND DATE(t.created_at) >= $${paramIndex}`;
      params.push(date_debut);
      paramIndex++;
    }

    if (date_fin) {
      whereClause += ` AND DATE(t.created_at) <= $${paramIndex}`;
      params.push(date_fin);
      paramIndex++;
    }

    const result = await pool.query(
      `SELECT 
        t.id,
        t.montant,
        t.points_gagnes,
        t.type_achat,
        t.created_at,
        c.nom,
        c.prenom,
        c.telephone,
        c.email,
        c.qr_code,
        c.points_total
       FROM transactions t
       JOIN clients c ON t.client_id = c.id
       ${whereClause}
       ORDER BY t.created_at DESC
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...params, limit, offset]
    );

    const total = await pool.query(
      `SELECT COUNT(*) FROM transactions t ${whereClause}`,
      params
    );

    res.json({
      transactions: result.rows,
      total: parseInt(total.rows[0].count),
      page: parseInt(page, 10)
    });

  } catch (err) {
    res.status(500).json({ message: '❌ Erreur serveur', error: err.message });
  }
};

// QR Code de l'entreprise
const getQRCodeEntreprise = async (req, res) => {
  const entreprise_id = req.user.id;

  try {
    const result = await pool.query(
      'SELECT id, nom, secteur, adresse FROM entreprises WHERE id = $1',
      [entreprise_id]
    );

    const entreprise = result.rows[0];
    const qr_code = `ENT-${entreprise_id}-${entreprise.nom.replace(/\s/g, '').toUpperCase()}`;

    res.json({
      qr_code,
      entreprise: entreprise.nom,
      secteur: entreprise.secteur
    });

  } catch (err) {
    res.status(500).json({ message: '❌ Erreur serveur', error: err.message });
  }
};

module.exports = { 
  getDashboardEntreprise,
  getPassagesQuotidiens,
  getHistoriqueComplet,
  getQRCodeEntreprise
};
module.exports = { getDashboardEntreprise };