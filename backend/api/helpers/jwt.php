<?php
require_once __DIR__ . '/config.php';

function base64url_encode(string $data): string {
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}

function base64url_decode(string $data): string {
    $remainder = strlen($data) % 4;
    if ($remainder) {
        $padlen = 4 - $remainder;
        $data .= str_repeat('=', $padlen);
    }
    return base64_decode(strtr($data, '-_', '+/'));
}

function jwt_encode(array $payload): string {
    global $JWT_SECRET, $JWT_ISSUER, $JWT_TTL_SECONDS;
    $header = ['alg' => 'HS256', 'typ' => 'JWT'];
    $now = time();
    $payload = array_merge([
        'iss' => $JWT_ISSUER,
        'iat' => $now,
        'exp' => $now + $JWT_TTL_SECONDS,
    ], $payload);

    $segments = [
        base64url_encode(json_encode($header)),
        base64url_encode(json_encode($payload)),
    ];
    $signing_input = implode('.', $segments);
    $signature = hash_hmac('sha256', $signing_input, $JWT_SECRET, true);
    $segments[] = base64url_encode($signature);
    return implode('.', $segments);
}

function jwt_decode(string $jwt): array {
    global $JWT_SECRET, $JWT_ISSUER;
    $parts = explode('.', $jwt);
    if (count($parts) !== 3) {
        throw new Exception('Invalid token format');
    }
    [$header64, $payload64, $signature64] = $parts;
    $header = json_decode(base64url_decode($header64), true);
    $payload = json_decode(base64url_decode($payload64), true);
    $signature = base64url_decode($signature64);

    if (!is_array($header) || !is_array($payload)) {
        throw new Exception('Invalid token');
    }
    if (($header['alg'] ?? '') !== 'HS256') {
        throw new Exception('Unsupported alg');
    }

    $signing_input = $header64 . '.' . $payload64;
    $expected = hash_hmac('sha256', $signing_input, $JWT_SECRET, true);
    if (!hash_equals($expected, $signature)) {
        throw new Exception('Invalid signature');
    }

    $now = time();
    if (($payload['exp'] ?? 0) < $now) {
        throw new Exception('Token expired');
    }
    if (($payload['iss'] ?? '') !== $JWT_ISSUER) {
        throw new Exception('Invalid issuer');
    }

    return $payload;
}