<?php
declare(strict_types=1);

$allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
    "http://localhost:1234",
    "http://127.0.0.1:5173",
];

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

if (in_array($origin, $allowedOrigins, true)) {
    header("Access-Control-Allow-Origin: " . $origin);
} else {
    // Fallback if needed for local test, but credentials require exact origin match (no *)
    header("Access-Control-Allow-Origin: http://localhost:5173"); 
}
header("Cross-Origin-Opener-Policy: unsafe-none");
header("Cross-Origin-Embedder-Policy: unsafe-none");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Credentials: true");

// Gérer la requête PREFLIGHT (OPTIONS) envoyée par Axios/Fetch
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Bootstrap : session + connexion DB
set_exception_handler(function ($e) {
    $errorMsg = "[" . date("Y-m-d H:i:s") . "] EXCEPTION: " . $e->getMessage() . " in " . $e->getFile() . ":" . $e->getLine() . "\n" . $e->getTraceAsString() . "\n\n";
    file_put_contents(__DIR__ . '/../storage/logs/api_errors.log', $errorMsg, FILE_APPEND);
    
    header("Content-Type: application/json");
    http_response_code(500);
    echo json_encode([
        "error" => "Global Exception",
        "message" => $e->getMessage(),
        "file" => basename($e->getFile()),
        "line" => $e->getLine()
    ]);
    exit;
});

set_error_handler(function ($errno, $errstr, $errfile, $errline) {
    if (!(error_reporting() & $errno)) return;
    throw new ErrorException($errstr, 0, $errno, $errfile, $errline);
});

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
require_once __DIR__ . '/../app/Models/Livrable.php';
require_once __DIR__ . '/../app/Controllers/StudentController.php';
require_once __DIR__ . '/../app/Controllers/SupervisorController.php';
require_once __DIR__ . '/../app/Controllers/UserController.php';
require_once __DIR__ . '/../app/Models/Task.php';
require_once __DIR__ . '/../app/Controllers/TaskController.php';
require_once __DIR__ . '/../app/Models/Notification.php';
require_once __DIR__ . '/../app/Controllers/NotificationController.php';
require_once __DIR__ . '/../app/Models/Evaluation.php';
require_once __DIR__ . '/../app/Models/ProfessionalEvaluation.php';
require_once __DIR__ . '/../app/Controllers/StatsController.php';
require_once __DIR__ . '/../app/Controllers/AdminDeliverablesController.php';
require_once __DIR__ . '/../app/Controllers/SystemController.php';
require_once __DIR__ . '/../app/Controllers/SoutenanceController.php';
require_once __DIR__ . '/../app/Controllers/ChatController.php';

// Router
$router = new Router();

//Récupération de la route demandée
$uri  = parse_url($_SERVER["REQUEST_URI"], PHP_URL_PATH);
$base = dirname($_SERVER['SCRIPT_NAME']); 
$path = str_starts_with($uri, $base) ? substr($uri, strlen($base)) : $uri;
if ($path === "" || $path === false) $path = "/";

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

// Google Auth (API POST)
$router->post("/api/auth/google", function () use ($pdo) {
  AuthController::googleAuth($pdo);
});

// Ping test
$router->get("/api/ping", function () {
  header("Content-Type: application/json");
  echo json_encode(["status" => "pong"]);
});

// Messagerie Globale (Support)
$router->get("/api/support", function () use ($pdo) {
    ChatController::getSupportMessages($pdo);
});

$router->get("/api/support/conversations", function () use ($pdo) {
    ChatController::getConversations($pdo);
});

$router->post("/api/support", function () use ($pdo) {
    ChatController::sendSupportMessage($pdo);
});

// Alias pour compatibilité
$router->get("/api/messages/support", function () use ($pdo) {
    ChatController::getSupportMessages($pdo);
});
$router->post("/api/messages/support", function () use ($pdo) {
    ChatController::sendSupportMessage($pdo);
});

$router->get("/api/admin/users", function () use ($pdo) {
  RoleMiddleware::require("ADMIN");
  AdminController::pendingUsers($pdo);
});

$router->get("/api/admin/users/all", function () use ($pdo) {
  RoleMiddleware::require("ADMIN");
  AdminController::allUsers($pdo);
});

$router->get("/admin/users_pending", function () {
  header("Location: /api/admin/users");
  exit;
});

$router->post("/api/admin/users/activate", function () use ($pdo) {
  RoleMiddleware::require("ADMIN");
  AdminController::activate($pdo);
});

