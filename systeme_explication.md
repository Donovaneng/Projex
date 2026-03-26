# Comprendre le Système PROJEX

Le système PROJEX est conçu pour gérer et suivre les projets de fin d'études ou de stage des étudiants, avec une collaboration entre l'étudiant, un encadreur académique (université) et un encadreur professionnel (entreprise).

## 1. Les Acteurs et leurs Rôles
Le système distingue quatre types d'utilisateurs par héritage de la classe **Utilisateur** :

- **Étudiant** : Il propose des sujets de projet, dépose des livrables (fichiers) et suit l'avancement de ses tâches.
- **Encadreur Académique** : Il valide le contenu scientifique du projet, commente les livrables et donne une note académique finale.
- **Encadreur Professionnel** : Il suit l'aspect technique en entreprise et évalue les compétences professionnelles acquises par l'étudiant.
- **Administrateur** : Il valide la création des comptes, assigne les encadreurs aux projets et gère les périodes académiques (semestres/années).

## 2. Le Cycle de Vie d'un Projet
1. **Proposition** : L'étudiant propose un titre et une description de projet.
2. **Validation/Assignation** : L'administrateur valide le projet et lui assigne deux encadreurs (un académique, un professionnel).
3. **Réalisation** : L'étudiant travaille sur son projet, soumet des **Livrables** (ex: rapport, code source) et met à jour ses **Tâches**.
4. **Suivi** : Les encadreurs consultent les livrables et ajoutent des commentaires.
5. **Évaluation** : Chaque encadreur évalue le projet selon son domaine (voir section 4).
6. **Soutenance** : Le projet se termine par une présentation orale devant un jury.

## 3. Suivi du Travail (Livrables et Tâches)
- **Livrables** : Ce sont des jalons concrets (fichiers). Chaque livrable a une **version** (V1, V2, etc.) et un **statut** (Soumis, À modifier, Validé).
- **Tâches** : Ce sont de petits éléments de travail définis au sein du projet. La progression globale du projet (%) est calculée automatiquement en fonction du nombre de tâches terminées.

## 4. Le Système de Double Évaluation
Le système utilise deux approches différentes pour noter l'étudiant :

### A. Évaluation Académique (Université)
C'est une évaluation classique. L'encadreur académique attribue une **Note unique** (par exemple 15/20) accompagnée d'un commentaire global sur le travail de recherche et de rédaction.

### B. Évaluation Professionnelle (Entreprise)
C'est une évaluation par **Compétences**. L'encadreur professionnel ne donne pas une note globale directement. Il évalue plusieurs critères spécifiques (ex: Autonomie, Ponctualité, Maîtrise technique) :
- Pour chaque compétence, il donne un **Score** (note de compétence) et une **Appréciation**.
- Le système calcule ensuite la moyenne de tous ces scores pour obtenir une évaluation globale de la performance en entreprise.

## 5. Soutenance et Jury
À la fin du projet, une **Soutenance** est planifiée. Elle regroupe plusieurs **Membres du Jury** (Président, Rapporteur, Examinateur). Le jury enregistre les résultats finaux et les observations après la présentation orale de l'étudiant.
