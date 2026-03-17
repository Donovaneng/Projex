<?php
declare(strict_types=1);

require_once __DIR__ . '/../Models/Project.php';

final class ProjectController
{
    public static function createForm(): void
    {
        AuthMiddleware::handle();
        // role middleware expects a string, not array
        RoleMiddleware::require("ETUDIANT");

        View::render("student/projects/create", [
            "title" => "Proposer un projet"
        ]);
    }

    public static function create(PDO $pdo): void
    {
        AuthMiddleware::handle();
        RoleMiddleware::require("ETUDIANT");

        $user = $_SESSION["user"];

        $titre = trim($_POST["titre"] ?? "");
        $description = trim($_POST["description"] ?? "");

        if ($titre === "") {
            echo "Titre obligatoire";
            return;
        }

        Project::createByStudent(
            $pdo,
            $titre,
            $description,
            (int)$user["id"]
        );

        // header("Location: /projex/public/dashboard");
        exit;
    }
}