<?php
declare(strict_types=1);

if (session_status() === PHP_SESSION_NONE) {
  // configure session cookie to be sent in cross-site AJAX requests (Lax blocks POSTs)
  session_set_cookie_params([
    'lifetime' => 0,
    'path' => '/',
    'domain' => 'localhost',
    'secure' => false,          // http for now
    'httponly' => true,
    'samesite' => 'None',       // allow cross-origin requests
  ]);
  session_start();
}

// Charger config
$db = require __DIR__ . "/config/db.php";

// Sécuriser les clés (évite Undefined array key)
$host = $db["host"] ?? "localhost";
$name = $db["name"] ?? "";
$user = $db["user"] ?? "";
$pass = $db["pass"] ?? "";
$charset = $db["charset"] ?? "utf8mb4";

// Si une info manque, on stop avec un message clair
if ($name === "" || $user === "") {
  die("Config DB invalide : vérifie config/database.php (name, user).");
}

try {
  $pdo = new PDO(
    "mysql:host={$host};dbname={$name};charset={$charset}",
    $user,
    $pass,
    [
      PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
      PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]
  );
} catch (PDOException $e) {
  die("Erreur DB: " . $e->getMessage());
}


// create a demo admin user if not present (useful for development)
try {
    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ? LIMIT 1");
    $stmt->execute(['demo@example.com']);
    $exists = $stmt->fetchColumn();
    if (!$exists) {
        $hash = password_hash('demo123', PASSWORD_DEFAULT);
        $insert = $pdo->prepare(
            "INSERT INTO users
             (nom, prenom, email, role, role_demande, actif, mot_de_passe)
             VALUES (?, ?, ?, ?, ?, 1, ?)"
        );
        $insert->execute([
            'Demo',
            'User',
            'demo@example.com',                 
            'ADMIN',
            'ADMIN',
            $hash,                  
        ]);
    }
} catch (Throwable $e) {
    // ignore any errors during seed
}

return $pdo;