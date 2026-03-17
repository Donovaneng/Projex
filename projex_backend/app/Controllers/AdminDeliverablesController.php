<?php
declare(strict_types=1);

require_once __DIR__ . "/../Models/Livrable.php";

final class AdminDeliverablesController
{
    public static function index(PDO $pdo): void
    {
        AuthMiddleware::handle();
        if (($_SESSION["user"]["role"] ?? "") !== "ADMIN") {
            http_response_code(403);
            echo json_encode(["error" => "Accès réservé aux administrateurs."]);
            return;
        }

        try {
            $deliverables = Livrable::all($pdo);
            header("Content-Type: application/json");
            echo json_encode(["deliverables" => $deliverables]);
        } catch (Throwable $e) {
            http_response_code(500);
            echo json_encode(["error" => "Erreur lors de la récupération des livrables."]);
        }
    }
}
