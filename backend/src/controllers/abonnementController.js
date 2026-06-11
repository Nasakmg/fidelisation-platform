const pool = require('../config/db');
const axios = require('axios');

const CINETPAY_API_KEY = process.env.CINETPAY_API_KEY;
const CINETPAY_SITE_ID = process.env.CINETPAY_SITE_ID;
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://fidelisation-platform.vercel.app';

// Récupérer tous les plans
const getPlans = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM plans WHERE actif = true ORDER BY prix_mensuel ASC'
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: '❌ Erreur serveur', error: err.message });
  }
};

// Récupérer l'abonnement actuel de l'entreprise
const getMonAbonnement = async (req, res) => {
  const entreprise_id = req.user.id;
  try {
    const result = await pool.query(
      `SELECT a.*, p.nom as plan_nom, p.prix_mensuel, p.prix_trimestriel, 
              p.prix_annuel, p.max_clients, p.features
       FROM abonnements a
       JOIN plans p ON a.plan_id = p.id
       WHERE a.entreprise_id = $1
       ORDER BY a.created_at DESC
       LIMIT 1`,
      [entreprise_id]
    );

    if (result.rows.length === 0) {
      return res.json({ statut: 'aucun', message: 'Aucun abonnement' });
    }

    const abonnement = result.rows[0];
    const actif = abonnement.statut === 'actif' || 
                  (abonnement.statut === 'trial' && new Date(abonnement.date_fin) > new Date());

    res.json({ ...abonnement, actif });

  } catch (err) {
    res.status(500).json({ message: '❌ Erreur serveur', error: err.message });
  }
};

// Initier un paiement CinetPay
const initierPaiement = async (req, res) => {
  const { plan_id, frequence } = req.body;
  const entreprise_id = req.user.id;

  try {
    // Récupérer le plan
    const planResult = await pool.query('SELECT * FROM plans WHERE id = $1', [plan_id]);
    if (planResult.rows.length === 0) {
      return res.status(404).json({ message: '❌ Plan introuvable' });
    }
    const plan = planResult.rows[0];

    // Calculer le montant selon la fréquence
    let montant;
    if (frequence === 'mensuel') montant = plan.prix_mensuel;
    else if (frequence === 'trimestriel') montant = plan.prix_trimestriel;
    else if (frequence === 'annuel') montant = plan.prix_annuel;
    else return res.status(400).json({ message: '❌ Fréquence invalide' });

    // Récupérer l'entreprise
    const entrepriseResult = await pool.query(
      'SELECT * FROM entreprises WHERE id = $1', [entreprise_id]
    );
    const entreprise = entrepriseResult.rows[0];

    // Générer un ID de transaction unique
    const transaction_id = `FID-${Date.now()}-${entreprise_id}`;

    // Créer le paiement en base
    const paiementResult = await pool.query(
      `INSERT INTO paiements (entreprise_id, montant, statut, transaction_id, methode)
       VALUES ($1, $2, 'en_attente', $3, 'cinetpay')
       RETURNING id`,
      [entreprise_id, montant, transaction_id]
    );

    // Appel API CinetPay
    const cinetpayResponse = await axios.post(
      'https://api-checkout.cinetpay.com/v2/payment',
      {
        apikey: CINETPAY_API_KEY,
        site_id: CINETPAY_SITE_ID,
        transaction_id,
        amount: montant,
        currency: 'XOF',
        description: `Abonnement FidélisationPro - Plan ${plan.nom} (${frequence})`,
        return_url: `${FRONTEND_URL}/dashboard/abonnement?success=true`,
        notify_url: `${process.env.BACKEND_URL}/api/abonnements/webhook`,
        customer_name: entreprise.nom,
        customer_email: entreprise.email,
        customer_phone_number: entreprise.telephone || '',
        customer_address: entreprise.adresse || 'Dakar',
        customer_city: 'Dakar',
        customer_country: 'SN',
        customer_state: 'SN',
        customer_zip_code: '00000',
        metadata: JSON.stringify({
          entreprise_id,
          plan_id,
          frequence,
          paiement_id: paiementResult.rows[0].id
        })
      }
    );

    if (cinetpayResponse.data.code === '201') {
      res.json({
        payment_url: cinetpayResponse.data.data.payment_url,
        transaction_id
      });
    } else {
      res.status(400).json({ 
        message: '❌ Erreur CinetPay', 
        error: cinetpayResponse.data.message 
      });
    }

  } catch (err) {
    res.status(500).json({ message: '❌ Erreur serveur', error: err.message });
  }
};

