<?php
require_once __DIR__ . '/../middleware/auth.php';
require_once __DIR__ . '/../helpers/db.php';
require_once __DIR__ . '/../helpers/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'PUT') {
    send_json(405, ['error' => 'Method not allowed']);
}

require_auth(true);
$input = get_json_input();
$userId = intval($input['id'] ?? 0);
if ($userId <= 0) {
    send_json(400, ['error' => 'Invalid user id']);
}

$fields = [];
$params = [];

if (isset($input['name'])) { $fields[] = 'name = ?'; $params[] = trim($input['name']); }
if (isset($input['email'])) { 
    $email = strtolower(trim($input['email']));
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) { send_json(400, ['error' => 'Invalid email']); }
    $fields[] = 'email = ?'; $params[] = $email; 
}
if (isset($input['phone'])) { $fields[] = 'phone = ?'; $params[] = trim($input['phone']); }
if (isset($input['balance'])) { $fields[] = 'balance = ?'; $params[] = floatval($input['balance']); }
if (isset($input['account_number'])) { $fields[] = 'account_number = ?'; $params[] = trim($input['account_number']); }
if (isset($input['date_of_birth'])) { $fields[] = 'date_of_birth = ?'; $params[] = trim($input['date_of_birth']) ?: null; }
if (isset($input['occupation'])) { $fields[] = 'occupation = ?'; $params[] = trim($input['occupation']); }
if (isset($input['contract_start_date'])) { $fields[] = 'contract_start_date = ?'; $params[] = trim($input['contract_start_date']) ?: null; }
if (isset($input['contract_expiry_date'])) { $fields[] = 'contract_expiry_date = ?'; $params[] = trim($input['contract_expiry_date']) ?: null; }
if (isset($input['kyc_verified'])) { $fields[] = 'kyc_verified = ?'; $params[] = intval($input['kyc_verified']) ? 1 : 0; }
if (isset($input['bank_verified'])) { $fields[] = 'bank_verified = ?'; $params[] = intval($input['bank_verified']) ? 1 : 0; }
if (isset($input['is_admin'])) { $fields[] = 'is_admin = ?'; $params[] = intval($input['is_admin']) ? 1 : 0; }

if (empty($fields)) {
    send_json(400, ['error' => 'No fields to update']);
}

try {
    $pdo = get_pdo();
    $sql = 'UPDATE users SET ' . implode(', ', $fields) . ', updated_at = NOW() WHERE id = ?';
    $params[] = $userId;
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);

    send_json(200, ['status' => 'updated']);
} catch (Throwable $e) {
    send_json(500, ['error' => 'Server error']);
}