<?php
error_reporting(E_ALL);
ini_set('display_errors', '1');

try {
    $pdo = require __DIR__ . '/bootstrap.php';
    require_once __DIR__ . '/app/Controllers/StatsController.php';
    require_once __DIR__ . '/app/Middlewares/AuthMiddleware.php';
    
    // Simuler un utilisateur admin pour passer le check
    session_start();
    $_SESSION['user'] = ['id' => 1, 'role' => 'ADMIN'];

    echo "Tentative d'exécution de StatsController::getAdminStats...\n";
    StatsController::getAdminStats($pdo);
} catch (Throwable $e) {
    echo "\nERREUR CAPTURÉE : " . $e->getMessage() . "\n";
    echo "Fichier : " . $e->getFile() . " à la ligne " . $e->getLine() . "\n";
    echo "Stack trace :\n" . $e->getTraceAsString() . "\n";
}
