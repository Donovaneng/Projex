<?php
declare(strict_types=1);

$pdo = require __DIR__ . '/bootstrap.php';
require_once __DIR__ . '/app/Models/Project.php';

$titre = "Système de Gestion de Bibliothèque";
$description = "Un projet de test pour vérifier la visibilité des propositions.";
$studentId = 26;

try {
    // 1. Créer le projet
    $projectId = Project::create($pdo, $titre, $description, date("Y-m-d"), null, $studentId, "ETUDIANT");
    
    // 2. Assigner l'étudiant
    Project::assign($pdo, $projectId, $studentId, null, null);
    
    echo "PROJECT_ID=" . $projectId . "\n";
    echo "SUCCESS\n";
} catch (Throwable $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}
