# Scénario de Test Complet (UAT) - PROJEX 🎭🚀

Ce document guide un testeur à travers un cycle complet de gestion de projet sur la plateforme.

---

## 📅 Phase 1 : Configuration (Rôle : Admin)
*Objectif : Préparer le terrain pour la nouvelle session.*

1.  **Connexion** : Se connecter avec `admin@projex.com`.
2.  **Période Académique** : Aller dans `Paramètres` > `Périodes` et créer "Année Académique 2024-2025". L'activer.
3.  **Catégories** : Vérifier que des catégories existent (ex: "Web", "Mobile").
4.  **Utilisateurs** : S'assurer que les 3 comptes de test (Étudiant, Acad, Pro) sont bien sur `Statut : Actif`.

---

## 💡 Phase 2 : Initialisation du Projet (Rôle : Étudiant)
*Objectif : Proposer un sujet de travail.*

1.  **Connexion** : Se connecter avec le compte Étudiant.
2.  **Proposition** : Cliquer sur "Proposer un projet".
3.  **Saisie** : Remplir le titre ("Audit de sécurité"), la description et choisir une catégorie.
4.  **Validation** : Envoyer la proposition. Le statut doit passer à `EN ATTENTE`.

---

## ⚖️ Phase 3 : Validation & Affectation (Rôle : Admin)
*Objectif : Officialiser le projet et désigner l'équipe.*

1.  **Revue** : Dans "Gestion des Projets", ouvrir la proposition de l'étudiant.
2.  **Approbation** : Cliquer sur "Approuver".
3.  **Encadrement** : Sélectionner l'Encadreur Académique et l'Encadreur Professionnel dans les listes déroulantes.
4.  **Confirmation** : Valider l'affectation.

---

## 🛠️ Phase 4 : Suivi Opérationnel (Rôle : Étudiant)
*Objectif : Produire du travail.*

1.  **Tâches** : Aller sur le Dashboard projet, créer une tâche "Analyse de l'existant".
2.  **Mouvement** : Glisser la tâche de "À faire" vers "En cours".
3.  **Livrable** : Aller dans "Livrables", cliquer sur "Déposer", choisir un fichier PDF et valider.
4.  **Chat** : Envoyer un message dans le chat du projet : "Bonjour, je viens de déposer mon premier rapport."

---

## 🔍 Phase 5 : Revue & Évaluation (Rôles : Encadreurs)
*Objectif : Valider la qualité et noter.*

1.  **Notifications** : Vérifier la réception de l'alerte (cloche) pour le livrable et le message.
2.  **Feedback** : Ouvrir le livrable, ajouter un commentaire ("Très bon début"), puis cliquer sur "Approuver".
3.  **Notes** :
    *   **Académique** : Saisir la note (ex: 16/20) et l'appréciation.
    *   **Professionnel** : Remplir la grille de compétences (Rigueur, Autonomie, etc.).

---

## 🎓 Phase 6 : Clôture & Soutenance (Rôle : Admin)
*Objectif : Finaliser le cursus.*

1.  **Planning** : Créer une soutenance, assigner une date, une salle et les membres du jury.
2.  **Note Finale** : Saisir la note de soutenance après la présentation.
3.  **Clôture** : Passer le projet au statut `CLÔTURÉ`.

---
*Fin du Scénario de Test PROJEX v1.0* 🏁🛡️
