<?php
$pdo = require __DIR__ . '/bootstrap.php';

echo "=== Vérification Étudiant 26 ===\n";
$studentId = 26;

$stmt = $pdo->prepare("SELECT * FROM project_assignments WHERE etudiant_id = ?");
$stmt->execute([$studentId]);
$assignments = $stmt->fetchAll(PDO::FETCH_ASSOC);

if (empty($assignments)) {
    echo "L'étudiant 26 n'a AUCUNE affectation dans project_assignments.\n";
} else {
    echo "Affectations pour l'étudiant 26 :\n";
    print_r($assignments);
}

$stmt = $pdo->prepare("SELECT id, titre, student_id FROM projects WHERE student_id = ?");
$stmt->execute([$studentId]);
$projects = $stmt->fetchAll(PDO::FETCH_ASSOC);

if (empty($projects)) {
    echo "L'étudiant 26 n'est student_id d'AUCUN projet dans la table projects.\n";
} else {
    echo "Projets où l'étudiant 26 est student_id :\n";
    print_r($projects);
}
