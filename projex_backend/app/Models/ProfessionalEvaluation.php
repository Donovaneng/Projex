<?php
declare(strict_types=1);

final class ProfessionalEvaluation
{
  public static function create(
    PDO $pdo,
    int $projectId,
    int $studentId,
    int $supervisorId,
    string $comment
  ): int {

    $stmt = $pdo->prepare("
      INSERT INTO evaluation_professionnelle
      (projet_id, etudiant_id, encadreur_pro_id, commentaire_global)
      VALUES (?, ?, ?, ?)
    ");

    $stmt->execute([
      $projectId,
      $studentId,
      $supervisorId,
      $comment
    ]);

    return (int)$pdo->lastInsertId();
  }


  public static function addItem(
    PDO $pdo,
    int $evaluationId,
    int $competenceId,
    int $score
  ): void {

    $stmt = $pdo->prepare("
      INSERT INTO evaluation_professionnelle_items
      (evaluation_pro_id, competence_id, score)
      VALUES (?, ?, ?)
    ");

    $stmt->execute([
      $evaluationId,
      $competenceId,
      $score
    ]);
  }


  public static function competences(PDO $pdo): array
  {
    $stmt = $pdo->query("
      SELECT *
      FROM competences
      WHERE is_active = 1
      ORDER BY id
    ");

    return $stmt->fetchAll();
  }
  public static function allBySupervisor(PDO $pdo, int $supervisorId): array
  {
    $stmt = $pdo->prepare("
      SELECT e.*, p.titre as projet_titre, u.nom as etudiant_nom, u.prenom as etudiant_prenom
      FROM evaluation_professionnelle e
      JOIN projects p ON p.id = e.projet_id
      JOIN users u ON u.id = e.etudiant_id
      WHERE e.encadreur_pro_id = ?
      ORDER BY e.created_at DESC
    ");
    $stmt->execute([$supervisorId]);
    return $stmt->fetchAll();
  }

  public static function byProject(PDO $pdo, int $projectId): ?array
  {
      $stmt = $pdo->prepare("SELECT * FROM evaluation_professionnelle WHERE projet_id = ? LIMIT 1");
      $stmt->execute([$projectId]);
      return $stmt->fetch() ?: null;
  }
}