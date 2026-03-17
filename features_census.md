# Recensement des Fonctionnalités - Système PROJEX

Voici la liste exhaustive des capacités actuelles du système, organisées par modules fonctionnels.

## 👥 Gestion des Utilisateurs & Accès
- **Authentification Sécurisée** : Système de login/logout avec gestion des sessions PHP et protection des routes par middleware.
- **Gestion des Rôles** : Distinction stricte entre **ADMIN**, **ETUDIANT**, **ENCADREUR_ACAD** et **ENCADREUR_PRO**.
- **Profil Utilisateur** : Edition des informations personnelles, changement de mot de passe et upload d'avatar.
- **Activation Interactive** : Système de validation des comptes par l'administrateur (statut "Actif/Inactif").

## 📂 Cycle de Vie des Projets
- **Propositions de Projets** : Les étudiants peuvent soumettre des thèmes qui sont ensuite validés ou rejetés.
- **Affectations Tripartites** : Liaison dynamique entre un projet, un étudiant, un encadreur académique et un encadreur professionnel.
- **Gestion des Catégories** : Classification des projets (Web, IA, Réseaux, etc.) pour des statistiques précises.
- **Suivi des Statuts** : Workflow complet de "Proposé" à "Terminé".

## 📈 Suivi & Accompagnement (Monitorage)
- **Gestion des Tâches** : Création et suivi de l'avancement des tâches individuelles par les étudiants.
- **Gestion des Livrables** : Dépôt de fichiers, historique des versions, validation/rejet par les encadreurs.
- **Commentaires Collaboratifs** : Système de feedback textuel sur chaque livrable déposé.
- **Timeline de Projet** : Historique chronologique visuel regroupant livrables et évaluations.
- **Chat de Projet** : Discussion en temps réel entre l'étudiant et ses encadreurs au sein d'un projet spécifique.

## 🎓 Évaluation & Performance
- **Évaluation Académique** : Attribution d'une note sur 20 par l'encadreur académique.
- **Évaluation Professionnelle** : Grille de notation par compétences (Support, Autonomie, Rigueur, etc.) côtées de 1 à 5.
- **Visualisation Radar (Skills)** : Graphique type "Radar" sur le dashboard étudiant pour visualiser l'équilibre des compétences acquises.
- **Moyennes de Cohorte** : Calcul automatique des moyennes globales pour le pilotage pédagogique.

## 🗓️ Planification des Soutenances
- **Calendrier des Soutenances** : Interface visuelle pour organiser et consulter les dates de passage.
- **Gestion des Jurys** : (Structure prête pour l'affectation des examinateurs).

## 🛡️ Administration & Maintenance
- **Dashboard de Pilotage** : Statistiques en temps réel (nombre de projets, taux de validation, répartition par catégorie).
- **Audit Logs** : Historique complet des actions critiques effectuées sur le système (qui a fait quoi et quand).
- **Configuration Système** : Gestion des périodes académiques (semestres/années) et des catégories de thèmes.
- **Outil de Diagnostic** : Script de vérification de l'intégrité de la base de données.
- **Sauvegarde** : Routine de backup de la base de données intégrée.

---
*Ce document reflète l'état actuel du système PROJEX au 16 Mars 2026.*
