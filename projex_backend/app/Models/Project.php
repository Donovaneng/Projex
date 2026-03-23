<?php
declare(strict_types=1);

final class Project
{
  public static function create(PDO $pdo, string $titre, ?string $description, ?string $date_debut, ?string $date_fin, ?int $createdBy = null, ?string $role = null, ?int $categorieId = null, ?int $periodId = null): int
  {
    $stmt = $pdo->prepare("
      INSERT INTO projects (titre, description, date_debut, date_fin, statut, created_by, created_by_role, categorie_id, period_id)
      VALUES (?, ?, ?, ?, 'EN_ATTENTE', ?, ?, ?, ?)
    ");
    $stmt->execute([$titre, $description, $date_debut, $date_fin, $createdBy, $role, $categorieId, $periodId]);
    return (int)$pdo->lastInsertId();
  }

  public static function all(PDO $pdo): array
  {
    $stmt = $pdo->query("
        SELECT p.*, 
               u.nom as etudiant_nom, u.prenom as etudiant_prenom, u.email as etudiant_email, u.telephone as etudiant_tel,
               c.label as categorie_label,
               pa.encadreur_acad_id, pa.encadreur_pro_id
        FROM projects p 
        LEFT JOIN users u ON p.student_id = u.id 
        LEFT JOIN project_categories c ON p.categorie_id = c.id
        LEFT JOIN project_assignments pa ON p.id = pa.project_id
        ORDER BY p.id DESC
    ");
    return $stmt->fetchAll();
  }

    public static function findBySupervisor(PDO $pdo, int $supervisorId): array
    {
        $stmt = $pdo->prepare("
            SELECT p.*, 
                   u.nom as etudiant_nom, u.prenom as etudiant_prenom, u.email as etudiant_email, u.telephone as etudiant_tel,
                   u.matricule as etudiant_matricule, u.filiere as etudiant_filiere,
                   c.label as categorie_label
            FROM projects p
            JOIN project_assignments pa ON p.id = pa.project_id
            LEFT JOIN users u ON u.id = p.student_id
            LEFT JOIN project_categories c ON p.categorie_id = c.id
            WHERE pa.encadreur_acad_id = ? OR pa.encadreur_pro_id = ?
            ORDER BY p.id DESC
        ");
        $stmt->execute([$supervisorId, $supervisorId]);
        return $stmt->fetchAll();
    }

    public static function find(PDO $pdo, int $id): ?array
    {
        $stmt = $pdo->prepare("
            SELECT p.*, c.label as categorie_label,
                   u_acad.nom as acad_nom, u_acad.prenom as acad_prenom, u_acad.email as acad_email, u_acad.telephone as acad_tel,
                   u_pro.nom as pro_nom, u_pro.prenom as pro_prenom, u_pro.email as pro_email, u_pro.telephone as pro_tel,
                   u_stud.nom as etudiant_nom, u_stud.prenom as etudiant_prenom, u_stud.email as etudiant_email, u_stud.telephone as etudiant_tel,
                   u_stud.matricule as etudiant_matricule, u_stud.filiere as etudiant_filiere
            FROM projects p
            LEFT JOIN project_categories c ON p.categorie_id = c.id
            LEFT JOIN project_assignments pa ON p.id = pa.project_id
            LEFT JOIN users u_acad ON pa.encadreur_acad_id = u_acad.id
            LEFT JOIN users u_pro ON pa.encadreur_pro_id = u_pro.id
            LEFT JOIN users u_stud ON p.student_id = u_stud.id
            WHERE p.id = ?
        ");
        $stmt->execute([$id]);
        $p = $stmt->fetch();
        if ($p) {
            $p['superviseur_acad'] = trim(($p['acad_prenom'] ?? '') . ' ' . ($p['acad_nom'] ?? ''));
            $p['superviseur_pro'] = trim(($p['pro_prenom'] ?? '') . ' ' . ($p['pro_nom'] ?? ''));
            if ($p['superviseur_acad'] === '') $p['superviseur_acad'] = null;
            if ($p['superviseur_pro'] === '') $p['superviseur_pro'] = null;
        }
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
            SELECT p.*, 
                   c.label as categorie_label,
                   u_acad.nom as acad_nom, u_acad.prenom as acad_prenom, u_acad.email as acad_email, u_acad.telephone as acad_tel,
                   u_pro.nom as pro_nom, u_pro.prenom as pro_prenom, u_pro.email as pro_email, u_pro.telephone as pro_tel
            FROM projects p
            LEFT JOIN project_categories c ON p.categorie_id = c.id
            LEFT JOIN project_assignments pa ON p.id = pa.project_id
            LEFT JOIN users u_acad ON pa.encadreur_acad_id = u_acad.id
            LEFT JOIN users u_pro ON pa.encadreur_pro_id = u_pro.id
            WHERE p.student_id = ? OR pa.etudiant_id = ?
            ORDER BY p.id DESC
            LIMIT 1
        ");
        $stmt->execute([$studentId, $studentId]);
        $row = $stmt->fetch();
        
        if ($row) {
            $row['superviseur_acad'] = trim(($row['acad_prenom'] ?? '') . ' ' . ($row['acad_nom'] ?? ''));
            $row['superviseur_pro'] = trim(($row['pro_prenom'] ?? '') . ' ' . ($row['pro_nom'] ?? ''));
            if ($row['superviseur_acad'] === '') $row['superviseur_acad'] = null;
            if ($row['superviseur_pro'] === '') $row['superviseur_pro'] = null;
            
            // Legacy/Friendly name
            $row['superviseur'] = $row['superviseur_acad'] ?: $row['superviseur_pro'];
        }
        
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
        FROM users u
        WHERE u.id = (SELECT student_id FROM projects WHERE id = ?)
        LIMIT 1
    ");
    $stmt->execute([$projectId]);
    $row = $stmt->fetch();
    return $row ?: null;
    }


    public static function update(PDO $pdo, int $id, array $data): void
    {
        $fields = ["titre", "description", "date_debut", "date_fin", "statut", "categorie_id", "motif_rejet"];
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
    int $studentId,
    ?int $categorieId = null
): int {
    require_once __DIR__ . '/AcademicPeriod.php';
    $activePeriod = AcademicPeriod::getActive($pdo);
    $periodId = $activePeriod ? (int)$activePeriod['id'] : null;
    
    return self::create($pdo, $titre, $description, date("Y-m-d"), null, $studentId, 'ETUDIANT', $categorieId, $periodId);
}

    public static function search(PDO $pdo, array $filters = []): array
    {
        $sql = "SELECT p.*, u.nom as etudiant_nom, u.prenom as etudiant_prenom, c.label as categorie_label,
                       pa.encadreur_acad_id, pa.encadreur_pro_id
                FROM projects p 
                LEFT JOIN users u ON u.id = p.student_id 
                LEFT JOIN project_categories c ON p.categorie_id = c.id
                LEFT JOIN project_assignments pa ON p.id = pa.project_id
                WHERE 1=1";
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

        if (!empty($filters['period_id'])) {
            $sql .= " AND p.period_id = ?";
            $params[] = $filters['period_id'];
        }

        $sql .= " ORDER BY p.created_at DESC";

        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll();
    }

    public static function getProgress(PDO $pdo, int $projectId): int
    {
        $stmt = $pdo->prepare("SELECT COUNT(*) as total, SUM(CASE WHEN statut = 'TERMINE' THEN 1 ELSE 0 END) as done FROM taches WHERE project_id = ?");
        $stmt->execute([$projectId]);
        $stats = $stmt->fetch();
        return $stats['total'] > 0 ? (int)round(($stats['done'] / $stats['total']) * 100) : 0;
    }

    public static function isStudentBusy(PDO $pdo, int $studentId, int $excludeProjectId = 0, ?int $periodId = null): ?array
    {
        $sql = "SELECT id, titre FROM projects WHERE student_id = ? AND id != ? AND statut NOT IN ('TERMINE', 'REJETE', 'CLOTURE')";
        $params = [$studentId, $excludeProjectId];

        if ($periodId !== null) {
            $sql .= " AND period_id = ?";
            $params[] = $periodId;
        }

        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $result = $stmt->fetch();
        return $result ?: null;
    }
}