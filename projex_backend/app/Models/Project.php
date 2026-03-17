<?php
declare(strict_types=1);

final class Project
{
  public static function create(PDO $pdo, string $titre, ?string $description, ?string $date_debut, ?string $date_fin, ?int $createdBy = null, ?string $role = null): int
  {
    $stmt = $pdo->prepare("
      INSERT INTO projects (titre, description, date_debut, date_fin, statut, created_by, created_by_role)
      VALUES (?, ?, ?, ?, 'EN_ATTENTE', ?, ?)
    ");
    $stmt->execute([$titre, $description, $date_debut, $date_fin, $createdBy, $role]);
    return (int)$pdo->lastInsertId();
  }

  public static function all(PDO $pdo): array
  {
    $stmt = $pdo->query("
        SELECT p.*, u.nom as nom_etudiant, u.prenom as prenom_etudiant 
        FROM projects p 
        LEFT JOIN users u ON p.student_id = u.id 
        ORDER BY p.id DESC
    ");
    return $stmt->fetchAll();
  }
  public static function find(PDO $pdo, int $id): ?array
    {
    $stmt = $pdo->prepare("SELECT * FROM projects WHERE id = ?");
    $stmt->execute([$id]);
    $p = $stmt->fetch();
    return $p ?: null;
    }

    public static function assign(PDO $pdo, int $projectId, int $etudiantId, ?int $acadId, ?int $proId): void
    {
    // Vérifier si une affectation existe déjà pour ce projet
    $check = $pdo->prepare("SELECT id FROM project_assignments WHERE project_id = ? LIMIT 1");
    $check->execute([$projectId]);
    $existing = $check->fetch();

        if ($existing) {
            // UPDATE si déjà affecté
            $stmt = $pdo->prepare("
            UPDATE project_assignments
            SET etudiant_id = ?, encadreur_acad_id = ?, encadreur_pro_id = ?
            WHERE project_id = ?
            ");
            $stmt->execute([$etudiantId, $acadId, $proId, $projectId]);
        } else {
            // INSERT sinon
            $stmt = $pdo->prepare("
            INSERT INTO project_assignments (project_id, etudiant_id, encadreur_acad_id, encadreur_pro_id)
            VALUES (?, ?, ?, ?)
            ");
            $stmt->execute([$projectId, $etudiantId, $acadId, $proId]);
        }

        // Synchronisation : mettre à jour student_id dans la table projects pour la recherche/affichage
        $sync = $pdo->prepare("UPDATE projects SET student_id = ? WHERE id = ?");
        $sync->execute([$etudiantId, $projectId]);
    }

    public static function findByStudent(PDO $pdo, int $studentId): ?array
    {
        $stmt = $pdo->prepare("
            SELECT p.*, pa.etudiant_id, pa.encadreur_acad_id, pa.encadreur_pro_id
            FROM project_assignments pa
            JOIN projects p ON p.id = pa.project_id
            WHERE pa.etudiant_id = ?
            LIMIT 1
        ");
        $stmt->execute([$studentId]);
        $row = $stmt->fetch();
        return $row ?: null;
    }

    // Méthodes pour trouver les projets par encadreur académique ou professionnel
    public static function findByAcademicSupervisor(PDO $pdo, int $userId): array
    {
    $stmt = $pdo->prepare("
        SELECT p.*
        FROM project_assignments pa
        JOIN projects p ON p.id = pa.project_id
        WHERE pa.encadreur_acad_id = ?
        ORDER BY p.id DESC
    ");
    $stmt->execute([$userId]);
    return $stmt->fetchAll();
    }

    // Méthode pour trouver les projets par encadreur professionnel
    public static function findByProSupervisor(PDO $pdo, int $userId): array
    {
    $stmt = $pdo->prepare("
        SELECT p.*
        FROM project_assignments pa
        JOIN projects p ON p.id = pa.project_id
        WHERE pa.encadreur_pro_id = ?
        ORDER BY p.id DESC
    ");
    $stmt->execute([$userId]);
    return $stmt->fetchAll();
    }

    public static function assignedStudent(PDO $pdo, int $projectId): ?array
    {
    $stmt = $pdo->prepare("
        SELECT u.id, u.nom, u.prenom
        FROM project_assignments pa
        JOIN users u ON u.id = pa.etudiant_id
        WHERE pa.project_id = ?
        LIMIT 1
    ");
    $stmt->execute([$projectId]);
    $row = $stmt->fetch();
    return $row ?: null;
    }


    public static function update(PDO $pdo, int $id, array $data): void
    {
        $fields = ["titre", "description", "date_debut", "date_fin", "statut", "categorie_id"];
        $updates = [];
        $params = [];
        
        foreach ($fields as $field) {
            if (isset($data[$field])) {
                $updates[] = "$field = ?";
                $params[] = $data[$field];
            }
        }
        
        if (empty($updates)) return;
        
        $sql = "UPDATE projects SET " . implode(", ", $updates) . " WHERE id = ?";
        $params[] = $id;
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
    }

    public static function delete(PDO $pdo, int $id): void
    {
        $stmt = $pdo->prepare("DELETE FROM projects WHERE id = ?");
        $stmt->execute([$id]);
    }

    public static function createByStudent(
    PDO $pdo,
    string $titre,
    string $description,
    int $studentId
): int {
    return self::create($pdo, $titre, $description, date("Y-m-d"), null, $studentId, 'ETUDIANT');
}

    public static function search(PDO $pdo, array $filters = []): array
    {
        $sql = "SELECT p.*, u.nom as nom_etudiant, u.prenom as prenom_etudiant FROM projects p LEFT JOIN users u ON u.id = p.student_id WHERE 1=1";
        $params = [];

        if (!empty($filters['q'])) {
            $sql .= " AND (p.titre LIKE ? OR p.description LIKE ?)";
            $searchTerm = "%" . $filters['q'] . "%";
            $params[] = $searchTerm;
            $params[] = $searchTerm;
        }

        if (!empty($filters['statut'])) {
            $sql .= " AND p.statut = ?";
            $params[] = $filters['statut'];
        }

        $sql .= " ORDER BY p.created_at DESC";

        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll();
    }
}