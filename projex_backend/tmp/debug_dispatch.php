<?php
error_reporting(E_ALL);
ini_set('display_errors', '1');

// Mock session
$_SESSION = [
    "user" => [
        "id" => 1,
        "role" => "ADMIN",
        "email" => "admin@projex.com"
    ]
];

try {
    echo "--- START DISPATCH SIMULATION ---\n";
    
    // 1. Bootstrap
    $pdo = require __DIR__ . '/../bootstrap.php';
    echo "Bootstrap OK\n";
    
    // 2. Requires (Same order as index.php)
    require_once __DIR__ . '/../app/Core/Router.php';
    require_once __DIR__ . '/../app/Middlewares/AuthMiddleware.php';
    require_once __DIR__ . '/../app/Middlewares/RoleMiddleware.php';
    require_once __DIR__ . '/../app/Controllers/SystemController.php';
    require_once __DIR__ . '/../app/Models/AcademicPeriod.php';
    
    echo "Requires OK\n";
    
    // 3. Execution (Simulating Router closure)
    echo "Calling RoleMiddleware::require('ADMIN')...\n";
    RoleMiddleware::require("ADMIN");
    
    echo "Calling SystemController::listPeriods()...\n";
    SystemController::listPeriods($pdo);
    
    echo "\n--- SUCCESS ---\n";

} catch (Throwable $e) {
    echo "\n--- FAILURE ---\n";
    echo "EXCEPTION: " . $e->getMessage() . "\n";
    echo "FILE: " . $e->getFile() . " LINE: " . $e->getLine() . "\n";
    echo "TRACE: " . $e->getTraceAsString() . "\n";
}
