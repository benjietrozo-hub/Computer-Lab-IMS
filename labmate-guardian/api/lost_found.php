<?php
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/helpers.php';

// Get user from request header (simplified approach)
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
    case 'DELETE':
        handle_delete($conn);
        break;
    default:
        send_json(['success' => false, 'error' => 'Method not allowed'], 405);
}

function handle_get(mysqli $conn): void {
    $result = $conn->query('SELECT * FROM lost_found ORDER BY created_at DESC');
    if (!$result) {
        send_json(['success' => false, 'error' => $conn->error], 500);
    }

    $rows = [];
    while ($row = $result->fetch_assoc()) {
        $rows[] = $row;
    }

    send_json(['success' => true, 'data' => $rows]);
}

function handle_post(mysqli $conn): void {
    $input = get_json_input();

    $id = generate_uuid();
    $title = $conn->real_escape_string($input['title'] ?? '');
    $description = $conn->real_escape_string($input['description'] ?? '');
    $item_type = $conn->real_escape_string($input['item_type'] ?? '');
    $status = $conn->real_escape_string($input['status'] ?? 'lost');
    $location = $conn->real_escape_string($input['location'] ?? '');
    $reported_by = $conn->real_escape_string($input['reported_by'] ?? '');
    $contact_info = $conn->real_escape_string($input['contact_info'] ?? '');
    $timestamp = $conn->real_escape_string($input['timestamp'] ?? date('Y-m-d H:i:s'));
    $date_occurred = $conn->real_escape_string($input['timestamp'] ?? date('Y-m-d H:i:s')); // Keep for backward compatibility

    if (!$title || !$description || !$item_type || !$reported_by || !$timestamp) {
        send_json(['success' => false, 'error' => 'Missing required fields'], 400);
        return;
    }

    // Try to insert with timestamp first, fallback to old structure if fails
    $sql = "INSERT INTO lost_found (id, title, description, item_type, status, location, reported_by, contact_info, timestamp, date_occurred) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    $stmt = $conn->prepare($sql);
    if (!$stmt) {
        send_json(['success' => false, 'error' => $conn->error], 500);
        return;
    }

    $stmt->bind_param('ssssssssss', $id, $title, $description, $item_type, $status, $location, $reported_by, $contact_info, $timestamp, $date_occurred);

    if ($stmt->execute()) {
        // Send notifications to admins about new lost/found item
        send_lostfound_notification_to_admins($id, $title, $item_type, $status, $location, $reported_by, $timestamp);
        
        // Send confirmation notification to user who created the report
        send_lostfound_confirmation_to_user($reported_by, $id, $title, $item_type, $status, $timestamp);
        
        send_json(['success' => true, 'id' => $id]);
    } else {
        send_json(['success' => false, 'error' => $stmt->error], 500);
    }
}

function handle_put(mysqli $conn): void {
    global $current_user_id, $current_user_role;
    
    parse_str($_SERVER['QUERY_STRING'] ?? '', $query);
    $id = $query['id'] ?? null;
    if (!$id) {
        send_json(['success' => false, 'error' => 'Missing id'], 400);
        return;
    }

    // Check if user owns this item or is admin
    $check_sql = "SELECT reported_by FROM lost_found WHERE id = ?";
    $check_stmt = $conn->prepare($check_sql);
    $check_stmt->bind_param('s', $id);
    $check_stmt->execute();
    $result = $check_stmt->get_result();
    $item = $result->fetch_assoc();

    if (!$item) {
        send_json(['success' => false, 'error' => 'Lost/Found item not found'], 404);
        return;
    }

    // Find the user ID of the reporter
    $user_sql = "SELECT id FROM users WHERE CONCAT(first_name, ' ', last_name) = ? OR email = ?";
    $user_stmt = $conn->prepare($user_sql);
    $user_stmt->bind_param('ss', $item['reported_by'], $item['reported_by']);
    $user_stmt->execute();
    $user_result = $user_stmt->get_result();
    $reporter = $user_result->fetch_assoc();

    $is_owner = $reporter && $reporter['id'] == $current_user_id;
    $is_admin = $current_user_role === 'admin';

    if (!$is_owner && !$is_admin) {
        send_json(['success' => false, 'error' => 'Permission denied'], 403);
        return;
    }

    $input = get_json_input();

    $title = $conn->real_escape_string($input['title'] ?? '');
    $description = $conn->real_escape_string($input['description'] ?? '');
    $item_type = $conn->real_escape_string($input['item_type'] ?? '');
    $status = $conn->real_escape_string($input['status'] ?? 'lost');
    $location = $conn->real_escape_string($input['location'] ?? '');
    $reported_by = $conn->real_escape_string($input['reported_by'] ?? '');
    $contact_info = $conn->real_escape_string($input['contact_info'] ?? '');
    $timestamp = $conn->real_escape_string($input['timestamp'] ?? date('Y-m-d H:i:s'));
    $date_occurred = $conn->real_escape_string($input['timestamp'] ?? date('Y-m-d H:i:s')); // Keep for backward compatibility
    $date_claimed = $conn->real_escape_string($input['date_claimed'] ?? null);

    // Try to update with timestamp first
    $sql = "UPDATE lost_found SET title=?, description=?, item_type=?, status=?, location=?, reported_by=?, contact_info=?, timestamp=?, date_occurred=?, date_claimed=? WHERE id=?";
    $stmt = $conn->prepare($sql);
    if (!$stmt) {
        send_json(['success' => false, 'error' => $conn->error], 500);
    }

    $stmt->bind_param('sssssssssss', $title, $description, $item_type, $status, $location, $reported_by, $contact_info, $timestamp, $date_occurred, $date_claimed, $id);

    if ($stmt->execute()) {
        send_json(['success' => true]);
    } else {
        send_json(['success' => false, 'error' => $stmt->error], 500);
    }
}

