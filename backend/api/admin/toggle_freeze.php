<?php
require_once __DIR__ . '/../middleware/auth.php';
require_once __DIR__ . '/../helpers/db.php';
require_once __DIR__ . '/../helpers/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'PATCH') {
    send_json(405, ['error' => 'Method not allowed']);
}

require_auth(true);
$input = get_json_input();
$userId = intval($input['id'] ?? 0);
$isFrozen = intval($input['is_frozen'] ?? -1);
if ($userId <= 0 || ($isFrozen !== 0 && $isFrozen !== 1)) {
    send_json(400, ['error' => 'Invalid input']);
}

try {
    $pdo = get_pdo();
    $stmt = $pdo->prepare('UPDATE users SET is_frozen = ?, updated_at = NOW() WHERE id = ?');
    $stmt->execute([$isFrozen, $userId]);
    send_json(200, ['status' => 'updated']);
} catch (Throwable $e) {
    send_json(500, ['error' => 'Server error']);
}