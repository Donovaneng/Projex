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
      echo "403 - Accès refusé";
      exit;
    }
  }
}