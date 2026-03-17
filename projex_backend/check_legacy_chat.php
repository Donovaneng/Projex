<?php
$pdo = require __DIR__ . '/bootstrap.php';
try {
    $stmt = $pdo->query("DESCRIBE projets_commentaires");
    echo "--- Table projets_commentaires ---\n";
    print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
    
    $stmt = $pdo->query("SELECT * FROM projets_commentaires LIMIT 5");
    echo "\n--- Data in projets_commentaires ---\n";
    print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
