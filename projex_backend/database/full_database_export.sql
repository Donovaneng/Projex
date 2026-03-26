-- =========================================================
-- PROJEX - Full Database Export (Schema + Initial Data)
-- Version : 2.1 (Communication Fix)
-- Generated on: 2026-03-25
-- =========================================================

DROP DATABASE IF EXISTS projex;
CREATE DATABASE projex
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE projex;

-- -------------------------
-- 1) Roles
-- -------------------------
CREATE TABLE roles (
  id TINYINT UNSIGNED PRIMARY KEY,
  code VARCHAR(30) NOT NULL UNIQUE,
  label VARCHAR(60) NOT NULL
) ENGINE=InnoDB;

INSERT INTO roles (id, code, label) VALUES
(1, 'ADMIN', 'Administrateur'),
(2, 'ETUDIANT', 'Étudiant'),
(3, 'ENCADREUR_ACAD', 'Encadreur académique'),
(4, 'ENCADREUR_PRO', 'Encadreur professionnel');

-- -------------------------
-- 2) Academic Periods
-- -------------------------
CREATE TABLE academic_periods (
  id INT AUTO_INCREMENT PRIMARY KEY,
  label VARCHAR(100) NOT NULL,
  date_debut DATE NOT NULL,
  date_fin DATE NOT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- -------------------------
-- 3) Users
-- -------------------------
CREATE TABLE users (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  role_id TINYINT UNSIGNED NOT NULL,
  nom VARCHAR(80) NOT NULL,
  prenom VARCHAR(80) NOT NULL,
  email VARCHAR(180) NOT NULL UNIQUE,
  telephone VARCHAR(30) NULL,
  image_profil VARCHAR(255) NULL,
  mot_de_passe VARCHAR(255) NOT NULL,
  role VARCHAR(30) NULL,
  role_demande VARCHAR(30) NULL,
  actif TINYINT(1) NOT NULL DEFAULT 0,
  
  matricule VARCHAR(50) NULL,
  filiere VARCHAR(100) NULL,
  niveau VARCHAR(20) NULL,
  
  entreprise VARCHAR(150) NULL,
  poste VARCHAR(150) NULL,
  departement VARCHAR(150) NULL,
  grade VARCHAR(100) NULL,

  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT fk_users_role FOREIGN KEY (role_id) REFERENCES roles(id)
) ENGINE=InnoDB;

-- Insertion de l'administrateur par défaut
-- Mot de passe : admin2024
INSERT INTO users (id, nom, prenom, email, role_id, role, actif, mot_de_passe)
VALUES (1, 'Administrateur', 'PROJEX', 'admin@projex.com', 1, 'ADMIN', 1, '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi');

