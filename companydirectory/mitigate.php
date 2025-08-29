<?php
// public/migrate.php

// --- Simple access protection with a token ---
$TOKEN = 'CHANGE_THIS_TOKEN';
if (!isset($_GET['key']) || $_GET['key'] !== $TOKEN) {
    http_response_code(403);
    exit('Forbidden');
}

// --- Diagnostics (temporarily show & log errors) ---
ini_set('display_errors', '1');
ini_set('display_startup_errors', '1');
error_reporting(E_ALL);
ini_set('log_errors', '1');
ini_set('error_log', __DIR__ . '/migrate-error.log');

function out($msg) {
    echo $msg . "<br>\n";
    @file_put_contents(__DIR__ . '/migrate.log', $msg . PHP_EOL, FILE_APPEND);
}

// --- Locate the SQL file (adjust path if your structure differs) ---
$sqlFile = __DIR__ . '/../libs/sql/companydirectory.sql';
if (!file_exists($sqlFile)) {
    http_response_code(500);
    out("❌ SQL file not found: $sqlFile");
    exit;
}

// --- Get DB credentials ---
// 1) Try real environment variables (if mapped at runtime)
$DB_HOST = getenv('DB_HOST');
$DB_USER = getenv('DB_USERNAME') ?: getenv('DB_USER');
$DB_PASS = getenv('DB_PASSWORD') ?: getenv('DB_PASS');
$DB_NAME = getenv('DB_DATABASE') ?: getenv('DB_NAME');

// 2) If not set, try reading a .env file from the deployment
if (!$DB_HOST || !$DB_USER || !$DB_PASS || !$DB_NAME) {
    $envPaths = [__DIR__ . '/.env', dirname(__DIR__) . '/.env'];
    foreach ($envPaths as $envPath) {
        if (is_readable($envPath)) {
            $lines = file($envPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
            foreach ($lines as $line) {
                if (strpos($line, '=') !== false) {
                    list($k, $v) = array_map('trim', explode('=', $line, 2));
                    $v = trim($v, "\"'");
                    if ($k === 'DB_HOST')     $DB_HOST = $DB_HOST ?: $v;
                    if ($k === 'DB_USERNAME') $DB_USER = $DB_USER ?: $v;
                    if ($k === 'DB_PASSWORD') $DB_PASS = $DB_PASS ?: $v;
                    if ($k === 'DB_DATABASE') $DB_NAME = $DB_NAME ?: $v;
                }
            }
        }
    }
}

if (!$DB_HOST || !$DB_USER || !$DB_PASS || !$DB_NAME) {
    http_response_code(500);
    out('❌ Missing DB credentials (DB_HOST/DB_USERNAME/DB_PASSWORD/DB_DATABASE). Check your .env in Deployment Viewer or map these environment variables.');
    exit;
}

// --- Connect and run migration ---
$mysqli = @new mysqli($DB_HOST, $DB_USER, $DB_PASS, $DB_NAME);
if ($mysqli->connect_errno) {
    http_response_code(500);
    out('❌ Connection failed: ' . $mysqli->connect_error);
    exit;
}

$sql = file_get_contents($sqlFile);
if ($sql === false) {
    http_response_code(500);
    out('❌ Unable to read SQL file.');
    exit;
}

if (!$mysqli->multi_query($sql)) {
    http_response_code(500);
    out('❌ Migration failed: ' . $mysqli->error);
    exit;
}
do { if ($res = $mysqli->store_result()) { $res->free(); } } while ($mysqli->more_results() && $mysqli->next_result());

out('✅ Migration completed');