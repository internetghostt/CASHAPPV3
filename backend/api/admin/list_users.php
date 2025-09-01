<?php
require_once __DIR__ . '/../middleware/auth.php';
require_once __DIR__ . '/../helpers/db.php';
require_once __DIR__ . '/../helpers/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    send_json(405, ['error' => 'Method not allowed']);
}

require_auth(true);

try {
    $pdo = get_pdo();
    $stmt = $pdo->query('SELECT id, name, email, phone, balance, account_number, date_of_birth, occupation, contract_start_date, contract_expiry_date, kyc_verified, bank_verified, is_admin, is_frozen, created_at FROM users ORDER BY created_at DESC LIMIT 500');
    $rows = $stmt->fetchAll();
    send_json(200, ['users' => $rows]);
} catch (Throwable $e) {
    send_json(500, ['error' => 'Server error']);
}