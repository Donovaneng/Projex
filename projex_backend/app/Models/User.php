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

  public static function pendingUsers(PDO $pdo): array
    {
        $stmt = $pdo->query("
            SELECT id, nom, prenom, email, telephone, role_demande,
                matricule, filiere, niveau, entreprise, poste, departement, grade
            FROM users
            WHERE actif = 0
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

}

