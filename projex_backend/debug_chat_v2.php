<?php
$pdo = require __DIR__ . '/bootstrap.php';

echo "--- Tables ---\n";
$stmt = $pdo->query("SHOW TABLES");
$tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
foreach($tables as $t) echo "- $t\n";

if (!in_array('messages', $tables)) {
    echo "\nFATAL: Table messages is missing!\n";
} else {
    echo "\nTable messages exists.\n";
}

echo "\n--- Last 5 Projects ---\n";
$stmt = $pdo->query("SELECT id, titre, student_id FROM projects ORDER BY id DESC LIMIT 5");
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));

echo "\n--- Last 5 Assignments ---\n";
$stmt = $pdo->query("SELECT * FROM project_assignments ORDER BY id DESC LIMIT 5");
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));

echo "\n--- Last 5 Messages ---\n";
try {
    $stmt = $pdo->query("SELECT * FROM messages ORDER BY id DESC LIMIT 5");
    print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
