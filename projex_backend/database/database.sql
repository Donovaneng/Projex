-- =========================================================
-- PROJEX - Database schema (MySQL 8+)
-- =========================================================

DROP DATABASE IF EXISTS projex_db;
CREATE DATABASE projex_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE projex_db;

-- -------------------------
-- 1) Roles
-- -------------------------
CREATE TABLE roles (
  id TINYINT UNSIGNED PRIMARY KEY,
  code VARCHAR(30) NOT NULL UNIQUE,  -- ADMIN, ETUDIANT, ENCADREUR_ACAD, ENCADREUR_PRO
  label VARCHAR(60) NOT NULL
) ENGINE=InnoDB;

INSERT INTO roles (id, code, label) VALUES
(1, 'ADMIN', 'Administrateur'),
(2, 'ETUDIANT', 'Étudiant'),
(3, 'ENCADREUR_ACAD', 'Encadreur académique'),
(4, 'ENCADREUR_PRO', 'Encadreur professionnel');

-- -------------------------
-- 2) Users (auth + profils)
-- -------------------------
CREATE TABLE users (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  role_id TINYINT UNSIGNED NOT NULL,
  nom VARCHAR(80) NOT NULL,
  prenom VARCHAR(80) NOT NULL,
  email VARCHAR(180) NOT NULL UNIQUE,
  telephone VARCHAR(30) NULL,
  password_hash VARCHAR(255) NOT NULL,         -- bcrypt/argon2
  is_active TINYINT(1) NOT NULL DEFAULT 0,     -- activation par admin (EF4)
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT fk_users_role FOREIGN KEY (role_id) REFERENCES roles(id)
) ENGINE=InnoDB;

