<?php
declare(strict_types=1);

final class Soutenance
{
    public static function create(PDO $pdo, int $projet_id, string $date, ?string $salle, ?string $jury): int
    {
        $stmt = $pdo->prepare("
            INSERT INTO soutenances (projet_id, date_soutenance, salle, jury_membres)
            VALUES (?, ?, ?, ?)
        ");
        $stmt->execute([$projet_id, $date, $salle, $jury]);
        return (int)$pdo->lastInsertId();
    }

    public static function all(PDO $pdo): array
    {
        $stmt = $pdo->query("
            SELECT s.*, p.titre as projet_titre, u.nom, u.prenom 
            FROM soutenances s
            LEFT JOIN projects p ON s.projet_id = p.id
            LEFT JOIN project_assignments pa ON p.id = pa.project_id
            LEFT JOIN users u ON pa.etudiant_id = u.id
            ORDER BY s.date_soutenance ASC
        ");
        return $stmt->fetchAll();
    }

    public static function update(PDO $pdo, int $id, array $data): void
    {
        $stmt = $pdo->prepare("
            UPDATE soutenances 
            SET date_soutenance = ?, salle = ?, jury_membres = ?, note_finale = ?, observations = ?
            WHERE id = ?
        ");
        $stmt->execute([
            $data["date_soutenance"],
            $data["salle"],
            $data["jury_membres"],
            $data["note_finale"] ?? null,
            $data["observations"] ?? null,
            $id
        ]);
    }

    public static function delete(PDO $pdo, int $id): void
    {
        $stmt = $pdo->prepare("DELETE FROM soutenances WHERE id = ?");
        $stmt->execute([$id]);
    }
}
