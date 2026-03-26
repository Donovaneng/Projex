<?php
declare(strict_types=1);

require_once __DIR__ . "/../Models/User.php";
require_once __DIR__ . "/../Models/Project.php";
require_once __DIR__ . "/../Models/AuditLog.php";

final class AdminController
{
  public static function pendingUsers(PDO $pdo): void
  {
    $users = User::pendingUsers($pdo);
    
    // Retourner JSON si c'est une API call
    if (isset($_SERVER['HTTP_ACCEPT']) && strpos($_SERVER['HTTP_ACCEPT'], 'application/json') !== false) {
      header("Content-Type: application/json");
      echo json_encode(["users" => $users]);
      return;
    }
    
    View::render("admin/users_pending", [
      "title" => "Validation des comptes",
      "users" => $users
    ]);
  }

  public static function allUsers(PDO $pdo): void
  {
    $users = User::allUsers($pdo);
    
    if (isset($_SERVER['HTTP_ACCEPT']) && strpos($_SERVER['HTTP_ACCEPT'], 'application/json') !== false) {
      header("Content-Type: application/json");
      echo json_encode(["users" => $users]);
      return;
    }
  }

  public static function activate(PDO $pdo): void
  {
    $id = (int)($_POST["id"] ?? (int)json_decode(file_get_contents('php://input'), true)["user_id"] ?? 0);
    $role = trim($_POST["role"] ?? (string)(json_decode(file_get_contents('php://input'), true)["role_final"] ?? ""));

    if ($id <= 0 || $role === "") {
      header("Content-Type: application/json");
      http_response_code(400);
      echo json_encode(["error" => "ID ou rôle invalide"]);
      return;
    }

    try {
      User::activateUser($pdo, $id, $role);
      
      // Notification
      Notification::create(
        $pdo, 
        $id, 
        "Compte activé", 
        "Votre compte PROJEX a été activé avec le rôle : " . str_replace('_', ' ', $role),
        "/settings"
      );
      
      // Audit Log
      AuditLog::log($pdo, (int)$_SESSION["user"]["id"], "ACTIVATE_USER", "USER", $id, ["role" => $role]);

      // Retourner JSON si c'est une API call
      if (isset($_SERVER['HTTP_ACCEPT']) && strpos($_SERVER['HTTP_ACCEPT'], 'application/json') !== false) {
        header("Content-Type: application/json");
        echo json_encode(["message" => "Utilisateur activé avec succès"]);
        return;
      }
      
      // Pas de redirection header en API
      exit;
    } catch (Throwable $e) {
      header("Content-Type: application/json");
      http_response_code(500);
      echo json_encode(["error" => "Erreur lors de l'activation"]);
    }
  }

  public static function getUser(PDO $pdo, int $id): void
  {
      header("Content-Type: application/json");
      try {
          $user = User::findById($pdo, $id);
          if (!$user) {
              http_response_code(404);
              echo json_encode(["error" => "Utilisateur non trouvé"]);
              return;
          }
          unset($user["mot_de_passe"]);
          echo json_encode(["user" => $user]);
      } catch (Throwable $e) {
          http_response_code(500);
          echo json_encode(["error" => "Erreur lors de la récupération : " . $e->getMessage()]);
      }
  }

  public static function createUser(PDO $pdo): void
  {
      header("Content-Type: application/json");
      $input = json_decode(file_get_contents('php://input'), true);
      
      $email = strtolower(trim($input["email"] ?? ""));
      $password = $input["password"] ?? "Password123!"; // Default password if none provided
      
      if ($email === "" || !isset($input["nom"]) || !isset($input["prenom"])) {
          http_response_code(400);
          echo json_encode(["error" => "Email, nom et prénom sont obligatoires."]);
          return;
      }

      if (User::findByEmail($pdo, $email)) {
          http_response_code(409);
          echo json_encode(["error" => "Cet email est déjà utilisé."]);
          return;
      }

      $data = $input;
      $data["email"] = $email;
      $data["mot_de_passe"] = password_hash($password, PASSWORD_DEFAULT);
      $data["actif"] = 1; // Created by admin = active by default
      if (!isset($data["role"])) $data["role"] = "ETUDIANT";

      try {
          $userId = User::create($pdo, $data);
          // Audit Log
          AuditLog::log($pdo, (int)$_SESSION["user"]["id"], "CREATE_USER", "USER", $userId, ["email" => $email, "role" => $data["role"]]);
          echo json_encode(["message" => "Utilisateur créé avec succès", "id" => $userId]);
      } catch (Throwable $e) {
          http_response_code(500);
          echo json_encode(["error" => "Erreur lors de la création : " . $e->getMessage()]);
      }
  }

