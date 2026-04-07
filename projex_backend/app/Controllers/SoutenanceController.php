<?php
declare(strict_types=1);

require_once __DIR__ . "/../Models/Soutenance.php";
require_once __DIR__ . "/../Models/AuditLog.php";

final class SoutenanceController
{
    public static function listSoutenances(PDO $pdo): void
    {
        AuthMiddleware::handle();
        header("Content-Type: application/json");
        echo json_encode(["soutenances" => Soutenance::all($pdo)]);
    }

    public static function scheduleSoutenance(PDO $pdo): void
    {
        AuthMiddleware::handle();
        RoleMiddleware::require("ADMIN");
        header("Content-Type: application/json");
        $input = json_decode(file_get_contents('php://input'), true);
        $userId = $_SESSION['user']['id'] ?? null;
        $logFile = __DIR__ . "/../../../soutenance_debug.log";
        
        error_log("ScheduleSoutenance: " . date('Y-m-d H:i:s') . " Input=" . json_encode($input) . " User=" . $userId . "\n", 3, $logFile);

        try {
            $id = Soutenance::create($pdo, (int)$input["projet_id"], $input["date"], $input["salle"] ?? null, $input["jury_membres"] ?? null);
            
            // Handle structured jury members if provided
            if (isset($input["jury"]) && is_array($input["jury"])) {
                foreach ($input["jury"] as $member) {
                    $mUserId = (!empty($member["user_id"])) ? (int)$member["user_id"] : null;
                    Soutenance::addJuryMember($pdo, $id, $mUserId, $member["external_name"] ?? null, $member["role"] ?? "EXAMINATEUR");
                }
            }

            // Utiliser l'ID de session si admin_id est absent
            $actorId = isset($input["admin_id"]) && (int)$input["admin_id"] > 0 ? (int)$input["admin_id"] : (int)$userId;
            if ($actorId <= 0) $actorId = null;
            
            AuditLog::log($pdo, $actorId, "SCHEDULE_SOUTENANCE", "SOUTENANCES", $id, ["projet_id" => $input["projet_id"]]);
            
            error_log("ScheduleSoutenance: Success, ID=$id\n", 3, $logFile);
            echo json_encode(["message" => "Soutenance programmée", "id" => $id]);
        } catch (Throwable $e) {
            error_log("ScheduleSoutenance: ERROR: " . $e->getMessage() . "\n", 3, $logFile);
            http_response_code(500);
            echo json_encode(["error" => $e->getMessage()]);
        }
    }

    public static function updateSoutenance(PDO $pdo, int $id): void
    {
        AuthMiddleware::handle();
        RoleMiddleware::require("ADMIN");
        header("Content-Type: application/json");
        $input = json_decode(file_get_contents('php://input'), true);
        
        try {
            Soutenance::update($pdo, $id, $input);
            
            // Update jury members if provided
            if (isset($input["jury"]) && is_array($input["jury"])) {
                Soutenance::clearJuryMembers($pdo, $id);
                foreach ($input["jury"] as $member) {
                    $mUserId = (!empty($member["user_id"])) ? (int)$member["user_id"] : null;
                    Soutenance::addJuryMember($pdo, $id, $mUserId, $member["external_name"] ?? null, $member["role"] ?? "EXAMINATEUR");
                }
            }
            
            echo json_encode(["message" => "Soutenance mise à jour"]);
        } catch (Throwable $e) {
            http_response_code(500);
            echo json_encode(["error" => $e->getMessage()]);
        }
    }

    public static function deleteSoutenance(PDO $pdo, int $id): void
    {
        AuthMiddleware::handle();
        RoleMiddleware::require("ADMIN");
        header("Content-Type: application/json");
        try {
            Soutenance::delete($pdo, $id);
            echo json_encode(["message" => "Soutenance supprimée"]);
        } catch (Throwable $e) {
            http_response_code(500);
            echo json_encode(["error" => $e->getMessage()]);
        }
    }
}
