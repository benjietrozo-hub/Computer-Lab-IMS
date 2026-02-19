<?php
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/helpers.php';
require_once __DIR__ . '/activity_log_helper.php';

$conn = get_db_connection();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    send_json(['success' => false, 'error' => 'Method not allowed'], 405);
}

$input = get_json_input();

// Get user info from request
$user_id = $input['user_id'] ?? null;
$user_email = $input['user_email'] ?? null;

if (!$user_id && !$user_email) {
    send_json(['success' => false, 'error' => 'User ID or email required'], 400);
}

// Get user details from database
$user = null;
if ($user_id) {
    $stmt = $conn->prepare('SELECT id, email, first_name, last_name, role FROM users WHERE id = ? LIMIT 1');
    $stmt->bind_param('i', $user_id);
    $stmt->execute();
    $result = $stmt->get_result();
    if ($result && $result->num_rows > 0) {
        $user = $result->fetch_assoc();
    }
} elseif ($user_email) {
    $stmt = $conn->prepare('SELECT id, email, first_name, last_name, role FROM users WHERE email = ? LIMIT 1');
    $stmt->bind_param('s', $user_email);
    $stmt->execute();
    $result = $stmt->get_result();
    if ($result && $result->num_rows > 0) {
        $user = $result->fetch_assoc();
    }
}

if (!$user) {
    // Even if user not found, return success (they're logging out anyway)
    send_json(['success' => true, 'message' => 'Logged out']);
    exit;
}

// Log the logout
$user_name = trim(($user['first_name'] ?? '') . ' ' . ($user['last_name'] ?? ''));
logActivity(
    'logout',
    'authentication',
    'user',
    $user['id'],
    $user_name ?: $user['email'],
    "User logged out: " . ($user_name ?: $user['email']),
    'info'
);

send_json([
    'success' => true,
    'message' => 'Logged out successfully'
]);
