<?php
declare(strict_types=1);

final class Notification
{
  public static function create(
    PDO $pdo,
    int $userId,
    string $titre,
    string $message,
    ?string $linkUrl = null,
    ?string $entityType = null,
    ?int $entityId = null
  ): void {
    $stmt = $pdo->prepare("
      INSERT INTO notifications (user_id, titre, message, link_url, entity_type, entity_id)
      VALUES (?, ?, ?, ?, ?, ?)
    ");
    $stmt->execute([$userId, $titre, $message, $linkUrl, $entityType, $entityId]);
  }

  public static function byUser(PDO $pdo, int $userId): array
  {
    $stmt = $pdo->prepare("
      SELECT *
      FROM notifications
      WHERE user_id = ?
      ORDER BY id DESC
    ");
    $stmt->execute([$userId]);
    return $stmt->fetchAll();
  }

  public static function markAsRead(PDO $pdo, int $id, int $userId): void
  {
    $stmt = $pdo->prepare("
      UPDATE notifications
      SET is_read = 1
      WHERE id = ? AND user_id = ?
    ");
    $stmt->execute([$id, $userId]);
  }

  public static function countUnread(PDO $pdo, int $userId): int
  {
    $stmt = $pdo->prepare("
      SELECT COUNT(*) AS total
      FROM notifications
      WHERE user_id = ? AND is_read = 0
    ");
    $stmt->execute([$userId]);
    $row = $stmt->fetch();

    return (int)($row["total"] ?? 0);
  }
}