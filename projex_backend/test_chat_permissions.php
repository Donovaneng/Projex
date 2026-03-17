<?php
$pdo = require __DIR__ . '/bootstrap.php';

// Check projects and their student_id
echo "--- Projects and Student IDs ---\n";
$stmt = $pdo->query("SELECT id, titre, student_id, created_by, created_by_role FROM projects");
$projects = $stmt->fetchAll(PDO::FETCH_ASSOC);
print_r($projects);

foreach ($projects as $p) {
    if ($p['student_id']) {
        $studentId = (int)$p['student_id'];
        $projectId = (int)$p['id'];
        
        echo "\nChecking access for Student $studentId on Project $projectId...\n";
        
        $stmt = $pdo->prepare("SELECT project_id FROM project_assignments WHERE project_id = ? AND (etudiant_id = ? OR encadreur_acad_id = ? OR encadreur_pro_id = ?)");
        $stmt->execute([$projectId, $studentId, $studentId, $studentId]);
        $assignment = $stmt->fetch();
        
        if ($assignment) {
            echo "Access GRANTED via project_assignments\n";
        } else {
            echo "Access DENIED via project_assignments (REQUIRED by ChatController)\n";
            
            // Check if it's the student's project but missing assignment
            if ($p['student_id'] == $studentId) {
                echo "BUT Student IS the student_id of the project! (ChatController should be updated)\n";
            }
        }
    }
}
