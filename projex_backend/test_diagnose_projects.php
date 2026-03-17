<?php
declare(strict_types=1);

$pdo = require __DIR__ . '/bootstrap.php';

echo "--- ALL PROJECTS TABLE ---\n";
$stmt = $pdo->query("SELECT * FROM projects");
$all = $stmt->fetchAll();
print_r($all);

echo "\n--- ALL PROJECT ASSIGNMENTS ---\n";
$stmt = $pdo->query("SELECT * FROM project_assignments");
print_r($stmt->fetchAll());

echo "\n--- TEST: Supervisor Query Simulation ---\n";
$stmt = $pdo->prepare("
    SELECT p.*, u.prenom as etudiant_prenom, u.nom as etudiant_nom 
    FROM projects p
    LEFT JOIN users u ON p.created_by = u.id
    WHERE p.statut IN ('PROPOSE', 'EN_ATTENTE')
    ORDER BY p.created_at DESC
");
$stmt->execute();
$proposals = $stmt->fetchAll();
echo "Found " . count($proposals) . " proposals.\n";
foreach($proposals as $p) {
    echo "ID: {$p['id']}, Status: {$p['statut']}, CreatedBy: {$p['created_by']}, StudentName: {$p['etudiant_prenom']} {$p['etudiant_nom']}\n";
}
