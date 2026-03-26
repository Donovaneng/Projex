<?php
declare(strict_types=1);

require_once __DIR__ . '/../Models/Project.php';
require_once __DIR__ . '/../Models/Evaluation.php';
require_once __DIR__ . '/../Models/ProfessionalEvaluation.php';
require_once __DIR__ . '/../Models/Livrable.php';
require_once __DIR__ . '/../Models/AuditLog.php';

final class SupervisorController
{
  public static function getProjects(PDO $pdo): void
  {
    AuthMiddleware::handle();
    $user = $_SESSION["user"];
    $userId = (int)$user["id"];
    $role = $user["role"];

    if ($role === "ENCADREUR_ACAD") {
      $projects = Project::findByAcademicSupervisor($pdo, $userId);
    } else {
      $projects = Project::findByProSupervisor($pdo, $userId);
    }

    // Add student name and progress to each project for the UI
    foreach ($projects as &$p) {
        $student = Project::assignedStudent($pdo, (int)$p["id"]);
        $p["etudiant_nom"] = $student ? $student["nom"] : "Non assigné";
        $p["etudiant_prenom"] = $student ? $student["prenom"] : "";
        $p["etudiant_id"] = $student ? $student["id"] : null;
        $p["etudiant_full_nom"] = $student ? $student["prenom"] . " " . $student["nom"] : "Non assigné";

        // Calculate progress
        $p["progress"] = Project::getProgress($pdo, (int)$p["id"]);
    }

    header("Content-Type: application/json");
    echo json_encode(["projects" => $projects]);
  }

  public static function getProjectDetails(PDO $pdo, int $projectId): void
  {
    AuthMiddleware::handle();
    $project = Project::find($pdo, $projectId);
    
    if (!$project) {
        http_response_code(404);
        echo json_encode(["error" => "Projet introuvable"]);
        return;
    }

    $student = Project::assignedStudent($pdo, $projectId);
    $project["etudiant_nom"] = $student ? $student["nom"] : "Non assigné";
    $project["etudiant_prenom"] = $student ? $student["prenom"] : "";
    $project["etudiant_full_nom"] = $student ? $student["prenom"] . " " . $student["nom"] : "Non assigné";
    
    $livrables = Livrable::byProject($pdo, $projectId);
    $project["livrables"] = $livrables;
    $project["progress"] = Project::getProgress($pdo, $projectId);

    header("Content-Type: application/json");
    echo json_encode(["project" => $project]);
  }

