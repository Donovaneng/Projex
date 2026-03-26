-- =========================================================
-- PROJEX - Fix Communication Schema
-- Correction des tables notifications et messages
-- =========================================================

USE projex;

-- 1. Correction de la table notifications
-- Ajout des colonnes pour les liens et les entités liées
-- Mise à jour de l'énumération pour inclure les messages
ALTER TABLE notifications 
ADD COLUMN link_url VARCHAR(255) NULL AFTER message,
ADD COLUMN entity_type VARCHAR(50) NULL AFTER link_url,
ADD COLUMN entity_id BIGINT UNSIGNED NULL AFTER entity_type,
MODIFY COLUMN type ENUM('INFO','ALERTE','LIVRABLE','EVALUATION','TACHE','MESSAGE') NOT NULL DEFAULT 'INFO';

-- 2. Correction de la table messages
-- Ajout du destinataire, du type de message (fichiers/images) et du statut de lecture
ALTER TABLE messages 
ADD COLUMN recipient_id BIGINT UNSIGNED NULL AFTER sender_id,
ADD COLUMN type ENUM('text', 'image', 'file') NOT NULL DEFAULT 'text' AFTER message,
ADD COLUMN file_path VARCHAR(255) NULL AFTER type,
ADD COLUMN is_read TINYINT(1) NOT NULL DEFAULT 0 AFTER file_path;

-- 3. Mise à jour de la contrainte pour le destinataire
ALTER TABLE messages
ADD CONSTRAINT fk_messages_recipient FOREIGN KEY (recipient_id) REFERENCES users(id) ON DELETE SET NULL;
