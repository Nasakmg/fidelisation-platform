const pool = require('../config/db');
const { envoyerEmail } = require('../config/resend');
const { envoyerNotificationPush } = require('../config/firebaseAdmin');

const creerCampagne = async (req, res) => {
  const { titre, message } = req.body;
  const entreprise_id = req.user.id;
  if (req.user?.role !== 'entreprise') {
    return res.status(403).json({ message: '❌ Accès réservé aux entreprises' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO campagnes (entreprise_id, titre, message, canal, statut)
       VALUES ($1, $2, $3, 'auto', 'brouillon') RETURNING *`,
      [entreprise_id, titre, message]
    );
    res.status(201).json({ message: '✅ Campagne créée !', campagne: result.rows[0] });
  } catch (err) {
    res.status(500).json({ message: '❌ Erreur serveur', error: err.message });
  }
};

const getCampagnes = async (req, res) => {
  const entreprise_id = req.user.id;
  if (req.user?.role !== 'entreprise') {
    return res.status(403).json({ message: '❌ Accès réservé aux entreprises' });
  }

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
  if (req.user?.role !== 'entreprise') {
    return res.status(403).json({ message: '❌ Accès réservé aux entreprises' });
  }

  let campagneReservee = false;

  try {
    const campagneResult = await pool.query(
      `UPDATE campagnes
       SET statut = 'en_cours'
       WHERE id = $1 AND entreprise_id = $2 AND statut = 'brouillon'
       RETURNING *`,
      [id, entreprise_id]
    );

    if (campagneResult.rows.length === 0) {
      const existe = await pool.query(
        'SELECT id FROM campagnes WHERE id = $1 AND entreprise_id = $2',
        [id, entreprise_id]
      );
      return existe.rows.length === 0
        ? res.status(404).json({ message: '❌ Campagne introuvable' })
        : res.status(409).json({ message: '❌ Cette campagne a déjà été envoyée ou est en cours d’envoi' });
    }

    campagneReservee = true;
    const campagne = campagneResult.rows[0];
    const entrepriseResult = await pool.query(
      'SELECT nom, notification_icon FROM entreprises WHERE id = $1',
      [entreprise_id]
    );
    const nomEntreprise = entrepriseResult.rows[0]?.nom || 'E-Wallet';
    const iconeEntreprise = entrepriseResult.rows[0]?.notification_icon || null;

    let emailsEnvoyes = 0;
    let pushEnvoyes = 0;
    let echecs = 0;
    let appareilsCibles = 0;
    let clientsCibles = 0;
    let clientsSansToken = 0;

    const clientsResult = await pool.query(
      `SELECT DISTINCT c.id, c.email, c.mode_connexion
       FROM clients c
       INNER JOIN client_entreprise ce ON ce.client_id = c.id
       WHERE ce.entreprise_id = $1`,
      [entreprise_id]
    );
    clientsCibles = clientsResult.rows.length;

    for (const client of clientsResult.rows) {
      const canal = client.mode_connexion === 'telephone' ? 'push' : 'email';
      let tokens = [];

      if (canal === 'push') {
        const tokenResult = await pool.query(
          'SELECT DISTINCT token FROM fcm_tokens WHERE client_id = $1',
          [client.id]
        );
        tokens = tokenResult.rows.map(row => row.token);
        if (tokens.length === 0) {
          clientsSansToken++;
          continue;
        }
        appareilsCibles += tokens.length;
      } else if (!client.email) {
        echecs++;
        continue;
      }

      const reservation = await pool.query(
        `INSERT INTO notifications (campagne_id, client_id, message, canal, statut)
         VALUES ($1, $2, $3, $4, 'en_cours')
         ON CONFLICT (campagne_id, client_id, canal)
         WHERE campagne_id IS NOT NULL DO NOTHING
         RETURNING id`,
        [campagne.id, client.id, campagne.message, canal]
      );
      if (reservation.rows.length === 0) continue;

      if (canal === 'email') {
        const result = await envoyerEmail(
          client.email,
          `${campagne.titre} — ${nomEntreprise}`,
          campagne.message
        );
        if (result?.success) emailsEnvoyes++;
        else echecs++;
        await pool.query(
          'UPDATE notifications SET statut = $1 WHERE id = $2',
          [result?.success ? 'envoyé' : 'échec', reservation.rows[0].id]
        );
        continue;
      }

      let result;
      try {
        result = await envoyerNotificationPush(
          tokens,
          campagne.titre,
          campagne.message,
          nomEntreprise,
          iconeEntreprise
        );
      } catch (err) {
        console.error(`Échec push client ${client.id}:`, err.message);
      }

      const succesPush = result?.successCount || 0;
      const echecsPush = result?.failureCount ?? tokens.length;
      pushEnvoyes += succesPush;
      echecs += echecsPush;
      await pool.query(
        'UPDATE notifications SET statut = $1 WHERE id = $2',
        [succesPush > 0 ? (echecsPush > 0 ? 'partiel' : 'envoyé') : 'échec', reservation.rows[0].id]
      );
    }

    await pool.query(
      `UPDATE campagnes SET statut = 'envoyée', date_envoi = NOW()
       WHERE id = $1 AND entreprise_id = $2`,
      [campagne.id, entreprise_id]
    );

    res.json({
      message: '✅ Campagne envoyée avec succès !',
      details: {
        emails_envoyes: emailsEnvoyes,
        push_envoyes: pushEnvoyes,
        echecs,
        appareils_cibles: appareilsCibles,
        clients_cibles: clientsCibles,
        clients_sans_token: clientsSansToken
      }
    });

  } catch (err) {
    console.error('❌ Erreur campagne:', err);
    if (campagneReservee) {
      await pool.query(
        `UPDATE campagnes SET statut = 'échec'
         WHERE id = $1 AND entreprise_id = $2 AND statut = 'en_cours'`,
        [id, entreprise_id]
      ).catch(updateErr => console.error('Échec mise à jour statut campagne:', updateErr.message));
      await pool.query(
        `UPDATE notifications SET statut = 'échec'
         WHERE campagne_id = $1 AND statut = 'en_cours'`,
        [id]
      ).catch(updateErr => console.error('Échec mise à jour statut notifications:', updateErr.message));
    }
    res.status(500).json({ message: '❌ Erreur serveur', error: err.message });
  }
};

const supprimerCampagne = async (req, res) => {
  const { id } = req.params;
  const entreprise_id = req.user.id;
  if (req.user?.role !== 'entreprise') {
    return res.status(403).json({ message: '❌ Accès réservé aux entreprises' });
  }
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