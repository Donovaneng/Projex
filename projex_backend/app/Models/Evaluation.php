<?php
declare(strict_types=1);

final class Evaluation
{
  public static function create(
    PDO $pdo,
    int $projectId,
    int $studentId,
    int $supervisorId,
    float $note,
    string $comment
  ): void {
    $stmt = $pdo->prepare("
      INSERT INTO evaluation_academique
      (projet_id, etudiant_id, encadreur_acad_id, note, commentaire)
      VALUES (?, ?, ?, ?, ?)
    ");

    $stmt->execute([
      $projectId,
      $studentId,
      $supervisorId,
      $note,
      $comment
    ]);
  }

  public static function findByProject(PDO $pdo, int $projectId): ?array
  {
    $stmt = $pdo->prepare("
      SELECT *
      FROM evaluation_academique
      WHERE projet_id = ?
      LIMIT 1
    ");

    $stmt->execute([$projectId]);

    return $stmt->fetch() ?: null;
  }

  public static function byStudent(PDO $pdo, int $studentId): ?array
  {
    $stmt = $pdo->prepare("
      SELECT *
      FROM evaluation_academique
      WHERE etudiant_id = ?
      LIMIT 1
    ");

    $stmt->execute([$studentId]);

    return $stmt->fetch() ?: null;
  }
}