<?php
require_once __DIR__ . '/../middleware/auth.php';
require_once __DIR__ . '/../helpers/db.php';
require_once __DIR__ . '/../helpers/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    send_json(405, ['error' => 'Method not allowed']);
}

$user = require_auth(false);

try {
    $pdo = get_pdo();
    $stmt = $pdo->prepare('
        SELECT t.id, t.amount, t.status, t.created_at,
               t.sender_id, t.recipient_id,
               CASE WHEN t.sender_id = ? THEN "sent" ELSE "received" END AS type
        FROM transactions t
        WHERE t.sender_id = ? OR t.recipient_id = ?
        ORDER BY t.created_at DESC
        LIMIT 100
    ');
    $stmt->execute([$user['id'], $user['id'], $user['id']]);
    $rows = $stmt->fetchAll();

    send_json(200, ['transactions' => $rows]);
} catch (Throwable $e) {
    send_json(500, ['error' => 'Server error']);
}