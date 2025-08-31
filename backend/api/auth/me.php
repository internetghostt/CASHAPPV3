<?php
require_once __DIR__ . '/../middleware/auth.php';
require_once __DIR__ . '/../helpers/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    send_json(405, ['error' => 'Method not allowed']);
}

$user = require_auth(false);

send_json(200, ['user' => $user]);