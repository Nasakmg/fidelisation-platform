Guide d'installation Firebase pour Render et tests
===============================================

But
----
Ce document explique, pas à pas, comment ajouter les variables d'environnement Firebase requises sur Render, comment vérifier l'initialisation côté backend et comment exécuter un test d'envoi (si vous avez un token FCM valide).

Variables requises
------------------
- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`

Format de `FIREBASE_PRIVATE_KEY`
-------------------------------
La `privateKey` est la clé privée du compte de service (fichier JSON fourni par Google).

1. Option recommandée (Render accepte les retours à la ligne dans le champ) :
   - Copiez le bloc entier tel qu'il apparaît dans le JSON (avec les sauts de ligne). Collez-le directement dans la valeur de `FIREBASE_PRIVATE_KEY` dans Render.

2. Option alternative (si le panneau d'environnement ne préserve pas les sauts de ligne) :
   - Remplacez chaque saut de ligne par la séquence `\n` et collez la chaîne unique.
   - Exemple :

     -----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkq...\n-----END PRIVATE KEY-----\n

Étapes (Render - interface web)
--------------------------------
1. Ouvre ton tableau de bord Render et sélectionne ton service backend (API).
2. Va dans "Environment" ou "Environment Variables".
3. Ajoute les 3 variables (nom exact) et colle les valeurs depuis le fichier JSON du compte de service Firebase.
4. Sauvegarde et redéploie si nécessaire (Render applique souvent la nouvelle valeur sans redeploy automatique, clique sur "Manual Deploy" si besoin).

Vérification côté serveur
-------------------------
Après avoir ajouté les variables, teste l'endpoint de debug que j'ai ajouté :

GET https://<ton-backend-render>/api/debug/firebase

Réponses attendues :
- `200` JSON `{ message: '✅ Firebase Admin initialisé', projectId: '...' }` → tout est bon
- `500` JSON `{ message: '❌ Variables Firebase manquantes', missing: [...] }` → variables manquantes
- `500` JSON `{ message: '❌ Impossible d\'initialiser Firebase Admin', details: '...' }` → probable problème de format de clé privée

Test d'envoi (optionnel)
------------------------
Si tu veux tester l'envoi réel depuis ton backend, tu peux exécuter le script suivant (nécessite Node.js et que les variables d'environnement soient configurées localement ou dans Render avec un token de test) :

Commandes (localement) :

```bash
# installer dépendances si nécessaire
cd backend
npm install

# exécuter (en supposant que FCM_TEST_TOKEN est la valeur du token à tester)
FCM_TEST_TOKEN="<ton-token-FCM>" node scripts/send_test_push.js
```

Si le test réussit, le script affichera le nombre de notifications envoyées.

Je peux t'aider à :
- formuler exactement les valeurs à coller dans Render (si tu me montres le JSON du compte de service)
- exécuter le test sur Render (je peux te guider pas à pas)

Fin du guide