  public static function getEvaluations(PDO $pdo): void
  {
    AuthMiddleware::handle();
    $user = $_SESSION["user"];
    $userId = (int)$user["id"];
    $role = $user["role"];

    if ($role === "ENCADREUR_ACAD") {
      $evals = Evaluation::allBySupervisor($pdo, $userId);
    } else {
      $evals = ProfessionalEvaluation::allBySupervisor($pdo, $userId);
      // Inclure les items Detailed pour chaque évaluation pro
      foreach ($evals as &$e) {
        $e["commentaire"] = $e["commentaire_global"] ?? $e["commentaire"] ?? "";
        $e["note"] = "N/A"; // Pas de note globale simple pour les pros
        
        $stmt = $pdo->prepare("
            SELECT i.score, c.libelle, i.appreciation 
            FROM evaluation_professionnelle_items i
            JOIN competences c ON c.id = i.competence_id
            WHERE i.evaluation_pro_id = ?
        ");
        $stmt->execute([(int)$e["id"]]);
        $e["items"] = $stmt->fetchAll();
      }
    }

    header("Content-Type: application/json");
    echo json_encode(["evaluations" => $evals]);
  }

  public static function approveDeliverable(PDO $pdo, int $deliverableId): void
  {
      AuthMiddleware::handle();
      $input = json_decode(file_get_contents('php://input'), true);
      $feedback = $input["feedback"] ?? "";

      Livrable::updateStatus($pdo, $deliverableId, 'VALIDE');
      if ($feedback) {
          Livrable::addComment($pdo, $deliverableId, (int)$_SESSION["user"]["id"], $feedback);
      }

      $livrable = Livrable::find($pdo, $deliverableId);
      if ($livrable) {
          Notification::create(
              $pdo,
              (int)$livrable["etudiant_id"],
              "Livrable validé",
              "Votre livrable '" . $livrable["titre"] . "' a été approuvé.",
              "/student/deliverables",
              "LIVRABLE",
              (int)$livrable["id"]
          );
      }

      echo json_encode(["success" => true, "message" => "Livrable approuvé"]);
      // Audit Log
      AuditLog::log($pdo, (int)$_SESSION["user"]["id"], "APPROVE_DELIVERABLE", "LIVRABLE", $deliverableId);
  }

  public static function rejectDeliverable(PDO $pdo, int $deliverableId): void
  {
      AuthMiddleware::handle();
      $input = json_decode(file_get_contents('php://input'), true);
      $reason = $input["reason"] ?? "";

      Livrable::updateStatus($pdo, $deliverableId, 'REJETE', $reason);
      if ($reason) {
          Livrable::addComment($pdo, $deliverableId, (int)$_SESSION["user"]["id"], "Rejet: " . $reason);
      }

      $livrable = Livrable::find($pdo, $deliverableId);
      if ($livrable) {
          Notification::create(
              $pdo,
              (int)$livrable["etudiant_id"],
              "Livrable rejeté",
              "Votre livrable '" . $livrable["titre"] . "' a été rejeté par l'encadreur.",
              "/student/deliverables",
              "LIVRABLE",
              (int)$livrable["id"]
          );
      }

      echo json_encode(["success" => true, "message" => "Livrable rejeté"]);
      // Audit Log
      AuditLog::log($pdo, (int)$_SESSION["user"]["id"], "REJECT_DELIVERABLE", "LIVRABLE", $deliverableId, ["reason" => $reason]);
  }

  public static function createEvaluation(PDO $pdo): void
  {
      AuthMiddleware::handle();
      $user = $_SESSION["user"];
      $input = json_decode(file_get_contents('php://input'), true);

      $projectId = (int)($input["projet_id"] ?? 0);
      $studentId = (int)($input["etudiant_id"] ?? 0);
      $note = (float)($input["note"] ?? 0);
      $comment = $input["commentaire"] ?? "";

      if ($user["role"] === "ENCADREUR_ACAD") {
          Evaluation::create($pdo, $projectId, $studentId, (int)$user["id"], $note, $comment);
      } else {
          $evalId = ProfessionalEvaluation::create($pdo, $projectId, $studentId, (int)$user["id"], $comment);
          // If items (skills) were sent
          if (isset($input["items"]) && is_array($input["items"])) {
              foreach ($input["items"] as $item) {
                  ProfessionalEvaluation::addItem($pdo, $evalId, (int)$item["competence_id"], (int)$item["score"]);
              }
          }
      }

      Notification::create(
          $pdo,
          $studentId,
          "Nouvelle évaluation disponible",
          "Votre encadreur a publié une nouvelle évaluation pour votre projet.",
          "/student/dashboard", // Or a specific eval page if exists
          "EVALUATION",
          $projectId
      );

      echo json_encode(["success" => true, "message" => "Évaluation enregistrée"]);
  }

  public static function apiGetCompetences(PDO $pdo): void
  {
      AuthMiddleware::handle();
      $comps = ProfessionalEvaluation::competences($pdo);
      header("Content-Type: application/json");
      echo json_encode(["competences" => $comps]);
  }

  public static function apiGetProposals(PDO $pdo): void
  {
      AuthMiddleware::handle();
      $user = $_SESSION["user"];
      
      // Les propositions sont des projets avec le statut 'PROPOSE' ou 'EN_ATTENTE'
      // qui ne sont pas encore validés.
      $stmt = $pdo->prepare("
          SELECT p.*, u.prenom as etudiant_prenom, u.nom as etudiant_nom 
          FROM projects p
          LEFT JOIN users u ON p.created_by = u.id
          WHERE p.statut IN ('PROPOSE', 'EN_ATTENTE')
          ORDER BY p.created_at DESC
      ");
      $stmt->execute();
      $proposals = $stmt->fetchAll(PDO::FETCH_ASSOC);

      header("Content-Type: application/json");
      echo json_encode(["proposals" => $proposals]);
  }

  public static function apiHandleProposal(PDO $pdo, int $id): void
  {
      AuthMiddleware::handle();
      $user = $_SESSION["user"];
      $input = json_decode(file_get_contents('php://input'), true);
      $action = $input["action"] ?? ""; // 'APPROVE' ou 'REJECT'
      $comment = $input["comment"] ?? "";

      $project = Project::find($pdo, $id);
      if (!$project) {
          http_response_code(404);
          echo json_encode(["error" => "Proposition introuvable"]);
          return;
      }

      if ($action === "APPROVE") {
          $stmt = $pdo->prepare("UPDATE projects SET statut = 'VALIDE', description = CONCAT(description, '\n\nNote encadreur: ', ?) WHERE id = ?");
          $stmt->execute([$comment, $id]);
          
          Notification::create(
              $pdo,
              (int)$project["created_by"],
              "Proposition de projet validée",
              "Votre proposition de projet '" . $project["titre"] . "' a été validée par un encadreur.",
              "/student/projects",
              "PROJET",
              $id
          );
      } else {
          $stmt = $pdo->prepare("UPDATE projects SET statut = 'REJETE', motif_rejet = ? WHERE id = ?");
          $stmt->execute([$comment, $id]);

          Notification::create(
              $pdo,
              (int)$project["created_by"],
              "Proposition de projet rejetée",
              "Votre proposition de projet '" . $project["titre"] . "' a été rejetée. Motif: " . $comment,
              "/student/projects",
              "PROJET",
              $id
          );
      }

      // Audit Log
      AuditLog::log($pdo, (int)$_SESSION["user"]["id"], $action === "APPROVE" ? "APPROVE_PROJECT" : "REJECT_PROJECT", "PROJECT", $id, ["comment" => $comment]);

      echo json_encode(["success" => true, "message" => "Action effectuée avec succès"]);
  }

  public static function apiGetProjectTimeline(PDO $pdo, int $projectId): void
  {
      AuthMiddleware::handle();
      
      // On combine les livrables, les évaluations et les commentaires pour faire une timeline
      $timeline = [];

      // 1. Livrables
      $livrables = $pdo->prepare("SELECT id, titre as label, description, 'LIVRABLE' as type, submitted_at as date, statut as meta, file_path FROM livrables WHERE project_id = ?");
      $livrables->execute([$projectId]);
      while($row = $livrables->fetch(PDO::FETCH_ASSOC)) { $timeline[] = $row; }

      // 2. Évaluations Académiques
      $evals = $pdo->prepare("SELECT id, 'Évaluation Académique' as label, 'EVALUATION' as type, created_at as date, CAST(note AS CHAR) as meta FROM evaluation_academique WHERE projet_id = ?");
      $evals->execute([$projectId]);
      while($row = $evals->fetch(PDO::FETCH_ASSOC)) { $timeline[] = $row; }

      // 3. Évaluations Professionnelles
      $evalsPro = $pdo->prepare("SELECT id, 'Évaluation Professionnelle' as label, 'EVALUATION' as type, created_at as date, 'PRO' as meta FROM evaluation_professionnelle WHERE projet_id = ?");
      $evalsPro->execute([$projectId]);
      while($row = $evalsPro->fetch(PDO::FETCH_ASSOC)) { $timeline[] = $row; }

      // 4. Tâches
      $tasks = $pdo->prepare("SELECT id, titre as label, 'TASK' as type, created_at as date, statut as meta FROM taches WHERE project_id = ?");
      $tasks->execute([$projectId]);
      while($row = $tasks->fetch(PDO::FETCH_ASSOC)) { $timeline[] = $row; }

      // Trier par date décroissante
      usort($timeline, function($a, $b) {
          $dateA = $a['date'] ?? '0000-00-00 00:00:00';
          $dateB = $b['date'] ?? '0000-00-00 00:00:00';
          return strtotime($dateB) - strtotime($dateA);
      });

      header("Content-Type: application/json");
      echo json_encode(["timeline" => $timeline]);
  }
}
