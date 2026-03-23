<?php
declare(strict_types=1);

final class RoleMiddleware
{
  /**
   * Require one or more roles (string or array).
   *
   * @param string|array $roles
   */
  public static function require($roles): void
  {
    if (session_status() === PHP_SESSION_NONE) {
      session_start();
    }

    if (!isset($_SESSION["user"])) {
      if (strpos($_SERVER['REQUEST_URI'] ?? '', '/api/') !== false || 
          (isset($_SERVER['HTTP_ACCEPT']) && strpos($_SERVER['HTTP_ACCEPT'], 'application/json') !== false)) {
          http_response_code(401);
          header('Content-Type: application/json');
          echo json_encode(['error' => 'Non authentifié']);
          exit();
      }
      header("Location: /projex/public/login");
      exit;
    }

    $userRole = $_SESSION["user"]["role"] ?? "";
    
    // normalize roles to array
    if (is_string($roles)) {
      $roles = [$roles];
    }

    if (!in_array($userRole, $roles, true)) {
      http_response_code(403);
      if (strpos($_SERVER['REQUEST_URI'] ?? '', '/api/') !== false || 
          (isset($_SERVER['HTTP_ACCEPT']) && strpos($_SERVER['HTTP_ACCEPT'], 'application/json') !== false)) {
          header('Content-Type: application/json');
          echo json_encode(['error' => 'Accès refusé - Rôle insuffisant']);
      } else {
          echo "403 - Accès refusé";
      }
      exit;
    }
  }
}