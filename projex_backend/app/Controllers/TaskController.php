<?php
declare(strict_types=1);

require_once __DIR__ . '/../Models/Task.php';
require_once __DIR__ . '/../Models/Notification.php';
require_once __DIR__ . '/../Models/AuditLog.php';
require_once __DIR__ . '/../Models/Project.php'; // Keep Project.php as it's used in the controller

final class TaskController
{
  // Formulaire de création d'une tâche
    public static function createForm(PDO $pdo): void
        {
        AuthMiddleware::handle();

        $projectId = (int)($_GET["project_id"] ?? 0);

        if ($projectId <= 0) {
            echo "Projet invalide";
            return;
        }

        $project = Project::find($pdo, $projectId);

        if (!$project) {
            echo "Projet introuvable";
            return;     
        }

        $student = Project::assignedStudent($pdo, $projectId);

        View::render("tasks/create", [
            "title" => "Créer une tâche",
            "project" => $project,
            "student" => $student
        ]);
    }
  // Enregistrement d'une tâche
  public static function create(PDO $pdo): void
  {
    AuthMiddleware::handle();

    $user = $_SESSION["user"] ?? [];
    $createdBy = (int)($user["id"] ?? 0);

    $projectId = (int)($_POST["project_id"] ?? 0);
    $assignedTo = (int)($_POST["assigned_to"] ?? 0);
    $titre = trim($_POST["titre"] ?? "");
    $description = trim($_POST["description"] ?? "");
    $dueDate = $_POST["due_date"] ?? null;

    if ($projectId <= 0 || $assignedTo <= 0 || $titre === "") {
      echo "Champs obligatoires manquants";
      return;
    }

    Task::create($pdo, $projectId, $assignedTo, $createdBy, $titre, $description, $dueDate);

    // Pas de redirection header
    exit;
  }

  // Voir les tâches d'un projet
  public static function projectTasks(PDO $pdo): void
  {
    AuthMiddleware::handle();

    $projectId = (int)($_GET["project_id"] ?? 0);

    if ($projectId <= 0) {
      echo "Projet invalide";
      return;
    }

    $project = Project::find($pdo, $projectId);
    $tasks = Task::byProject($pdo, $projectId);

    View::render("tasks/project", [
      "title" => "Tâches du projet",
      "project" => $project,
      "tasks" => $tasks
    ]);
  }

  // Voir les tâches de l'étudiant connecté
  public static function studentTasks(PDO $pdo): void
  {
    AuthMiddleware::handle();

    $user = $_SESSION["user"] ?? [];
    $studentId = (int)($user["id"] ?? 0);

    $tasks = Task::byStudent($pdo, $studentId);

    View::render("tasks/student", [
      "title" => "Mes tâches",
      "tasks" => $tasks
    ]);
  }

  // Mise à jour du statut
  public static function updateStatus(PDO $pdo): void
  {
    AuthMiddleware::handle();

    $taskId = (int)($_POST["task_id"] ?? 0);
    $status = trim($_POST["statut"] ?? "");

    $allowed = ["A_FAIRE", "EN_COURS", "TERMINE", "BLOQUE"];

    if ($taskId <= 0 || !in_array($status, $allowed, true)) {
      echo "Données invalides";
      return;
    }

    Task::updateStatus($pdo, $taskId, $status);

    // Pas de redirection header
    exit;
  }

  public static function apiCreate(PDO $pdo): void
  {
      AuthMiddleware::handle();
      $user = $_SESSION["user"];
      $input = json_decode(file_get_contents('php://input'), true);
      
      $projectId = (int)($input["project_id"] ?? 0);
      $assignedTo = (int)($input["assigned_to"] ?? $user["id"]);
      $titre = trim($input["titre"] ?? "");
      $description = trim($input["description"] ?? "");
      $dueDate = $input["due_date"] ?? null;

      if ($projectId <= 0 || $titre === "") {
          http_response_code(400);
          echo json_encode(["error" => "Le titre et le projet sont obligatoires."]);
          return;
      }

      // Gérer le cas où la date est une chaîne vide (souvent le cas en JS)
      if (empty($dueDate)) {
          $dueDate = null;
      }

      try {
          Task::create($pdo, $projectId, (int)$assignedTo, (int)$user["id"], $titre, $description, $dueDate);
          
          // N'envoyer de notification QUE si la personne assignée est différente de l'auteur (ex: Admin qui assigne une tâche à l'étudiant)
          if ((int)$assignedTo !== (int)$user["id"]) {
              Notification::create(
                  $pdo,
                  (int)$assignedTo,
                  "Nouvelle tâche assignée",
                  "Une nouvelle tâche '" . $titre . "' vous a été assignée.",
                  "/student/tasks",
                  "TASK",
                  $projectId
              );
          }

          header("Content-Type: application/json");
          echo json_encode(["message" => "Tâche créée avec succès"]);
      } catch (Exception $e) {
          http_response_code(500);
          echo json_encode(["error" => "Erreur lors de la création de la tâche: " . $e->getMessage()]);
      }
  }

  public static function apiUpdateStatus(PDO $pdo, ?int $taskId = null): void
  {
      AuthMiddleware::handle();
      $input = json_decode(file_get_contents('php://input'), true);
      $id = $taskId ?? (int)($input["task_id"] ?? 0);
      $status = $input["status"] ?? "";

      $allowed = ["A_FAIRE", "EN_COURS", "TERMINE", "BLOQUE"];
      if ($id <= 0 || !in_array($status, $allowed, true)) {
          http_response_code(400);
          echo json_encode(["error" => "Données invalides"]);
          return;
      }

      Task::updateStatus($pdo, $id, $status);
      
      // Audit Log
      AuditLog::log($pdo, (int)$_SESSION["user"]["id"], "UPDATE_TASK_STATUS", "TASK", $id, ["status" => $status]);
      
      header("Content-Type: application/json");
      echo json_encode(["message" => "Statut mis à jour"]);
  }

  public static function apiGetProjectTasks(PDO $pdo, int $projectId): void
  {
      AuthMiddleware::handle();
      $tasks = Task::byProject($pdo, $projectId);
      header("Content-Type: application/json");
      echo json_encode(["tasks" => $tasks]);
  }

  public static function apiDelete(PDO $pdo, int $taskId): void
  {
      AuthMiddleware::handle();
      
      try {
          Task::delete($pdo, $taskId);
          header("Content-Type: application/json");
          echo json_encode(["message" => "Tâche supprimée avec succès"]);
      } catch (Exception $e) {
          http_response_code(500);
          echo json_encode(["error" => "Erreur lors de la suppression de la tâche: " . $e->getMessage()]);
      }
  }
}