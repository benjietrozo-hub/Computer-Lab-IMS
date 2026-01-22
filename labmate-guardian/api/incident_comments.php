<?php
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/helpers.php';

// Get user from request header
$headers = getallheaders();
$user_id_header = $headers['X-User-ID'] ?? '';
$user_role_header = $headers['X-User-Role'] ?? '';

if (!$user_id_header) {
    send_json(['success' => false, 'error' => 'Authentication required'], 401);
    exit;
}

$current_user_id = $user_id_header;
$current_user_role = $user_role_header;

$conn = get_db_connection();
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        handle_get($conn);
        break;
    case 'POST':
        handle_post($conn);
        break;
    case 'PUT':
        handle_put($conn);
        break;
    default:
        send_json(['success' => false, 'error' => 'Method not allowed'], 405);
}

function handle_get(mysqli $conn): void {
    global $current_user_role;
    
    // Only admins can view all comments, users can only view comments for their own incidents
    $incident_id = $_GET['incident_id'] ?? null;
    
    if (!$incident_id) {
        send_json(['success' => false, 'error' => 'Missing incident_id'], 400);
        return;
    }
    
    // Verify the incident exists
    $incident_check = "SELECT id FROM incident_reports WHERE id = ?";
    $check_stmt = $conn->prepare($incident_check);
    $check_stmt->bind_param('s', $incident_id);
    $check_stmt->execute();
    $incident_result = $check_stmt->get_result();
    
    if ($incident_result->num_rows === 0) {
        send_json(['success' => false, 'error' => 'Incident not found'], 404);
        return;
    }
    
    // Get comments with user information
    $sql = "SELECT iu.*, u.first_name, u.last_name, u.email 
            FROM incident_updates iu 
            LEFT JOIN users u ON iu.updated_by = u.id 
            WHERE iu.incident_id = ? 
            ORDER BY iu.created_at ASC";
    
    $stmt = $conn->prepare($sql);
    if (!$stmt) {
        send_json(['success' => false, 'error' => $conn->error], 500);
        return;
    }
    
    $stmt->bind_param('s', $incident_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $comments = [];
    while ($row = $result->fetch_assoc()) {
        $comments[] = [
            'id' => $row['id'],
            'incident_id' => $row['incident_id'],
            'updated_by' => $row['updated_by'],
            'updated_by_name' => trim($row['first_name'] . ' ' . $row['last_name']) ?: $row['email'],
            'update_type' => $row['update_type'],
            'message' => $row['message'],
            'created_at' => $row['created_at']
        ];
    }
    
    send_json(['success' => true, 'data' => $comments]);
}

function handle_post(mysqli $conn): void {
    global $current_user_id, $current_user_role;
    
    // Only admins can add comments
    if ($current_user_role !== 'admin') {
        send_json(['success' => false, 'error' => 'Permission denied. Only admins can add comments.'], 403);
        return;
    }
    
    $input = get_json_input();
    
    $incident_id = $conn->real_escape_string($input['incident_id'] ?? '');
    $message = $conn->real_escape_string($input['message'] ?? '');
    $update_type = $conn->real_escape_string($input['update_type'] ?? 'comment');
    
    if (!$incident_id || !$message) {
        send_json(['success' => false, 'error' => 'Missing required fields'], 400);
        return;
    }
    
    // Verify the incident exists
    $incident_check = "SELECT id, title, reported_by FROM incident_reports WHERE id = ?";
    $check_stmt = $conn->prepare($incident_check);
    $check_stmt->bind_param('s', $incident_id);
    $check_stmt->execute();
    $incident_result = $check_stmt->get_result();
    
    if ($incident_result->num_rows === 0) {
        send_json(['success' => false, 'error' => 'Incident not found'], 404);
        return;
    }
    
    $incident = $incident_result->fetch_assoc();
    
    // Validate update_type
    $valid_types = ['comment', 'status_change', 'action_taken'];
    if (!in_array($update_type, $valid_types)) {
        send_json(['success' => false, 'error' => 'Invalid update_type'], 400);
        return;
    }
    
    $comment_id = generate_uuid();
    
    $sql = "INSERT INTO incident_updates (id, incident_id, updated_by, update_type, message) VALUES (?, ?, ?, ?, ?)";
    $stmt = $conn->prepare($sql);
    if (!$stmt) {
        send_json(['success' => false, 'error' => $conn->error], 500);
        return;
    }
    
    $stmt->bind_param('ssiss', $comment_id, $incident_id, $current_user_id, $update_type, $message);
    
    if ($stmt->execute()) {
        // Send notification to the original reporter
        send_comment_notification_to_reporter($incident['reported_by'], $incident_id, $incident['title'], $message);
        
        send_json(['success' => true, 'id' => $comment_id]);
    } else {
        send_json(['success' => false, 'error' => $stmt->error], 500);
    }
}

function handle_put(mysqli $conn): void {
    global $current_user_id, $current_user_role;
    
    // Only admins can edit comments
    if ($current_user_role !== 'admin') {
        send_json(['success' => false, 'error' => 'Permission denied. Only admins can edit comments.'], 403);
        return;
    }
    
    parse_str($_SERVER['QUERY_STRING'] ?? '', $query);
    $comment_id = $query['id'] ?? null;
    
    if (!$comment_id) {
        send_json(['success' => false, 'error' => 'Missing comment id'], 400);
        return;
    }
    
    $input = get_json_input();
    $message = $conn->real_escape_string($input['message'] ?? '');
    
    if (!$message) {
        send_json(['success' => false, 'error' => 'Missing message'], 400);
        return;
    }
    
    // Check if the comment exists and belongs to the current admin
    $check_sql = "SELECT updated_by FROM incident_updates WHERE id = ?";
    $check_stmt = $conn->prepare($check_sql);
    $check_stmt->bind_param('s', $comment_id);
    $check_stmt->execute();
    $result = $check_stmt->get_result();
    
    if ($result->num_rows === 0) {
        send_json(['success' => false, 'error' => 'Comment not found'], 404);
        return;
    }
    
    $comment = $result->fetch_assoc();
    
    // Only allow the original commenter to edit
    if ($comment['updated_by'] != $current_user_id) {
        send_json(['success' => false, 'error' => 'Permission denied. You can only edit your own comments.'], 403);
        return;
    }
    
    $sql = "UPDATE incident_updates SET message = ? WHERE id = ?";
    $stmt = $conn->prepare($sql);
    if (!$stmt) {
        send_json(['success' => false, 'error' => $conn->error], 500);
        return;
    }
    
    $stmt->bind_param('ss', $message, $comment_id);
    
    if ($stmt->execute()) {
        send_json(['success' => true]);
    } else {
        send_json(['success' => false, 'error' => $stmt->error], 500);
    }
}

function generate_uuid() {
    return sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
        mt_rand(0, 0xffff), mt_rand(0, 0xffff),
        mt_rand(0, 0xffff),
        mt_rand(0, 0x0fff) | 0x4000,
        mt_rand(0, 0x3fff) | 0x8000,
        mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
    );
}

