<?php
require_once __DIR__ . '/../helpers/config.php';
require_once __DIR__ . '/../helpers/jwt.php';
require_once __DIR__ . '/../helpers/db.php';

function require_auth(bool $adminRequired = false): array {
    $authHeader = get_auth_header();
    if (!$authHeader || stripos($authHeader, 'Bearer ') !== 0) {
        send_json(401, ['error' => 'Missing Authorization header']);
    }
    $token = trim(substr($authHeader, 7));
    try {
        $payload = jwt_decode($token);
    } catch (Exception $e) {
        send_json(401, ['error' => 'Invalid token']);
    }

    $userId = intval($payload['uid'] ?? 0);
    if ($userId <= 0) {
        send_json(401, ['error' => 'Invalid token payload']);
    }

    $pdo = get_pdo();
    $stmt = $pdo->prepare('SELECT id, name, email, phone, balance, account_number, date_of_birth, occupation, contract_start_date, contract_expiry_date, kyc_verified, bank_verified, is_admin, is_frozen FROM users WHERE id = ?');
    $stmt->execute([$userId]);
    $user = $stmt->fetch();

    if (!$user) {
        send_json(401, ['error' => 'User not found']);
    }

    // Coerce numeric types early
    $user['balance'] = isset($user['balance']) ? (float)$user['balance'] : 0.0;
    $user['kyc_verified'] = intval($user['kyc_verified'] ?? 0);
    $user['bank_verified'] = intval($user['bank_verified'] ?? 0);
    $user['is_admin'] = intval($user['is_admin'] ?? 0);
    $user['is_frozen'] = intval($user['is_frozen'] ?? 0);

    if ($adminRequired && intval($user['is_admin']) !== 1) {
        send_json(403, ['error' => 'Admin access required']);
    }

    // Note: Do NOT block frozen here. Some endpoints (login/me/home) must still work.
    return $user;
}

function ensure_not_frozen(array $user): void {
    if (intval($user['is_frozen'] ?? 0) === 1) {
        send_json(423, ['error' => 'Account is frozen']);
    }
}