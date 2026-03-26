<?php
try {
    $pdo = new PDO('mysql:host=localhost;dbname=projex', 'root', '');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pass = password_hash('admin123', PASSWORD_DEFAULT);
    $stmt = $pdo->prepare('UPDATE users SET mot_de_passe = ?, actif = 1 WHERE email = ?');
    $stmt->execute([$pass, 'admin@projex.com']);
    echo "Password reset for admin@projex.com to 'admin123'";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
