<?php
declare(strict_types=1);

$pdo = require __DIR__ . '/bootstrap.php';

$stmt = $pdo->query("SHOW COLUMNS FROM projects LIKE 'statut'");
$col = $stmt->fetch();
echo "COLUMN statut TYPE: " . $col['Type'] . "\n";

$stmt = $pdo->query("SELECT DISTINCT statut FROM projects");
$stats = $stmt->fetchAll(PDO::FETCH_COLUMN);
echo "CURRENT STATUSES IN DB: " . implode(', ', $stats) . "\n";
