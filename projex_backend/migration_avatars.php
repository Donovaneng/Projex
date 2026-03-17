<?php
try {
    $pdo = new PDO('mysql:host=localhost;dbname=projex', 'root', '');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Check if column exists
    $stmt = $pdo->query("SHOW COLUMNS FROM users LIKE 'image_profil'");
    if (!$stmt->fetch()) {
        $pdo->exec("ALTER TABLE users ADD COLUMN image_profil VARCHAR(255) NULL AFTER email");
        echo "Column image_profil added successfully.\n";
    } else {
        echo "Column image_profil already exists.\n";
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
