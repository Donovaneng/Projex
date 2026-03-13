<?php
declare(strict_types=1);

require_once __DIR__ . '/../Models/Task.php';
require_once __DIR__ . '/../Models/Project.php';

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

    header("Location: /projex/public/tasks/project?project_id=" . $projectId);
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

    header("Location: /projex/public/tasks/student");
    exit;
  }

  
}