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
        $periods = AcademicPeriod::all($pdo);
        // Map backend 'label' to frontend 'nom' for UI display
        $mapped = array_map(function($p) {
            $p['nom'] = $p['label'];
            $p['actif'] = $p['is_active']; // legacy frontend compatibility
            return $p;
        }, $periods);
        echo json_encode(["periods" => $mapped]);
    }

    public static function createPeriod(PDO $pdo): void
    {
        AuthMiddleware::handle();
        RoleMiddleware::require("ADMIN");
        header("Content-Type: application/json");
        $input = json_decode(file_get_contents('php://input'), true);
        
        try {
            // Frontend sends 'nom', 'debut', 'fin'
            // Backend Model expects 'label', 'date_debut', 'date_fin'
            $label = $input["nom"] ?? $input["label"] ?? "Période sans nom";
            $start = $input["debut"] ?? $input["date_debut"] ?? date("Y-m-d");
            $end = $input["fin"] ?? $input["date_fin"] ?? date("Y-m-d");
            
            AcademicPeriod::create($pdo, $label, $start, $end);
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
            $active = isset($input["active"]) ? (bool)$input["active"] : (bool)($input["actif"] ?? false);
            AcademicPeriod::toggleActive($pdo, $id, $active);
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

        $dbConfig = require __DIR__ . '/../../config/db.php';
        $backupDir = __DIR__ . '/../../storage/backups/';
        if (!is_dir($backupDir)) mkdir($backupDir, 0777, true);

        $filename = 'backup_' . date('Y-m-d_H-i-s') . '.sql';
        $filePath = $backupDir . $filename;
        
        // Path to mysqldump in XAMPP
        $mysqldumpPath = 'C:\xampp\mysql\bin\mysqldump.exe';
        
        // Construct command
        $command = sprintf(
            '"%s" --user=%s --host=%s %s > "%s"',
            $mysqldumpPath,
            $dbConfig['user'],
            $dbConfig['host'],
            $dbConfig['name'],
            $filePath
        );

        try {
            // Execute command
            exec($command, $output, $returnVar);

            if ($returnVar !== 0) {
                throw new Exception("Erreur mysqldump (code $returnVar)");
            }

            // Purge old backups (30 days)
            self::cleanupOldBackups($backupDir);

            // Audit Log
            AuditLog::log($pdo, (int)$_SESSION["user"]["id"], "BACKUP_SYSTEM", "SYSTEM", null, ["file" => $filename]);

            echo json_encode([
                "message" => "Sauvegarde réussie",
                "filename" => $filename,
                "timestamp" => date("Y-m-d H:i:s")
            ]);
        } catch (Throwable $e) {
            http_response_code(500);
            echo json_encode(["error" => "Erreur lors de la sauvegarde : " . $e->getMessage()]);
        }
    }

    private static function cleanupOldBackups(string $directory): void
    {
        $files = glob($directory . "*.sql");
        $now = time();
        $retentionSeconds = 30 * 24 * 60 * 60; // 30 days

        foreach ($files as $file) {
            if (is_file($file)) {
                if ($now - filemtime($file) >= $retentionSeconds) {
                    unlink($file);
                }
            }
        }
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
