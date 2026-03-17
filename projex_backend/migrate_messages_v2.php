<?php
$pdo = require __DIR__ . '/bootstrap.php';

try {
    $sql = "CREATE TABLE IF NOT EXISTS messages (
      id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      project_id INT NOT NULL,
      sender_id BIGINT UNSIGNED NOT NULL,
      message TEXT NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_messages_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
      CONSTRAINT fk_messages_sender FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;";

    $pdo->exec($sql);
    
    // MySQL 5.7+ supporte CREATE INDEX IF NOT EXISTS si on le gère avec un try/catch ou si l'index n'existe pas
    try {
        $pdo->exec("CREATE INDEX idx_messages_project ON messages (project_id);");
    } catch (Exception $e) {
        // Ignorer si l'index existe déjà
    }

    echo "Table 'messages' créée avec succès !\n";
} catch (PDOException $e) {
    echo "Erreur : " . $e->getMessage() . "\n";
}

