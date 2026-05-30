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

module.exports = { getDashboardEntreprise };