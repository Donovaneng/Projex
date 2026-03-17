-- Script pour mettre à jour les données de l'administrateur PROJEX
-- Exécutez ce script dans phpMyAdmin ou via la ligne de commande MySQL

USE projex_db;

-- Mettre à jour l'utilisateur admin existant (id = 1)
UPDATE users SET 
    nom = 'Administrateur',
    prenom = 'PROJEX', 
    email = 'admin@projex.com',
    password_hash = '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- admin2024
    is_active = 1,
    updated_at = CURRENT_TIMESTAMP
WHERE id = 1;

-- Si l'admin n'existe pas, le créer
INSERT IGNORE INTO users (id, nom, prenom, email, role_id, password_hash, is_active, created_at)
VALUES (1, 'Administrateur', 'PROJEX', 'admin@projex.com', 1, '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 1, CURRENT_TIMESTAMP);

-- Afficher les informations de l'admin pour vérification
SELECT id, nom, prenom, email, role_id, is_active, created_at 
FROM users 
WHERE email = 'admin@projex.com';