  public static function updateUser(PDO $pdo, int $id): void
  {
      header("Content-Type: application/json");
      $input = json_decode(file_get_contents('php://input'), true);

      try {
          User::updateProfile($pdo, $id, $input);
          
          // Audit Log
          AuditLog::log($pdo, (int)$_SESSION["user"]["id"], "UPDATE_USER", "USER", $id);
          
          echo json_encode(["message" => "Utilisateur mis à jour avec succès"]);
      } catch (Throwable $e) {
          http_response_code(500);
          echo json_encode(["error" => "Erreur lors de la mise à jour"]);
      }
  }

  public static function deleteUser(PDO $pdo, int $id): void
  {
      header("Content-Type: application/json");
      try {
          User::delete($pdo, $id);
          
          // Audit Log
          AuditLog::log($pdo, (int)$_SESSION["user"]["id"], "DELETE_USER", "USER", $id);
          
          echo json_encode(["message" => "Utilisateur supprimé avec succès"]);
      } catch (Throwable $e) {
          http_response_code(500);
          echo json_encode(["error" => "Erreur lors de la suppression"]);
      }
  }

  public static function searchUsers(PDO $pdo): void
  {
      header("Content-Type: application/json");
      $q = $_GET["q"] ?? "";
      $role = $_GET["role"] ?? "";
      $actif = isset($_GET["actif"]) ? $_GET["actif"] : null;

      $filters = [
          "q" => $q,
          "role" => $role,
          "actif" => $actif
      ];

      try {
          $users = User::search($pdo, $filters);
          echo json_encode(["users" => $users]);
      } catch (Throwable $e) {
          http_response_code(500);
          echo json_encode(["error" => "Erreur lors de la recherche"]);
      }
  }

  public static function resetPassword(PDO $pdo, int $id): void
  {
      header("Content-Type: application/json");
      $input = json_decode(file_get_contents('php://input'), true);
      $newPassword = $input["password"] ?? "Reset123!";

      try {
          $hash = password_hash($newPassword, PASSWORD_DEFAULT);
          User::updatePassword($pdo, $id, $hash);
          echo json_encode(["message" => "Mot de passe réinitialisé avec succès"]);
      } catch (Throwable $e) {
          http_response_code(500);
          echo json_encode(["error" => "Erreur lors de la réinitialisation"]);
      }
  }

  public static function getAllEvaluations(PDO $pdo): void
  {
      header("Content-Type: application/json");
      try {
          $acad = [];
          try {
              // Synthèse des notes académiques
              $stmt = $pdo->query("
                  SELECT e.*, p.titre as projet_titre, u.nom as student_nom, u.prenom as student_prenom
                  FROM evaluation_academique e
                  JOIN projects p ON p.id = e.projet_id
                  JOIN users u ON u.id = e.etudiant_id
                  ORDER BY e.created_at DESC
              ");
              $acad = $stmt->fetchAll();
          } catch (Throwable $e) {}

          $pro = [];
          try {
              // Synthèse simplifiée des notes pro (moyenne des scores par compétence)
              $stmt = $pdo->query("
                  SELECT e.id, e.projet_id, e.etudiant_id, e.commentaire_global, e.created_at,
                         p.titre as projet_titre, u.nom as student_nom, u.prenom as student_prenom,
                         (SELECT AVG(score) FROM evaluation_professionnelle_items WHERE evaluation_pro_id = e.id) as moyenne_pro
                  FROM evaluation_professionnelle e
                  JOIN projects p ON p.id = e.projet_id
                  JOIN users u ON u.id = e.etudiant_id
                  ORDER BY e.created_at DESC
              ");
              $pro = $stmt->fetchAll();
          } catch (Throwable $e) {}

          echo json_encode([
              "academiques" => $acad,
              "professionnelles" => $pro
          ]);
      } catch (Throwable $e) {
          http_response_code(500);
          echo json_encode(["error" => "Erreur lors de la récupération des évaluations : " . $e->getMessage()]);
      }
  }
}