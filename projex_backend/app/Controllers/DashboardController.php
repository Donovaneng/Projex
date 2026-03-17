<?php
declare(strict_types=1);

require_once __DIR__ . '/../Models/Project.php';
require_once __DIR__ . '/../Models/Livrable.php';
require_once __DIR__ . '/../Models/Notification.php';

final class DashboardController
{
  public static function index(PDO $pdo): void
  {
    AuthMiddleware::handle();

    $user = $_SESSION["user"] ?? [];
    $role = $user["role"] ?? "";
    $userId = (int)($user["id"] ?? 0);

    // Étudiant
    if ($role === "ETUDIANT") {
      $project = Project::findByStudent($pdo, $userId);
      $evaluation = Evaluation::byStudent($pdo, $userId);
      View::render("dashboard/student", [
        "title" => "Dashboard Étudiant",
        "project" => $project,
        "evaluation" => $evaluation,
        "pdo" => $pdo
      ]);
      return;
    }

    // Encadreur académique
    if ($role === "ENCADREUR_ACAD") {
      $projects = Project::findByAcademicSupervisor($pdo, $userId);
      View::render("dashboard/supervisor", [
        "title" => "Dashboard Encadreur Académique",
        "projects" => $projects,
        "type" => "Académique",
        "pdo" => $pdo
      ]);
      return;
    }

    // Encadreur professionnel
    if ($role === "ENCADREUR_PRO") {
      $projects = Project::findByProSupervisor($pdo, $userId);
      View::render("dashboard/supervisor", [
        "title" => "Dashboard Encadreur Professionnel",
        "projects" => $projects,
        "type" => "Professionnel",
        "pdo" => $pdo
      ]);
      return;
    }

    // Admin
    View::render("dashboard/index", [
      "title" => "Dashboard",
      "pdo" => $pdo
    ]);
  }

  public static function projectLivrables(PDO $pdo, int $projectId): void
  {
    AuthMiddleware::handle();

    $items = Livrable::byProject($pdo, $projectId);

    View::render("dashboard/livrables", [
      "title" => "Livrables du projet",
      "items" => $items,
      "pdo" => $pdo
    ]);
  }

  public static function validateLivrable(PDO $pdo): void
  {
    AuthMiddleware::handle();

    $id = (int)($_POST["livrable_id"] ?? 0);
    $action = trim($_POST["action"] ?? "");
    $projectId = (int)($_POST["project_id"] ?? 0);
    $reason = trim($_POST["rejection_reason"] ?? "");

    if ($id <= 0 || !in_array($action, ["VALIDE", "REJETE"], true)) {
      echo "Données invalides";
      return;
    }

    Livrable::updateStatus(
      $pdo,
      $id,
      $action,
      $action === "REJETE" ? $reason : null
    );

    $livrable = Livrable::find($pdo, $id);

    if ($livrable) {
      $titreNotif = "Mise à jour de votre livrable";
      $messageNotif = ($action === "VALIDE")
      ? "Votre livrable a été validé."
      : "Votre livrable a été rejeté. Motif : " . ($reason !== "" ? $reason : "Aucun motif précisé.");

      $linkUrl = "/student/deliverables";

      Notification::create(
        $pdo,
        (int)$livrable["etudiant_id"],
        $titreNotif,
        $messageNotif,
        $linkUrl,
        "LIVRABLE",
        (int)$livrable["id"]
      );
    }

    // header("Location: /projex/public/projects/livrables?id=" . $projectId);
    exit;
  }

  public static function addLivrableComment(PDO $pdo): void
  {
    AuthMiddleware::handle();

    $user = $_SESSION["user"] ?? [];
    $authorId = (int)($user["id"] ?? 0);

    $livrableId = (int)($_POST["livrable_id"] ?? 0);
    $projectId = (int)($_POST["project_id"] ?? 0);
    $commentaire = trim($_POST["commentaire"] ?? "");

    if ($livrableId <= 0 || $commentaire === "") {
      echo "Commentaire invalide";
      return;
    }

    Livrable::addComment($pdo, $livrableId, $authorId, $commentaire);

    // header("Location: /projex/public/projects/livrables?id=" . $projectId);
    exit;
  }

  public static function evaluateForm(PDO $pdo): void
  {
    AuthMiddleware::handle();

    $projectId = (int)($_GET["id"] ?? 0);

    $project = Project::find($pdo, $projectId);
    
    $stmt = $pdo->prepare("
      SELECT etudiant_id
      FROM project_assignments
      WHERE project_id = ?
      LIMIT 1
    ");
    $stmt->execute([$projectId]);
    $assignment = $stmt->fetch();

    View::render("dashboard/evaluate", [
      "title" => "Évaluation du projet",
      "project" => $project,
      "student_id" => $assignment["etudiant_id"] ?? 0,
      "pdo" => $pdo
    ]);
  }
  public static function saveEvaluation(PDO $pdo): void
  {
    AuthMiddleware::handle();

    $user = $_SESSION["user"] ?? [];
    $supervisorId = (int)$user["id"];

    $projectId = (int)$_POST["project_id"];
    $studentId = (int)$_POST["student_id"];
    $note = (float)$_POST["note"];
    $comment = trim($_POST["commentaire"] ?? "");

    Evaluation::create(
      $pdo,
      $projectId,
      $studentId,
      $supervisorId,
      $note,
      $comment
    );

    // header("Location: /projex/public/dashboard");
    exit;
  }

  public static function evaluateProForm(PDO $pdo): void
  {
    AuthMiddleware::handle();

    $projectId = (int)($_GET["id"] ?? 0);

    $project = Project::find($pdo, $projectId);

    $stmt = $pdo->prepare("
      SELECT etudiant_id
      FROM project_assignments
      WHERE project_id = ?
    ");
    $stmt->execute([$projectId]);

    $assignment = $stmt->fetch();

    $competences = ProfessionalEvaluation::competences($pdo);

    View::render("dashboard/evaluate_pro", [
      "title" => "Évaluation professionnelle",
      "project" => $project,
      "student_id" => $assignment["etudiant_id"] ?? 0,
      "competences" => $competences,
      "pdo" => $pdo
    ]);
  }

  public static function saveEvaluationPro(PDO $pdo): void
  {
    AuthMiddleware::handle();

    $user = $_SESSION["user"] ?? [];
    $supervisorId = (int)$user["id"];

    $projectId = (int)$_POST["project_id"];
    $studentId = (int)$_POST["student_id"];
    $comment = trim($_POST["commentaire"] ?? "");

    $evaluationId = ProfessionalEvaluation::create(
      $pdo,
      $projectId,
      $studentId,
      $supervisorId,
      $comment
    );

    $scores = $_POST["score"] ?? [];

    foreach ($scores as $competenceId => $score) {

      ProfessionalEvaluation::addItem(
        $pdo,
        $evaluationId,
        (int)$competenceId,
        (int)$score
      );

    }

    // header("Location: /projex/public/dashboard");
    exit;
  }
}