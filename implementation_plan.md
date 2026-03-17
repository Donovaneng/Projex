# Intégration de Google OAuth

Permettre une connexion simplifiée et sécurisée via les comptes Google pour tous les utilisateurs.

## Proposed Changes

### [projex_backend]

#### [MODIFY] [AuthController.php](file:///c:/xampp/htdocs/projex/projex_backend/app/Controllers/AuthController.php)
- Ajouter une méthode `googleAuth(PDO $pdo)` :
    - Vérifier le `id_token` Google.
    - Si l'utilisateur **existe** : Générer la session et renvoyer les infos (Connexion).
    - Si l'utilisateur **n'existe pas** : Renvoyer les infos Google (e-mail, nom, prénom) avec un indicateur `needs_registration` (Inscription).
- Adapter la logique de création de compte pour supporter les comptes liés à Google.

#### [MODIFY] [index.php](file:///c:/xampp/htdocs/projex/projex_backend/public/index.php)
- Ajouter la route `/api/auth/google`.

### [projex_frontend]

#### [MODIFY] [Login.jsx](file:///c:/xampp/htdocs/projex/projex_frontend/src/pages/Login.jsx)
- Ajouter le bouton "Continuer avec Google".
- Si le backend renvoie `needs_registration`, rediriger vers `/register` en passant les données Google via l'état de navigation.

#### [MODIFY] [Register.jsx](file:///c:/xampp/htdocs/projex/projex_frontend/src/pages/Register.jsx)
- Détecter si des données Google sont présentes dans l'état de navigation.
- Pré-remplir et verrouiller les champs Nom, Prénom et E-mail.
- Forcer l'utilisateur à choisir son rôle et remplir les champs obligatoires restants.

#### [MODIFY] [authService.js](file:///c:/xampp/htdocs/projex/projex_frontend/src/services/authService.js) (ou équivalent)
- Ajouter la méthode pour envoyer le jeton Google au backend.

## Verification Plan

### Automated Tests
- Simuler un jeton Google valide et vérifier que le backend renvoie bien l'utilisateur correspondant.
- Vérifier que les jetons invalides sont rejetés (401).

### Manual Verification
- Cliquer sur le bouton Google sur la page de login.
- Vérifier la redirection et la connexion réussie si l'email correspond à un compte actif.
- Vérifier le message d'erreur si l'email n'est pas enregistré.

