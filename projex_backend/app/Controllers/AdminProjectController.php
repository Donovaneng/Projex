<?php
declare(strict_types=1);

require_once __DIR__ . '/../Models/Project.php';
require_once __DIR__ . '/../Models/User.php';

final class AdminProjectController
{
  public static function index(PDO $pdo): void
  {
    $projects = Project::all($pdo);
    
    // Retourner JSON si c'est une API call
    if (isset($_SERVER['HTTP_ACCEPT']) && strpos($_SERVER['HTTP_ACCEPT'], 'application/json') !== false) {
      header("Content-Type: application/json");
      echo json_encode(["projects" => $projects]);
      return;
    }
    
    View::render("admin/projects/index", [
      "title" => "Projets",
      "projects" => $projects
    ]);
  }

  public static function createForm(): void
  {
    View::render("admin/projects/create", ["title" => "Créer un projet"]);
  }

  public static function create(PDO $pdo): void
  {
    // Lire JSON pour API calls
    $input = isset($_SERVER['CONTENT_TYPE']) && strpos($_SERVER['CONTENT_TYPE'], 'application/json') !== false
      ? json_decode(file_get_contents('php://input'), true)
      : $_POST;

    $titre = trim($input["titre"] ?? "");
    $description = trim($input["description"] ?? "");
    $date_debut = $input["date_debut"] ?? null;
    $date_fin = $input["date_fin"] ?? null;

    if ($titre === "") {
      http_response_code(400);
      header("Content-Type: application/json");
      echo json_encode(["error" => "Le titre est obligatoire."]);
      return;
    }

    Project::create($pdo, $titre, $description !== "" ? $description : null, $date_debut ?: null, $date_fin ?: null);

    // Retourner JSON si API call
    if (isset($_SERVER['CONTENT_TYPE']) && strpos($_SERVER['CONTENT_TYPE'], 'application/json') !== false) {
      header("Content-Type: application/json");
      echo json_encode(["message" => "Projet créé avec succès"]);
      return;
    }

    header("Location: /projex/public/admin/projects");
    exit;
  }

  public static function assignForm(PDO $pdo, int $id): void
  {
    $project = Project::find($pdo, $id);
    if (!$project) {
      echo "Projet introuvable";
      return;
    }

    View::render("admin/projects/assign", [
      "title" => "Affecter projet",
      "project" => $project,
      "etudiants" => User::byRole($pdo, "ETUDIANT"),
      "acad" => User::byRole($pdo, "ENCADREUR_ACAD"),
      "pro" => User::byRole($pdo, "ENCADREUR_PRO")
    ]);
  }

  public static function assign(PDO $pdo): void
  {
    // Lire JSON pour API calls
    $input = isset($_SERVER['CONTENT_TYPE']) && strpos($_SERVER['CONTENT_TYPE'], 'application/json') !== false
      ? json_decode(file_get_contents('php://input'), true)
      : $_POST;

    $projectId = (int)($input["project_id"] ?? 0);
    $userIds = $input["user_ids"] ?? []; // Tableau d'IDs

    if ($projectId <= 0 || empty($userIds)) {
      http_response_code(400);
      header("Content-Type: application/json");
      echo json_encode(["error" => "Champs obligatoires manquants"]);
      return;
    }

    // Assigner chaque utilisateur
    foreach ($userIds as $userId) {
      $userId = (int)$userId;
      if ($userId > 0) {
        Project::assign($pdo, $projectId, $userId, null, null);
      }
    }

    // Retourner JSON si API call
    if (isset($_SERVER['CONTENT_TYPE']) && strpos($_SERVER['CONTENT_TYPE'], 'application/json') !== false) {
      header("Content-Type: application/json");
      echo json_encode(["message" => "Projet assigné avec succès"]);
      return;
    }

    header("Location: /projex/public/admin/projects");
    exit;
  }
}