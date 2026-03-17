<?php
$pdo = require __DIR__ . '/bootstrap.php';
try {
    $stmt = $pdo->query("DESCRIBE messages");
    print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
