<?php
require_once __DIR__ . '/config.php';

function get_pdo(): PDO {
    global $DB_HOST, $DB_NAME, $DB_USER, $DB_PASS, $DB_CHARSET;
    static $pdo = null;
    if ($pdo instanceof PDO) {
        return $pdo;
    }
    $dsn = "mysql:host={$DB_HOST};dbname={$DB_NAME};charset={$DB_CHARSET}";
    $options = [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ];
    try {
        $pdo = new PDO($dsn, $DB_USER, $DB_PASS, $options);
    } catch (Throwable $e) {
        if (is_dev()) {
            send_json(500, ['error' => 'DB connection failed', 'details' => $e->getMessage(), 'dsn' => $dsn, 'user' => $DB_USER]);
        }
        send_json(500, ['error' => 'Server error']);
    }
    return $pdo;
}