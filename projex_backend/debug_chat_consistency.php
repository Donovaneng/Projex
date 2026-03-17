<?php
$pdo = require __DIR__ . '/bootstrap.php';

echo "--- Incohérences Détectées ---\n";
// Projets où student_id est défini mais absent de project_assignments
$stmt = $pdo->query("
    SELECT p.id, p.titre, p.student_id 
    FROM projects p
    LEFT JOIN project_assignments pa ON p.id = pa.project_id
    WHERE p.student_id IS NOT NULL AND pa.project_id IS NULL
");
$missingAssignments = $stmt->fetchAll(PDO::FETCH_ASSOC);

if (empty($missingAssignments)) {
    echo "Aucune incohérence trouvée : tous les projets avec un student_id ont une affectation.\n";
} else {
    echo "Projets avec student_id mais SANS entrée dans project_assignments :\n";
    print_r($missingAssignments);
}

echo "\n--- Vérification des Rôles et IDs ---";
$stmt = $pdo->query("SELECT id, prenom, nom, role FROM users WHERE role = 'ETUDIANT'");
$students = $stmt->fetchAll(PDO::FETCH_ASSOC);
print_r($students);
