<?php
require_once __DIR__ . '/bootstrap.php';

try {
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS soutenances (
            id INT AUTO_INCREMENT PRIMARY KEY,
            projet_id INT NOT NULL,
            date_soutenance DATETIME NOT NULL,
            salle VARCHAR(100),
            jury_membres TEXT, -- Liste des noms ou IDs des membres du jury
            note_finale DECIMAL(4,2),
            observations TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (projet_id) REFERENCES projets(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    ");
    echo "Table 'soutenances' créée avec succès.\n";
} catch (PDOException $e) {
    echo "Erreur lors de la création de la table : " . $e->getMessage() . "\n";
}
