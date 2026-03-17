<?php
$pdo = require __DIR__ . '/bootstrap.php';

echo "--- Test de Permission Chat pour tous les Étudiants ---\n";

$stmt = $pdo->query("SELECT id, prenom, nom FROM users WHERE role = 'ETUDIANT'");
$students = $stmt->fetchAll(PDO::FETCH_ASSOC);

foreach ($students as $student) {
    $studentId = (int)$student['id'];
    
    // Projets où cet étudiant est le student_id
    $stmt = $pdo->prepare("SELECT id, titre FROM projects WHERE student_id = ?");
    $stmt->execute([$studentId]);
    $projects = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    foreach ($projects as $project) {
        $projectId = (int)$project['id'];
        
        // Simuler ChatController logic
        $stmtPerm = $pdo->prepare("SELECT project_id FROM project_assignments WHERE project_id = ? AND (etudiant_id = ? OR encadreur_acad_id = ? OR encadreur_pro_id = ?)");
        $stmtPerm->execute([$projectId, $studentId, $studentId, $studentId]);
        $hasAccess = $stmtPerm->fetch();
        
        if ($hasAccess) {
            echo "[OK] Student $studentId ({$student['prenom']}) has access to Project $projectId ({$project['titre']})\n";
        } else {
            echo "[FAIL] Student $studentId ({$student['prenom']}) is DENIED access to Project $projectId ({$project['titre']})\n";
        }
    }
}
