<?php
$pdo = new PDO('mysql:host=localhost;dbname=projex', 'root', '');
// Ajouter la colonne period_id
try {
    $pdo->exec("ALTER TABLE projects ADD COLUMN period_id INT DEFAULT NULL");
    $pdo->exec("ALTER TABLE projects ADD CONSTRAINT fk_project_period FOREIGN KEY (period_id) REFERENCES academic_periods(id)");
    echo "Migration réussie: colonne period_id ajoutée.\n";
} catch (PDOException $e) {
    echo "Erreur ou colonne déjà existante: " . $e->getMessage() . "\n";
}
