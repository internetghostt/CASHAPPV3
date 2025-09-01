<?php
require_once __DIR__ . '/../helpers/config.php';
require_once __DIR__ . '/../helpers/db.php';
require_once __DIR__ . '/../helpers/jwt.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    send_json(405, ['error' => 'Method not allowed']);
}

$input = get_json_input();
$name = trim($input['name'] ?? '');
$email = strtolower(trim($input['email'] ?? ''));
$phone = trim($input['phone'] ?? '');
$password = $input['password'] ?? '';
$dateOfBirth = trim($input['date_of_birth'] ?? '');
$occupation = trim($input['occupation'] ?? '');

if ($name === '' || !filter_var($email, FILTER_VALIDATE_EMAIL) || $phone === '' || strlen($password) < 6 || $dateOfBirth === '' || $occupation === '') {
    send_json(400, ['error' => 'Invalid input']);
}

try {
    $pdo = get_pdo();

    $stmt = $pdo->prepare('SELECT id FROM users WHERE email = ? OR phone = ?');
    $stmt->execute([$email, $phone]);
    if ($stmt->fetch()) {
        send_json(409, ['error' => 'User already exists']);
    }

    $accountNumber = strval(random_int(1000000000, 9999999999));
    $passwordHash = password_hash($password, PASSWORD_DEFAULT);

    $stmt = $pdo->prepare('INSERT INTO users (name, email, password, phone, balance, account_number, date_of_birth, occupation, is_admin, is_frozen, created_at, updated_at) VALUES (?, ?, ?, ?, 0, ?, ?, ?, 0, 0, NOW(), NOW())');
    $stmt->execute([$name, $email, $passwordHash, $phone, $accountNumber, $dateOfBirth, $occupation]);
    $userId = intval($pdo->lastInsertId());

    $token = jwt_encode(['uid' => $userId]);

    send_json(201, [
        'token' => $token,
        'user' => [
            'id' => $userId,
            'name' => $name,
            'email' => $email,
            'phone' => $phone,
            'balance' => 0,
            'account_number' => $accountNumber,
            'date_of_birth' => $dateOfBirth,
            'occupation' => $occupation,
            'contract_start_date' => null,
            'contract_expiry_date' => null,
            'kyc_verified' => 0,
            'bank_verified' => 0,
            'is_admin' => 0,
            'is_frozen' => 0,
        ]
    ]);
} catch (Throwable $e) {
    send_json(500, ['error' => 'Server error']);
}