<?php
declare(strict_types=1);

$pdo = require __DIR__ . '/bootstrap.php';

$queries = [
    // 1. affectations (renamed project_assignments in some versions)
    "ALTER TABLE affectations DROP FOREIGN KEY fk_aff_etudiant",
    "ALTER TABLE affectations ADD CONSTRAINT fk_aff_etudiant FOREIGN KEY (etudiant_id) REFERENCES users(id) ON DELETE CASCADE",
    "ALTER TABLE affectations DROP FOREIGN KEY fk_aff_acad",
    "ALTER TABLE affectations ADD CONSTRAINT fk_aff_acad FOREIGN KEY (encadreur_acad_id) REFERENCES users(id) ON DELETE CASCADE",
    "ALTER TABLE affectations DROP FOREIGN KEY fk_aff_pro",
    "ALTER TABLE affectations ADD CONSTRAINT fk_aff_pro FOREIGN KEY (encadreur_pro_id) REFERENCES users(id) ON DELETE CASCADE",

    // 2. evaluations (another variant)
    "ALTER TABLE evaluations DROP FOREIGN KEY fk_eval_etudiant",
    "ALTER TABLE evaluations ADD CONSTRAINT fk_eval_etudiant FOREIGN KEY (etudiant_id) REFERENCES users(id) ON DELETE CASCADE",
    "ALTER TABLE evaluations DROP FOREIGN KEY fk_eval_acad",
    "ALTER TABLE evaluations ADD CONSTRAINT fk_eval_acad FOREIGN KEY (encadreur_acad_id) REFERENCES users(id) ON DELETE CASCADE",

    // 3. projets
    "ALTER TABLE projets DROP FOREIGN KEY fk_projets_created_by",
    "ALTER TABLE projets ADD CONSTRAINT fk_projets_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE",

    // 4. projects (the main one used now)
    "ALTER TABLE projects DROP FOREIGN KEY fk_project_student",
    "ALTER TABLE projects ADD CONSTRAINT fk_project_student FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE",

    // 5. evaluation_academique (missing constraints in schema!)
    "ALTER TABLE evaluation_academique ADD CONSTRAINT fk_ea_projet FOREIGN KEY (projet_id) REFERENCES projects(id) ON DELETE CASCADE",
    "ALTER TABLE evaluation_academique ADD CONSTRAINT fk_ea_etudiant FOREIGN KEY (etudiant_id) REFERENCES users(id) ON DELETE CASCADE",
    "ALTER TABLE evaluation_academique ADD CONSTRAINT fk_ea_acad FOREIGN KEY (encadreur_acad_id) REFERENCES users(id) ON DELETE CASCADE",

    // 6. Fix any other missing ones found
    "ALTER TABLE taches DROP FOREIGN KEY fk_taches_assigned_to",
    "ALTER TABLE taches ADD CONSTRAINT fk_taches_assigned_to FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE CASCADE",
    "ALTER TABLE taches DROP FOREIGN KEY fk_taches_created_by",
    "ALTER TABLE taches ADD CONSTRAINT fk_taches_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE"
];

foreach ($queries as $sql) {
    try {
        echo "Executing: $sql\n";
        $pdo->exec($sql);
        echo "SUCCESS.\n";
    } catch (PDOException $e) {
        echo "SKIPPED/ERROR: " . $e->getMessage() . "\n";
    }
}

echo "\nConstraint Fix Complete.\n";
