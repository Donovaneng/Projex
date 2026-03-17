<?php
try {
    $pdo = new PDO("mysql:host=127.0.0.1;dbname=projex;charset=utf8mb4", "root", "");
    echo "Connexion réussie !\n";
} catch (PDOException $e) {
    echo "Échec connexion : " . $e->getMessage() . "\n";
}
