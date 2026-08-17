const pool = require('../config/db');
const { envoyerSMS } = require('../config/twilio');
const { envoyerEmail } = require('../config/resend');
const { envoyerNotificationPush } = require('../config/firebaseAdmin');

const creerCampagne = async (req, res) => {
  const { titre, message, canal } = req.body;
  const entreprise_id = req.user.id;
  try {
    const result = await pool.query(
      `INSERT INTO campagnes (entreprise_id, titre, message, canal, statut)
       VALUES ($1, $2, $3, $4, 'brouillon') RETURNING *`,
      [entreprise_id, titre, message, canal]
    );
    res.status(201).json({ message: '✅ Campagne créée !', campagne: result.rows[0] });
  } catch (err) {
    res.status(500).json({ message: '❌ Erreur serveur', error: err.message });
  }
};

const getCampagnes = async (req, res) => {
  const entreprise_id = req.user.id;
  try {
    const result = await pool.query(
      `SELECT * FROM campagnes WHERE entreprise_id = $1 ORDER BY created_at DESC`,
      [entreprise_id]
    );
    res.json({ total: result.rows.length, campagnes: result.rows });
  } catch (err) {
    res.status(500).json({ message: '❌ Erreur serveur', error: err.message });
  }
};

const envoyerCampagne = async (req, res) => {
  const { id } = req.params;
  const entreprise_id = req.user.id;

  try {
    // 1. Vérifier que la campagne existe
    const campagneResult = await pool.query(
      'SELECT * FROM campagnes WHERE id = $1 AND entreprise_id = $2',
      [id, entreprise_id]
    );

    if (campagneResult.rows.length === 0) {
      return res.status(404).json({ message: '❌ Campagne introuvable' });
    }

    const campagne = campagneResult.rows[0];

    // 2. Récupérer le nom de l'entreprise
    const entrepriseResult = await pool.query(
      'SELECT nom FROM entreprises WHERE id = $1',
      [entreprise_id]
    );
    const nomEntreprise = entrepriseResult.rows[0]?.nom || 'E-Wallet';

    let emailsEnvoyes = 0;
    let pushEnvoyes = 0;
    let smsEnvoyes = 0;
    let echecs = 0;

    // 3. Gestion selon le canal
    if (campagne.canal === 'email') {
      const clientsResult = await pool.query(
        `SELECT DISTINCT c.id, c.nom, c.prenom, c.email 
         FROM clients c 
         INNER JOIN client_entreprise ce ON c.id = ce.client_id 
         WHERE ce.entreprise_id = $1 AND c.email IS NOT NULL`,
        [entreprise_id]
      );

      for (const client of clientsResult.rows) {
        await pool.query(
          `INSERT INTO notifications (client_id, message, canal, statut) VALUES ($1, $2, 'email', 'envoyé')`,
          [client.id, campagne.message]
        );
        const result = await envoyerEmail(
          client.email,
          `${campagne.titre} — ${nomEntreprise}`,
          campagne.message
        );
        if (result.success) emailsEnvoyes++;
        else echecs++;
      }

    } else if (campagne.canal === 'sms') {
      const clientsResult = await pool.query(
        `SELECT DISTINCT c.id, c.nom, c.telephone 
         FROM clients c 
         INNER JOIN client_entreprise ce ON c.id = ce.client_id 
         WHERE ce.entreprise_id = $1 AND c.telephone IS NOT NULL`,
        [entreprise_id]
      );

      for (const client of clientsResult.rows) {
        await pool.query(
          `INSERT INTO notifications (client_id, message, canal, statut) VALUES ($1, $2, 'sms', 'envoyé')`,
          [client.id, campagne.message]
        );
        const result = await envoyerSMS(client.telephone, `${nomEntreprise}: ${campagne.message}`);
        if (result.success) smsEnvoyes++;
        else echecs++;
      }

   } else if (campagne.canal === 'push') {
  // 1. Récupération de tous les tokens FCM des clients liés à l'entreprise (avec ou sans achat)
  const tokensResult = await pool.query(
    `SELECT DISTINCT ft.token, c.id as client_id, c.nom 
     FROM fcm_tokens ft
     INNER JOIN clients c ON ft.client_id = c.id
     INNER JOIN client_entreprise ce ON c.id = ce.client_id
     WHERE ce.entreprise_id = $1`,
    [entreprise_id]
  );

  console.log(`🔔 ${tokensResult.rows.length} token(s) FCM trouvé(s) pour l'entreprise ID: ${entreprise_id}`);

  // Cas où aucun client n'a encore activé les notifications Push
  if (tokensResult.rows.length === 0) {
    await pool.query(
      `UPDATE campagnes SET statut = 'envoyée', date_envoi = NOW() WHERE id = $1`,
      [id]
    );
    return res.json({
      success: true,
      message: '⚠️ Aucun client n\'a encore activé les notifications Push pour votre entreprise.',
      details: { push_envoyes: 0, echecs: 0 }
    });
  }

  // 2. Historisation de la notification dans la BDD pour chaque client
  for (const row of tokensResult.rows) {
    await pool.query(
      `INSERT INTO notifications (client_id, message, canal, statut) 
       VALUES ($1, $2, 'push', 'envoyé') 
       ON CONFLICT DO NOTHING`,
      [row.client_id, campagne.message]
    );
  }

  // 3. Extraction de la liste des tokens et envoi groupé
  const tokens = tokensResult.rows.map(r => r.token);

  const result = await envoyerNotificationPush(
    tokens,
    campagne.titre,
    campagne.message,
    nomEntreprise
  );

  if (result) {
    pushEnvoyes = result.successCount || 0;
    echecs = result.failureCount || 0;
  }
}

    // 4. Mettre à jour le statut de la campagne
    await pool.query(
      `UPDATE campagnes SET statut = 'envoyée', date_envoi = NOW() WHERE id = $1`,
      [id]
    );

    res.json({
      message: '✅ Campagne envoyée avec succès !',
      details: {
        emails_envoyes: emailsEnvoyes,
        sms_envoyes: smsEnvoyes,
        push_envoyes: pushEnvoyes,
        echecs
      }
    });

  } catch (err) {
    console.error('❌ Erreur campagne:', err);
    res.status(500).json({ message: '❌ Erreur serveur', error: err.message });
  }
};

const supprimerCampagne = async (req, res) => {
  const { id } = req.params;
  const entreprise_id = req.user.id;
  try {
    await pool.query(
      'DELETE FROM campagnes WHERE id = $1 AND entreprise_id = $2',
      [id, entreprise_id]
    );
    res.json({ message: '✅ Campagne supprimée !' });
  } catch (err) {
    res.status(500).json({ message: '❌ Erreur serveur', error: err.message });
  }
};

module.exports = { creerCampagne, getCampagnes, envoyerCampagne, supprimerCampagne };