$router->get("/api/admin/users/:id", function ($id) use ($pdo) {
    RoleMiddleware::require("ADMIN");
    AdminController::getUser($pdo, (int)$id);
});

$router->put("/api/admin/users/:id", function ($id) use ($pdo) {
    RoleMiddleware::require("ADMIN");
    AdminController::updateUser($pdo, (int)$id);
});

// Admin - Stats
$router->get("/api/admin/stats", function () use ($pdo) {
    RoleMiddleware::require("ADMIN");
    StatsController::getAdminStats($pdo);
});

// Admin - Deliverables
$router->get("/api/admin/deliverables", function () use ($pdo) {
    RoleMiddleware::require("ADMIN");
    AdminDeliverablesController::index($pdo);
});

// Admin - System Config
$router->get("/api/admin/periods", function () use ($pdo) {
    RoleMiddleware::require("ADMIN");
    SystemController::listPeriods($pdo);
});

$router->post("/api/admin/periods", function () use ($pdo) {
    RoleMiddleware::require("ADMIN");
    SystemController::createPeriod($pdo);
});

$router->delete("/api/admin/periods/:id", function ($id) use ($pdo) {
    RoleMiddleware::require("ADMIN");
    SystemController::deletePeriod($pdo, (int)$id);
});

$router->post("/api/admin/periods/:id/toggle", function ($id) use ($pdo) {
    RoleMiddleware::require("ADMIN");
    SystemController::togglePeriod($pdo, (int)$id);
});

$router->post("/api/admin/periods/:id/archive", function ($id) use ($pdo) {
    RoleMiddleware::require("ADMIN");
    SystemController::archivePeriod($pdo, (int)$id);
});

$router->put("/api/admin/periods/:id/toggle", function ($id) use ($pdo) {
    RoleMiddleware::require("ADMIN");
    SystemController::togglePeriod($pdo, (int)$id);
});

$router->delete("/api/admin/periods/:id", function ($id) use ($pdo) {
    RoleMiddleware::require("ADMIN");
    SystemController::deletePeriod($pdo, (int)$id);
});

$router->get("/api/admin/categories", function () use ($pdo) {
    RoleMiddleware::require("ADMIN");
    SystemController::listCategories($pdo);
});

$router->post("/api/admin/categories", function () use ($pdo) {
    RoleMiddleware::require("ADMIN");
    SystemController::createCategory($pdo);
});

$router->delete("/api/admin/categories/:id", function ($id) use ($pdo) {
    RoleMiddleware::require("ADMIN");
    SystemController::deleteCategory($pdo, (int)$id);
});

$router->get("/api/admin/audit-logs", function () use ($pdo) {
    RoleMiddleware::require("ADMIN");
    SystemController::listAuditLogs($pdo);
});

$router->post("/api/admin/system/backup", function () use ($pdo) {
    RoleMiddleware::require("ADMIN");
    SystemController::backupDatabase($pdo);
});

$router->post("/api/admin/system/report", function () use ($pdo) {
    RoleMiddleware::require("ADMIN");
    SystemController::generateGlobalReport($pdo);
});

// Categories (All Auth)
$router->get("/api/categories", function () use ($pdo) {
    AuthMiddleware::handle();
    header("Content-Type: application/json");
    echo json_encode(["categories" => ProjectCategory::all($pdo)]);
});

// SOUTENANCES
$router->get("/api/soutenances", function () use ($pdo) {
    SoutenanceController::listSoutenances($pdo);
});

$router->post("/api/admin/soutenances", function () use ($pdo) {
    RoleMiddleware::require("ADMIN");
    SoutenanceController::scheduleSoutenance($pdo);
});

$router->put("/api/admin/soutenances/:id", function ($id) use ($pdo) {
    RoleMiddleware::require("ADMIN");
    SoutenanceController::updateSoutenance($pdo, (int)$id);
});

$router->delete("/api/admin/soutenances/:id", function ($id) use ($pdo) {
    RoleMiddleware::require("ADMIN");
    SoutenanceController::deleteSoutenance($pdo, (int)$id);
});

// Admin - Create User
$router->post("/api/admin/users/create", function () use ($pdo) {
    RoleMiddleware::require("ADMIN");
    AdminController::createUser($pdo);
});

$router->delete("/api/student/deliverables/:id", function ($id) use ($pdo) {
    RoleMiddleware::require("ETUDIANT");
    StudentController::apiDeleteLivrable($pdo, (int)$id);
});

