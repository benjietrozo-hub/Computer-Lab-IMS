<?php
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/helpers.php';

$conn = get_db_connection();
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        handle_get($conn);
        break;
    case 'POST':
        handle_post($conn);
        break;
    default:
        send_json(['success' => false, 'error' => 'Method not allowed'], 405);
}

function handle_get(mysqli $conn): void {
    // Check if maintenance table exists, create if not
    $conn->query("CREATE TABLE IF NOT EXISTS maintenance_settings (
        id INT PRIMARY KEY DEFAULT 1,
        is_maintenance BOOLEAN DEFAULT FALSE,
        message TEXT DEFAULT 'System is currently under maintenance. Please try again later.',
        start_time DATETIME NULL,
        end_time DATETIME NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )");

    // Get maintenance settings
    $result = $conn->query('SELECT * FROM maintenance_settings WHERE id = 1');
    if (!$result) {
        send_json(['success' => false, 'error' => $conn->error], 500);
    }

    $settings = $result->fetch_assoc();
    
    if (!$settings) {
        // Insert default settings if none exist
        $conn->query("INSERT INTO maintenance_settings (id, is_maintenance, message) VALUES (1, FALSE, 'System is currently under maintenance. Please try again later.')");
        $settings = [
            'is_maintenance' => false,
            'message' => 'System is currently under maintenance. Please try again later.',
            'start_time' => null,
            'end_time' => null
        ];
    }

    send_json(['success' => true, 'data' => $settings]);
}

function handle_post(mysqli $conn): void {
    // Get user from request header for authentication
    $headers = getallheaders();
    $user_id_header = $headers['X-User-ID'] ?? '';
    $user_role_header = $headers['X-User-Role'] ?? '';

    if (!$user_id_header) {
        send_json(['success' => false, 'error' => 'Authentication required'], 401);
        return;
    }

    // Only admins can update maintenance settings
    if ($user_role_header !== 'admin') {
        send_json(['success' => false, 'error' => 'Admin access required'], 403);
        return;
    }

    $input = get_json_input();
    $is_maintenance = $input['is_maintenance'] ?? false;
    $message = $conn->real_escape_string($input['message'] ?? 'System is currently under maintenance. Please try again later.');
    $start_time = $conn->real_escape_string($input['start_time'] ?? null);
    $end_time = $conn->real_escape_string($input['end_time'] ?? null);

    // Ensure table exists
    $conn->query("CREATE TABLE IF NOT EXISTS maintenance_settings (
        id INT PRIMARY KEY DEFAULT 1,
        is_maintenance BOOLEAN DEFAULT FALSE,
        message TEXT DEFAULT 'System is currently under maintenance. Please try again later.',
        start_time DATETIME NULL,
        end_time DATETIME NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )");

    $sql = "UPDATE maintenance_settings SET is_maintenance = ?, message = ?, start_time = ?, end_time = ? WHERE id = 1";
    $stmt = $conn->prepare($sql);
    if (!$stmt) {
        send_json(['success' => false, 'error' => $conn->error], 500);
        return;
    }

    $stmt->bind_param('issss', $is_maintenance, $message, $start_time, $end_time);

    if ($stmt->execute()) {
        send_json(['success' => true]);
    } else {
        send_json(['success' => false, 'error' => $stmt->error], 500);
    }
}
?>
