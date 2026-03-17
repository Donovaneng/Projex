<?php
declare(strict_types=1);

require_once __DIR__ . '/../Models/Notification.php';

final class NotificationController
{
  /**
   * Liste toutes les notifications de l'utilisateur connecté (JSON)
   */
  public static function index(PDO $pdo): void
  {
    AuthMiddleware::handle();
    header("Content-Type: application/json");

    $userId = (int)$_SESSION["user"]["id"];
    $items = Notification::byUser($pdo, $userId);
    $unreadCount = Notification::countUnread($pdo, $userId);

    echo json_encode([
      "notifications" => $items,
      "unread_count" => $unreadCount
    ]);
  }

  /**
   * Marquer une notification comme lue
   */
  public static function read(PDO $pdo, int $id): void
  {
    AuthMiddleware::handle();
    header("Content-Type: application/json");

    $userId = (int)$_SESSION["user"]["id"];
    Notification::markAsRead($pdo, $id, $userId);

    echo json_encode(["success" => true, "message" => "Notification marquée comme lue"]);
  }

  /**
   * Marquer toutes les notifications comme lues
   */
  public static function readAll(PDO $pdo): void
  {
    AuthMiddleware::handle();
    header("Content-Type: application/json");

    $userId = (int)$_SESSION["user"]["id"];
    Notification::markAllAsRead($pdo, $userId);

    echo json_encode(["success" => true, "message" => "Toutes les notifications sont lues"]);
  }

  /**
   * Supprimer une notification
   */
  public static function delete(PDO $pdo, int $id): void
  {
    AuthMiddleware::handle();
    header("Content-Type: application/json");

    $userId = (int)$_SESSION["user"]["id"];
    Notification::delete($pdo, $id, $userId);

    echo json_encode(["success" => true, "message" => "Notification supprimée"]);
  }

  /**
   * Supprimer toutes les notifications
   */
  public static function deleteAll(PDO $pdo): void
  {
    AuthMiddleware::handle();
    header("Content-Type: application/json");

    $userId = (int)$_SESSION["user"]["id"];
    Notification::deleteAll($pdo, $userId);

    echo json_encode(["success" => true, "message" => "Toutes les notifications sont supprimées"]);
  }

  /**
   * Route legacy pour open/redirect (optionnel, on peut le garder pour les liens directs)
   */
  public static function open(PDO $pdo): void
  {
    AuthMiddleware::handle();
    $userId = (int)$_SESSION["user"]["id"];
    $id = (int)($_GET["id"] ?? 0);

    if ($id <= 0) {
      header("Location: /notifications");
      exit;
    }

    $stmt = $pdo->prepare("SELECT link_url FROM notifications WHERE id = ? AND user_id = ? LIMIT 1");
    $stmt->execute([$id, $userId]);
    $notif = $stmt->fetch();

    Notification::markAsRead($pdo, $id, $userId);

    $target = $notif["link_url"] ?? "/notifications";
    header("Location: " . $target);
    exit;
  }
}