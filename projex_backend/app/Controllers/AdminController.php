<?php
declare(strict_types=1);

require_once __DIR__ . "/../Models/User.php";

final class AdminController
{
  public static function pendingUsers(PDO $pdo): void
  {
    $users = User::pendingUsers($pdo);
    
    // Retourner JSON si c'est une API call
    if (isset($_SERVER['HTTP_ACCEPT']) && strpos($_SERVER['HTTP_ACCEPT'], 'application/json') !== false) {
      header("Content-Type: application/json");
      echo json_encode(["users" => $users]);
      return;
    }
    
    View::render("admin/users_pending", [
      "title" => "Validation des comptes",
      "users" => $users
    ]);
  }

  public static function activate(PDO $pdo): void
  {
    $id = (int)($_POST["id"] ?? (int)json_decode(file_get_contents('php://input'), true)["user_id"] ?? 0);
    $role = trim($_POST["role"] ?? (string)(json_decode(file_get_contents('php://input'), true)["role_final"] ?? ""));

    if ($id <= 0 || $role === "") {
      header("Content-Type: application/json");
      http_response_code(400);
      echo json_encode(["error" => "ID ou rôle invalide"]);
      return;
    }

    try {
      User::activateUser($pdo, $id, $role);
      
      // Retourner JSON si c'est une API call
      if (isset($_SERVER['HTTP_ACCEPT']) && strpos($_SERVER['HTTP_ACCEPT'], 'application/json') !== false) {
        header("Content-Type: application/json");
        echo json_encode(["message" => "Utilisateur activé avec succès"]);
        return;
      }
      
      header("Location: /projex/public/admin/users_pending");
      exit;
    } catch (Throwable $e) {
      header("Content-Type: application/json");
      http_response_code(500);
      echo json_encode(["error" => "Erreur lors de l'activation"]);
    }
  }
}