-- -------------------------
-- 4) Entreprises
-- -------------------------
CREATE TABLE entreprises (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nom VARCHAR(160) NOT NULL,
  ville VARCHAR(80) NULL,
  adresse VARCHAR(255) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE user_entreprise (
  user_id BIGINT UNSIGNED PRIMARY KEY,
  entreprise_id BIGINT UNSIGNED NOT NULL,
  poste VARCHAR(120) NULL,
  CONSTRAINT fk_ue_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_ue_ent FOREIGN KEY (entreprise_id) REFERENCES entreprises(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- -------------------------
-- 5) Project Categories
-- -------------------------
CREATE TABLE IF NOT EXISTS project_categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  label VARCHAR(180) NOT NULL,
  description VARCHAR(300) NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO project_categories (label, description) VALUES
('Développement Web', 'Projets orientés vers les technologies web et applications mobiles'),
('Intelligence Artificielle', 'Projets liés au machine learning, data science et IA'),
('Réseaux & Sécurité', 'Projets de configuration réseau et cybersécurité'),
('IoT & Systèmes Embarqués', 'Projets matériels et systèmes temps réel');

-- -------------------------
-- 6) Projects
-- -------------------------
CREATE TABLE IF NOT EXISTS projects (
  id INT AUTO_INCREMENT PRIMARY KEY,
  categorie_id INT NULL,
  period_id INT NULL,
  titre VARCHAR(150) NOT NULL,
  description TEXT NULL,
  date_debut DATE NULL,
  date_fin DATE NULL,
  statut ENUM('EN_ATTENTE','EN_COURS','TERMINE','REJETE','CLOTURE') NOT NULL DEFAULT 'EN_ATTENTE',
  motif_rejet TEXT NULL,
  created_by BIGINT UNSIGNED NULL,
  created_by_role VARCHAR(30) NULL,
  student_id BIGINT UNSIGNED NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_projects_category FOREIGN KEY (categorie_id) REFERENCES project_categories(id) ON DELETE SET NULL,
  CONSTRAINT fk_projects_period FOREIGN KEY (period_id) REFERENCES academic_periods(id) ON DELETE SET NULL,
  CONSTRAINT fk_projects_student FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_projets_statut ON projects (statut);

-- -------------------------
-- 7) Project Assignments
-- -------------------------
CREATE TABLE IF NOT EXISTS project_assignments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  project_id INT NOT NULL,
  etudiant_id BIGINT UNSIGNED NOT NULL,
  encadreur_acad_id BIGINT UNSIGNED NULL,
  encadreur_pro_id BIGINT UNSIGNED NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_pa_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  CONSTRAINT fk_pa_etudiant FOREIGN KEY (etudiant_id) REFERENCES users(id) ON DELETE RESTRICT,
  CONSTRAINT fk_pa_acad FOREIGN KEY (encadreur_acad_id) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT fk_pa_pro FOREIGN KEY (encadreur_pro_id) REFERENCES users(id) ON DELETE SET NULL,

  UNIQUE KEY uq_one_assignment_per_project (project_id),
  INDEX idx_etudiant (etudiant_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -------------------------
-- 8) Tâches
-- -------------------------
CREATE TABLE taches (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  projet_id INT NOT NULL,
  titre VARCHAR(200) NOT NULL,
  description TEXT NULL,
  assigned_to BIGINT UNSIGNED NOT NULL,
  due_date DATE NULL,
  statut ENUM('A_FAIRE','EN_COURS','TERMINE','BLOQUE') NOT NULL DEFAULT 'A_FAIRE',
  created_by BIGINT UNSIGNED NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT fk_taches_projet FOREIGN KEY (projet_id) REFERENCES projects(id) ON DELETE CASCADE,
  CONSTRAINT fk_taches_assigned_to FOREIGN KEY (assigned_to) REFERENCES users(id),
  CONSTRAINT fk_taches_created_by FOREIGN KEY (created_by) REFERENCES users(id)
) ENGINE=InnoDB;

-- -------------------------
-- 9) Livrables
-- -------------------------
CREATE TABLE livrables (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  projet_id INT NOT NULL,
  etudiant_id BIGINT UNSIGNED NOT NULL,
  type ENUM('RAPPORT','CODE_SOURCE','PRESENTATION','AUTRE') NOT NULL DEFAULT 'RAPPORT',
  titre VARCHAR(200) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  mime_type VARCHAR(120) NULL,
  file_size BIGINT UNSIGNED NULL,
  version_num INT UNSIGNED NOT NULL DEFAULT 1,
  statut ENUM('SOUMIS','VALIDE','REJETE') NOT NULL DEFAULT 'SOUMIS',
  submitted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  validated_at TIMESTAMP NULL,
  validated_by BIGINT UNSIGNED NULL,
  rejection_reason VARCHAR(500) NULL,

  CONSTRAINT fk_livrables_projet FOREIGN KEY (projet_id) REFERENCES projects(id) ON DELETE CASCADE,
  CONSTRAINT fk_livrables_etudiant FOREIGN KEY (etudiant_id) REFERENCES users(id),
  CONSTRAINT fk_livrables_validated_by FOREIGN KEY (validated_by) REFERENCES users(id)
) ENGINE=InnoDB;

-- -------------------------
-- 10) Commentaires Livrables
-- -------------------------
CREATE TABLE livrable_commentaires (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  livrable_id BIGINT UNSIGNED NOT NULL,
  author_id BIGINT UNSIGNED NOT NULL,
  commentaire TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_lc_livrable FOREIGN KEY (livrable_id) REFERENCES livrables(id) ON DELETE CASCADE,
  CONSTRAINT fk_lc_author FOREIGN KEY (author_id) REFERENCES users(id)
) ENGINE=InnoDB;

-- -------------------------
-- 11) Évaluations Académiques
-- -------------------------
CREATE TABLE evaluation_academique (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  projet_id INT NOT NULL,
  etudiant_id BIGINT UNSIGNED NOT NULL,
  encadreur_acad_id BIGINT UNSIGNED NOT NULL,
  note DECIMAL(5,2) NULL,
  commentaire TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT fk_ea_projet FOREIGN KEY (projet_id) REFERENCES projects(id) ON DELETE CASCADE,
  CONSTRAINT fk_ea_etudiant FOREIGN KEY (etudiant_id) REFERENCES users(id),
  CONSTRAINT fk_ea_acad FOREIGN KEY (encadreur_acad_id) REFERENCES users(id),
  CONSTRAINT uq_ea UNIQUE (projet_id, etudiant_id)
) ENGINE=InnoDB;

