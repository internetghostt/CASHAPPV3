<?php
require_once __DIR__ . '/../middleware/auth.php';
require_once __DIR__ . '/../helpers/db.php';
require_once __DIR__ . '/../helpers/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    send_json(405, ['error' => 'Method not allowed']);
}

$sender = require_auth(false);
ensure_not_frozen($sender);
$input = get_json_input();
$recipientIdentifier = trim($input['recipient'] ?? '');
$amount = floatval($input['amount'] ?? 0);

if ($recipientIdentifier === '' || $amount <= 0) {
    send_json(400, ['error' => 'Invalid input']);
}

try {
    $pdo = get_pdo();

    // Find recipient by email or account number
    $stmt = $pdo->prepare('SELECT id, is_frozen FROM users WHERE email = ? OR account_number = ? LIMIT 1');
    $stmt->execute([$recipientIdentifier, $recipientIdentifier]);
    $recipient = $stmt->fetch();
    if (!$recipient) {
        send_json(404, ['error' => 'Recipient not found']);
    }
    if (intval($recipient['id']) === intval($sender['id'])) {
        send_json(400, ['error' => 'Cannot send to self']);
    }
    if (intval($recipient['is_frozen']) === 1) {
        send_json(423, ['error' => 'Recipient is frozen']);
    }

    $pdo->beginTransaction();

    // Lock rows for update
    $stmt = $pdo->prepare('SELECT id, balance FROM users WHERE id = ? FOR UPDATE');
    $stmt->execute([$sender['id']]);
    $rowSender = $stmt->fetch();

    $stmt = $pdo->prepare('SELECT id, balance FROM users WHERE id = ? FOR UPDATE');
    $stmt->execute([$recipient['id']]);
    $rowRecipient = $stmt->fetch();

    if (!$rowSender || !$rowRecipient) {
        $pdo->rollBack();
        send_json(404, ['error' => 'Users not found']);
    }

    $senderBalance = (float)$rowSender['balance'];
    if ($senderBalance < $amount) {
        $pdo->rollBack();
        send_json(400, ['error' => 'Insufficient balance']);
    }

    $newSenderBalance = $senderBalance - $amount;
    $newRecipientBalance = (float)$rowRecipient['balance'] + $amount;

    $stmt = $pdo->prepare('UPDATE users SET balance = ?, updated_at = NOW() WHERE id = ?');
    $stmt->execute([$newSenderBalance, $sender['id']]);

    $stmt = $pdo->prepare('UPDATE users SET balance = ?, updated_at = NOW() WHERE id = ?');
    $stmt->execute([$newRecipientBalance, $recipient['id']]);

    $stmt = $pdo->prepare('INSERT INTO transactions (sender_id, recipient_id, amount, status, created_at) VALUES (?, ?, ?, ?, NOW())');
    $stmt->execute([$sender['id'], $recipient['id'], $amount, 'completed']);

    $pdo->commit();

    send_json(200, [
        'status' => 'success',
        'balance' => $newSenderBalance,
    ]);
} catch (Throwable $e) {
    if ($pdo && $pdo->inTransaction()) {
        $pdo->rollBack();
    }
    send_json(500, ['error' => 'Server error']);
}