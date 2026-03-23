<?php
$pdo = new PDO('mysql:host=localhost;dbname=projex', 'root', '');
$stmt = $pdo->query("DESCRIBE projects");
$columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
foreach ($columns as $column) {
    echo $column['Field'] . " - " . $column['Type'] . "\n";
}
