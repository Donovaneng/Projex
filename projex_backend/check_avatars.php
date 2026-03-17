<?php
try {
    $pdo = new PDO('mysql:host=localhost;dbname=projex', 'root', '');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "--- Users table structure ---\n";
    $stmt = $pdo->query('DESCRIBE users');
    print_r($stmt->fetchAll(PDO::FETCH_ASSOC));

    echo "\n--- Users with avatars in DB ---\n";
    $stmt = $pdo->query('SELECT id, nom, image_profil FROM users WHERE image_profil IS NOT NULL');
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
    print_r($users);

    $uploadDir = __DIR__ . '/public/uploads/avatars/';
    echo "\nUpload directory: $uploadDir\n";
    if (is_dir($uploadDir)) {
        echo "Files in upload directory:\n";
        print_r(scandir($uploadDir));
    } else {
        echo "Upload directory does NOT exist.\n";
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
