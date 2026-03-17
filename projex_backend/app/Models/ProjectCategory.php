<?php
declare(strict_types=1);

final class ProjectCategory
{
    public static function create(PDO $pdo, string $label, ?string $description): int
    {
        $stmt = $pdo->prepare("
            INSERT INTO project_categories (label, description)
            VALUES (?, ?)
        ");
        $stmt->execute([$label, $description]);
        return (int)$pdo->lastInsertId();
    }

    public static function all(PDO $pdo): array
    {
        $stmt = $pdo->query("SELECT * FROM project_categories ORDER BY label ASC");
        return $stmt->fetchAll();
    }

    public static function delete(PDO $pdo, int $id): void
    {
        $stmt = $pdo->prepare("DELETE FROM project_categories WHERE id = ?");
        $stmt->execute([$id]);
    }
}
