<?php
declare(strict_types=1);

require_once __DIR__ . '/../Models/Notification.php';

final class NotificationController
{
  public static function index(PDO $pdo): void
  {
    AuthMiddleware::handle();

    $user = $_SESSION["user"] ?? [];
    $userId = (int)($user["id"] ?? 0);

    $items = Notification::byUser($pdo, $userId);

    View::render("notifications/index", [
      "title" => "Mes notifications",
      "items" => $items,
      "pdo" => $pdo
    ]);
  }

  public static function read(PDO $pdo): void
  {
    AuthMiddleware::handle();

    $user = $_SESSION["user"] ?? [];
    $userId = (int)($user["id"] ?? 0);
    $id = (int)($_POST["id"] ?? 0);

    if ($id > 0) {
      Notification::markAsRead($pdo, $id, $userId);
    }

    header("Location: /projex/public/notifications");
    exit;
  }

  public static function open(PDO $pdo): void
  {
    AuthMiddleware::handle();

    $user = $_SESSION["user"] ?? [];
    $userId = (int)($user["id"] ?? 0);
    $id = (int)($_GET["id"] ?? 0);

    if ($id <= 0) {
      header("Location: /projex/public/notifications");
      exit;
    }

    $stmt = $pdo->prepare("
      SELECT * FROM notifications
      WHERE id = ? AND user_id = ?
      LIMIT 1
    ");
    $stmt->execute([$id, $userId]);
    $notif = $stmt->fetch();

    if (!$notif) {
      header("Location: /projex/public/notifications");
      exit;
    }

    Notification::markAsRead($pdo, $id, $userId);

    $target = $notif["link_url"] ?? "/projex/public/notifications";
    header("Location: " . $target);
    exit;
  }
}