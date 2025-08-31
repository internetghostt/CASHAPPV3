<?php

// CORS headers for API
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit();
}

// App environment
$APP_ENV = getenv('APP_ENV') ?: 'production';
if ($APP_ENV === 'development') {
    ini_set('display_errors', '1');
    error_reporting(E_ALL);
} else {
    ini_set('display_errors', '0');
    error_reporting(0);
}

// Database configuration (override via environment variables on server)
$APP_ENV = 'production';

$DB_HOST = '';       // your DB host
$DB_NAME = ''; // your DB name
$DB_USER = '';          // your DB user
$DB_PASS = '';
$DB_CHARSET = 'utf8mb4';

$JWT_SECRET = 'a-strong-secret-here';
$JWT_ISSUER = 'dbname';
$JWT_TTL_SECONDS = 86400; // 24h

function is_dev(): bool {
    global $APP_ENV;
    return strtolower($APP_ENV) === 'development';
}

function send_json(int $statusCode, array $data): void {
    http_response_code($statusCode);
    header('Content-Type: application/json');
    echo json_encode($data);
    exit();
}

function get_json_input(): array {
    $raw = file_get_contents('php://input');
    if (!$raw) {
        return [];
    }
    $data = json_decode($raw, true);
    if (!is_array($data)) {
        return [];
    }
    return $data;
}

function get_auth_header(): ?string {
    $headers = function_exists('getallheaders') ? getallheaders() : [];
    if (isset($headers['Authorization'])) {
        return $headers['Authorization'];
    }
    if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
        return $_SERVER['HTTP_AUTHORIZATION'];
    }
    return null;
}