function send_comment_notification_to_reporter($reported_by_name, $incident_id, $incident_title, $comment_message) {
    global $conn;
    
    // Find user ID by name
    $user_sql = "SELECT id FROM users WHERE CONCAT(first_name, ' ', last_name) = ? OR email = ?";
    $user_stmt = $conn->prepare($user_sql);
    $user_stmt->bind_param('ss', $reported_by_name, $reported_by_name);
    $user_stmt->execute();
    $user_result = $user_stmt->get_result();
    $user = $user_result->fetch_assoc();
    
    if (!$user) return;
    
    $notification_data = [
        'type' => 'incident_comment_added',
        'incident_id' => $incident_id,
        'title' => 'New Comment on Incident Report',
        'message' => "An admin has added a comment to your incident report '{$incident_title}'",
        'incident_title' => $incident_title,
        'comment_message' => substr($comment_message, 0, 100) . (strlen($comment_message) > 100 ? '...' : ''),
        'timestamp' => date('Y-m-d H:i:s'),
        'actionUrl' => '/incidents'
    ];
    
    // Send to the user who created the report
    send_websocket_notification($user['id'], $notification_data);
}

function send_websocket_notification($user_id, $data) {
    // Save notification to database first
    save_notification_to_db($user_id, $data);
    
    // Then send via WebSocket
    $ch = curl_init();
    
    $notification = [
        'user_id' => $user_id,
        'data' => $data
    ];
    
    curl_setopt($ch, CURLOPT_URL, 'http://localhost:8082/notify');
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($notification));
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 2);
    
    curl_exec($ch);
    curl_close($ch);
}

function save_notification_to_db($user_id, $data) {
    global $conn;
    
    $notification_id = generate_uuid();
    $title = $data['title'] ?? '';
    $message = $data['message'] ?? '';
    $type = $data['type'] ?? 'general';
    $data_json = json_encode($data);
    $action_url = $data['actionUrl'] ?? null;
    
    $sql = "INSERT INTO notifications (id, user_id, title, message, type, data, action_url) VALUES (?, ?, ?, ?, ?, ?, ?)";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('sssssss', $notification_id, $user_id, $title, $message, $type, $data_json, $action_url);
    $stmt->execute();
}
?>
