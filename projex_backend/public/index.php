<?php
declare(strict_types=1);

$allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
    "http://localhost:5176",
    "http://localhost:5177",
    "http://localhost:5178",
    "http://localhost:5179",
];

if (isset($_SERVER['HTTP_ORIGIN']) && in_array($_SERVER['HTTP_ORIGIN'], $allowedOrigins)) {
    header("Access-Control-Allow-Origin: " . $_SERVER['HTTP_ORIGIN']);
}

header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Credentials: true");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

//Bootstrap : session + connexion DB
$pdo = require __DIR__ . '/../bootstrap.php';

//Chargement des classes (une seule fois)
require_once __DIR__ . '/../app/Core/Router.php';
require_once __DIR__ . '/../app/Core/View.php';
require_once __DIR__ . '/../app/Middlewares/AuthMiddleware.php';
require_once __DIR__ . '/../app/Models/User.php';
require_once __DIR__ . '/../app/Controllers/AuthController.php';
require_once __DIR__ . '/../app/Middlewares/RoleMiddleware.php';
require_once __DIR__ . '/../app/Controllers/AdminController.php';
require_once __DIR__ . '/../app/Models/Project.php';
require_once __DIR__ . '/../app/Controllers/AdminProjectController.php';
require_once __DIR__ . '/../app/Controllers/DashboardController.php';
require_once __DIR__ . '/../app/Models/Project.php';
require_once __DIR__ . '/../app/Models/Livrable.php';
require_once __DIR__ . '/../app/Controllers/StudentController.php';
require_once __DIR__ . '/../app/Models/Task.php';
require_once __DIR__ . '/../app/Controllers/TaskController.php';
require_once __DIR__ . '/../app/Models/Notification.php';
require_once __DIR__ . '/../app/Controllers/NotificationController.php';
require_once __DIR__ . '/../app/Models/Evaluation.php';
require_once __DIR__ . '/../app/Models/ProfessionalEvaluation.php';

// Router
$router = new Router();

//Récupération de la route demandée
$uri  = parse_url($_SERVER["REQUEST_URI"], PHP_URL_PATH);
$base = "/projex/public"; // base URL de ton dossier public
$path = str_starts_with($uri, $base) ? substr($uri, strlen($base)) : $uri;
if ($path === "") $path = "/";

// Déclaration des API Routes

// Accueil de l'API (pour tester si elle tourne)
$router->get("/", function () {
  header("Content-Type: application/json");
  echo json_encode(["message" => "PROJEX API is running"]);
});

// Login (API POST)
$router->post("/api/login", function () use ($pdo) {
  AuthController::login($pdo);
});

// Register (API POST)
$router->post("/api/register", function () use ($pdo) {
  AuthController::register($pdo);
});

// Récupérer l'utilisateur connecté (API GET)
$router->get("/api/me", function () {
  AuthController::me();
});

// Logout (API POST)
$router->post("/api/logout", function () {
  AuthController::logout();
});

// Dashboard (protégé)
$router->get("/dashboard", function () {
  AuthMiddleware::handle();
  View::render("dashboard/index", ["title" => "Dashboard"]);
});

$router->get("/api/admin/users", function () use ($pdo) {
  RoleMiddleware::require("ADMIN");
  AdminController::pendingUsers($pdo);
});

$router->get("/admin/users_pending", function () {
  header("Location: /api/admin/users");
  exit;
});

$router->post("/api/admin/users/activate", function () use ($pdo) {
  RoleMiddleware::require("ADMIN");
  AdminController::activate($pdo);
});

// Admin - projets
$router->get("/api/admin/projects", function () use ($pdo) {
  RoleMiddleware::require("ADMIN");
  AdminProjectController::index($pdo);
});
// Création projet
$router->get("/api/admin/projects/create", function () {
  RoleMiddleware::require("ADMIN");
  AdminProjectController::createForm();
});

$router->post("/api/admin/projects/create", function () use ($pdo) {
  RoleMiddleware::require("ADMIN");
  AdminProjectController::create($pdo);
});
// Affectation projet
$router->get("/api/admin/projects/assign", function () use ($pdo) {
  RoleMiddleware::require("ADMIN");
  $id = (int)($_GET["id"] ?? 0);
  AdminProjectController::assignForm($pdo, $id);
});

$router->post("/api/admin/projects/assign", function () use ($pdo) {
  RoleMiddleware::require("ADMIN");
  AdminProjectController::assign($pdo);
});

// Dashboard
$router->get("/dashboard", function () use ($pdo) {
  DashboardController::index($pdo);
});
// Livrables étudiants
$router->get("/student/livrables", function () use ($pdo) {
  AuthMiddleware::handle();
  StudentController::livrables($pdo);
});

$router->get("/student/livrables/upload", function () use ($pdo) {
  AuthMiddleware::handle();
  StudentController::uploadForm($pdo);
});

$router->post("/student/livrables/upload", function () use ($pdo) {
  AuthMiddleware::handle();
  StudentController::upload($pdo);
});

$router->get("/projects/livrables", function () use ($pdo) {
  AuthMiddleware::handle();
  $id = (int)($_GET["id"] ?? 0);
  DashboardController::projectLivrables($pdo, $id);
});

// Formulaire création tâche
$router->get("/tasks/create", function () use ($pdo) {
  AuthMiddleware::handle();
  TaskController::createForm($pdo);
});

// Enregistrer tâche
$router->post("/tasks/create", function () use ($pdo) {
  AuthMiddleware::handle();
  TaskController::create($pdo);
});

// Tâches d'un projet
$router->get("/tasks/project", function () use ($pdo) {
  AuthMiddleware::handle();
  TaskController::projectTasks($pdo);
});

// Mes tâches (étudiant)
$router->get("/tasks/student", function () use ($pdo) {
  AuthMiddleware::handle();
  TaskController::studentTasks($pdo);
});

// Changer statut
$router->post("/tasks/status", function () use ($pdo) {
  AuthMiddleware::handle();
  TaskController::updateStatus($pdo);
});

$router->post("/projects/livrables/status", function () use ($pdo) {
  AuthMiddleware::handle();
  DashboardController::validateLivrable($pdo);
});


$router->post("/projects/livrables/comment", function () use ($pdo) {
  AuthMiddleware::handle();
  DashboardController::addLivrableComment($pdo);
});

$router->get("/notifications", function () use ($pdo) {
  AuthMiddleware::handle();
  NotificationController::index($pdo);
});

$router->post("/notifications/read", function () use ($pdo) {
  AuthMiddleware::handle();
  NotificationController::read($pdo);
});


$router->get("/notifications/open", function () use ($pdo) {
  AuthMiddleware::handle();
  NotificationController::open($pdo);
});

$router->get("/projects/evaluate", function () use ($pdo) {
  DashboardController::evaluateForm($pdo);
});

$router->post("/projects/evaluate", function () use ($pdo) {
  DashboardController::saveEvaluation($pdo);
});

$router->get("/projects/evaluate_pro", function () use ($pdo) {
  DashboardController::evaluateProForm($pdo);
});

$router->post("/projects/evaluate_pro", function () use ($pdo) {
  DashboardController::saveEvaluationPro($pdo);
});

$router->get("/student/projects/create", function () {
    ProjectController::createForm();
});

$router->post("/student/projects/create", function () use ($pdo) {
    ProjectController::create($pdo);
});

//Lancer le routeur
$router->dispatch($_SERVER["REQUEST_METHOD"], $path);

$router->get("/student/livrables", function () use ($pdo) {
  AuthMiddleware::handle();
  StudentController::livrables($pdo);
});

