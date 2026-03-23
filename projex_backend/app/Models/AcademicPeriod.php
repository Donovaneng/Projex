<?php
declare(strict_types=1);

final class AcademicPeriod
{
    public static function create(PDO $pdo, string $label, string $start, string $end): int
    {
        $stmt = $pdo->prepare("
            INSERT INTO academic_periods (label, date_debut, date_fin)
            VALUES (?, ?, ?)
        ");
        $stmt->execute([$label, $start, $end]);
        return (int)$pdo->lastInsertId();
    }

    public static function all(PDO $pdo): array
    {
        $stmt = $pdo->query("SELECT * FROM academic_periods ORDER BY date_debut DESC");
        return $stmt->fetchAll();
    }

    public static function toggleActive(PDO $pdo, int $id, bool $active): void
    {
        $stmt = $pdo->prepare("UPDATE academic_periods SET is_active = ? WHERE id = ?");
        $stmt->execute([(int)$active, $id]);
    }

    public static function delete(PDO $pdo, int $id): void
    {
        $stmt = $pdo->prepare("DELETE FROM academic_periods WHERE id = ?");
        $stmt->execute([$id]);
    }

    public static function getActive(PDO $pdo): ?array
    {
        $stmt = $pdo->query("SELECT * FROM academic_periods WHERE is_active = 1 LIMIT 1");
        return $stmt->fetch() ?: null;
    }

    public static function archive(PDO $pdo, int $id): void
    {
        // 1. Marquer la période comme inactive
        $stmt = $pdo->prepare("UPDATE academic_periods SET is_active = 0 WHERE id = ?");
        $stmt->execute([$id]);

        // 2. Passer tous les projets 'EN_COURS' de cette période en 'TERMINE' ou 'ARCHIVE'
        $stmt = $pdo->prepare("UPDATE projects SET statut = 'TERMINE' WHERE period_id = ? AND statut = 'EN_COURS'");
        $stmt->execute([$id]);
    }
}
