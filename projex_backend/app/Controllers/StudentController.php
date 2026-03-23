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
      if (strpos($_SERVER['REQUEST_URI'] ?? '', '/api/') !== false) {
          http_response_code(404);
          header('Content-Type: application/json');
          echo json_encode(["error" => "Aucun projet ne vous est affecté."]);
          exit();
      }
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
      if (strpos($_SERVER['REQUEST_URI'] ?? '', '/api/') !== false) {
          http_response_code(400);
          header('Content-Type: application/json');
          echo json_encode(["error" => "Le titre est obligatoire."]);
          exit();
      }
      View::render("student/livrables/upload", [
        "title" => "Déposer un livrable",
        "error" => "Le titre est obligatoire.",
        "project" => $project,
        "pdo" => $pdo
      ]);
      return;
    }

    if (!isset($_FILES["fichier"]) || $_FILES["fichier"]["error"] !== UPLOAD_ERR_OK) {
      if (strpos($_SERVER['REQUEST_URI'] ?? '', '/api/') !== false) {
          http_response_code(400);
          header('Content-Type: application/json');
          echo json_encode(["error" => "Veuillez sélectionner un fichier valide."]);
          exit();
      }
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
    if (strpos($_SERVER['REQUEST_URI'] ?? '', '/api/') !== false) {
        http_response_code(400);
        header('Content-Type: application/json');
        echo json_encode(["error" => "Type de fichier non autorisé. Formats acceptés : pdf, doc, docx, zip, ppt, pptx."]);
        exit();
    }
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
    if (strpos($_SERVER['REQUEST_URI'] ?? '', '/api/') !== false) {
        http_response_code(400);
        header('Content-Type: application/json');
        echo json_encode(["error" => "Le fichier est trop volumineux. Taille maximale : 10 Mo."]);
        exit();
    }
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
    $relativePath = 'uploads/livrables/' . $safeName;
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
      $linkUrl = "/supervisor/projects"; // Rediriger vers la liste des projets pour l'encadreur

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

    if (strpos($_SERVER['REQUEST_URI'] ?? '', '/api/') !== false) {
      header("Content-Type: application/json");
      echo json_encode(["message" => "Livrable déposé avec succès"]);
      exit;
    }

    // On ne fait plus de redirection header en API, on laisse le frontend gérer après le succès JSON
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
  public static function apiCreateProject(PDO $pdo): void
  {
      AuthMiddleware::handle();
      $user = $_SESSION["user"];
      if ($user["role"] !== "ETUDIANT") {
          http_response_code(403);
          echo json_encode(["error" => "Seuls les étudiants peuvent proposer des projets."]);
          return;
      }

      $input = json_decode(file_get_contents('php://input'), true);
      $titre = $input["titre"] ?? "";
      $description = $input["description"] ?? "";
      $date_fin = $input["date_fin"] ?? null;
      $categorie_id = isset($input["categorie_id"]) ? (int)$input["categorie_id"] : null;

      if (!$titre || !$description) {
          http_response_code(400);
          echo json_encode(["error" => "Le titre et la description sont obligatoires."]);
          return;
      }

      // Propose project: create project entry
      $projectId = Project::createByStudent($pdo, $titre, $description, (int)$user["id"], $categorie_id);
      
      // Affect to the student
      Project::assign($pdo, $projectId, (int)$user["id"], null, null);

      // Notification pour les Admins
      $admins = User::byRole($pdo, "ADMIN");
      foreach ($admins as $admin) {
          Notification::create(
            $pdo, 
            (int)$admin["id"], 
            "Nouvelle proposition", 
            "L'étudiant " . $user["prenom"] . " " . $user["nom"] . " a proposé un nouveau projet : " . $titre,
            "/admin/projects"
          );
      }

      header("Content-Type: application/json");
      echo json_encode(["message" => "Projet proposé avec succès", "project_id" => $projectId]);
  }

  public static function apiDeleteProjectProposal(PDO $pdo, int $id): void
  {
      AuthMiddleware::handle();
      $user = $_SESSION["user"];
      
      $project = Project::find($pdo, $id);
      if (!$project) {
          http_response_code(404);
          echo json_encode(["error" => "Projet introuvable"]);
          return;
      }

      // On vérifie que c'est bien une proposition du student
      if ($project["statut"] !== "EN_ATTENTE") {
          http_response_code(400);
          echo json_encode(["error" => "Impossible de supprimer un projet déjà validé."]);
          return;
      }

      try {
          Project::delete($pdo, $id);
          echo json_encode(["message" => "Proposition supprimée avec succès"]);
      } catch (Throwable $e) {
          http_response_code(500);
          echo json_encode(["error" => "Erreur lors de la suppression"]);
      }
  }

  public static function apiUpdateProjectProposal(PDO $pdo, int $id): void
  {
      AuthMiddleware::handle();
      $user = $_SESSION["user"];
      
      $project = Project::find($pdo, $id);
      if (!$project) {
          http_response_code(404);
          echo json_encode(["error" => "Projet introuvable"]);
          return;
      }

      if ($project["statut"] !== "EN_ATTENTE") {
          http_response_code(400);
          echo json_encode(["error" => "Impossible de modifier un projet déjà validé."]);
          return;
      }

      $input = json_decode(file_get_contents('php://input'), true);
      try {
          Project::update($pdo, $id, $input);
          echo json_encode(["message" => "Proposition mise à jour avec succès"]);
      } catch (Throwable $e) {
          http_response_code(500);
          echo json_encode(["error" => "Erreur lors de la mise à jour"]);
      }
  }

  public static function apiDeleteLivrable(PDO $pdo, int $id): void
  {
      AuthMiddleware::handle();
      $user = $_SESSION["user"];

      $livrable = Livrable::find($pdo, $id);
      if (!$livrable) {
          http_response_code(404);
          echo json_encode(["error" => "Livrable introuvable"]);
          return;
      }

      if ((int)$livrable["etudiant_id"] !== (int)$user["id"]) {
          http_response_code(403);
          echo json_encode(["error" => "Ceci n'est pas votre livrable."]);
          return;
      }

      try {
          // Supprimer le fichier si il existe
          $filePath = __DIR__ . '/../../public/' . $livrable["file_path"];
          if (file_exists($filePath)) {
              unlink($filePath);
          }
          
          Livrable::delete($pdo, $id);
          echo json_encode(["message" => "Livrable supprimé avec succès"]);
      } catch (Throwable $e) {
          http_response_code(500);
          echo json_encode(["error" => "Erreur lors de la suppression"]);
      }
  }

  public static function apiAvailableProjects(PDO $pdo): void
  {
      AuthMiddleware::handle();
      $stmt = $pdo->query("
          SELECT p.* FROM projects p
          LEFT JOIN project_assignments pa ON pa.project_id = p.id
          WHERE pa.id IS NULL AND p.statut = 'EN_ATTENTE'
          ORDER BY p.created_at DESC
      ");
      header("Content-Type: application/json");
      echo json_encode(["projects" => $stmt->fetchAll()]);
  }

  public static function apiAddComment(PDO $pdo, int $id): void
  {
      AuthMiddleware::handle();
      $user = $_SESSION["user"];
      $input = json_decode(file_get_contents('php://input'), true);
      $comment = $input["comment"] ?? "";

      if (!$comment) {
          http_response_code(400);
          echo json_encode(["error" => "Le commentaire est vide."]);
          return;
      }

      try {
          Livrable::addComment($pdo, $id, (int)$user["id"], $comment);
          echo json_encode(["message" => "Commentaire ajouté avec succès"]);
      } catch (Throwable $e) {
          http_response_code(500);
          echo json_encode(["error" => "Erreur lors de l'ajout du commentaire"]);
      }
  }

  public static function apiGetComments(PDO $pdo, int $id): void
  {
      AuthMiddleware::handle();
      try {
          $comments = Livrable::comments($pdo, $id);
          header("Content-Type: application/json");
          echo json_encode(["comments" => $comments]);
      } catch (Throwable $e) {
          http_response_code(500);
          echo json_encode(["error" => "Erreur lors de la récupération des commentaires"]);
      }
  }

  public static function apiUpdateLivrable(PDO $pdo, int $id): void
  {
      AuthMiddleware::handle();
      $user = $_SESSION["user"];
      $input = json_decode(file_get_contents('php://input'), true);

      $livrable = Livrable::find($pdo, $id);
      if (!$livrable || (int)$livrable["etudiant_id"] !== (int)$user["id"]) {
          http_response_code(403);
          echo json_encode(["error" => "Non autorisé"]);
          return;
      }

      $stmt = $pdo->prepare("UPDATE livrables SET titre = ?, description = ? WHERE id = ?");
      $stmt->execute([
          $input["titre"] ?? $livrable["titre"],
          $input["description"] ?? $livrable["description"],
          $id
      ]);

      echo json_encode(["message" => "Livrable mis à jour"]);
  }

  public static function apiApplyForProject(PDO $pdo, int $id): void
  {
      AuthMiddleware::handle();
      $user = $_SESSION["user"];
      $studentId = (int)$user["id"];

      // 1. Vérifier si l'étudiant a déjà un projet assigné
      $existingProject = Project::findByStudent($pdo, $studentId);
      if ($existingProject) {
          http_response_code(400);
          echo json_encode(["error" => "Vous avez déjà un projet assigné."]);
          return;
      }

      // 2. Vérifier si le projet est encore disponible
      $project = Project::find($pdo, $id);
      if (!$project) {
          http_response_code(404);
          echo json_encode(["error" => "Projet introuvable."]);
          return;
      }

      // Vérifier si quelqu'un d'autre l'a pris entre temps
      $check = $pdo->prepare("SELECT id FROM project_assignments WHERE project_id = ? LIMIT 1");
      $check->execute([$id]);
      if ($check->fetch()) {
          http_response_code(400);
          echo json_encode(["error" => "Ce projet n'est plus disponible."]);
          return;
      }

      try {
          // 3. Assigner l'étudiant (superviseurs null pour le moment)
          Project::assign($pdo, $id, $studentId, null, null);
          echo json_encode(["message" => "Félicitations ! Vous avez été assigné au projet."]);
      } catch (Throwable $e) {
          http_response_code(500);
          echo json_encode(["error" => "Erreur lors de l'assignation."]);
      }
  }

  public static function getEvaluations(PDO $pdo): void
  {
      AuthMiddleware::handle();
      $user = $_SESSION["user"];
      $studentId = (int)$user["id"];

      require_once __DIR__ . "/../Models/Evaluation.php";
      $acad = Evaluation::byStudent($pdo, $studentId);
      
      // Get all pro evals with items
      $stmt = $pdo->prepare("
          SELECT ep.*, p.titre as projet_titre
          FROM evaluation_professionnelle ep
          JOIN projects p ON p.id = ep.projet_id
          WHERE ep.etudiant_id = ?
      ");
      $stmt->execute([$studentId]);
      $proEvals = $stmt->fetchAll();

      foreach ($proEvals as &$eval) {
          $stmt = $pdo->prepare("
              SELECT i.*, c.libelle
              FROM evaluation_professionnelle_items i
              JOIN competences c ON c.id = i.competence_id
              WHERE i.evaluation_pro_id = ?
          ");
          $stmt->execute([$eval['id']]);
          $eval['items'] = $stmt->fetchAll();
      }

      header("Content-Type: application/json");
      echo json_encode([
          "academiques" => $acad,
          "professionnelles" => $proEvals
      ]);
  }
}