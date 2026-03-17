<?php
$pdo = require_once __DIR__ . '/bootstrap.php';

try {
    // $pdo est déjà initialisé par bootstrap.php
    
    $sql = "CREATE TABLE IF NOT EXISTS messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        project_id INT NOT NULL,
        sender_id INT NOT NULL,
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
        FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;";

    $pdo->exec($sql);
    echo "Table 'messages' créée avec succès !\n";

} catch (PDOException $e) {
    die("Erreur lors de la création de la table : " . $e->getMessage() . "\n");
}
