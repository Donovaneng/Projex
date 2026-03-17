<?php
declare(strict_types=1);

$pdo = require __DIR__ . '/bootstrap.php';
require_once __DIR__ . '/app/Models/User.php';

$userId = 10;

try {
    echo "Attempting to delete user ID: $userId\n";
    User::delete($pdo, $userId);
    echo "SUCCESS: User deleted.\n";
} catch (PDOException $e) {
    echo "PDO Error: " . $e->getMessage() . "\n";
    echo "Error Code: " . $e->getCode() . "\n";
    echo "SQL State: " . $e->errorInfo[0] . "\n";
} catch (Throwable $e) {
    echo "General Error: " . $e->getMessage() . "\n";
}
