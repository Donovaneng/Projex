<?php
echo "Starting bootstrap test...\n";
$pdo = require __DIR__ . '/../bootstrap.php';
echo "Bootstrap successful. DB Connected.\n";
echo "Session Status: " . session_status() . "\n";
echo "Session ID: " . session_id() . "\n";
