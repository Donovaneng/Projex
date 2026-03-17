<?php
declare(strict_types=1);

$pdo = require __DIR__ . '/bootstrap.php';
require_once __DIR__ . '/app/Controllers/SupervisorController.php';

echo "Testing Project::search for Admin...\n";
$filters = ["q" => "", "statut" => "EN_ATTENTE"];
$stmt = $pdo->prepare("SELECT p.*, u.nom as student_nom, u.prenom as student_prenom FROM projects p LEFT JOIN users u ON u.id = p.student_id WHERE p.statut = 'EN_ATTENTE'");
$stmt->execute();
$results = $stmt->fetchAll();
echo "Found " . count($results) . " projects in EN_ATTENTE for Admin.\n";
foreach($results as $r) {
    echo "- ID: {$r['id']}, Titre: {$r['titre']}, Student: {$r['student_prenom']} {$r['student_nom']}\n";
}

echo "\nTesting Supervisor proposals query...\n";
$stmt = $pdo->prepare("
    SELECT p.*, u.prenom as etudiant_prenom, u.nom as etudiant_nom 
    FROM projects p
    LEFT JOIN users u ON p.created_by = u.id
    WHERE p.statut IN ('PROPOSE', 'EN_ATTENTE')
    ORDER BY p.created_at DESC
");
$stmt->execute();
$proposals = $stmt->fetchAll();
echo "Found " . count($proposals) . " proposals for Supervisor.\n";
foreach($proposals as $p) {
    echo "- ID: {$p['id']}, Titre: {$p['titre']}, By: {$p['etudiant_prenom']} {$p['etudiant_nom']}\n";
}
