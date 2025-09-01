<?php
require_once __DIR__ . '/../middleware/auth.php';
require_once __DIR__ . '/../helpers/db.php';
require_once __DIR__ . '/../helpers/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
    send_json(405, ['error' => 'Method not allowed']);
}

require_auth(true);
$input = get_json_input();
$userId = intval($input['id'] ?? 0);

if ($userId <= 0) {
    send_json(400, ['error' => 'Invalid user id']);
}

try {
    $pdo = get_pdo();
    
    // Check if user exists
    $stmt = $pdo->prepare('SELECT id FROM users WHERE id = ?');
    $stmt->execute([$userId]);
    if (!$stmt->fetch()) {
        send_json(404, ['error' => 'User not found']);
    }
    
    // Delete user (transactions will be cascade deleted)
    $stmt = $pdo->prepare('DELETE FROM users WHERE id = ?');
    $stmt->execute([$userId]);
    
    send_json(200, ['status' => 'deleted']);
} catch (Throwable $e) {
    send_json(500, ['error' => 'Server error']);
}