// Student - Projects
$router->post("/api/student/projects/propose", function () use ($pdo) {
    RoleMiddleware::require("ETUDIANT");
    StudentController::apiCreateProject($pdo);
});

$router->put("/api/student/projects/:id", function ($id) use ($pdo) {
    RoleMiddleware::require("ETUDIANT");
    StudentController::apiUpdateProjectProposal($pdo, (int)$id);
});

$router->delete("/api/student/projects/:id", function ($id) use ($pdo) {
    RoleMiddleware::require("ETUDIANT");
    StudentController::apiDeleteProjectProposal($pdo, (int)$id);
});

// Admin - Search Users
$router->get("/api/admin/users/search", function () use ($pdo) {
    RoleMiddleware::require("ADMIN");
    AdminController::searchUsers($pdo);
});

// Admin - Reset Password
$router->post("/api/admin/users/:id/reset-password", function ($id) use ($pdo) {
    RoleMiddleware::require("ADMIN");
    AdminController::resetPassword($pdo, (int)$id);
});

// Admin - projets
$router->get("/api/admin/projects", function () use ($pdo) {
  RoleMiddleware::require(["ADMIN", "ENCADREUR_ACAD", "ENCADREUR_PRO"]);
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
  error_log("Route /api/admin/projects/assign was hit.");
  RoleMiddleware::require("ADMIN");
  AdminProjectController::assign($pdo);
});

// Admin - Update Project
$router->put("/api/admin/projects/:id", function ($id) use ($pdo) {
    RoleMiddleware::require("ADMIN");
    AdminProjectController::update($pdo, (int)$id);
});

// Admin - Delete Project
$router->delete("/api/admin/projects/:id", function ($id) use ($pdo) {
    RoleMiddleware::require("ADMIN");
    AdminProjectController::delete($pdo, (int)$id);
});

// Admin - Approve Proposal
$router->post("/api/admin/projects/:id/approve", function ($id) use ($pdo) {
    RoleMiddleware::require("ADMIN");
    AdminProjectController::approveProposal($pdo, (int)$id);
});

// Admin - Reject Proposal
$router->post("/api/admin/projects/:id/reject", function ($id) use ($pdo) {
    RoleMiddleware::require("ADMIN");
    AdminProjectController::rejectProposal($pdo, (int)$id);
});

// Admin - Close Project
$router->post("/api/admin/projects/:id/close", function ($id) use ($pdo) {
    RoleMiddleware::require("ADMIN");
    AdminProjectController::closeProject($pdo, (int)$id);
});

// Admin - Search Projects
$router->get("/api/admin/projects/search", function () use ($pdo) {
    RoleMiddleware::require(["ADMIN", "ENCADREUR_ACAD", "ENCADREUR_PRO"]);
    AdminProjectController::searchProjects($pdo);
});

$router->get("/api/admin/projects/:id/details", function ($id) use ($pdo) {
    RoleMiddleware::require(["ADMIN", "ENCADREUR_ACAD", "ENCADREUR_PRO"]);
    AdminProjectController::show($pdo, (int)$id);
});

$router->get("/api/admin/evaluations/all", function () use ($pdo) {
    RoleMiddleware::require("ADMIN");
    AdminController::getAllEvaluations($pdo);
});

// Dashboard
$router->get("/dashboard", function () use ($pdo) {
  DashboardController::index($pdo);
});

// --- Student API ---
$router->get("/api/student/available-projects", function () use ($pdo) {
    StudentController::apiAvailableProjects($pdo);
});

$router->get("/api/student/projects/:id/apply", function ($id) use ($pdo) {
    StudentController::apiApplyForProject($pdo, (int)$id);
});

$router->get("/api/student/profile", function () {
  AuthMiddleware::handle();
  header("Content-Type: application/json");
  echo json_encode(["user" => $_SESSION["user"]]);
});

$router->get("/api/student/projects", function () use ($pdo) {
  AuthMiddleware::handle();
  $user = $_SESSION["user"];
  $project = Project::findByStudent($pdo, (int)$user["id"]);
  if ($project && isset($project["id"])) {
      $project["progress"] = Project::getProgress($pdo, (int)$project["id"]);
  }
  header("Content-Type: application/json");
  echo json_encode(["projects" => $project ? [$project] : []]);
});

$router->post("/api/student/projects/create", function () use ($pdo) {
  StudentController::apiCreateProject($pdo);
});

