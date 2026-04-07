# PROJEX - Gestion et Suivi de Projets Académiques

PROJEX est une plateforme web conçue pour simplifier la gestion, le suivi et l'encadrement des projets au sein des établissements académiques. Elle permet une collaboration fluide entre les étudiants, les encadreurs (superviseurs) et l'administration.

## 🚀 Fonctionnalités Principales

- **Administration** : Gestion des utilisateurs, des attributions et statistiques globales.
- **Superviseurs** : Suivi de l'avancement, validation des livrables et échange avec les étudiants.
- **Étudiants** : Dépôt de livrables, gestion des tâches et communication directe avec l'encadreur.
- **Chat Intégré** : Messagerie instantanée avec partage de fichiers.
- **Tableaux de Bord** : Visualisation dynamique de la progression des projets.

## 🛠️ Stack Technique

- **Backend** : PHP (Architecture MVC, PDO pour la base de données).
- **Frontend** : React.js (Vite, Tailwind CSS, Lucide React).
- **Base de données** : MySQL.
- **Serveur local recommandé** : XAMPP / WAMP.

## 📦 Installation

### 1. Préparation de la Base de Données
1. Lancez **XAMPP** (ou votre serveur local) et activez Apache et MySQL.
2. Accédez à `phpMyAdmin`.
3. Créez une base de données nommée `projex`.
4. Importez le fichier SQL principal : `projex_backend/database/database.sql`.

### 2. Configuration du Backend
1. Naviguez dans le dossier `projex_backend/config/`.
2. Vérifiez que les informations de connexion dans `db.php` correspondent à votre serveur local.

### 3. Lancement du Frontend
1. Ouvrez un terminal dans le dossier `projex_frontend`.
2. Installez les dépendances :
   ```bash
   npm install
   ```
3. Lancez l'application en mode développement :
   ```bash
   npm run dev
   ```
4. Accédez à l'application via l'URL indiquée par Vite (généralement `http://localhost:5173`).

## 📁 Structure du Projet

```text
PROJEX/
├── projex_backend/     # API et Logique métier (PHP)
│   ├── app/            # Contrôleurs et Modèles
│   ├── config/         # Configuration DB
│   └── database/       # Scripts SQL d'export
├── projex_frontend/    # Interface Utilisateur (React)
│   ├── src/            # Composants et Pages
│   └── public/         # Assets statiques
└── README.md           # Documentation (ce fichier)
```

---
*Réalisé dans le cadre du projet de stage PROJEX.*
