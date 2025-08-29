<?php
// db.php

$cd_host = "127.0.0.1";
$cd_port = 3306;
$cd_socket = "";

$cd_dbname = "companydirectory";
$cd_user = "companydirectory";
$cd_password = "companydirectory";

$allowed_origin = "http://localhost:8080/";

if (isset($_SERVER['HTTP_ORIGIN']) && $_SERVER['HTTP_ORIGIN'] === $allowed_origin) {
    header("Access-Control-Allow-Origin: $allowed_origin");
    header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization");
}

// Create a mysqli connection
$conn = new mysqli($cd_host, $cd_user, $cd_password, $cd_dbname, $cd_port);

// Check connection
if ($conn->connect_error) {
    die("Database connection failed: " . $conn->connect_error);
}
?>
