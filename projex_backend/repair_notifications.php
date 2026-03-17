<?php
$pdo = require __DIR__ . '/bootstrap.php';

echo "--- Réparation Table notifications ---\n";

try {
    // Liste des colonnes actuelles
    $stmt = $pdo->query("SHOW COLUMNS FROM notifications");
    $cols = array_column($stmt->fetchAll(PDO::FETCH_ASSOC), 'Field');
    
    $toAdd = [
        'link_url' => "VARCHAR(255) NULL AFTER message",
        'entity_type' => "VARCHAR(50) NULL AFTER link_url",
        'entity_id' => "BIGINT UNSIGNED NULL AFTER entity_type"
    ];
    
    foreach ($toAdd as $col => $def) {
        if (!in_array($col, $cols)) {
            echo "Ajout de $col...\n";
            $pdo->exec("ALTER TABLE notifications ADD COLUMN $col $def");
        }
    }
    
    // Vérifier si 'type' existe, sinon le créer
    if (!in_array('type', $cols)) {
        echo "Ajout de 'type'...\n";
        $pdo->exec("ALTER TABLE notifications ADD COLUMN type ENUM('INFO','ALERTE','LIVRABLE','EVALUATION','TACHE','MESSAGE') NOT NULL DEFAULT 'INFO' AFTER message");
    } else {
        // Optionnel: s'assurer que 'MESSAGE' est dans l'ENUM
        // Pour faire simple, on laisse tel quel si ça marche, ou on recrée.
    }

    echo "Table notifications vérifiée et mise à jour.\n";
} catch (Exception $e) {
    echo "ERREUR: " . $e->getMessage() . "\n";
}