function handle_delete(mysqli $conn): void {
    global $current_user_id, $current_user_role;
    
    parse_str($_SERVER['QUERY_STRING'] ?? '', $query);
    $id = $query['id'] ?? null;
    if (!$id) {
        send_json(['success' => false, 'error' => 'Missing id'], 400);
        return;
    }

    // Check if user owns this item or is admin
    $check_sql = "SELECT reported_by FROM lost_found WHERE id = ?";
    $check_stmt = $conn->prepare($check_sql);
    $check_stmt->bind_param('s', $id);
    $check_stmt->execute();
    $result = $check_stmt->get_result();
    $item = $result->fetch_assoc();

    if (!$item) {
        send_json(['success' => false, 'error' => 'Lost/Found item not found'], 404);
        return;
    }

    // Find the user ID of the reporter
    $user_sql = "SELECT id FROM users WHERE CONCAT(first_name, ' ', last_name) = ? OR email = ?";
    $user_stmt = $conn->prepare($user_sql);
    $user_stmt->bind_param('ss', $item['reported_by'], $item['reported_by']);
    $user_stmt->execute();
    $user_result = $user_stmt->get_result();
    $reporter = $user_result->fetch_assoc();

    $is_owner = $reporter && $reporter['id'] == $current_user_id;
    $is_admin = $current_user_role === 'admin';

    if (!$is_owner && !$is_admin) {
        send_json(['success' => false, 'error' => 'Permission denied'], 403);
        return;
    }

    $sql = "DELETE FROM lost_found WHERE id=?";
    $stmt = $conn->prepare($sql);
    if (!$stmt) {
        send_json(['success' => false, 'error' => $conn->error], 500);
        return;
    }

    $stmt->bind_param('s', $id);

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

function send_lostfound_notification_to_admins($item_id, $title, $item_type, $status, $location, $reported_by, $timestamp = null) {
    // Convert "electronics" to "gadgets" for display if needed
    $display_item_type = ($item_type === 'electronics') ? 'gadgets' : $item_type;
    
    $message = "New {$status} item reported: {$title} ({$display_item_type})";
    
    if ($location) {
        $message .= " at {$location}";
    }
    
    $message .= " by {$reported_by}";
    
    // Add timestamp info if available
    if ($timestamp) {
        $message .= " - " . date('M j, Y g:i A', strtotime($timestamp));
    }
    
    $notification_data = [
        'type' => 'new_lostfound_item',
        'item_id' => $item_id,
        'title' => 'New Lost & Found Item',
        'message' => $message,
        'item_title' => $title,
        'item_type' => $display_item_type,
        'status' => $status,
        'location' => $location,
        'reported_by' => $reported_by,
        'timestamp' => $timestamp ?? date('Y-m-d H:i:s'),
        'actionUrl' => '/lost-found'
    ];
    
    // Send to all admins
    send_websocket_notification('admin_broadcast', $notification_data);
    
    // Also save to database for admin users
    global $conn;
    $admin_sql = "SELECT id FROM users WHERE role = 'admin'";
    $admin_result = $conn->query($admin_sql);
    
    while ($admin = $admin_result->fetch_assoc()) {
        save_notification_to_db($admin['id'], $notification_data);
    }
}

function send_lostfound_confirmation_to_user($reported_by_name, $item_id, $title, $item_type, $status, $timestamp = null) {
    // Find user ID by name
    global $conn;
    $user_sql = "SELECT id FROM users WHERE CONCAT(first_name, ' ', last_name) = ? OR email = ?";
    $user_stmt = $conn->prepare($user_sql);
    $user_stmt->bind_param('ss', $reported_by_name, $reported_by_name);
    $user_stmt->execute();
    $user_result = $user_stmt->get_result();
    $user = $user_result->fetch_assoc();
    
    if (!$user) return;
    
    // Convert "electronics" to "gadgets" for display if needed
    $display_item_type = ($item_type === 'electronics') ? 'gadgets' : $item_type;
    
    $message = "Your {$status} item '{$title}' ({$display_item_type}) has been submitted successfully";
    
    // Add timestamp info if available
    if ($timestamp) {
        $message .= " - Reported: " . date('M j, Y g:i A', strtotime($timestamp));
    }
    
    $notification_data = [
        'type' => 'lostfound_item_submitted',
        'item_id' => $item_id,
        'title' => 'Lost & Found Item Submitted',
        'message' => $message,
        'item_title' => $title,
        'item_type' => $display_item_type,
        'status' => $status,
        'timestamp' => $timestamp ?? date('Y-m-d H:i:s'),
        'actionUrl' => '/lost-found'
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
    
    $response = curl_exec($ch);
    $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    // Log for debugging
    error_log("WebSocket notification sent: user_id=$user_id, type={$data['type']}, response_code=$http_code, response=$response");
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
