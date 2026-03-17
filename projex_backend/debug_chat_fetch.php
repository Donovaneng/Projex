<?php
$pdo = require __DIR__ . '/bootstrap.php';

echo "--- Diagnostic Récupération Messages ---\n";

// Choisir un projet avec des messages
$stmt = $pdo->query("SELECT DISTINCT project_id FROM messages LIMIT 1");
$proj = $stmt->fetch();

if (!$proj) {
    echo "Aucun message trouvé en base.\n";
    exit;
}

$projectId = (int)$proj['project_id'];
echo "Analyse du Projet ID: $projectId\n";

// Vérifier les messages brut
$stmt = $pdo->prepare("SELECT * FROM messages WHERE project_id = ?");
$stmt->execute([$projectId]);
$allMessages = $stmt->fetchAll(PDO::FETCH_ASSOC);
echo "Nombre de messages bruts: " . count($allMessages) . "\n";

// Vérifier les messages avec JOIN (comme dans le controller)
$stmt = $pdo->prepare("
    SELECT m.*, u.prenom, u.nom, u.role
    FROM messages m
    JOIN users u ON u.id = m.sender_id
    WHERE m.project_id = ?
    ORDER BY m.created_at ASC
");
$stmt->execute([$projectId]);
$joinedMessages = $stmt->fetchAll(PDO::FETCH_ASSOC);
echo "Nombre de messages après JOIN users: " . count($joinedMessages) . "\n";

if (count($allMessages) !== count($joinedMessages)) {
    echo "\nATTENTION: Certains messages ont un sender_id qui n'existe pas dans la table users!\n";
    // Trouver les orphelins
    $senderIds = array_column($joinedMessages, 'sender_id');
    foreach ($allMessages as $m) {
        if (!in_array($m['sender_id'], $senderIds)) {
            echo "Message ID {$m['id']} - Sender ID {$m['sender_id']} INTROUVABLE.\n";
        }
    }
} else {
    echo "Tous les expéditeurs sont valides.\n";
}

// Vérifier les affectations pour ce projet
$stmt = $pdo->prepare("SELECT * FROM project_assignments WHERE project_id = ?");
$stmt->execute([$projectId]);
$assignments = $stmt->fetchAll(PDO::FETCH_ASSOC);
echo "\nAffectations pour ce projet:\n";
print_r($assignments);
