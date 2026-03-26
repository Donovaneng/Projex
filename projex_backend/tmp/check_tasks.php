<?php
$pdo = new PDO('mysql:host=localhost;dbname=projex', 'root', '');
$stmt = $pdo->query("SELECT project_id, COUNT(*) as total, SUM(CASE WHEN statut = 'TERMINE' THEN 1 ELSE 0 END) as done FROM taches GROUP BY project_id");
$results = $stmt->fetchAll(PDO::FETCH_ASSOC);
echo json_encode($results, JSON_PRETTY_PRINT);
