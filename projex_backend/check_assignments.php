<?php
$pdo = require __DIR__ . '/bootstrap.php';
// Vérifier les affectations pour les encadreurs
$stmt = $pdo->query("
    SELECT pa.*, p.titre, u.nom as etudiant_nom, acad.nom as acad_nom, pro.nom as pro_nom
    FROM project_assignments pa
    JOIN projects p ON pa.project_id = p.id
    JOIN users u ON pa.etudiant_id = u.id
    LEFT JOIN users acad ON pa.encadreur_acad_id = acad.id
    LEFT JOIN users pro ON pa.encadreur_pro_id = pro.id
");
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
