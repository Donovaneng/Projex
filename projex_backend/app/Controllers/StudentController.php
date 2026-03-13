<?php
declare(strict_types=1);

require_once __DIR__ . '/../Models/Project.php';
require_once __DIR__ . '/../Models/Livrable.php';
require_once __DIR__ . '/../Models/Notification.php';

final class StudentController
{
  public static function uploadForm(PDO $pdo): void
  {
    AuthMiddleware::handle();

    $user = $_SESSION["user"] ?? [];
    if (($user["role"] ?? "") !== "ETUDIANT") {
      http_response_code(403);
      echo "Accès refusé";
      return;
    }

    $project = Project::findByStudent($pdo, (int)$user["id"]);

    View::render("student/livrables/upload", [
      "title" => "Déposer un livrable",
      "project" => $project,
      "pdo" => $pdo
    ]);
  }

  public static function upload(PDO $pdo): void
  {
    AuthMiddleware::handle();

    $user = $_SESSION["user"] ?? [];
    if (($user["role"] ?? "") !== "ETUDIANT") {
      http_response_code(403);
      echo "Accès refusé";
      return;
    }

    $studentId = (int)$user["id"];
    $project = Project::findByStudent($pdo, $studentId);

    if (!$project) {
      View::render("student/livrables/upload", [
        "title" => "Déposer un livrable",
        "error" => "Aucun projet ne vous est affecté.",
        "project" => null,
        "pdo" => $pdo
      ]);
      return;
    }

    $titre = trim($_POST["titre"] ?? "");
    $type = trim($_POST["type"] ?? "RAPPORT");
    $versionNum = (int)($_POST["version_num"] ?? 1);

    if ($versionNum <= 0) {
      $versionNum = 1;
    }

    if ($titre === "") {
      View::render("student/livrables/upload", [
        "title" => "Déposer un livrable",
        "error" => "Le titre est obligatoire.",
        "project" => $project,
        "pdo" => $pdo
      ]);
      return;
    }

    if (!isset($_FILES["fichier"]) || $_FILES["fichier"]["error"] !== UPLOAD_ERR_OK) {
      View::render("student/livrables/upload", [
        "title" => "Déposer un livrable",
        "error" => "Veuillez sélectionner un fichier valide.",
        "project" => $project,
        "pdo" => $pdo
      ]);
      return;
    }

    $originalName = $_FILES["fichier"]["name"];
    $tmpName = $_FILES["fichier"]["tmp_name"];

    $allowedExtensions = ['pdf', 'doc', 'docx', 'zip', 'ppt', 'pptx'];
    $extension = strtolower(pathinfo($originalName, PATHINFO_EXTENSION));

    if (!in_array($extension, $allowedExtensions, true)) {
    View::render("student/livrables/upload", [
        "title" => "Déposer un livrable",
        "error" => "Type de fichier non autorisé. Formats acceptés : pdf, doc, docx, zip, ppt, pptx.",
        "project" => $project,
        "pdo" => $pdo
    ]);
    return;
    }

    $maxSize = 10 * 1024 * 1024; // 10 Mo

    if ($_FILES["fichier"]["size"] > $maxSize) {
    View::render("student/livrables/upload", [
        "title" => "Déposer un livrable",
        "error" => "Le fichier est trop volumineux. Taille maximale : 10 Mo.",
        "project" => $project,
        "pdo" => $pdo
    ]);
    return;
    }

    $safeName = time() . "_" . preg_replace('/[^a-zA-Z0-9._-]/', '_', $originalName);
    $uploadDir = __DIR__ . '/../../public/uploads/livrables/';
    $relativePath = '/projex/public/uploads/livrables/' . $safeName;
    $fullPath = $uploadDir . $safeName;

    if (!is_dir($uploadDir)) {
      mkdir($uploadDir, 0777, true);
    }

    if (!move_uploaded_file($tmpName, $fullPath)) {
      View::render("student/livrables/upload", [
        "title" => "Déposer un livrable",
        "error" => "Échec de l'enregistrement du fichier.",
        "project" => $project,
        "pdo" => $pdo
      ]);
      return;
    }

    // Attention à l’ordre des paramètres selon ton modèle Livrable::create()
    Livrable::create(
      $pdo,
      (int)$project["id"],
      $studentId,
      $titre,
      $type,
      $versionNum,
      $originalName,
      $relativePath
    );

    // notifier les encadreurs du projet
    $stmt = $pdo->prepare("
      SELECT encadreur_acad_id, encadreur_pro_id
      FROM project_assignments
      WHERE project_id = ?
      LIMIT 1
    ");
    $stmt->execute([(int)$project["id"]]);
    $assignment = $stmt->fetch();

    if ($assignment) {
      $titreNotif = "Nouveau livrable déposé";
      $messageNotif = "Un étudiant a déposé le livrable : " . $titre;
      $linkUrl = "/projex/public/projects/livrables?id=" . (int)$project["id"];

      if (!empty($assignment["encadreur_acad_id"])) {
        Notification::create(
          $pdo,
          (int)$assignment["encadreur_acad_id"],
          $titreNotif,
          $messageNotif,
          $linkUrl,
          "LIVRABLE",
          (int)$project["id"]
        );
      }

      if (!empty($assignment["encadreur_pro_id"])) {
        Notification::create(
          $pdo,
          (int)$assignment["encadreur_pro_id"],
          $titreNotif,
          $messageNotif,
          $linkUrl,
          "LIVRABLE",
          (int)$project["id"]
        );
      }
    }

    header("Location: /projex/public/student/livrables");
    exit;
  }

  public static function livrables(PDO $pdo): void
  {
    AuthMiddleware::handle();

    $user = $_SESSION["user"] ?? [];
    if (($user["role"] ?? "") !== "ETUDIANT") {
      http_response_code(403);
      echo "Accès refusé";
      return;
    }

    $items = Livrable::byStudent($pdo, (int)$user["id"]);

    View::render("student/livrables/index", [
      "title" => "Mes livrables",
      "items" => $items,
      "pdo" => $pdo
    ]);
  }
}