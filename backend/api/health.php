<?php
require_once __DIR__ . '/helpers/db.php';
require_once __DIR__ . '/helpers/config.php';

try {
    $pdo = get_pdo();
    $stmt = $pdo->query('SELECT 1 as ok');
    $ok = $stmt->fetch();
    send_json(200, [
        'status' => 'ok',
        'db' => $ok['ok'] == 1,
        'env' => getenv('APP_ENV') ?: 'production',
    ]);
} catch (Throwable $e) {
    if (is_dev()) {
        send_json(500, ['status' => 'fail', 'error' => $e->getMessage()]);
    }
    send_json(500, ['status' => 'fail']);
}