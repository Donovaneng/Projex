<?php
$pdo = require 'c:/xampp/htdocs/projex/projex_backend/bootstrap.php';
$stmt = $pdo->query("SELECT id, prenom, nom, role, matricule, filiere, niveau FROM users");
$users = $stmt->fetchAll(PDO::FETCH_ASSOC);
echo json_encode($users, JSON_PRETTY_PRINT);
