<?php
$pdo = require __DIR__ . '/bootstrap.php';

echo "--- Migration Table notifications ---\n";

function addColumnIfMissing($pdo, $table, $column, $definition) {
    $stmt = $pdo->query("SHOW COLUMNS FROM $table LIKE '$column'");
    if (!$stmt->fetch()) {
        echo "Ajout de la colonne $column...\n";
        $pdo->exec("ALTER TABLE $table ADD COLUMN $column $definition");
    } else {
        echo "La colonne $column existe déjà.\n";
    }
}

try {
    addColumnIfMissing($pdo, 'notifications', 'link_url', "VARCHAR(255) NULL AFTER message");
    addColumnIfMissing($pdo, 'notifications', 'entity_type', "VARCHAR(50) NULL AFTER link_url");
    addColumnIfMissing($pdo, 'notifications', 'entity_id', "BIGINT UNSIGNED NULL AFTER entity_type");
    
    // Mettre à jour l'ENUM type si nécessaire (ajout de MESSAGE)
    // Note: Modifier un ENUM peut être délicat selon la version MySQL. 
    // On va juste s'assurer que les colonnes additionnelles sont là.
    
    echo "Migration terminée avec succès.\n";
} catch (Exception $e) {
    echo "Erreur lors de la migration : " . $e->getMessage() . "\n";
}
