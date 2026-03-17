<?php
declare(strict_types=1);

$pdo = require __DIR__ . '/bootstrap.php';

$outputFile = __DIR__ . '/db_schema_full.txt';
$fp = fopen($outputFile, 'w');

fwrite($fp, "Database: " . $pdo->query("SELECT DATABASE()")->fetchColumn() . "\n\n");

fwrite($fp, "Tables & Schemas:\n");
$tables = $pdo->query("SHOW TABLES")->fetchAll(PDO::FETCH_COLUMN);
foreach ($tables as $table) {
    fwrite($fp, "--- TABLE: $table ---\n");
    $stmt = $pdo->query("SHOW CREATE TABLE `$table` ");
    fwrite($fp, $stmt->fetch(PDO::FETCH_ASSOC)['Create Table'] . "\n\n");
}
fclose($fp);
echo "Full schema written to $outputFile\n";
