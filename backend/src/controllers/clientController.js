const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { genererLienWallet: genererLienWalletConfig } = require('../config/googleWallet');

const inscrireClient = async (req, res) => {
  const { nom, prenom, email, telephone, mot_de_passe, date_naissance, entreprise_qr } = req.body;
  const emailNormalise = String(email || '').trim().toLowerCase();
  const telephoneNormalise = String(telephone || '').trim();

  try {
    if (!emailNormalise || !telephoneNormalise || !mot_de_passe) {
      return res.status(400).json({ message: '❌ Email, téléphone et mot de passe requis' });
    }

    const existe = await pool.query(
      'SELECT id FROM clients WHERE LOWER(TRIM(email)) = $1', [emailNormalise]
    );
    if (existe.rows.length > 0) {
      return res.status(400).json({ message: '❌ Email déjà utilisé' });
    }

    const hash = await bcrypt.hash(String(mot_de_passe), 10);
    const qr_code = 'USR-' + crypto.randomBytes(6).toString('hex').toUpperCase();

    const result = await pool.query(
      `INSERT INTO clients (nom, prenom, email, telephone, mot_de_passe, qr_code, date_naissance, mode_connexion)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'email')
       RETURNING id, nom, prenom, email, telephone, qr_code, points_total, mode_connexion`,
      [nom, prenom, emailNormalise, telephoneNormalise, hash, qr_code, date_naissance || null]
    );

    const client = result.rows[0];

    // LIER AUTOMATIQUEMENT à l'entreprise
    if (entreprise_qr) {
      try {
        // Format QR boutique : ENT-1-BOUTIQUEDAKARMODE
        const parts = entreprise_qr.split('-');
        const entreprise_id = parseInt(parts[1]);
        
        if (!isNaN(entreprise_id)) {
          await pool.query(
            `INSERT INTO client_entreprise (client_id, entreprise_id)
             VALUES ($1, $2) ON CONFLICT DO NOTHING`,
            [client.id, entreprise_id]
          );
          console.log(`✅ Client ${client.id} lié à l'entreprise ${entreprise_id}`);
        }
      } catch (err) {
        console.error('❌ Erreur liaison:', err.message);
      }
    }

    const token = jwt.sign(
      { id: client.id, role: 'client' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: '✅ Compte créé avec succès !',
      token,
      client
    });

  } catch (err) {
    res.status(500).json({ message: '❌ Erreur serveur', error: err.message });
  }
};

const connecterClient = async (req, res) => {
  const { identifiant, mode, email, mot_de_passe } = req.body;
  const valeurIdentifiant = String(identifiant || email || '').trim();
  const modeConnexion = mode || (valeurIdentifiant.includes('@') ? 'email' : 'telephone');
  const identifiantNormalise = modeConnexion === 'email'
    ? valeurIdentifiant.toLowerCase()
    : valeurIdentifiant;

  if (!['email', 'telephone'].includes(modeConnexion) || !identifiantNormalise || !mot_de_passe) {
    return res.status(400).json({ message: '❌ Identifiant et mot de passe requis' });
  }

  try {
    const result = await pool.query(
      modeConnexion === 'email'
        ? 'SELECT * FROM clients WHERE LOWER(TRIM(email)) = $1'
        : 'SELECT * FROM clients WHERE telephone = $1',
      [identifiantNormalise]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ message: '❌ Identifiants incorrects' });
    }

    const client = result.rows[0];
    const valide = await bcrypt.compare(mot_de_passe, client.mot_de_passe);

    if (!valide) {
      return res.status(400).json({ message: '❌ Identifiants incorrects' });
    }

    await pool.query(
      'UPDATE clients SET mode_connexion = $1 WHERE id = $2',
      [modeConnexion, client.id]
    );

    const token = jwt.sign(
      { id: client.id, role: 'client' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: '✅ Connexion réussie !',
      token,
      client: {
        id: client.id,
        nom: client.nom,
        prenom: client.prenom,
        email: client.email,
        qr_code: client.qr_code,
        points_total: client.points_total,
        mode_connexion: modeConnexion
      }
    });

  } catch (err) {
    res.status(500).json({ message: '❌ Erreur serveur', error: err.message });
  }
};

const profilClient = async (req, res) => {
  try {
    const result = await pool.query(
            `SELECT c.id, c.nom, c.prenom, c.email, c.telephone,
              c.qr_code, c.points_total, c.created_at, c.mode_connexion,
              array_agg(DISTINCT e.nom) FILTER (WHERE e.nom IS NOT NULL) as boutiques
       FROM clients c
       LEFT JOIN client_entreprise ce ON c.id = ce.client_id
       LEFT JOIN entreprises e ON ce.entreprise_id = e.id
       WHERE c.id = $1
       GROUP BY c.id`,
      [req.user.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: '❌ Erreur serveur', error: err.message });
  }
};

// Generer le lien JWT d'ajout a Google Wallet
const genererLienWallet = async (req, res) => {
  try {
    const clientId = req.user ? req.user.id : req.body.client_id;
    
    if (!clientId) {
      return res.status(400).json({ message: '❌ ID client manquant' });
    }

    const result = await pool.query(
      'SELECT id, nom, prenom, email, qr_code, points_total, created_at FROM clients WHERE id = $1',
      [clientId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: '❌ Client non trouvé' });
    }

    const client = result.rows[0];

    // Délégation de la génération à googleWallet.js (qui utilise fidelisation_card et le bon ISSUER_ID)
    const saveUrl = await genererLienWalletConfig(client);

    return res.json({
      message: '✅ Lien Google Wallet généré avec succès !',
      url: saveUrl,
      saveUrl,
    });
  } catch (err) {
    console.error('❌ Erreur genererLienWallet:', err);
    return res.status(500).json({ message: '❌ Erreur génération Google Wallet', error: err.message });
  }
};

module.exports = { 
  inscrireClient, 
  connecterClient, 
  profilClient, 
  genererLienWallet 
};