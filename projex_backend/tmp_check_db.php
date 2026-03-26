<?php
$pdo = require 'bootstrap.php';
$stmt = $pdo->query("SHOW COLUMNS FROM livrables");
$cols = $stmt->fetchAll(PDO::FETCH_COLUMN);
foreach($cols as $c) {
    echo "COLUMN_NAME: " . $c . "\n";
}
