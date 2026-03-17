<?php
declare(strict_types=1);

$pdo = require __DIR__ . '/bootstrap.php';
require_once __DIR__ . '/app/Models/Project.php';
require_once __DIR__ . '/app/Models/Soutenance.php';

echo "--- PROJECTS LIST (Models/Project.php) ---\n";
$projects = Project::all($pdo);
foreach ($projects as $p) {
    echo "ID: {$p['id']}, Titre: {$p['titre']}, Statut: {$p['statut']}, Etudiant: {$p['prenom_etudiant']} {$p['nom_etudiant']}\n";
}

echo "\n--- SOUTENANCES LIST (Models/Soutenance.php) ---\n";
try {
    $soutenances = Soutenance::all($pdo);
    echo "Found " . count($soutenances) . " soutenances.\n";
} catch (Throwable $e) {
    echo "ERROR in Soutenance::all: " . $e->getMessage() . "\n";
}

echo "\n--- UPDATING PROJECT 7 TO EN_COURS ---\n";
try {
    Project::update($pdo, 7, ["statut" => "EN_COURS"]);
    echo "SUCCESS: Project 7 is now EN_COURS\n";
} catch (Throwable $e) {
    echo "ERROR updating project: " . $e->getMessage() . "\n";
}
