<?php
$pdo = require __DIR__ . '/bootstrap.php';

echo "--- Structure table notifications ---\n";
$stmt = $pdo->query("DESCRIBE notifications");
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
