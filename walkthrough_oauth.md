# Intégration Google OAuth : Connexion & Inscription

L'authentification Google est désormais disponible sur PROJEX, offrant une expérience fluide tant pour la connexion que pour la création de compte.

## 🚀 Fonctionnalités implémentées

### 1. Connexion Simplifiée (One-Click Login)
Les utilisateurs ayant déjà un compte PROJEX associé à leur adresse Gmail peuvent désormais se connecter instantanément via le bouton Google.
- **Backend** : Vérification sécurisée du jeton (`id_token`) via les serveurs de Google.
- **Session** : Création automatique de la session PHP identique à une connexion classique.

### 2. Inscription Assistée (Smart Registration)
Si un utilisateur se connecte avec Google mais n'a pas encore de compte :
- Il est automatiquement redirigé vers la page d'inscription.
- Ses informations ( **Nom, Prénom, E-mail** ) sont **pré-remplies et verrouillées** (lecture seule) pour garantir la cohérence des données.
- L'utilisateur n'a plus qu'à choisir son rôle et fournir ses infos spécifiques (Matricule, Entreprise, etc.).

## 🛠️ Configuration Technique

- **Côté Client** : Utilisation de `@react-oauth/google`.
- **ClientId** : Configuré dans [src/main.jsx](file:///c:/xampp/htdocs/projex/projex_frontend/src/main.jsx). 
- **Endpoint Backend** : `/api/auth/google`.

## ✅ Vérification

- [x] **Redirection** : Le flux `LOGIN` redirige correctement vers le dashboard selon le rôle utilisateur.
- [x] **Transition** : Le flux `REGISTER` transmet les données Google de [Login.jsx](file:///c:/xampp/htdocs/projex/projex_frontend/src/pages/Login.jsx) vers [Register.jsx](file:///c:/xampp/htdocs/projex/projex_frontend/src/pages/Register.jsx) via le `location.state`.
- [x] **Sécurité** : Seuls les emails Google vérifiés (`email_verified: true`) sont acceptés.

> [!IMPORTANT]
> Pour passer en production, assurez-vous de configurer les **Origines JavaScript autorisées** et les **URI de redirection autorisées** dans votre console Google Cloud (identiques à celles configurées dans `allowedOrigins` de [index.php](file:///c:/xampp/htdocs/projex/projex_backend/public/index.php)).
