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
    // Récupérer tous les clients liés à l'entreprise
    const clientsResult = await pool.query(
      `SELECT DISTINCT c.id, c.nom, c.prenom, c.email, c.telephone
       FROM clients c
       LEFT JOIN transactions t ON c.id = t.client_id AND t.entreprise_id = $1
       LEFT JOIN client_entreprise ce ON c.id = ce.client_id AND ce.entreprise_id = $1
       WHERE t.entreprise_id = $1 OR ce.entreprise_id = $1`,
      [entreprise_id]
    );

    const clients = clientsResult.rows;
    console.log(`📢 ${clients.length} client(s) trouvé(s) pour la campagne`);

    if (clients.length === 0) {
      return res.status(400).json({ 
        message: '❌ Aucun client à notifier. Les clients doivent d\'abord être liés à votre boutique.' 
      });
    }

    const campagneResult = await pool.query(
      'SELECT * FROM campagnes WHERE id = $1 AND entreprise_id = $2',
      [id, entreprise_id]
    );

    if (campagneResult.rows.length === 0) {
      return res.status(404).json({ message: '❌ Campagne introuvable' });
    }

    const campagne = campagneResult.rows[0];

    const entrepriseResult = await pool.query(
      'SELECT nom FROM entreprises WHERE id = $1', [entreprise_id]
    );
    const nomEntreprise = entrepriseResult.rows[0]?.nom || 'E-Wallet';

    let emailsEnvoyes = 0;
    let smsEnvoyes = 0;
    let pushEnvoyes = 0;
    let echecs = 0;

    for (const client of clients) {
      // Toujours enregistrer la notification
      await pool.query(
        `INSERT INTO notifications (client_id, message, canal, statut)
         VALUES ($1, $2, $3, 'envoyé')`,
        [client.id, campagne.message, campagne.canal]
      );

      if (campagne.canal === 'email' && client.email) {
        const result = await envoyerEmail(
          client.email,
          `${campagne.titre} — ${nomEntreprise}`,
          campagne.message
        );
        if (result.success) emailsEnvoyes++;
        else { echecs++; console.error(`Email échoué pour ${client.email}:`, result.error); }

      } else if (campagne.canal === 'sms' && client.telephone) {
        const result = await envoyerSMS(
          client.telephone,
          `${nomEntreprise}: ${campagne.message}`
        );
        if (result.success) smsEnvoyes++;
        else { echecs++; console.error(`SMS échoué pour ${client.telephone}:`, result.error); }

      } else if (campagne.canal === 'push') {
        const tokensResult = await pool.query(
          'SELECT token FROM fcm_tokens WHERE client_id = $1',
          [client.id]
        );
        const tokens = tokensResult.rows.map(r => r.token);
        if (tokens.length > 0) {
          await envoyerNotificationPush(tokens, campagne.titre, campagne.message);
          pushEnvoyes++;
        }
      }
    }

    await pool.query(
      `UPDATE campagnes SET statut = 'envoyée', date_envoi = NOW() WHERE id = $1`,
      [id]
    );

    res.json({
      message: `✅ Campagne envoyée à ${clients.length} client(s) !`,
      details: {
        total_clients: clients.length,
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