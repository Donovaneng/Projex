<?php
$pdo = require __DIR__ . '/bootstrap.php';

$stmt = $pdo->query("SHOW COLUMNS FROM notifications");
$columns = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo "Colonnes de la table 'notifications' :\n";
foreach ($columns as $col) {
    echo "- " . $col['Field'] . " (" . $col['Type'] . ")\n";
}
