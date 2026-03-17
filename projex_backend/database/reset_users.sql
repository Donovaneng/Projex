-- Script de réinitialisation des utilisateurs PROJEX
-- Supprime tous les utilisateurs sauf l'admin de démonstration

USE projex_db;

-- Supprimer toutes les données liées aux utilisateurs (ordre important pour les contraintes)
DELETE FROM audit_logs WHERE user_id > 1;
DELETE FROM notifications WHERE user_id > 1;
DELETE FROM password_resets WHERE user_id > 1;
DELETE FROM evaluation_professionnelle WHERE student_id > 1 OR supervisor_id > 1;
DELETE FROM evaluation_academique WHERE student_id > 1 OR supervisor_id > 1;
DELETE FROM livrable_commentaires WHERE user_id > 1;
DELETE FROM livrables WHERE student_id > 1;
DELETE FROM taches WHERE student_id > 1;
DELETE FROM project_assignments WHERE student_id > 1;
DELETE FROM projects WHERE created_by > 1;
DELETE FROM users WHERE id > 1;

-- Réinitialiser les auto-increment
ALTER TABLE users AUTO_INCREMENT = 2;
ALTER TABLE projects AUTO_INCREMENT = 1;
ALTER TABLE taches AUTO_INCREMENT = 1;
ALTER TABLE livrables AUTO_INCREMENT = 1;
ALTER TABLE evaluation_academique AUTO_INCREMENT = 1;
ALTER TABLE evaluation_professionnelle AUTO_INCREMENT = 1;
ALTER TABLE notifications AUTO_INCREMENT = 1;
ALTER TABLE audit_logs AUTO_INCREMENT = 1;

-- Confirmer la réinitialisation
SELECT 'Réinitialisation terminée. Seul l\'admin (id=1) reste.' as message;
