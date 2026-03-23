<?php
declare(strict_types=1);

final class Task
{
  // créer une tâche
  public static function create(PDO $pdo, int $projectId, int $assignedTo, int $createdBy, string $titre, string $description, ?string $dueDate): void
  {
    $stmt = $pdo->prepare("
      INSERT INTO taches (project_id, assigned_to, created_by, titre, description, due_date)
      VALUES (?, ?, ?, ?, ?, ?)
    ");

    $stmt->execute([
      $projectId,
      $assignedTo,
      $createdBy,
      $titre,
      $description,
      $dueDate
    ]);
  }

  // récupérer les tâches d'un projet
  public static function byProject(PDO $pdo, int $projectId): array
  {
    $stmt = $pdo->prepare("
      SELECT t.*, u.nom, u.prenom
      FROM taches t
      JOIN users u ON u.id = t.assigned_to
      WHERE t.project_id = ?
      ORDER BY t.id DESC
    ");

    $stmt->execute([$projectId]);

    return $stmt->fetchAll();
  }

  // récupérer les tâches d'un étudiant
  public static function byStudent(PDO $pdo, int $studentId): array
  {
    $stmt = $pdo->prepare("
      SELECT *
      FROM taches
      WHERE assigned_to = ?
      ORDER BY id DESC
    ");

    $stmt->execute([$studentId]);

    return $stmt->fetchAll();
  }

  // changer le statut
  public static function updateStatus(PDO $pdo, int $taskId, string $status): void
  {
    $stmt = $pdo->prepare("
      UPDATE taches
      SET statut = ?
      WHERE id = ?
    ");

    $stmt->execute([$status, $taskId]);
  }

  // supprimer une tâche
  public static function delete(PDO $pdo, int $taskId): void
  {
    $stmt = $pdo->prepare("DELETE FROM taches WHERE id = ?");
    $stmt->execute([$taskId]);
  }
}