-- Pour encadreurs PRO (entreprise)
CREATE TABLE entreprises (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nom VARCHAR(160) NOT NULL,
  ville VARCHAR(80) NULL,
  adresse VARCHAR(255) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Lien optionnel user -> entreprise (pour ENCADREUR_PRO)
CREATE TABLE user_entreprise (
  user_id BIGINT UNSIGNED PRIMARY KEY,
  entreprise_id BIGINT UNSIGNED NOT NULL,
  poste VARCHAR(120) NULL,
  CONSTRAINT fk_ue_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_ue_ent FOREIGN KEY (entreprise_id) REFERENCES entreprises(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- -------------------------
-- 3) Projects
-- -------------------------
CREATE TABLE IF NOT EXISTS projects (
  id INT AUTO_INCREMENT PRIMARY KEY,
  titre VARCHAR(150) NOT NULL,
  description TEXT NULL,
  date_debut DATE NULL,
  date_fin DATE NULL,
  statut ENUM('EN_ATTENTE','EN_COURS','TERMINE') NOT NULL DEFAULT 'EN_ATTENTE',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Affectations : 1 étudiant + 2 encadreurs par projet

-- -------------------------
-- 4) Affectations (1 étudiant + 2 encadreurs sur un projet)
-- -------------------------
CREATE TABLE IF NOT EXISTS project_assignments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  project_id INT NOT NULL,
  etudiant_id INT NOT NULL,
  encadreur_acad_id INT NULL,
  encadreur_pro_id INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_pa_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  CONSTRAINT fk_pa_etudiant FOREIGN KEY (etudiant_id) REFERENCES users(id) ON DELETE RESTRICT,
  CONSTRAINT fk_pa_acad FOREIGN KEY (encadreur_acad_id) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT fk_pa_pro FOREIGN KEY (encadreur_pro_id) REFERENCES users(id) ON DELETE SET NULL,

  -- Un projet ne doit avoir qu’une seule affectation globale (dans notre version simple)
  UNIQUE KEY uq_one_assignment_per_project (project_id),

  -- Un étudiant ne doit avoir qu’un seul projet actif ? (optionnel, on peut l’ajouter plus tard)
  INDEX idx_etudiant (etudiant_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


CREATE INDEX idx_projets_statut ON projects (statut);
-- Un étudiant ne peut être affecté qu'une seule fois au même projet
CREATE UNIQUE INDEX uq_aff_projet_etudiant ON project_assignments (project_id, etudiant_id);

CREATE INDEX idx_aff_encadreurs ON project_assignments (encadreur_acad_id, encadreur_pro_id);

-- -------------------------
-- 5) Tâches (suivi temps réel)
-- -------------------------
CREATE TABLE taches (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  projet_id BIGINT UNSIGNED NOT NULL,
  titre VARCHAR(200) NOT NULL,
  description TEXT NULL,
  assigned_to BIGINT UNSIGNED NOT NULL, -- généralement étudiant
  due_date DATE NULL,
  statut ENUM('A_FAIRE','EN_COURS','TERMINE','BLOQUE') NOT NULL DEFAULT 'A_FAIRE',
  created_by BIGINT UNSIGNED NOT NULL,  -- encadreur ou admin
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT fk_taches_projet FOREIGN KEY (projet_id) REFERENCES projets(id) ON DELETE CASCADE,
  CONSTRAINT fk_taches_assigned_to FOREIGN KEY (assigned_to) REFERENCES users(id),
  CONSTRAINT fk_taches_created_by FOREIGN KEY (created_by) REFERENCES users(id)
) ENGINE=InnoDB;

CREATE INDEX idx_taches_projet_statut ON taches (projet_id, statut);
CREATE INDEX idx_taches_assigned ON taches (assigned_to);

-- -------------------------
-- 6) Livrables (upload fichiers)
-- -------------------------
CREATE TABLE livrables (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  projet_id BIGINT UNSIGNED NOT NULL,
  etudiant_id BIGINT UNSIGNED NOT NULL,
  type ENUM('RAPPORT','CODE_SOURCE','PRESENTATION','AUTRE') NOT NULL DEFAULT 'RAPPORT',
  titre VARCHAR(200) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,   -- chemin serveur
  mime_type VARCHAR(120) NULL,
  file_size BIGINT UNSIGNED NULL,
  version_num INT UNSIGNED NOT NULL DEFAULT 1,
  statut ENUM('SOUMIS','VALIDE','REJETE') NOT NULL DEFAULT 'SOUMIS',
  submitted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  validated_at TIMESTAMP NULL,
  validated_by BIGINT UNSIGNED NULL, -- encadreur
  rejection_reason VARCHAR(500) NULL,

  CONSTRAINT fk_livrables_projet FOREIGN KEY (projet_id) REFERENCES projets(id) ON DELETE CASCADE,
  CONSTRAINT fk_livrables_etudiant FOREIGN KEY (etudiant_id) REFERENCES users(id),
  CONSTRAINT fk_livrables_validated_by FOREIGN KEY (validated_by) REFERENCES users(id)
) ENGINE=InnoDB;

CREATE INDEX idx_livrables_projet_etudiant ON livrables (projet_id, etudiant_id);
CREATE INDEX idx_livrables_statut ON livrables (statut);

-- -------------------------
-- 7) Commentaires/Feedback sur livrables (asynchrone)
-- -------------------------
CREATE TABLE livrable_commentaires (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  livrable_id BIGINT UNSIGNED NOT NULL,
  author_id BIGINT UNSIGNED NOT NULL, -- encadreur ou admin
  commentaire TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_lc_livrable FOREIGN KEY (livrable_id) REFERENCES livrables(id) ON DELETE CASCADE,
  CONSTRAINT fk_lc_author FOREIGN KEY (author_id) REFERENCES users(id)
) ENGINE=InnoDB;

CREATE INDEX idx_lc_livrable ON livrable_commentaires (livrable_id);

