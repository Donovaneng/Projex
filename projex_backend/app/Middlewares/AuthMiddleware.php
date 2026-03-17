<?php 
declare(strict_types=1);

final class AuthMiddleware 
{
    public static function handle(): void
    {
        // Sécurité: au cas où une page appelle le middleware sans bootstrap
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        // Vérifier si l'utilisateur est connecté (session `user` définie)
        if (!isset($_SESSION['user']) || empty($_SESSION['user'])) {
            // Vérifier si on est sur l'API
            if (strpos($_SERVER['REQUEST_URI'] ?? '', '/api/') !== false || 
                (isset($_SERVER['HTTP_ACCEPT']) && strpos($_SERVER['HTTP_ACCEPT'], 'application/json') !== false)) {
                http_response_code(401);
                header('Content-Type: application/json');
                echo json_encode(['error' => 'Non authentifié']);
                exit();
            }

            // Rediriger vers la page de connexion
            header("Location: /projex/public/login");
            exit();
        }
    }   
}