$router->get("/api/student/tasks", function () use ($pdo) {
  AuthMiddleware::handle();
  $user = $_SESSION["user"];
  $tasks = Task::byStudent($pdo, (int)$user["id"]);
  header("Content-Type: application/json");
  echo json_encode(["tasks" => $tasks]);
});

$router->post("/api/student/tasks/create", function () use ($pdo) {
    TaskController::apiCreate($pdo);
});

$router->delete("/api/tasks/:id", function ($id) use ($pdo) {
    TaskController::apiDelete($pdo, (int)$id);
});

$router->get("/api/projects/:id/tasks", function ($id) use ($pdo) {
    TaskController::apiGetProjectTasks($pdo, (int)$id);
});

$router->get("/api/student/projects/:id/timeline", function ($id) use ($pdo) {
    AuthMiddleware::handle();
    SupervisorController::apiGetProjectTimeline($pdo, (int)$id);
});

$router->put("/api/tasks/:id/status", function ($id) use ($pdo) {
    TaskController::apiUpdateStatus($pdo, (int)$id);
});

$router->put("/api/student/tasks/:id/status", function ($id) use ($pdo) {
  TaskController::apiUpdateStatus($pdo, (int)$id);
});

$router->get("/api/student/deliverables", function () use ($pdo) {
  AuthMiddleware::handle();
  $user = $_SESSION["user"];
  $items = Livrable::byStudent($pdo, (int)$user["id"]);
  header("Content-Type: application/json");
  echo json_encode(["deliverables" => $items]);
});

$router->post("/api/student/deliverables/upload", function () use ($pdo) {
  AuthMiddleware::handle();
  StudentController::upload($pdo);
});

$router->put("/api/student/deliverables/:id", function ($id) use ($pdo) {
    StudentController::apiUpdateLivrable($pdo, (int)$id);
});

$router->get("/api/student/deliverables/:id/comments", function ($id) use ($pdo) {
    StudentController::apiGetComments($pdo, (int)$id);
});

$router->post("/api/student/deliverables/:id/comments", function ($id) use ($pdo) {
    StudentController::apiAddComment($pdo, (int)$id);
});

$router->get("/api/student/evaluations", function () use ($pdo) {
    StudentController::getEvaluations($pdo);
});

// --- Supervisor API ---
$router->get("/api/supervisor/projects", function () use ($pdo) {
  SupervisorController::getProjects($pdo);
});

$router->get("/api/supervisor/proposals", function () use ($pdo) {
    SupervisorController::apiGetProposals($pdo);
});

$router->post("/api/supervisor/proposals/:id/handle", function ($id) use ($pdo) {
    SupervisorController::apiHandleProposal($pdo, (int)$id);
});

$router->get("/api/supervisor/projects/:id", function ($id) use ($pdo) {
  SupervisorController::getProjectDetails($pdo, (int)$id);
});

$router->get("/api/supervisor/projects/:id/timeline", function ($id) use ($pdo) {
    SupervisorController::apiGetProjectTimeline($pdo, (int)$id);
});

