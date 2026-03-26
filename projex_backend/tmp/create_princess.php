<?php
try {
    $pdo = new PDO('mysql:host=localhost;dbname=projex', 'root', '');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Check if exists
    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->execute(['princess@projex.com']);
    if ($stmt->fetch()) {
        echo "User princess@projex.com already exists.";
        exit;
    }

    $pass = password_hash('Douala@1', PASSWORD_DEFAULT);
    $stmt = $pdo->prepare('INSERT INTO users (nom, prenom, email, role, mot_de_passe, actif) VALUES (?, ?, ?, ?, ?, ?)');
    $stmt->execute(['Princess', 'User', 'princess@projex.com', 'ADMIN', $pass, 1]);
    echo "User created: princess@projex.com with password 'Douala@1'";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
