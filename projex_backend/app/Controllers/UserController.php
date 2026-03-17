<?php
declare(strict_types=1);

require_once __DIR__ . '/../Models/User.php';
require_once __DIR__ . '/../Middlewares/AuthMiddleware.php';

final class UserController
{
    public static function getProfile(PDO $pdo): void
    {
        AuthMiddleware::handle();
        $userId = (int)$_SESSION["user"]["id"];
        $user = User::findById($pdo, $userId);

        if (!$user) {
            http_response_code(404);
            echo json_encode(["error" => "Utilisateur non trouvé"]);
            return;
        }

        unset($user["mot_de_passe"]);
        header("Content-Type: application/json");
        echo json_encode(["user" => $user]);
    }

    public static function updateProfile(PDO $pdo): void
    {
        AuthMiddleware::handle();
        $userId = (int)$_SESSION["user"]["id"];
        $input = json_decode(file_get_contents('php://input'), true);

        if (!$input) {
            http_response_code(400);
            echo json_encode(["error" => "Données invalides"]);
            return;
        }

        // Basic validation
        if (isset($input["email"]) && !filter_var($input["email"], FILTER_VALIDATE_EMAIL)) {
            http_response_code(400);
            echo json_encode(["error" => "Email invalide"]);
            return;
        }

        try {
            User::updateProfile($pdo, $userId, $input);
            
            // Refresh session data
            $updatedUser = User::findById($pdo, $userId);
            unset($updatedUser["mot_de_passe"]);
            $_SESSION["user"] = $updatedUser;

            echo json_encode([
                "message" => "Profil mis à jour avec succès",
                "user" => $updatedUser
            ]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["error" => "Erreur lors de la mise à jour : " . $e->getMessage()]);
        }
    }

    public static function updatePassword(PDO $pdo): void
    {
        AuthMiddleware::handle();
        $userId = (int)$_SESSION["user"]["id"];
        $input = json_decode(file_get_contents('php://input'), true);

        $oldPassword = $input["old_password"] ?? "";
        $newPassword = $input["new_password"] ?? "";

        if (strlen($newPassword) < 6) {
            http_response_code(400);
            echo json_encode(["error" => "Le nouveau mot de passe doit faire au moins 6 caractères"]);
            return;
        }

        $user = User::findById($pdo, $userId);
        if (!$user || !password_verify($oldPassword, $user["mot_de_passe"])) {
            http_response_code(401);
            echo json_encode(["error" => "L'ancien mot de passe est incorrect"]);
            return;
        }

        $hash = password_hash($newPassword, PASSWORD_DEFAULT);
        User::updatePassword($pdo, $userId, $hash);

        echo json_encode(["message" => "Mot de passe modifié avec succès"]);
    }

    public static function uploadAvatar(PDO $pdo): void
    {
        AuthMiddleware::handle();
        header("Content-Type: application/json");
        $userId = (int)$_SESSION["user"]["id"];

        if (!isset($_FILES['avatar']) || $_FILES['avatar']['error'] !== UPLOAD_ERR_OK) {
            $errCode = $_FILES['avatar']['error'] ?? 'MISSING';
            http_response_code(400);
            echo json_encode(["error" => "Erreur lors du téléchargement de l'image (Code: $errCode)"]);
            return;
        }

        $file = $_FILES['avatar'];
        
        $allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        
        if (!in_array($file['type'], $allowedTypes)) {
            http_response_code(400);
            echo json_encode(["error" => "Format d'image non supporté (JPG, PNG, GIF, WEBP uniquement)"]);
            return;
        }

        if ($file['size'] > 2 * 1024 * 1024) {
          http_response_code(400);
          echo json_encode(["error" => "L'image ne doit pas dépasser 2Mo"]);
          return;
        }

        $uploadDir = __DIR__ . '/../../public/uploads/avatars/';
        if (!is_dir($uploadDir)) {
            if (!mkdir($uploadDir, 0777, true)) {
                http_response_code(500);
                echo json_encode(["error" => "Erreur de configuration serveur (permissions)"]);
                return;
            }
        }

        $ext = pathinfo($file['name'], PATHINFO_EXTENSION);
        $filename = "avatar_" . $userId . "_" . time() . "." . $ext;
        $targetFile = $uploadDir . $filename;

        if (move_uploaded_file($file['tmp_name'], $targetFile)) {
            $path = "/uploads/avatars/" . $filename;
            User::updateAvatar($pdo, $userId, $path);
            
            $_SESSION["user"]["image_profil"] = $path;

            echo json_encode([
                "message" => "Photo de profil mise à jour",
                "image_profil" => $path
            ]);
        } else {
            http_response_code(500);
            echo json_encode(["error" => "Impossible d'enregistrer le fichier sur le disque"]);
        }
    }
}
