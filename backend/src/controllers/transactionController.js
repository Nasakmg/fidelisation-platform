const pool = require('../config/db');

// Scanner le QR code d'un client et ajouter des points
const scannerQRCode = async (req, res) => {
  const { qr_code, montant, type_achat } = req.body;
  const entreprise_id = req.user.id;

  try {
    // 1. Trouver le client via son QR code
    const clientResult = await pool.query(
      'SELECT * FROM clients WHERE qr_code = $1',
      [qr_code]
    );

    if (clientResult.rows.length === 0) {
      return res.status(404).json({ message: '❌ Client introuvable' });
    }

    const client = clientResult.rows[0];

    // 2. Calculer les points (1000 FCFA = 10 points)
    const points_gagnes = Math.floor(montant / 100);

    // 3. Enregistrer la transaction
    await pool.query(
      `INSERT INTO transactions (client_id, entreprise_id, montant, points_gagnes, type_achat)
       VALUES ($1, $2, $3, $4, $5)`,
      [client.id, entreprise_id, montant, points_gagnes, type_achat]
    );

    // 4. Mettre à jour les points du client
    const updatedClient = await pool.query(
      `UPDATE clients SET points_total = points_total + $1
       WHERE id = $2
       RETURNING id, nom, prenom, points_total, qr_code`,
      [points_gagnes, client.id]
    );

    res.json({
      message: '✅ Points ajoutés avec succès !',
      client: updatedClient.rows[0],
      points_gagnes,
      nouveau_total: updatedClient.rows[0].points_total
    });

  } catch (err) {
    res.status(500).json({ message: '❌ Erreur serveur', error: err.message });
  }
};

// Historique des transactions d'une entreprise
const historiqueEntreprise = async (req, res) => {
  const entreprise_id = req.user.id;

  try {
    const result = await pool.query(
      `SELECT t.id, t.montant, t.points_gagnes, t.type_achat, t.created_at,
              c.nom, c.prenom, c.qr_code
       FROM transactions t
       JOIN clients c ON t.client_id = c.id
       WHERE t.entreprise_id = $1
       ORDER BY t.created_at DESC`,
      [entreprise_id]
    );

    res.json({
      total_transactions: result.rows.length,
      transactions: result.rows
    });

  } catch (err) {
    res.status(500).json({ message: '❌ Erreur serveur', error: err.message });
  }
};

// Historique des transactions d'un client
const historiqueClient = async (req, res) => {
  const client_id = req.user.id;

  try {
    const result = await pool.query(
      `SELECT t.id, t.montant, t.points_gagnes, t.type_achat, t.created_at,
              e.nom as entreprise_nom
       FROM transactions t
       JOIN entreprises e ON t.entreprise_id = e.id
       WHERE t.client_id = $1
       ORDER BY t.created_at DESC`,
      [client_id]
    );

    // Récupérer le total des points
    const clientResult = await pool.query(
      'SELECT points_total FROM clients WHERE id = $1',
      [client_id]
    );

    res.json({
      points_total: clientResult.rows[0].points_total,
      total_transactions: result.rows.length,
      transactions: result.rows
    });

  } catch (err) {
    res.status(500).json({ message: '❌ Erreur serveur', error: err.message });
  }
};

module.exports = { scannerQRCode, historiqueEntreprise, historiqueClient };