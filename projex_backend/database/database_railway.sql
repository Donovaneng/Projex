-- =========================================================
-- PROJEX - Database schema (Version pour Railway)
-- =========================================================

-- Note: Les commandes CREATE DATABASE et USE ont été supprimées 
-- car Railway gère déjà l'initialisation de la base de données.

-- -------------------------
-- 1) Roles
-- -------------------------
CREATE TABLE IF NOT EXISTS roles (
  id TINYINT UNSIGNED PRIMARY KEY,
  code VARCHAR(30) NOT NULL UNIQUE,
  label VARCHAR(60) NOT NULL
) ENGINE=InnoDB;

INSERT IGNORE INTO roles (id, code, label) VALUES
(1, 'ADMIN', 'Administrateur'),
(2, 'ETUDIANT', 'Étudiant'),
(3, 'ENCADREUR_ACAD', 'Encadreur académique'),
(4, 'ENCADREUR_PRO', 'Encadreur professionnel');

-- -------------------------
-- 2) Users
-- -------------------------
CREATE TABLE IF NOT EXISTS users (
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

-- -------------------------
-- 3) Entreprises
-- -------------------------
CREATE TABLE IF NOT EXISTS entreprises (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nom VARCHAR(160) NOT NULL,
  ville VARCHAR(80) NULL,
  adresse VARCHAR(255) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- -------------------------
-- 4) Categories
-- -------------------------
CREATE TABLE IF NOT EXISTS project_categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  label VARCHAR(180) NOT NULL,
  description VARCHAR(300) NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT IGNORE INTO project_categories (label, description) VALUES
('Développement Web', 'Projets orientés vers les technologies web et applications mobiles'),
('Intelligence Artificielle', 'Projets liés au machine learning, data science et IA'),
('Réseaux & Sécurité', 'Projets de configuration réseau et cybersécurité'),
('IoT & Systèmes Embarqués', 'Projets matériels et systèmes temps réel');

-- -------------------------
-- 5) Projects
-- -------------------------
CREATE TABLE IF NOT EXISTS projects (
  id INT AUTO_INCREMENT PRIMARY KEY,
  categorie_id INT NULL,
  titre VARCHAR(150) NOT NULL,
  description TEXT NULL,
  date_debut DATE NULL,
  date_fin DATE NULL,
  statut ENUM('EN_ATTENTE','EN_COURS','TERMINE') NOT NULL DEFAULT 'EN_ATTENTE',
  created_by BIGINT UNSIGNED NULL,
  created_by_role VARCHAR(30) NULL,
  student_id BIGINT UNSIGNED NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_projects_category FOREIGN KEY (categorie_id) REFERENCES project_categories(id) ON DELETE SET NULL,
  CONSTRAINT fk_projects_student FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -------------------------
-- 6) Affectations
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
-- 7) Tâches
-- -------------------------
CREATE TABLE IF NOT EXISTS taches (
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
-- 8) Livrables
-- -------------------------
CREATE TABLE IF NOT EXISTS livrables (
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
-- 9) Commentaires
-- -------------------------
CREATE TABLE IF NOT EXISTS livrable_commentaires (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  livrable_id BIGINT UNSIGNED NOT NULL,
  author_id BIGINT UNSIGNED NOT NULL,
  commentaire TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_lc_livrable FOREIGN KEY (livrable_id) REFERENCES livrables(id) ON DELETE CASCADE,
  CONSTRAINT fk_lc_author FOREIGN KEY (author_id) REFERENCES users(id)
) ENGINE=InnoDB;

-- -------------------------
-- 10) Évaluations
-- -------------------------
CREATE TABLE IF NOT EXISTS evaluation_academique (
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
-- 11) Compétences
-- -------------------------
CREATE TABLE IF NOT EXISTS competences (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  libelle VARCHAR(180) NOT NULL,
  description VARCHAR(300) NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB;

INSERT IGNORE INTO competences (libelle, description) VALUES
('Ponctualité & assiduité', 'Respect des horaires et présence'),
('Autonomie', 'Capacité à travailler sans supervision constante'),
('Qualité du travail', 'Fiabilité et précision des livrables'),
('Communication', 'Clarté des échanges et reporting'),
('Maîtrise technique', 'Compétences techniques liées aux tâches');

-- -------------------------
-- 12) Messages (Chat)
-- -------------------------
CREATE TABLE IF NOT EXISTS messages (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  project_id INT NULL,
  sender_id BIGINT UNSIGNED NOT NULL,
  recipient_id BIGINT UNSIGNED NULL,
  message TEXT NOT NULL,
  type ENUM('text', 'image', 'file') DEFAULT 'text',
  file_path VARCHAR(255) NULL,
  is_read TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_messages_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  CONSTRAINT fk_messages_sender FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -------------------------
-- 13) Notifications
-- -------------------------
CREATE TABLE IF NOT EXISTS notifications (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  titre VARCHAR(200) NOT NULL,
  message VARCHAR(500) NOT NULL,
  type ENUM('INFO','ALERTE','LIVRABLE','EVALUATION','TACHE','MESSAGE') NOT NULL DEFAULT 'INFO',
  is_read TINYINT(1) NOT NULL DEFAULT 0,
  project_id INT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_notif_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;