-- -------------------------
-- 8) Évaluations académiques (note + commentaire)
-- -------------------------
CREATE TABLE evaluation_academique (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  projet_id BIGINT UNSIGNED NOT NULL,
  etudiant_id BIGINT UNSIGNED NOT NULL,
  encadreur_acad_id BIGINT UNSIGNED NOT NULL,
  note DECIMAL(5,2) NULL, -- ex 14.50
  commentaire TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT fk_ea_projet FOREIGN KEY (projet_id) REFERENCES projets(id) ON DELETE CASCADE,
  CONSTRAINT fk_ea_etudiant FOREIGN KEY (etudiant_id) REFERENCES users(id),
  CONSTRAINT fk_ea_acad FOREIGN KEY (encadreur_acad_id) REFERENCES users(id),
  CONSTRAINT uq_ea UNIQUE (projet_id, etudiant_id)
) ENGINE=InnoDB;

-- -------------------------
-- 9) Grille d'évaluation pro (compétences)
-- -------------------------
CREATE TABLE competences (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  libelle VARCHAR(180) NOT NULL,
  description VARCHAR(300) NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB;

-- Exemples (tu peux adapter)
INSERT INTO competences (libelle, description) VALUES
('Ponctualité & assiduité', 'Respect des horaires et présence'),
('Autonomie', 'Capacité à travailler sans supervision constante'),
('Qualité du travail', 'Fiabilité et précision des livrables'),
('Communication', 'Clarté des échanges et reporting'),
('Maîtrise technique', 'Compétences techniques liées aux tâches');

CREATE TABLE evaluation_professionnelle (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  projet_id BIGINT UNSIGNED NOT NULL,
  etudiant_id BIGINT UNSIGNED NOT NULL,
  encadreur_pro_id BIGINT UNSIGNED NOT NULL,
  commentaire_global TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT fk_ep_projet FOREIGN KEY (projet_id) REFERENCES projets(id) ON DELETE CASCADE,
  CONSTRAINT fk_ep_etudiant FOREIGN KEY (etudiant_id) REFERENCES users(id),
  CONSTRAINT fk_ep_pro FOREIGN KEY (encadreur_pro_id) REFERENCES users(id),
  CONSTRAINT uq_ep UNIQUE (projet_id, etudiant_id)
) ENGINE=InnoDB;

CREATE TABLE evaluation_professionnelle_items (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  evaluation_pro_id BIGINT UNSIGNED NOT NULL,
  competence_id INT UNSIGNED NOT NULL,
  score TINYINT UNSIGNED NOT NULL, -- 0..5 par exemple
  appreciation VARCHAR(255) NULL,

  CONSTRAINT fk_epi_eval FOREIGN KEY (evaluation_pro_id) REFERENCES evaluation_professionnelle(id) ON DELETE CASCADE,
  CONSTRAINT fk_epi_comp FOREIGN KEY (competence_id) REFERENCES competences(id),
  CONSTRAINT uq_epi UNIQUE (evaluation_pro_id, competence_id)
) ENGINE=InnoDB;

-- -------------------------
-- 10) Notifications (upload -> encadreurs)
-- -------------------------
CREATE TABLE notifications (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  titre VARCHAR(200) NOT NULL,
  message VARCHAR(500) NOT NULL,
  type ENUM('INFO','ALERTE','LIVRABLE','EVALUATION','TACHE') NOT NULL DEFAULT 'INFO',
  is_read TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_notif_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE INDEX idx_notifications_user_read ON notifications (user_id, is_read);

-- -------------------------
-- 11) Password reset tokens (EF3)
-- -------------------------
CREATE TABLE password_resets (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  token_hash VARCHAR(255) NOT NULL,
  expires_at DATETIME NOT NULL,
  used_at DATETIME NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_pr_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE INDEX idx_pr_user ON password_resets (user_id);
CREATE INDEX idx_pr_expires ON password_resets (expires_at);

-- -------------------------
-- 12) (Optionnel) Journal d'activité (traçabilité)
-- -------------------------
CREATE TABLE audit_logs (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  actor_id BIGINT UNSIGNED NULL,
  action VARCHAR(120) NOT NULL,
  entity VARCHAR(80) NOT NULL,
  entity_id BIGINT UNSIGNED NULL,
  details JSON NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_audit_actor FOREIGN KEY (actor_id) REFERENCES users(id)
) ENGINE=InnoDB;