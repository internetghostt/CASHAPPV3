<?php
require_once __DIR__ . '/../helpers/config.php';
require_once __DIR__ . '/../helpers/db.php';
require_once __DIR__ . '/../helpers/jwt.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    send_json(405, ['error' => 'Method not allowed']);
}

$input = get_json_input();
$emailOrPhone = strtolower(trim($input['identifier'] ?? ''));
$password = $input['password'] ?? '';

if ($emailOrPhone === '' || $password === '') {
    send_json(400, ['error' => 'Invalid input']);
}

try {
    $pdo = get_pdo();
    $stmt = $pdo->prepare('SELECT id, name, email, phone, password, balance, account_number, is_admin, is_frozen FROM users WHERE email = ? OR phone = ? LIMIT 1');
    $stmt = $pdo->prepare('SELECT id, name, email, phone, password, balance, account_number, date_of_birth, occupation, contract_start_date, contract_expiry_date, kyc_verified, bank_verified, is_admin, is_frozen FROM users WHERE email = ? OR phone = ? LIMIT 1');
    $stmt->execute([$emailOrPhone, $emailOrPhone]);
    $user = $stmt->fetch();

    if (!$user || !password_verify($password, $user['password'])) {
        send_json(401, ['error' => 'Invalid credentials']);
    }

   /* if (intval($user['is_frozen']) === 1) {
        send_json(423, ['error' => 'Account is frozen']);
    } */

    $token = jwt_encode(['uid' => intval($user['id'])]);

    unset($user['password']);

    // Coerce numeric types
    $user['balance'] = isset($user['balance']) ? (float)$user['balance'] : 0.0;
    $user['kyc_verified'] = intval($user['kyc_verified'] ?? 0);
    $user['bank_verified'] = intval($user['bank_verified'] ?? 0);
    $user['is_admin'] = intval($user['is_admin'] ?? 0);
    $user['is_frozen'] = intval($user['is_frozen'] ?? 0);

    send_json(200, [
        'token' => $token,
        'user' => $user,
    ]);
} catch (Throwable $e) {
    send_json(500, ['error' => 'Server error']);
}
