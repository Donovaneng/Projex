<?php
declare(strict_types=1);

return [
  "host" => getenv("MYSQLHOST") ?: "127.0.0.1",
  "name" => getenv("MYSQLDATABASE") ?: "projex",
  "user" => getenv("MYSQLUSER") ?: "root",
  "pass" => getenv("MYSQLPASSWORD") !== false ? getenv("MYSQLPASSWORD") : "",
  "port" => getenv("MYSQLPORT") ?: "3306",
  "charset" => "utf8mb4",
];