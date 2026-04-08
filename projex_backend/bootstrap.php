<?php
declare(strict_types=1);

if (session_status() === PHP_SESSION_NONE) {
  // configure session cookie
  // For production (Railway + Vercel), we need secure=true and samesite=None for cross-domain cookies
  $is_production = getenv('RAILWAY_ENVIRONMENT') !== false;
  
  session_set_cookie_params([
    'lifetime' => 0,
    'path' => '/',
    'domain' => '',
    'secure' => $is_production, 
    'httponly' => true,
    'samesite' => $is_production ? 'None' : 'Lax'
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
    $stmt->execute(['admin@projex.com']);  // Nouvel email
    $exists = $stmt->fetchColumn();
    if (!$exists) {
        $hash = password_hash('admin2024', PASSWORD_DEFAULT);  // Nouveau mot de passe
        $insert = $pdo->prepare(
            "INSERT INTO users
             (nom, prenom, email, role, mot_de_passe, actif)
             VALUES (?, ?, ?, ?, ?, ?)"
        );
        $insert->execute([
            'Administrateur',  // Nouveau nom
            'PROJEX',          // Nouveau prénom
            'admin@projex.com',    // Nouvel email                 
            'ADMIN',           // role
            $hash,             // mot_de_passe
            1                  // actif
        ]);
    }
} catch (Throwable $e) {
    // ignore any errors during seed
}

return $pdo;