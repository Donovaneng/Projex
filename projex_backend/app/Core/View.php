<?php
// app/Core/View.php
declare(strict_types=1);

final class View
{
  
  public static function render(string $view, array $data = [], string $layout = "layouts/main"): void
  {
    // Transformer 'auth/login' en chemin fichier
    $viewFile = __DIR__ . "/../Views/" . $view . ".php";
    $layoutFile = __DIR__ . "/../Views/" . $layout . ".php";

    // Vérifier existence fichiers
    if (!file_exists($viewFile)) {
      http_response_code(500);
      echo "Vue introuvable: " . htmlspecialchars($view);
      return;
    }
    if (!file_exists($layoutFile)) {
      http_response_code(500);
      echo "Layout introuvable: " . htmlspecialchars($layout);
      return;
    }

    // 3) Extraire les données pour les rendre disponibles en variables dans la vue
    extract($data, EXTR_SKIP);

    // Capturer la vue dans $content (buffer)
    ob_start();
    require $viewFile;
    $content = ob_get_clean();


    // nombre de notifications non lues
    $unreadNotifications = 0;

    if (!empty($_SESSION["user"]["id"])) {
      $pdo = $data["pdo"] ?? null;

      if ($pdo instanceof PDO && class_exists("Notification")) {
        $unreadNotifications = Notification::countUnread($pdo, (int)$_SESSION["user"]["id"]);
      }
    }
    // Charger le layout qui utilisera $content
    require $layoutFile;
  }
}