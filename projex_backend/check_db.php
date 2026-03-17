<?php
$config = require __DIR__ . '/config/db.php';

try {
    $db = new PDO(
        "mysql:host=" . $config['host'] . ";dbname=" . $config['name'] . ";charset=" . $config['charset'],
        $config['user'],
        $config['pass']
    );
    $tables = ['users', 'projects', 'project_categories', 'project_assignments', 'competences', 'evaluation_academique', 'evaluation_professionnelle', 'evaluation_professionnelle_items', 'livrables', 'audit_log', 'messages'];
    echo "--- Database Status Check ---\n";
    foreach ($tables as $table) {
        $stmt = $db->query("SHOW TABLES LIKE '$table'");
        if ($stmt->rowCount() > 0) {
            echo "Table $table: OK\n";
            $count = $db->query("SELECT COUNT(*) FROM $table")->fetchColumn();
            echo "  Count: $count\n";
        } else {
            echo "Table $table: MISSING\n";
        }
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
