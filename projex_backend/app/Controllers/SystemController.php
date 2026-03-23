<?php
declare(strict_types=1);

require_once __DIR__ . "/../Models/AcademicPeriod.php";
require_once __DIR__ . "/../Models/ProjectCategory.php";
require_once __DIR__ . "/../Models/AuditLog.php";

final class SystemController
{
    public static function listPeriods(PDO $pdo): void
    {
        AuthMiddleware::handle();
        RoleMiddleware::require("ADMIN");
        header("Content-Type: application/json");
        echo json_encode(["periods" => AcademicPeriod::all($pdo)]);
    }

    public static function createPeriod(PDO $pdo): void
    {
        AuthMiddleware::handle();
        RoleMiddleware::require("ADMIN");
        header("Content-Type: application/json");
        $input = json_decode(file_get_contents('php://input'), true);
        
        try {
            AcademicPeriod::create($pdo, $input["label"], $input["date_debut"], $input["date_fin"]);
            echo json_encode(["message" => "Période créée"]);
        } catch (Throwable $e) {
            http_response_code(500);
            echo json_encode(["error" => $e->getMessage()]);
        }
    }

    public static function listCategories(PDO $pdo): void
    {
        AuthMiddleware::handle();
        RoleMiddleware::require("ADMIN");
        header("Content-Type: application/json");
        echo json_encode(["categories" => ProjectCategory::all($pdo)]);
    }

    public static function createCategory(PDO $pdo): void
    {
        AuthMiddleware::handle();
        RoleMiddleware::require("ADMIN");
        header("Content-Type: application/json");
        $input = json_decode(file_get_contents('php://input'), true);
        
        try {
            ProjectCategory::create($pdo, $input["label"], $input["description"] ?? null);
            echo json_encode(["message" => "Catégorie créée"]);
        } catch (Throwable $e) {
            http_response_code(500);
            echo json_encode(["error" => $e->getMessage()]);
        }
    }

    public static function deletePeriod(PDO $pdo, int $id): void
    {
        AuthMiddleware::handle();
        RoleMiddleware::require("ADMIN");
        header("Content-Type: application/json");
        try {
            AcademicPeriod::delete($pdo, $id);
            echo json_encode(["message" => "Période supprimée"]);
        } catch (Throwable $e) {
            http_response_code(500);
            echo json_encode(["error" => $e->getMessage()]);
        }
    }

    public static function togglePeriod(PDO $pdo, int $id): void
    {
        AuthMiddleware::handle();
        RoleMiddleware::require("ADMIN");
        header("Content-Type: application/json");
        $input = json_decode(file_get_contents('php://input'), true);
        try {
            AcademicPeriod::toggleActive($pdo, $id, (bool)$input["active"]);
            echo json_encode(["message" => "Statut de la période mis à jour"]);
        } catch (Throwable $e) {
            http_response_code(500);
            echo json_encode(["error" => $e->getMessage()]);
        }
    }

    public static function deleteCategory(PDO $pdo, int $id): void
    {
        AuthMiddleware::handle();
        RoleMiddleware::require("ADMIN");
        header("Content-Type: application/json");
        try {
            ProjectCategory::delete($pdo, $id);
            echo json_encode(["message" => "Catégorie supprimée"]);
        } catch (Throwable $e) {
            http_response_code(500);
            echo json_encode(["error" => $e->getMessage()]);
        }
    }

    public static function listAuditLogs(PDO $pdo): void
    {
        AuthMiddleware::handle();
        RoleMiddleware::require("ADMIN");
        header("Content-Type: application/json");
        $limit = (int)($_GET["limit"] ?? 50);
        echo json_encode(["logs" => AuditLog::all($pdo, $limit)]);
    }

    public static function backupDatabase(PDO $pdo): void
    {
        AuthMiddleware::handle();
        RoleMiddleware::require("ADMIN");
        header("Content-Type: application/json");
        // Simulation d'une sauvegarde
        AuditLog::log($pdo, (int)$_SESSION["user"]["id"], "BACKUP", "SYSTEM", null, ["message" => "Sauvegarde manuelle initiée"]);
        echo json_encode(["message" => "Sauvegarde réussie (simulée)", "timestamp" => date("Y-m-d H:i:s")]);
    }

    public static function generateGlobalReport(PDO $pdo): void
    {
        AuthMiddleware::handle();
        RoleMiddleware::require("ADMIN");
        header("Content-Type: application/json");
        // Simulation d'un rapport
        AuditLog::log($pdo, (int)$_SESSION["user"]["id"], "REPORT", "SYSTEM", null, ["message" => "Génération rapport global"]);
        echo json_encode(["message" => "Rapport généré avec succès", "url" => "#report-url-dummy"]);
    }
    public static function archivePeriod(PDO $pdo, int $id): void
    {
        AuthMiddleware::handle();
        RoleMiddleware::require("ADMIN");
        header("Content-Type: application/json");
        try {
            AcademicPeriod::archive($pdo, $id);
            // Audit Log
            AuditLog::log($pdo, (int)$_SESSION["user"]["id"], "ARCHIVE_PERIOD", "ACADEMIC_PERIOD", $id);
            echo json_encode(["message" => "Période archivée avec succès. Projets en cours marqués comme terminés."]);
        } catch (Throwable $e) {
            http_response_code(500);
            echo json_encode(["error" => "Erreur lors de l'archivage: " . $e->getMessage()]);
        }
    }
}