-- -------------------------
-- 12) Compétences & Évaluations Professionnelles
-- -------------------------
CREATE TABLE competences (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  libelle VARCHAR(180) NOT NULL,
  description VARCHAR(300) NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB;

INSERT INTO competences (libelle, description) VALUES
('Ponctualité & assiduité', 'Respect des horaires et présence'),
('Autonomie', 'Capacité à travailler sans supervision constante'),
('Qualité du travail', 'Fiabilité et précision des livrables'),
('Communication', 'Clarté des échanges et reporting'),
('Maîtrise technique', 'Compétences techniques liées aux tâches');

CREATE TABLE evaluation_professionnelle (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  projet_id INT NOT NULL,
  etudiant_id BIGINT UNSIGNED NOT NULL,
  encadreur_pro_id BIGINT UNSIGNED NOT NULL,
  commentaire_global TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT fk_ep_projet FOREIGN KEY (projet_id) REFERENCES projects(id) ON DELETE CASCADE,
  CONSTRAINT fk_ep_etudiant FOREIGN KEY (etudiant_id) REFERENCES users(id),
  CONSTRAINT fk_ep_pro FOREIGN KEY (encadreur_pro_id) REFERENCES users(id),
  CONSTRAINT uq_ep UNIQUE (projet_id, etudiant_id)
) ENGINE=InnoDB;

CREATE TABLE evaluation_professionnelle_items (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  evaluation_pro_id BIGINT UNSIGNED NOT NULL,
  competence_id INT UNSIGNED NOT NULL,
  score TINYINT UNSIGNED NOT NULL,
  appreciation VARCHAR(255) NULL,

  CONSTRAINT fk_epi_eval FOREIGN KEY (evaluation_pro_id) REFERENCES evaluation_professionnelle(id) ON DELETE CASCADE,
  CONSTRAINT fk_epi_comp KEY (competence_id) REFERENCES competences(id),
  CONSTRAINT uq_epi UNIQUE (evaluation_pro_id, competence_id)
) ENGINE=InnoDB;

-- -------------------------
-- 13) Soutenances & Jury
-- -------------------------
CREATE TABLE soutenances (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  projet_id INT NOT NULL,
  date_soutenance DATETIME NOT NULL,
  salle VARCHAR(100) NULL,
  jury_membres TEXT NULL,
  note_finale DECIMAL(5,2) NULL,
  observations TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_soutenance_projet FOREIGN KEY (projet_id) REFERENCES projects(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE jury_members (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  soutenance_id BIGINT UNSIGNED NOT NULL,
  user_id BIGINT UNSIGNED NULL,
  external_name VARCHAR(150) NULL,
  role ENUM('PRESIDENT', 'RAPPORTEUR', 'EXAMINATEUR', 'INVITE') NOT NULL,
  
  CONSTRAINT fk_jury_soutenance FOREIGN KEY (soutenance_id) REFERENCES soutenances(id) ON DELETE CASCADE,
  CONSTRAINT fk_jury_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- -------------------------
-- 14) Notifications
-- -------------------------
CREATE TABLE notifications (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  titre VARCHAR(200) NOT NULL,
  message VARCHAR(500) NOT NULL,
  link_url VARCHAR(255) NULL,
  entity_type VARCHAR(50) NULL,
  entity_id BIGINT UNSIGNED NULL,
  type ENUM('INFO','ALERTE','LIVRABLE','EVALUATION','TACHE','MESSAGE') NOT NULL DEFAULT 'INFO',
  is_read TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_notif_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- -------------------------
-- 15) Password Resets
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

-- -------------------------
-- 16) Audit Logs
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

-- -------------------------
-- 17) Messages (Chat)
-- -------------------------
CREATE TABLE IF NOT EXISTS messages (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  project_id INT NULL,
  sender_id BIGINT UNSIGNED NOT NULL,
  recipient_id BIGINT UNSIGNED NULL,
  message TEXT NOT NULL,
  type ENUM('text', 'image', 'file') NOT NULL DEFAULT 'text',
  file_path VARCHAR(255) NULL,
  is_read TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_messages_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  CONSTRAINT fk_messages_sender FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_messages_recipient FOREIGN KEY (recipient_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