$router->get("/api/supervisor/students", function () use ($pdo) {
  AuthMiddleware::handle();
  $user = $_SESSION["user"];
  // Logic to find students assigned to this supervisor
  $stmt = $pdo->prepare("
    SELECT u.id, u.nom, u.prenom, u.email, p.titre AS projet_titre, p.id AS project_id
    FROM project_assignments pa
    JOIN users u ON u.id = pa.etudiant_id
    JOIN projects p ON p.id = pa.project_id
    WHERE pa.encadreur_acad_id = ? OR pa.encadreur_pro_id = ?
  ");
  $stmt->execute([(int)$user["id"], (int)$user["id"]]);
  $students = $stmt->fetchAll();
  
  // Ajouter la progression pour chaque étudiant
  foreach ($students as &$s) {
      if (isset($s["project_id"])) {
          $s["progression"] = Project::getProgress($pdo, (int)$s["project_id"]);
      } else {
          $s["progression"] = 0;
      }
  }

  header("Content-Type: application/json");
  echo json_encode(["students" => $students]);
});

$router->get("/api/supervisor/evaluations", function () use ($pdo) {
  SupervisorController::getEvaluations($pdo);
});

$router->get("/api/supervisor/deliverables/pending", function () use ($pdo) {
    AuthMiddleware::handle();
    $user = $_SESSION["user"];
    $stmt = $pdo->prepare("
        SELECT l.*, u.nom, u.prenom, p.titre AS projet_titre
        FROM livrables l
        JOIN users u ON u.id = l.etudiant_id
        JOIN projects p ON p.id = l.project_id
        JOIN project_assignments pa ON pa.project_id = l.project_id
        WHERE (pa.encadreur_acad_id = ? OR pa.encadreur_pro_id = ?)
        AND l.statut = 'SOUMIS'
    ");
    $stmt->execute([(int)$user["id"], (int)$user["id"]]);
    header("Content-Type: application/json");
    echo json_encode(["deliverables" => $stmt->fetchAll()]);
});

$router->get("/api/supervisor/deliverables", function () use ($pdo) {
    AuthMiddleware::handle();
    $user = $_SESSION["user"];
    $stmt = $pdo->prepare("
        SELECT l.*, u.nom, u.prenom, p.titre AS projet_titre
        FROM livrables l
        JOIN users u ON u.id = l.etudiant_id
        JOIN projects p ON p.id = l.project_id
        JOIN project_assignments pa ON pa.project_id = l.project_id
        WHERE (pa.encadreur_acad_id = ? OR pa.encadreur_pro_id = ?)
        ORDER BY l.submitted_at DESC
    ");
    $stmt->execute([(int)$user["id"], (int)$user["id"]]);
    header("Content-Type: application/json");
    echo json_encode(["deliverables" => $stmt->fetchAll()]);
});

$router->post("/api/supervisor/deliverables/:id/approve", function ($id) use ($pdo) {
    SupervisorController::approveDeliverable($pdo, (int)$id);
});

$router->post("/api/supervisor/deliverables/:id/reject", function ($id) use ($pdo) {
    SupervisorController::rejectDeliverable($pdo, (int)$id);
});

$router->post("/api/supervisor/evaluations/academic", function () use ($pdo) {
    SupervisorController::createEvaluation($pdo);
});

$router->post("/api/supervisor/evaluations/professional", function () use ($pdo) {
    SupervisorController::createEvaluation($pdo);
});

$router->get("/api/supervisor/competences", function () use ($pdo) {
    SupervisorController::apiGetCompetences($pdo);
});

// --- Chat API ---
$router->get("/api/projects/:id/messages", function ($id) use ($pdo) {
    ChatController::getMessages($pdo, (int)$id);
});

$router->post("/api/projects/:id/messages", function ($id) use ($pdo) {
    ChatController::sendMessage($pdo, (int)$id);
});

// Notifications API (Cleaned & Grouped)
$router->get("/api/notifications", function () use ($pdo) {
    NotificationController::index($pdo);
});

$router->put("/api/notifications/read-all", function () use ($pdo) {
    NotificationController::readAll($pdo);
});

$router->put("/api/notifications/:id/read", function ($id) use ($pdo) {
    NotificationController::read($pdo, (int)$id);
});

$router->delete("/api/notifications", function () use ($pdo) {
    NotificationController::deleteAll($pdo);
});

$router->delete("/api/notifications/:id", function ($id) use ($pdo) {
    NotificationController::delete($pdo, (int)$id);
});

// Legacy/Compatibility routes for services
$router->get("/api/student/notifications", function () use ($pdo) {
    NotificationController::index($pdo);
});

$router->put("/api/student/notifications/:id/read", function ($id) use ($pdo) {
    NotificationController::read($pdo, (int)$id);
});

$router->get("/api/supervisor/notifications", function () use ($pdo) {
    NotificationController::index($pdo);
});

$router->put("/api/supervisor/notifications/:id/read", function ($id) use ($pdo) {
    NotificationController::read($pdo, (int)$id);
});

// User Settings API
$router->get("/api/user/profile", function () use ($pdo) {
    UserController::getProfile($pdo);
});

$router->put("/api/user/profile", function () use ($pdo) {
    UserController::updateProfile($pdo);
});

$router->put("/api/user/password", function () use ($pdo) {
    UserController::updatePassword($pdo);
});

$router->post("/api/user/avatar", function () use ($pdo) {
    UserController::uploadAvatar($pdo);
});

// Admin deletion
$router->delete("/api/admin/users/:id", function ($id) use ($pdo) {
    RoleMiddleware::require("ADMIN");
    AdminController::deleteUser($pdo, (int)$id);
});

//Lancer le routeur
$router->dispatch($_SERVER["REQUEST_METHOD"], $path);

