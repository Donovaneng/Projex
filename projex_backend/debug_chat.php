<?php
$pdo = require __DIR__ . '/bootstrap.php';
echo "--- Tables ---\n";
$stmt = $pdo->query("SHOW TABLES");
print_r($stmt->fetchAll(PDO::FETCH_COLUMN));

echo "\n--- Messages ---\n";
try {
    $stmt = $pdo->query("SELECT * FROM messages");
    print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
} catch (Exception $e) {
    echo "Error on messages: " . $e->getMessage() . "\n";
}

echo "\n--- Project Assignments ---\n";
$stmt = $pdo->query("SELECT * FROM project_assignments");
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
