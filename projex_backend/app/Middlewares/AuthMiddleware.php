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
            // Rediriger vers la page de connexion
            header("Location: /projex/public/login");
            exit();
        }
    }   
}