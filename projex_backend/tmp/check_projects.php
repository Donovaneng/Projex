<?php
$pdo = new PDO('mysql:host=localhost;dbname=projex', 'root', '');
$stmt = $pdo->query('DESCRIBE academic_periods');
$cols = $stmt->fetchAll(PDO::FETCH_ASSOC);
foreach($cols as $c) {
    echo $c['Field'] . " | " . $c['Type'] . "\n";
}
