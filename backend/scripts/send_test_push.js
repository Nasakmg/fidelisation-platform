#!/usr/bin/env node
/*
  Script de test pour envoyer une notification push via Firebase Admin.
  Usage:
    FCM_TEST_TOKEN="<token-FCM>" node scripts/send_test_push.js

  Ce script utilise les mêmes variables d'environnement que le serveur.
*/

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const { envoyerNotificationPush, initAdmin } = require('../src/config/firebaseAdmin');

(async () => {
  try {
    const token = process.argv[2] || process.env.FCM_TEST_TOKEN;
    if (!token) {
      console.error('❌ Veuillez fournir le token de test via un argument ou via la variable FCM_TEST_TOKEN');
      process.exit(1);
    }

    const admin = initAdmin();
    if (!admin) {
      console.error('❌ Firebase Admin non initialisé. Vérifiez les variables d\'environnement.');
      process.exit(1);
    }

    const titre = 'Test push';
    const message = 'Ceci est un test d\'envoi depuis send_test_push.js';

    const result = await envoyerNotificationPush([token], titre, message);
    console.log('Résultat:', result);
    process.exit(0);
  } catch (err) {
    console.error('❌ Erreur:', err);
    process.exit(1);
  }
})();
