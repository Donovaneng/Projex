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

  public static function byStudent(PDO $pdo, int $studentId): array
  {
    $stmt = $pdo->prepare("
      SELECT e.*, p.titre as projet_titre, u.nom as supervisor_nom, u.prenom as supervisor_prenom
      FROM evaluation_academique e
      JOIN projects p ON p.id = e.projet_id
      JOIN users u ON u.id = e.encadreur_acad_id
      WHERE e.etudiant_id = ?
      ORDER BY e.created_at DESC
    ");

    $stmt->execute([$studentId]);

    return $stmt->fetchAll();
  }

  public static function allBySupervisor(PDO $pdo, int $supervisorId): array
  {
    $stmt = $pdo->prepare("
      SELECT e.*, p.titre as projet_titre, u.nom as etudiant_nom, u.prenom as etudiant_prenom
      FROM evaluation_academique e
      JOIN projects p ON p.id = e.projet_id
      JOIN users u ON u.id = e.etudiant_id
      WHERE e.encadreur_acad_id = ?
      ORDER BY e.created_at DESC
    ");

    $stmt->execute([$supervisorId]);

    return $stmt->fetchAll();
  }

    public static function createPro(
        PDO $pdo,
        int $projectId,
        int $studentId,
        int $supervisorProId,
        string $comment,
        array $items
    ): void {
        $pdo->beginTransaction();
        try {
            $stmt = $pdo->prepare("
                INSERT INTO evaluation_professionnelle (projet_id, etudiant_id, encadreur_pro_id, commentaire_global)
                VALUES (?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE commentaire_global = VALUES(commentaire_global)
            ");
            $stmt->execute([$projectId, $studentId, $supervisorProId, $comment]);
            
            $stmt = $pdo->prepare("SELECT id FROM evaluation_professionnelle WHERE projet_id = ? AND etudiant_id = ?");
            $stmt->execute([$projectId, $studentId]);
            $evalId = (int)$stmt->fetchColumn();

            $stmt = $pdo->prepare("DELETE FROM evaluation_professionnelle_items WHERE evaluation_pro_id = ?");
            $stmt->execute([$evalId]);

            $stmt = $pdo->prepare("
                INSERT INTO evaluation_professionnelle_items (evaluation_pro_id, competence_id, score, appreciation)
                VALUES (?, ?, ?, ?)
            ");
            foreach ($items as $item) {
                $stmt->execute([$evalId, $item['competence_id'], (int)$item['score'], $item['appreciation'] ?? null]);
            }

            $pdo->commit();
        } catch (Throwable $e) {
            $pdo->rollBack();
            throw $e;
        }
    }

    public static function findProByProject(PDO $pdo, int $projectId): ?array
    {
        $stmt = $pdo->prepare("SELECT * FROM evaluation_professionnelle WHERE projet_id = ? LIMIT 1");
        $stmt->execute([$projectId]);
        $eval = $stmt->fetch();
        if (!$eval) return null;

        $stmt = $pdo->prepare("
            SELECT i.*, c.libelle
            FROM evaluation_professionnelle_items i
            JOIN competences c ON c.id = i.competence_id
            WHERE i.evaluation_pro_id = ?
        ");
        $stmt->execute([$eval['id']]);
        $eval['items'] = $stmt->fetchAll();

        return $eval;
    }

    public static function getCompetences(PDO $pdo): array
    {
        return $pdo->query("SELECT * FROM competences WHERE is_active = 1")->fetchAll();
    }
}