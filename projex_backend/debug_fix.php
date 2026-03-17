<?php
try {
    $pdo = new PDO('mysql:host=localhost;dbname=projex', 'root', '');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "--- CHECKING USERS TABLE SCHEMA ---\n";
    $stmt = $pdo->query('DESCRIBE users');
    $cols = $stmt->fetchAll(PDO::FETCH_ASSOC);
    foreach($cols as $col) {
        echo $col['Field'] . " (" . $col['Type'] . ") - Null: " . $col['Null'] . "\n";
    }

    echo "\n--- CHECKING USERS WITH AVATARS ---\n";
    $stmt = $pdo->query('SELECT id, nom, image_profil FROM users');
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
    $found = 0;
    foreach($users as $u) {
        if (!empty($u['image_profil'])) {
            echo "ID: " . $u['id'] . " | Nom: " . $u['nom'] . " | Path: " . $u['image_profil'] . "\n";
            $found++;
        }
    }
    if ($found === 0) echo "No users have an avatar path in DB.\n";

    echo "\n--- DIR PERMISSIONS ---\n";
    $dir = __DIR__ . '/public/uploads/avatars';
    if (is_dir($dir)) {
        echo "Dir exists: $dir\n";
        echo "Writable: " . (is_writable($dir) ? 'YES' : 'NO') . "\n";
        echo "Files count: " . (count(scandir($dir)) - 2) . "\n";
    } else {
        echo "Dir does NOT exist: $dir\n";
        echo "Attempting to create it...\n";
        if (mkdir($dir, 0777, true)) {
            echo "Successfully created dir.\n";
        } else {
            echo "FAILED to create dir.\n";
        }
    }
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}
