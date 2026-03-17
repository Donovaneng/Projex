<?php
$pdo = require __DIR__ . '/bootstrap.php';

echo "=== DIAGNOSTIC CHAT APPROFONDI ===\n";

// 1. Projets et leurs étudiants
echo "\n--- Table projects ---\n";
$stmt = $pdo->query("SELECT id, titre, student_id, created_by FROM projects");
$projects = $stmt->fetchAll(PDO::FETCH_ASSOC);
foreach ($projects as $p) {
    echo "Projet ID: {$p['id']} | Titre: {$p['titre']} | StudentID: " . ($p['student_id'] ?? 'NULL') . " | CreatedBy: {$p['created_by']}\n";
}

// 2. Affectations
echo "\n--- Table project_assignments ---\n";
$stmt = $pdo->query("SELECT * FROM project_assignments");
$assignments = $stmt->fetchAll(PDO::FETCH_ASSOC);
foreach ($assignments as $a) {
    echo "Projet ID: {$a['project_id']} | Étudiant ID: {$a['etudiant_id']} | Acad ID: " . ($a['encadreur_acad_id'] ?? 'NULL') . " | Pro ID: " . ($a['encadreur_pro_id'] ?? 'NULL') . "\n";
}

// 3. Messages orphelins (sans users)
echo "\n--- Messages Orphelins ---\n";
$stmt = $pdo->query("
    SELECT m.id, m.sender_id, m.project_id 
    FROM messages m
    LEFT JOIN users u ON u.id = m.sender_id
    WHERE u.id IS NULL
");
$orphans = $stmt->fetchAll(PDO::FETCH_ASSOC);
if (empty($orphans)) {
    echo "Tous les expéditeurs de messages existent dans la table users.\n";
} else {
    echo "Messages avec expéditeur inconnu :\n";
    print_r($orphans);
}

// 4. Test de permission pour un étudiant spécifique (si rapporté)
echo "\n--- Test de Permission ChatController (Simulation) ---\n";
foreach ($projects as $p) {
    $pid = (int)$p['id'];
    $sid = (int)$p['student_id'];
    if ($sid > 0) {
        $stmt = $pdo->prepare("SELECT project_id FROM project_assignments WHERE project_id = ? AND (etudiant_id = ? OR encadreur_acad_id = ? OR encadreur_pro_id = ?)");
        $stmt->execute([$pid, $sid, $sid, $sid]);
        $row = $stmt->fetch();
        if ($row) {
            echo "Projet $pid: Étudiant $sid a ACCÈS.\n";
        } else {
            echo "Projet $pid: Étudiant $sid est BLOQUÉ (403).\n";
        }
    }
}
