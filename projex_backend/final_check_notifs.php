<?php
$pdo = require __DIR__ . '/bootstrap.php';

$stmt = $pdo->query("SHOW COLUMNS FROM notifications");
$columns = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo "Structure complète de 'notifications' :\n";
foreach ($columns as $col) {
    echo "COLONNE: " . $col['Field'] . " | TYPE: " . $col['Type'] . " | NULL: " . $col['Null'] . "\n";
}
