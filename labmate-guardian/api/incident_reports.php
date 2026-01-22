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
    $result = $conn->query('SELECT * FROM incident_reports ORDER BY created_at DESC');
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
    $name = $conn->real_escape_string($input['name'] ?? '');
    $title = $conn->real_escape_string($input['name'] ?? ''); // Keep title for backward compatibility
    $description = $conn->real_escape_string($input['description'] ?? '');
    $incident_type = $conn->real_escape_string($input['incident_type'] ?? '');
    $severity = $conn->real_escape_string($input['severity'] ?? 'medium');
    $location = $conn->real_escape_string($input['location'] ?? '');
    $reported_by = $conn->real_escape_string($input['reported_by'] ?? '');
    $hardware_type = $conn->real_escape_string($input['hardware_type'] ?? '');
    $hardware_damage = $conn->real_escape_string($input['hardware_damage'] ?? '');
    $timestamp = $conn->real_escape_string($input['timestamp'] ?? date('Y-m-d H:i:s'));
    $date_occurred = $conn->real_escape_string($input['timestamp'] ?? date('Y-m-d H:i:s')); // Keep for backward compatibility

    if (!$name || !$description || !$incident_type || !$reported_by) {
        send_json(['success' => false, 'error' => 'Missing required fields'], 400);
        return;
    }

    // Try to insert with new fields first, fallback to old structure if fails
    $sql = "INSERT INTO incident_reports (id, name, title, description, incident_type, severity, location, reported_by, hardware_type, hardware_damage, timestamp, date_occurred) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    $stmt = $conn->prepare($sql);
    if (!$stmt) {
        send_json(['success' => false, 'error' => $conn->error], 500);
        return;
    }

    $stmt->bind_param('ssssssssssss', $id, $name, $title, $description, $incident_type, $severity, $location, $reported_by, $hardware_type, $hardware_damage, $timestamp, $date_occurred);

    if ($stmt->execute()) {
        // Send notifications to admins about new incident report
        send_incident_notification_to_admins($id, $name, $incident_type, $severity, $location, $reported_by, $hardware_type, $hardware_damage);
        
        // Send confirmation notification to the user who created the report
        send_incident_confirmation_to_user($reported_by, $id, $name, $incident_type, $hardware_type, $hardware_damage);
        
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

    // Check if user owns this incident or is admin
    $check_sql = "SELECT reported_by FROM incident_reports WHERE id = ?";
    $check_stmt = $conn->prepare($check_sql);
    $check_stmt->bind_param('s', $id);
    $check_stmt->execute();
    $result = $check_stmt->get_result();
    $incident = $result->fetch_assoc();

    if (!$incident) {
        send_json(['success' => false, 'error' => 'Incident report not found'], 404);
        return;
    }

    // Find the user ID of the reporter
    $user_sql = "SELECT id FROM users WHERE CONCAT(first_name, ' ', last_name) = ? OR email = ?";
    $user_stmt = $conn->prepare($user_sql);
    $user_stmt->bind_param('ss', $incident['reported_by'], $incident['reported_by']);
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

    $name = $conn->real_escape_string($input['name'] ?? '');
    $title = $conn->real_escape_string($input['name'] ?? ''); // Keep title for backward compatibility
    $description = $conn->real_escape_string($input['description'] ?? '');
    $incident_type = $conn->real_escape_string($input['incident_type'] ?? '');
    $severity = $conn->real_escape_string($input['severity'] ?? 'medium');
    $location = $conn->real_escape_string($input['location'] ?? '');
    $reported_by = $conn->real_escape_string($input['reported_by'] ?? '');
    $hardware_type = $conn->real_escape_string($input['hardware_type'] ?? '');
    $hardware_damage = $conn->real_escape_string($input['hardware_damage'] ?? '');
    $timestamp = $conn->real_escape_string($input['timestamp'] ?? date('Y-m-d H:i:s'));
    $date_occurred = $conn->real_escape_string($input['timestamp'] ?? date('Y-m-d H:i:s')); // Keep for backward compatibility

    // Try to update with new fields first
    $sql = "UPDATE incident_reports SET name=?, title=?, description=?, incident_type=?, severity=?, location=?, reported_by=?, hardware_type=?, hardware_damage=?, timestamp=?, date_occurred=? WHERE id=?";
    $stmt = $conn->prepare($sql);
    if (!$stmt) {
        send_json(['success' => false, 'error' => $conn->error], 500);
    }

    $stmt->bind_param('ssssssssssss', $name, $title, $description, $incident_type, $severity, $location, $reported_by, $hardware_type, $hardware_damage, $timestamp, $date_occurred, $id);

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

    // Check if user owns this incident or is admin
    $check_sql = "SELECT reported_by FROM incident_reports WHERE id = ?";
    $check_stmt = $conn->prepare($check_sql);
    $check_stmt->bind_param('s', $id);
    $check_stmt->execute();
    $result = $check_stmt->get_result();
    $incident = $result->fetch_assoc();

    if (!$incident) {
        send_json(['success' => false, 'error' => 'Incident report not found'], 404);
        return;
    }

    // Find the user ID of the reporter
    $user_sql = "SELECT id FROM users WHERE CONCAT(first_name, ' ', last_name) = ? OR email = ?";
    $user_stmt = $conn->prepare($user_sql);
    $user_stmt->bind_param('ss', $incident['reported_by'], $incident['reported_by']);
    $user_stmt->execute();
    $user_result = $user_stmt->get_result();
    $reporter = $user_result->fetch_assoc();

    $is_owner = $reporter && $reporter['id'] == $current_user_id;
    $is_admin = $current_user_role === 'admin';

    if (!$is_owner && !$is_admin) {
        send_json(['success' => false, 'error' => 'Permission denied'], 403);
        return;
    }

    $sql = "DELETE FROM incident_reports WHERE id=?";
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

function send_incident_notification_to_admins($incident_id, $name, $incident_type, $severity, $location, $reported_by, $hardware_type = null, $hardware_damage = null) {
    $message = "New incident reported: {$name} ({$incident_type} - {$severity})";
    
    // Add hardware details if available
    if ($incident_type === 'hardware' && $hardware_type && $hardware_damage) {
        $message .= " - {$hardware_type}: {$hardware_damage}";
    }
    
    if ($location) {
        $message .= " at {$location}";
    }
    
    $message .= " by {$reported_by}";
    
    $notification_data = [
        'type' => 'new_incident_report',
        'incident_id' => $incident_id,
        'title' => 'New Incident Report',
        'message' => $message,
        'incident_title' => $name,
        'incident_type' => $incident_type,
        'severity' => $severity,
        'location' => $location,
        'reported_by' => $reported_by,
        'hardware_type' => $hardware_type,
        'hardware_damage' => $hardware_damage,
        'timestamp' => date('Y-m-d H:i:s'),
        'actionUrl' => '/incidents'
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

function send_incident_confirmation_to_user($reported_by_name, $incident_id, $name, $incident_type, $hardware_type = null, $hardware_damage = null) {
    // Find user ID by name
    global $conn;
    $user_sql = "SELECT id FROM users WHERE CONCAT(first_name, ' ', last_name) = ? OR email = ?";
    $user_stmt = $conn->prepare($user_sql);
    $user_stmt->bind_param('ss', $reported_by_name, $reported_by_name);
    $user_stmt->execute();
    $user_result = $user_stmt->get_result();
    $user = $user_result->fetch_assoc();
    
    if (!$user) return;
    
    $message = "Your incident report '{$name}' ({$incident_type}) has been submitted successfully";
    
    // Add hardware details to confirmation if available
    if ($incident_type === 'hardware' && $hardware_type && $hardware_damage) {
        $message .= " - {$hardware_type}: {$hardware_damage}";
    }
    
    $notification_data = [
        'type' => 'incident_report_submitted',
        'incident_id' => $incident_id,
        'title' => 'Incident Report Submitted',
        'message' => $message,
        'incident_title' => $name,
        'incident_type' => $incident_type,
        'hardware_type' => $hardware_type,
        'hardware_damage' => $hardware_damage,
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
