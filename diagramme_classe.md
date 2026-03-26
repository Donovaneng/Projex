# Diagramme de Classe UML PROJEX (Classification par domaines)

Ce diagramme utilise une classification visuelle pour séparer les différents domaines fonctionnels du système PROJEX.

```mermaid
classDiagram
    direction TB

    %% --- DÉFINITION DES STYLES ---
    classDef userGroup fill:#e3f2fd,stroke:#1565c0,stroke-width:2px;
    classDef projectGroup fill:#f1f8e9,stroke:#2e7d32,stroke-width:2px;
    classDef suiviGroup fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px;
    classDef evalGroup fill:#fff8e1,stroke:#f57c00,stroke-width:2px;
    classDef defenseGroup fill:#ffebee,stroke:#c62828,stroke-width:2px;

    %% --- 1. DOMAINE : UTILISATEURS ---
    class Utilisateur:::userGroup {
        -int id
        -string nom
        -string prenom
        -string email
        -string telephone
        -string role
        -bool actif
        -string image_profil
        -datetime created_at
        +authentifier() bool
        +modifierProfil(donnees) void
        +changerMotDePasse(ancien, nouveau) bool
        +mettreAJourAvatar(chemin) void
    }

    class Etudiant:::userGroup {
        -string matricule
        -string filiere
        -string niveau
        +proposerProjet() int
        +soumettreLivrable() int
        +consulterSesLivrables() array
        +postulerAProjet() bool
    }

    class Administrateur:::userGroup {
        +activerCompte() void
        +assignerEncadreurs() void
        +gererPeriodes() void
        +programmerSoutenance() void
    }

    class EncadreurAcad:::userGroup {
        -string departement
        -string grade
        +evaluerProjet() void
        +commenterLivrable() void
    }

    class EncadreurPro:::userGroup {
        -string entreprise
        -string poste
        +evaluerCompetences() void
    }

    Utilisateur <|-- Etudiant
    Utilisateur <|-- Administrateur
    Utilisateur <|-- EncadreurAcad
    Utilisateur <|-- EncadreurPro

    %% --- 2. DOMAINE : PROJET & STRUCTURE ---
    class Projet:::projectGroup {
        -int id
        -string titre
        -string description
        -date date_debut
        -string statut
        -string motif_rejet
        +valider() void
        +rejeter(motif) void
        +calculerProgression() int
        +estDisponible() bool
    }

    class CategorieProjet:::projectGroup {
        -int id
        -string label
        -string description
    }

    class PeriodeAcademique:::projectGroup {
        -int id
        -string label
        -bool est_active
    }

    Projet "0..*" -- "1" CategorieProjet : appartient à
    Projet "0..*" -- "1" PeriodeAcademique : s'inscrit dans
    Etudiant "1" -- "0..*" Projet : propose / réalise
    EncadreurAcad "0..1" -- "0..*" Projet : encadre
    EncadreurPro "0..1" -- "0..*" Projet : supervise

    %% --- 3. DOMAINE : SUIVI ET RÉALISATION ---
    class Livrable:::suiviGroup {
        -int id
        -string titre
        -string type
        -int version_num
        -string file_name
        -string file_path
        -string statut
        +mettreAJourStatut() void
        +ajouterCommentaire() void
    }

    class Tache:::suiviGroup {
        -int id
        -string titre
        -string statut
        +updateStatut() void
    }

    Projet "1" *-- "0..*" Livrable : contient
    Projet "1" *-- "0..*" Tache : possède

    %% --- 4. DOMAINE : ÉVALUATIONS ---
    class EvaluationAcademique:::evalGroup {
        -float note
        -string commentaire
        -datetime created_at
    }

    class EvaluationProfessionnelle:::evalGroup {
        -string commentaire_global
        -datetime created_at
        +getMoyennePro() float
    }

    class EvaluationProItem:::evalGroup {
        -int score
        -string appreciation
    }

    class Competence:::evalGroup {
        -int id
        -string libelle
    }

    Projet "1" -- "0..1" EvaluationAcademique : objet de
    Projet "1" -- "1" EvaluationProfessionnelle : objet de
    EvaluationProfessionnelle "1" *-- "0..*" EvaluationProItem : détaille
    EvaluationProItem "0..*" -- "1" Competence : évalue

    %% --- 5. DOMAINE : SOUTENANCE ---
    class Soutenance:::defenseGroup {
        -int id
        -datetime date_soutenance
        -string salle
        -float note_finale
        -string observations
        +planifier() void
        +enregistrerResultats() void
    }

    class MembreJury:::defenseGroup {
        -string role
        -string external_name
    }

    Projet "1" o-- "0..1" Soutenance : donne lieu à
    Soutenance "1" *-- "1..*" MembreJury : composée de
    MembreJury "0..*" -- "0..1" Utilisateur : est
```

## Explication du classement

Les classes ont été regroupées par **Domaines Métier** avec un code couleur distinct :

1. **Bleu (Utilisateurs)** : Les acteurs du système et la hiérarchie d'héritage.
2. **Vert (Projet)** : La structure centrale du projet et ses métadonnées (catégorie, période).
3. **Violet (Suivi)** : Les éléments liés à la progression concrète du travail (Livrables et Tâches).
4. **Orange (Évaluations)** : Le système de notation académique et l'évaluation par compétences professionnelles.
5. **Rose (Soutenance)** : L'organisation de l'événement final et la gestion du jury.

Ce classement permet d'identifier immédiatement les responsabilités de chaque classe.
