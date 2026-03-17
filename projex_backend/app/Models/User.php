<?php
declare(strict_types=1);

final class User
{
  public static function findByEmail(PDO $pdo, string $email): ?array
  {
    $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ? LIMIT 1");
    $stmt->execute([$email]);
    $u = $stmt->fetch();
    return $u ?: null;
  }

  public static function findByMatricule(PDO $pdo, string $matricule): ?array
  {
    $stmt = $pdo->prepare("SELECT * FROM users WHERE matricule = ? LIMIT 1");
    $stmt->execute([$matricule]);
    $u = $stmt->fetch();
    return $u ?: null;
  }

  public static function findById(PDO $pdo, int $id): ?array
  {
    $stmt = $pdo->prepare("SELECT * FROM users WHERE id = ? LIMIT 1");
    $stmt->execute([$id]);
    $u = $stmt->fetch();
    return $u ?: null;
  }

  public static function createPending(PDO $pdo, array $data): int
  {
    $stmt = $pdo->prepare("
      INSERT INTO users
      (nom, prenom, email, telephone, role, role_demande, actif,
       matricule, filiere, niveau,
       entreprise, poste,
       departement, grade,
       mot_de_passe)
      VALUES
      (?, ?, ?, ?, ?, ?, 0,
       ?, ?, ?,
       ?, ?,
       ?, ?,
       ?)
    ");

    $stmt->execute([
      $data["nom"],
      $data["prenom"],
      $data["email"],
      $data["telephone"],

      // rôle réel initial (on met ETUDIANT par défaut pour l'instant)
      // l'admin pourra changer au moment d'activer
      $data["role_initial"],

      $data["role_demande"],

      $data["matricule"],
      $data["filiere"],
      $data["niveau"],

      $data["entreprise"],
      $data["poste"],

      $data["departement"],
      $data["grade"],

      $data["mot_de_passe"],
    ]);

    return (int)$pdo->lastInsertId();
  }

  public static function create(PDO $pdo, array $data): int
  {
    $stmt = $pdo->prepare("
      INSERT INTO users
      (nom, prenom, email, telephone, role, role_demande, actif,
       matricule, filiere, niveau,
       entreprise, poste,
       departement, grade,
       mot_de_passe)
      VALUES
      (?, ?, ?, ?, ?, ?, ?,
       ?, ?, ?,
       ?, ?,
       ?, ?,
       ?)
    ");

    $stmt->execute([
      $data["nom"],
      $data["prenom"],
      $data["email"],
      $data["telephone"] ?? null,
      $data["role"],
      $data["role_demande"] ?? $data["role"],
      $data["actif"] ?? 1,
      $data["matricule"] ?? null,
      $data["filiere"] ?? null,
      $data["niveau"] ?? null,
      $data["entreprise"] ?? null,
      $data["poste"] ?? null,
      $data["departement"] ?? null,
      $data["grade"] ?? null,
      $data["mot_de_passe"],
    ]);

    return (int)$pdo->lastInsertId();
  }

    public static function pendingUsers(PDO $pdo): array
    {
        $stmt = $pdo->query("
            SELECT id, nom, prenom, email, telephone, role_demande, image_profil,
                matricule, filiere, niveau, entreprise, poste, departement, grade
            FROM users
            WHERE actif = 0
            ORDER BY id DESC
        ");
        return $stmt->fetchAll();
    }

    public static function allUsers(PDO $pdo): array
    {
        $stmt = $pdo->query("
            SELECT id, nom, prenom, email, telephone, role, actif, role_demande, created_at, image_profil,
                matricule, filiere, niveau, entreprise, poste, departement, grade
            FROM users
            ORDER BY id DESC
        ");
        return $stmt->fetchAll();
    }

    public static function activateUser(PDO $pdo, int $id, string $roleFinal): void
    {
        $allowed = ["ETUDIANT", "ENCADREUR_ACAD", "ENCADREUR_PRO", "ADMIN"];
    if (!in_array($roleFinal, $allowed, true)) {
        throw new InvalidArgumentException("Rôle invalide");
    }

        $stmt = $pdo->prepare("UPDATE users SET actif = 1, role = ? WHERE id = ?");
        $stmt->execute([$roleFinal, $id]);
    }
    public static function byRole(PDO $pdo, string $role): array
    {
      $stmt = $pdo->prepare("SELECT id, nom, prenom FROM users WHERE role = ? AND actif = 1");
      $stmt->execute([$role]);
      return $stmt->fetchAll();
    }

    public static function updatePassword(PDO $pdo, int $userId, string $hash): void
    {
        $stmt = $pdo->prepare("UPDATE users SET mot_de_passe = ? WHERE id = ?");
        $stmt->execute([$hash, $userId]);
    }

    public static function updateProfile(PDO $pdo, int $userId, array $data): void
    {
        $fields = ["email", "telephone", "nom", "prenom", "matricule", "filiere", "niveau", "entreprise", "poste", "departement", "grade", "role", "actif"];
        $updates = [];
        $params = [];
        
        foreach ($fields as $field) {
            if (isset($data[$field])) {
                $updates[] = "$field = ?";
                $params[] = $data[$field];
            }
        }
        
        if (empty($updates)) return;
        
        $sql = "UPDATE users SET " . implode(", ", $updates) . " WHERE id = ?";
        $params[] = $userId;
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
    }

    public static function delete(PDO $pdo, int $userId): void
    {
        $stmt = $pdo->prepare("DELETE FROM users WHERE id = ?");
        $stmt->execute([$userId]);
    }

    public static function updateAvatar(PDO $pdo, int $userId, string $path): void
    {
        $stmt = $pdo->prepare("UPDATE users SET image_profil = ? WHERE id = ?");
        $stmt->execute([$path, $userId]);
    }

    public static function search(PDO $pdo, array $filters = []): array
    {
        $sql = "SELECT id, nom, prenom, email, telephone, role, actif, created_at, image_profil, matricule, filiere, niveau, entreprise, poste, departement, grade FROM users WHERE 1=1";
        $params = [];

        if (!empty($filters['q'])) {
            $sql .= " AND (nom LIKE ? OR prenom LIKE ? OR email LIKE ? OR matricule LIKE ?)";
            $searchTerm = "%" . $filters['q'] . "%";
            $params[] = $searchTerm;
            $params[] = $searchTerm;
            $params[] = $searchTerm;
            $params[] = $searchTerm;
        }

        if (!empty($filters['role'])) {
            $sql .= " AND role = ?";
            $params[] = $filters['role'];
        }

        if (isset($filters['actif'])) {
            $sql .= " AND actif = ?";
            $params[] = (int)$filters['actif'];
        }

        $sql .= " ORDER BY created_at DESC";

        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll();
    }
}

