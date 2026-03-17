<?php
declare(strict_types=1);

final class AuditLog
{
    public static function log(PDO $pdo, ?int $actorId, string $action, string $entity, ?int $entityId, ?array $details = null): void
    {
        $stmt = $pdo->prepare("
            INSERT INTO audit_logs (actor_id, action, entity, entity_id, details)
            VALUES (?, ?, ?, ?, ?)
        ");
        $stmt->execute([
            $actorId,
            $action,
            $entity,
            $entityId,
            $details ? json_encode($details) : null
        ]);
    }

    public static function all(PDO $pdo, int $limit = 50): array
    {
        $stmt = $pdo->prepare("
            SELECT a.*, u.nom, u.prenom
            FROM audit_logs a
            LEFT JOIN users u ON u.id = a.actor_id
            ORDER BY a.created_at DESC
            LIMIT ?
        ");
        $stmt->bindValue(1, $limit, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll();
    }
}
