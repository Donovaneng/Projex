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
}
