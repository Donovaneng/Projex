<?php
$pdo = require 'bootstrap.php';
try {
    echo "Fixing livrables table...\n";
    $pdo->exec("ALTER TABLE livrables ADD COLUMN description TEXT NULL AFTER titre");
    echo "Added description.\n";
} catch (Exception $e) { echo "Skip description: " . $e->getMessage() . "\n"; }

try {
    $pdo->exec("ALTER TABLE livrables ADD COLUMN file_name VARCHAR(255) NULL AFTER description");
    echo "Added file_name.\n";
} catch (Exception $e) { echo "Skip file_name: " . $e->getMessage() . "\n"; }

try {
    $pdo->exec("ALTER TABLE livrables ADD COLUMN statut ENUM('SOUMIS','VALIDE','REJETE') NOT NULL DEFAULT 'SOUMIS' AFTER version_num");
    echo "Added statut.\n";
} catch (Exception $e) { echo "Skip statut: " . $e->getMessage() . "\n"; }

try {
    $pdo->exec("ALTER TABLE livrables MODIFY COLUMN file_path VARCHAR(500) NOT NULL");
    echo "Modified file_path length.\n";
} catch (Exception $e) { echo "Skip modify file_path: " . $e->getMessage() . "\n"; }

echo "Done.\n";
