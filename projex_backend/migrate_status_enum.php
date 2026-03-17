<?php
declare(strict_types=1);

$pdo = require __DIR__ . '/bootstrap.php';

try {
    $pdo->exec("ALTER TABLE projects MODIFY COLUMN statut ENUM('EN_ATTENTE', 'PROPOSE', 'EN_COURS', 'TERMINE', 'REJETE', 'CLOTURE') NOT NULL DEFAULT 'EN_ATTENTE'");
    echo "SUCCESS: projects.statut column updated.\n";
} catch (Throwable $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}