// Webhook CinetPay (notification de paiement)
const webhookCinetPay = async (req, res) => {
  const { transaction_id, status } = req.body;

  try {
    if (status !== 'ACCEPTED') {
      await pool.query(
        `UPDATE paiements SET statut = 'echoue' WHERE transaction_id = $1`,
        [transaction_id]
      );
      return res.json({ message: 'Paiement échoué enregistré' });
    }

    // Récupérer le paiement
    const paiementResult = await pool.query(
      'SELECT * FROM paiements WHERE transaction_id = $1',
      [transaction_id]
    );

    if (paiementResult.rows.length === 0) {
      return res.status(404).json({ message: 'Paiement introuvable' });
    }

    const paiement = paiementResult.rows[0];

    // Vérifier le paiement avec CinetPay
    const verification = await axios.post(
      'https://api-checkout.cinetpay.com/v2/payment/check',
      {
        apikey: CINETPAY_API_KEY,
        site_id: CINETPAY_SITE_ID,
        transaction_id
      }
    );

    if (verification.data.data.status !== 'ACCEPTED') {
      return res.status(400).json({ message: 'Paiement non vérifié' });
    }

    // Mettre à jour le paiement
    await pool.query(
      `UPDATE paiements SET statut = 'reussi', cinetpay_data = $1 WHERE transaction_id = $2`,
      [JSON.stringify(verification.data.data), transaction_id]
    );

    // Récupérer les métadonnées
    const metadata = JSON.parse(verification.data.data.metadata || '{}');
    const { entreprise_id, plan_id, frequence } = metadata;

    // Calculer la date de fin
    let datesFin = new Date();
    if (frequence === 'mensuel') datesFin.setMonth(datesFin.getMonth() + 1);
    else if (frequence === 'trimestriel') datesFin.setMonth(datesFin.getMonth() + 3);
    else if (frequence === 'annuel') datesFin.setFullYear(datesFin.getFullYear() + 1);

    // Créer ou mettre à jour l'abonnement
    await pool.query(
      `INSERT INTO abonnements (entreprise_id, plan_id, statut, frequence, date_fin, montant_paye, transaction_id)
       VALUES ($1, $2, 'actif', $3, $4, $5, $6)
       ON CONFLICT (entreprise_id) DO UPDATE SET
         plan_id = $2, statut = 'actif', frequence = $3,
         date_fin = $4, montant_paye = $5, transaction_id = $6`,
      [entreprise_id, plan_id, frequence, datesFin, paiement.montant, transaction_id]
    );

    res.json({ message: '✅ Abonnement activé !' });

  } catch (err) {
    res.status(500).json({ message: '❌ Erreur webhook', error: err.message });
  }
};

// Vérifier si l'abonnement est actif
const verifierAbonnement = async (entreprise_id) => {
  const result = await pool.query(
    `SELECT * FROM abonnements 
     WHERE entreprise_id = $1 
     AND (statut = 'actif' OR (statut = 'trial' AND date_fin > NOW()))
     ORDER BY created_at DESC LIMIT 1`,
    [entreprise_id]
  );
  return result.rows.length > 0;
};

module.exports = { getPlans, getMonAbonnement, initierPaiement, webhookCinetPay, verifierAbonnement };