<?php
declare(strict_types=1);

$pdo = require __DIR__ . '/bootstrap.php';

$queries = [
    "CREATE TABLE IF NOT EXISTS academic_periods (
        id INT AUTO_INCREMENT PRIMARY KEY,
        label VARCHAR(100) NOT NULL,
        date_debut DATE NOT NULL,
        date_fin DATE NOT NULL,
        is_active TINYINT(1) DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB",

    "CREATE TABLE IF NOT EXISTS project_categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        label VARCHAR(100) NOT NULL,
        description TEXT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB",

    "CREATE TABLE IF NOT EXISTS audit_logs (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        actor_id INT NULL,
        action VARCHAR(120) NOT NULL,
        entity VARCHAR(80) NOT NULL,
        entity_id BIGINT UNSIGNED NULL,
        details JSON NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_audit_actor FOREIGN KEY (actor_id) REFERENCES users(id) ON DELETE SET NULL
    ) ENGINE=InnoDB"
];

foreach ($queries as $sql) {
    try {
        echo "Executing: " . substr($sql, 0, 50) . "...\n";
        $pdo->exec($sql);
        echo "SUCCESS.\n";
    } catch (PDOException $e) {
        echo "ERROR: " . $e->getMessage() . "\n";
    }
}

echo "\nMigration Complete.\n";
