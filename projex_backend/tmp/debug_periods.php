<?php
error_reporting(E_ALL);
ini_set('display_errors', '1');

try {
    $dbConfig = require __DIR__ . '/../config/db.php';
    $pdo = new PDO(
        "mysql:host={$dbConfig['host']};dbname={$dbConfig['name']};charset={$dbConfig['charset']}",
        $dbConfig['user'],
        $dbConfig['pass'],
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );
    
    echo "Connexion DB OK\n";
    
    require_once __DIR__ . '/../app/Models/AcademicPeriod.php';
    echo "Inclusion Modèle OK\n";
    
    $periods = AcademicPeriod::all($pdo);
    echo "Query OK. Result count: " . count($periods) . "\n";
    print_r($periods);

} catch (Throwable $e) {
    echo "ERREUR DETECTEE: " . $e->getMessage() . "\n";
    echo "TRACE: " . $e->getTraceAsString() . "\n";
}
