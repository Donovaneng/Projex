<?php
// Créer un nouvel admin de test
require_once 'projex_backend/bootstrap.php';

$hash = password_hash('admin123', PASSWORD_DEFAULT);

$stmt = $pdo->prepare(
    "INSERT INTO users (nom, prenom, email, role, mot_de_passe, actif) 
     VALUES (?, ?, ?, ?, ?, ?)"
);

$result = $stmt->execute([
    'Admin',
    'Test',
    'admin@test.com',
    'ADMIN',
    $hash,
    1
]);

echo $result ? " Nouvel admin créé: admin@test.com / admin123" : " Erreur";
?>
