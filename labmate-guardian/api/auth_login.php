<?php
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/helpers.php';
require_once __DIR__ . '/ActivityLogger.php';

$conn = get_db_connection();
$activityLogger = new ActivityLogger($conn);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    send_json(['success' => false, 'error' => 'Method not allowed'], 405);
}

$input = get_json_input();
$email = trim($input['email'] ?? '');
$password = $input['password'] ?? '';

if ($email === '' || $password === '') {
    send_json(['success' => false, 'error' => 'Email and password are required'], 400);
}

$stmt = $conn->prepare('SELECT id, password_hash, role, first_name, middle_name, last_name FROM users WHERE email = ? LIMIT 1');
if (!$stmt) {
    send_json(['success' => false, 'error' => $conn->error], 500);
}
$stmt->bind_param('s', $email);
$stmt->execute();
$result = $stmt->get_result();

if (!$result || $result->num_rows === 0) {
    // Log failed login attempt - user not found
    $activityLogger->log([
        'user_id' => null,
        'user_name' => null,
        'user_email' => $email,
        'user_role' => null,
        'action' => 'login_failed',
        'module' => 'authentication',
        'entity_type' => 'user',
        'entity_id' => null,
        'entity_name' => $email,
        'description' => 'Failed login attempt for: ' . $email . ' (user not found)',
        'severity' => 'warning'
    ]);
    
    send_json(['success' => false, 'error' => 'Invalid credentials'], 401);
}

$row = $result->fetch_assoc();

if (!password_verify($password, $row['password_hash'])) {
    // Log failed login attempt - wrong password
    $activityLogger->log([
        'user_id' => $row['id'],
        'user_name' => trim(($row['first_name'] ?? '') . ' ' . ($row['last_name'] ?? '')),
        'user_email' => $email,
        'user_role' => $row['role'],
        'action' => 'login_failed',
        'module' => 'authentication',
        'entity_type' => 'user',
        'entity_id' => $row['id'],
        'entity_name' => $email,
        'description' => 'Failed login attempt for: ' . $email . ' (incorrect password)',
        'severity' => 'warning'
    ]);
    
    send_json(['success' => false, 'error' => 'Invalid credentials'], 401);
}

// Prepare user data
$userData = [
    'id' => $row['id'],
    'email' => $email,
    'role' => $row['role'] ?? 'user',
    'first_name' => $row['first_name'],
    'middle_name' => $row['middle_name'],
    'last_name' => $row['last_name'],
];

// Log successful login
$activityLogger->logLogin($userData);

send_json([
    'success' => true,
    'user' => $userData,
]);
