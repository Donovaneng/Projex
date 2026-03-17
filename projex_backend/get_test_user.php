<?php
declare(strict_types=1);

$pdo = require __DIR__ . '/bootstrap.php';

$stmt = $pdo->query("SELECT id, nom, prenom, role FROM users WHERE role = 'ETUDIANT' LIMIT 1");
$user = $stmt->fetch();

if ($user) {
    echo "USER_ID=" . $user['id'] . "\n";
    echo "USER_NAME=" . $user['prenom'] . " " . $user['nom'] . "\n";
} else {
    echo "NO_STUDENT_FOUND\n";
}
