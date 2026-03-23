<?php
declare(strict_types=1);

require_once __DIR__ . '/../Models/Project.php';
require_once __DIR__ . '/../Models/User.php';
require_once __DIR__ . '/../Models/AcademicPeriod.php';
require_once __DIR__ . '/../Models/Notification.php';

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

    $activePeriod = AcademicPeriod::getActive($pdo);
    $periodId = $activePeriod ? (int)$activePeriod['id'] : null;

    Project::create($pdo, $titre, $description !== "" ? $description : null, $date_debut ?: null, $date_fin ?: null, (int)$_SESSION["user"]["id"], "ADMIN", null, $periodId);

    // Retourner JSON si API call
    if (isset($_SERVER['CONTENT_TYPE']) && strpos($_SERVER['CONTENT_TYPE'], 'application/json') !== false) {
      header("Content-Type: application/json");
      echo json_encode(["message" => "Projet créé avec succès"]);
      return;
    }

    // header("Location: /projex/public/admin/projects");
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

    // Assigner chaque utilisateur selon son rôle
    $etudiantId = null;
    $acadId = null;
    $proId = null;

    foreach ($userIds as $userId) {
      $userId = (int)$userId;
      if ($userId > 0) {
        $user = User::findById($pdo, $userId);
        if ($user) {
          if ($user["role"] === "ETUDIANT") {
            $etudiantId = $userId;
          } elseif ($user["role"] === "ENCADREUR_ACAD") {
            $acadId = $userId;
          } elseif ($user["role"] === "ENCADREUR_PRO") {
            $proId = $userId;
          }
        }
      }
    }

    // Si on n'a pas reçu d'étudiant dans la liste, on regarde s'il y en a déjà un
    if (!$etudiantId) {
      $existingAssignment = Project::assignedStudent($pdo, $projectId);
      if ($existingAssignment) {
        $etudiantId = (int)$existingAssignment["id"];
      } else {
        // Optionnel : vérifier aussi projects.student_id au cas où
        $project = Project::find($pdo, $projectId);
        if ($project && $project["student_id"]) {
          $etudiantId = (int)$project["student_id"];
        }
      }
    }

    if ($etudiantId) {
      // Validation : Un étudiant ne peut avoir qu'un seul projet par période
      $activePeriod = AcademicPeriod::getActive($pdo);
      $periodId = $activePeriod ? (int)$activePeriod['id'] : null;
      
      $busyProject = Project::isStudentBusy($pdo, $etudiantId, $projectId, $periodId);
      if ($busyProject) {
        http_response_code(400);
        header("Content-Type: application/json");
        echo json_encode([
            "error" => "Cet étudiant est déjà assigné au projet : " . $busyProject["titre"],
            "details" => "Un étudiant ne peut pas avoir deux projets actifs pour la même période."
        ]);
        return;
      }

      Project::assign($pdo, $projectId, $etudiantId, $acadId, $proId);
      
      // Notifications aux membres de l'équipe
      $project = Project::find($pdo, $projectId);
      $msg = "Vous avez été assigné au projet : " . ($project["titre"] ?? "Nouveau projet");
      
      if ($etudiantId) Notification::create($pdo, $etudiantId, "Affectation Projet", $msg, "/student/projects");
      if ($acadId) Notification::create($pdo, $acadId, "Encadrement Projet", $msg, "/supervisor/projects");
      if ($proId) Notification::create($pdo, $proId, "Encadrement Projet", $msg, "/supervisor/projects");

    } else {
      http_response_code(400);
      header("Content-Type: application/json");
      echo json_encode(["error" => "Un étudiant est requis pour l'assignation"]);
      return;
    }

    // Retourner JSON si API call
    if (isset($_SERVER['CONTENT_TYPE']) && strpos($_SERVER['CONTENT_TYPE'], 'application/json') !== false) {
      header("Content-Type: application/json");
      echo json_encode(["message" => "Projet assigné avec succès"]);
      return;
    }

    // header("Location: /projex/public/admin/projects");
    exit;
  }

  public static function update(PDO $pdo, int $id): void
  {
      header("Content-Type: application/json");
      $input = json_decode(file_get_contents('php://input'), true);

      try {
          Project::update($pdo, $id, $input);
          echo json_encode(["message" => "Projet mis à jour avec succès"]);
      } catch (Throwable $e) {
          http_response_code(500);
          echo json_encode(["error" => "Erreur lors de la mise à jour"]);
      }
  }

  public static function delete(PDO $pdo, int $id): void
  {
      header("Content-Type: application/json");
      try {
          Project::delete($pdo, $id);
          echo json_encode(["message" => "Projet supprimé avec succès"]);
      } catch (Throwable $e) {
          http_response_code(500);
          echo json_encode(["error" => "Erreur lors de la suppression"]);
      }
  }

  public static function approveProposal(PDO $pdo, int $id): void
  {
      header("Content-Type: application/json");
      try {
          Project::update($pdo, $id, ["statut" => "EN_COURS"]);
          
          // Audit Log
          AuditLog::log($pdo, (int)$_SESSION["user"]["id"], "APPROVE_PROJECT", "PROJECTS", $id);
          
          // Notification à l'étudiant
          $project = Project::find($pdo, $id);
          if ($project && $project["student_id"]) {
              Notification::create($pdo, (int)$project["student_id"], "Projet Validé", "Votre proposition de projet '" . $project["titre"] . "' a été validée par l'administration.", "/student/projects");
          }

          echo json_encode(["message" => "Proposition validée avec succès"]);
      } catch (Throwable $e) {
          http_response_code(500);
          echo json_encode(["error" => "Erreur lors de la validation"]);
      }
  }

  public static function searchProjects(PDO $pdo): void
  {
      header("Content-Type: application/json");
      $q = $_GET["q"] ?? "";
      $statut = $_GET["statut"] ?? "";

      $filters = [
          "q" => $q,
          "statut" => $statut,
          "period_id" => $_GET["period_id"] ?? null
      ];

      try {
          $projects = Project::search($pdo, $filters);
          echo json_encode(["projects" => $projects]);
      } catch (Throwable $e) {
          http_response_code(500);
          echo json_encode(["error" => "Erreur lors de la recherche"]);
      }
  }

  public static function rejectProposal(PDO $pdo, int $id): void
  {
      header("Content-Type: application/json");
      try {
          $input = json_decode(file_get_contents('php://input'), true);
          $motif = $input["motif"] ?? "Refusé par l'administration";

          Project::update($pdo, $id, ["statut" => "REJETE", "motif_rejet" => $motif]);

          // Audit Log
          AuditLog::log($pdo, (int)$_SESSION["user"]["id"], "REJECT_PROJECT", "PROJECTS", $id, ["motif" => $motif]);

          // Notification à l'étudiant
          $project = Project::find($pdo, $id);
          if ($project && $project["student_id"]) {
              Notification::create($pdo, (int)$project["student_id"], "Projet Rejeté", "Votre proposition de projet '" . $project["titre"] . "' a été rejetée par l'administration. Motif: " . $motif, "/student/projects");
          }

          echo json_encode(["message" => "Proposition rejetée"]);
      } catch (Throwable $e) {
          http_response_code(500);
          echo json_encode(["error" => "Erreur lors du rejet"]);
      }
  }

  public static function closeProject(PDO $pdo, int $id): void
  {
      header("Content-Type: application/json");
      try {
          Project::update($pdo, $id, ["statut" => "TERMINE"]);
          
          // Audit Log
          AuditLog::log($pdo, (int)$_SESSION["user"]["id"], "CLOSE_PROJECT", "PROJECTS", $id);
          
          echo json_encode(["message" => "Projet terminé"]);
      } catch (Throwable $e) {
          http_response_code(500);
          echo json_encode(["error" => "Erreur lors de la clôture"]);
      }
  }

    public static function show(PDO $pdo, int $id): void
    {
        header("Content-Type: application/json");
        try {
            $project = Project::find($pdo, $id);
            if (!$project) {
                http_response_code(404);
                echo json_encode(["error" => "Projet non trouvé"]);
                return;
            }

            $project["progress"] = Project::getProgress($pdo, $id);

            // Équipe (Étudiant + Encadreurs)
            $stmt = $pdo->prepare("
                SELECT u.id, u.nom, u.prenom, u.role, u.email, u.telephone, u.image_profil
                FROM users u
                WHERE u.id = (SELECT student_id FROM projects WHERE id = ?)
                OR u.id IN (
                    SELECT encadreur_acad_id FROM project_assignments WHERE project_id = ?
                    UNION
                    SELECT encadreur_pro_id FROM project_assignments WHERE project_id = ?
                )
            ");
            $stmt->execute([$id, $id, $id]);
            $team = $stmt->fetchAll();

            // Livrables
            require_once __DIR__ . "/../Models/Livrable.php";
            $deliverables = Livrable::byProject($pdo, $id);

            // Évaluations
            require_once __DIR__ . "/../Models/Evaluation.php";
            $evalAcad = Evaluation::findByProject($pdo, $id);
            $evalPro = Evaluation::findProByProject($pdo, $id);

            // Soutenance
            require_once __DIR__ . "/../Models/Soutenance.php";
            $stmt = $pdo->prepare("SELECT * FROM soutenances WHERE projet_id = ? LIMIT 1");
            $stmt->execute([$id]);
            $soutenance = $stmt->fetch() ?: null;

            // Tâches
            require_once __DIR__ . "/../Models/Task.php";
            $tasks = Task::byProject($pdo, $id);

            echo json_encode([
                "project" => $project,
                "team" => $team,
                "deliverables" => $deliverables,
                "tasks" => $tasks,
                "evaluations" => [
                    "academique" => $evalAcad,
                    "professionnelle" => $evalPro
                ],
                "soutenance" => $soutenance
            ]);
        } catch (Throwable $e) {
            http_response_code(500);
            echo json_encode(["error" => $e->getMessage()]);
        }
    }
}