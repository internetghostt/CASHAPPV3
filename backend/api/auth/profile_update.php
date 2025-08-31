<?php
require_once __DIR__ . '/../middleware/auth.php';
require_once __DIR__ . '/../helpers/db.php';
require_once __DIR__ . '/../helpers/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'PUT') {
    send_json(405, ['error' => 'Method not allowed']);
}

$user = require_auth(false);
$input = get_json_input();

$fields = [];
$params = [];

if (isset($input['name'])) { $fields[] = 'name = ?'; $params[] = trim($input['name']); }
if (isset($input['phone'])) { $fields[] = 'phone = ?'; $params[] = trim($input['phone']); }
if (isset($input['email'])) {
    $email = strtolower(trim($input['email']));
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) { send_json(400, ['error' => 'Invalid email']); }
    // ensure unique email not used by others
    $pdo = get_pdo();
    $check = $pdo->prepare('SELECT id FROM users WHERE email = ? AND id <> ? LIMIT 1');
    $check->execute([$email, $user['id']]);
    if ($check->fetch()) {
        send_json(409, ['error' => 'Email already in use']);
    }
    $fields[] = 'email = ?'; $params[] = $email;
}

if (empty($fields)) {
    send_json(400, ['error' => 'No fields to update']);
}

try {
    $pdo = $pdo ?? get_pdo();
    $sql = 'UPDATE users SET ' . implode(', ', $fields) . ', updated_at = NOW() WHERE id = ?';
    $params[] = $user['id'];
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);

    send_json(200, ['status' => 'updated']);
} catch (Throwable $e) {
    send_json(500, ['error' => 'Server error']);
}