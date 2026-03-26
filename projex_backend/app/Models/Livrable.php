<?php
declare(strict_types=1);

final class Livrable
{
    public static function create(
        PDO $pdo,
        int $projectId,
        int $etudiantId,
        string $titre,
        string $description,
        string $type,
        int $versionNum,
        string $fileName,
        string $filePath
    ): int {
        $stmt = $pdo->prepare("
            INSERT INTO livrables (project_id, etudiant_id, titre, description, type, version_num, file_name, file_path, statut)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'SOUMIS')
        ");
        $stmt->execute([$projectId, $etudiantId, $titre, $description, $type, $versionNum, $fileName, $filePath]);

        return (int)$pdo->lastInsertId();
    }

  public static function byStudent(PDO $pdo, int $studentId): array
  {
    $stmt = $pdo->prepare("
      SELECT l.*, p.titre AS projet_titre
      FROM livrables l
      JOIN projects p ON p.id = l.project_id
      WHERE l.etudiant_id = ?
      ORDER BY l.id DESC
    ");
    $stmt->execute([$studentId]);
    return $stmt->fetchAll();
  }

    public static function byProject(PDO $pdo, int $projectId): array
    {
    $stmt = $pdo->prepare("
        SELECT l.*, u.nom, u.prenom
        FROM livrables l
        JOIN users u ON u.id = l.etudiant_id
        WHERE l.project_id = ?
        ORDER BY l.id DESC
    ");
    $stmt->execute([$projectId]);
    return $stmt->fetchAll();
    }

    public static function updateStatus(PDO $pdo, int $id, string $status, ?string $reason = null): void
    {
    $stmt = $pdo->prepare("
        UPDATE livrables
        SET statut = ?, rejection_reason = ?
        WHERE id = ?
    ");
    $stmt->execute([$status, $reason, $id]);
    }

    public static function find(PDO $pdo, int $id): ?array
    {
    $stmt = $pdo->prepare("SELECT * FROM livrables WHERE id = ? LIMIT 1");
    $stmt->execute([$id]);
    $row = $stmt->fetch();
    return $row ?: null;
    }

    public static function addComment(PDO $pdo, int $livrableId, int $authorId, string $commentaire): void
    {
    $stmt = $pdo->prepare("
        INSERT INTO livrable_commentaires (livrable_id, author_id, commentaire)
        VALUES (?, ?, ?)
    ");
    $stmt->execute([$livrableId, $authorId, $commentaire]);
    }

    public static function comments(PDO $pdo, int $livrableId): array
    {
    $stmt = $pdo->prepare("
        SELECT c.*, u.nom, u.prenom
        FROM livrable_commentaires c
        JOIN users u ON u.id = c.author_id
        WHERE c.livrable_id = ?
        ORDER BY c.id DESC
    ");
    $stmt->execute([$livrableId]);
    return $stmt->fetchAll();
    }

    public static function nextVersion(PDO $pdo, int $projectId, int $studentId, string $titre): int
    {
    $stmt = $pdo->prepare("
        SELECT MAX(version_num) AS max_version
        FROM livrables
        WHERE project_id = ? AND etudiant_id = ? AND titre = ?
    ");
    $stmt->execute([$projectId, $studentId, $titre]);
    $row = $stmt->fetch();

    return (int)($row["max_version"] ?? 0) + 1;
    }

    public static function delete(PDO $pdo, int $id): void
    {
        $stmt = $pdo->prepare("DELETE FROM livrables WHERE id = ?");
        $stmt->execute([$id]);
    }

    public static function all(PDO $pdo): array
    {
        $stmt = $pdo->query("
            SELECT l.*, p.titre AS projet_titre, u.nom, u.prenom
            FROM livrables l
            JOIN projects p ON p.id = l.project_id
            JOIN users u ON u.id = l.etudiant_id
            ORDER BY l.submitted_at DESC
        ");
        return $stmt->fetchAll();
    }
}