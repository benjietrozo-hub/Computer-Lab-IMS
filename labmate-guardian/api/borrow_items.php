<?php
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/helpers.php';

$origin = $_SERVER['HTTP_ORIGIN'] ?? '*';
header("Access-Control-Allow-Origin: $origin");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

$method = $_SERVER['REQUEST_METHOD'];
if ($method === 'OPTIONS') {
    send_json(['success' => true]);
}

$conn = get_db_connection();

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
    $result = $conn->query('SELECT * FROM borrow_items ORDER BY created_at DESC');
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

    // Generate UUID for the new record
    $id = $conn->real_escape_string(generate_uuid());
    $borrower_name = $conn->real_escape_string($input['borrower_name'] ?? '');
    $item = $conn->real_escape_string($input['item'] ?? '');
    $quantity = (int)($input['quantity'] ?? 1);
    $borrow_date = $conn->real_escape_string($input['borrow_date'] ?? '');
    $return_date = $conn->real_escape_string($input['return_date'] ?? null);
    $status = $conn->real_escape_string($input['status'] ?? 'pending');
    $created_by = $conn->real_escape_string($input['created_by'] ?? null);

    $sql = "INSERT INTO borrow_items (id, borrower_name, item, quantity, borrow_date, return_date, status, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
    $stmt = $conn->prepare($sql);
    if (!$stmt) {
        send_json(['success' => false, 'error' => $conn->error], 500);
    }

    $stmt->bind_param('sssissss', $id, $borrower_name, $item, $quantity, $borrow_date, $return_date, $status, $created_by);

    if (!$stmt->execute()) {
        send_json(['success' => false, 'error' => $stmt->error], 500);
    }

    // Send notification to admins about new borrow request
    send_admin_notification($conn, $borrower_name, $item, $quantity, $id);

    send_json(['success' => true]);
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

function handle_put(mysqli $conn): void {
    parse_str($_SERVER['QUERY_STRING'] ?? '', $query);
    $id = $query['id'] ?? null;
    if (!$id) {
        send_json(['success' => false, 'error' => 'Missing id'], 400);
    }

    $input = get_json_input();
    
    // Get current record
    $current_sql = "SELECT * FROM borrow_items WHERE id=?";
    $current_stmt = $conn->prepare($current_sql);
    $current_stmt->bind_param('s', $id);
    $current_stmt->execute();
    $current_result = $current_stmt->get_result();
    $current_record = $current_result->fetch_assoc();

    if (!$current_record) {
        send_json(['success' => false, 'error' => 'Record not found'], 404);
        return;
    }

    $status = $input['status'] ?? $current_record['status'];
    $return_condition = $input['return_condition'] ?? 'good';
    $return_comments = $input['return_notes'] ?? '';
    $admin_id = $input['admin_id'] ?? null;

    // Only process return workflow if status is changing to 'returned'
    if ($status === 'returned' && $current_record['status'] !== 'returned') {
        // Verify admin password for return confirmation
        $admin_password = $input['admin_password'] ?? null;
        if (!$admin_password) {
            send_json(['success' => false, 'error' => 'Admin password required for return confirmation'], 400);
        }
        
        $admin_sql = "SELECT password_hash FROM users WHERE id = ? AND role IN ('admin', 'staff')";
        $admin_stmt = $conn->prepare($admin_sql);
        $admin_stmt->bind_param('s', $admin_id);
        $admin_stmt->execute();
        $admin_result = $admin_stmt->get_result();
        $admin_user = $admin_result->fetch_assoc();
        $admin_stmt->close();
        
        if (!$admin_user || !password_verify($admin_password, $admin_user['password_hash'])) {
            send_json(['success' => false, 'error' => 'Invalid admin password'], 401);
        }
        
        $conn->begin_transaction();
        
        try {
            // Step 1: Update borrow_items record
            $update_sql = "UPDATE borrow_items SET 
                status = 'returned', 
                return_condition = ?, 
                return_comments = ?, 
                return_processed_at = NOW(),
                return_processed_by = ?
                WHERE id = ?";
            
            $update_stmt = $conn->prepare($update_sql);
            $update_stmt->bind_param('ssss', $return_condition, $return_comments, $admin_id, $id);
            $update_stmt->execute();
            
            // Step 2: Handle inventory based on condition
            if ($return_condition === 'good') {
                // Update inventory - increase quantity
                update_inventory_quantity($conn, $current_record['item'], $current_record['quantity']);
            } else {
                // Add to repair/maintenance
                add_to_repair_maintenance($conn, $current_record, $return_condition, $return_comments, $admin_id);
            }
            
            // Step 3: Log activity
            log_return_activity($conn, $current_record, $return_condition, $return_comments, $admin_id);
            
            // Step 4: Send notifications
            send_return_notifications($conn, $current_record, $return_condition, $return_comments);
            
            $conn->commit();
            send_json(['success' => true, 'message' => 'Item returned successfully']);
            
        } catch (Exception $e) {
            $conn->rollback();
            send_json(['success' => false, 'error' => 'Return processing failed: ' . $e->getMessage()], 500);
        }
    } else {
        // Regular update for other fields
        $sql = "UPDATE borrow_items SET status=? WHERE id=?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param('ss', $status, $id);
        $stmt->execute();
        send_json(['success' => true]);
    }
}

function update_inventory_quantity(mysqli $conn, $item_name, $quantity) {
    // Get equipment ID first
    $equipment_sql = "SELECT id, quantity FROM inventory_equipment WHERE name = ?";
    $equipment_stmt = $conn->prepare($equipment_sql);
    $equipment_stmt->bind_param('s', $item_name);
    $equipment_stmt->execute();
    $equipment_result = $equipment_stmt->get_result();
    $equipment = $equipment_result->fetch_assoc();
    $equipment_stmt->close();
    
    if (!$equipment) {
        error_log("Equipment not found: $item_name");
        return;
    }
    
    // Update inventory quantity
    $sql = "UPDATE inventory_equipment SET quantity = quantity + ? WHERE name = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('is', $quantity, $item_name);
    $stmt->execute();
    $stmt->close();
    
    // Get the new total quantity
    $new_quantity_sql = "SELECT quantity FROM inventory_equipment WHERE id = ?";
    $new_quantity_stmt = $conn->prepare($new_quantity_sql);
    $new_quantity_stmt->bind_param('s', $equipment['id']);
    $new_quantity_stmt->execute();
    $new_quantity_result = $new_quantity_stmt->get_result();
    $new_quantity_row = $new_quantity_result->fetch_assoc();
    $new_quantity_stmt->close();
    
    if ($new_quantity_row && function_exists('process_borrow_waiting_list')) {
        process_borrow_waiting_list($conn, $equipment['id'], $new_quantity_row['quantity']);
    }
}

function add_to_repair_maintenance(mysqli $conn, $borrow_record, $condition, $comments, $admin_id) {
    $id = generate_uuid();
    $item_name = $borrow_record['item'];
    $condition_status = $condition === 'damaged' ? 'damaged' : 'needs_repair';
    
    $borrower_id_number = null;
    $user_sql = "SELECT id_number FROM users WHERE email=? OR CONCAT(first_name, ' ', last_name) = ?";
    $user_stmt = $conn->prepare($user_sql);
    if ($user_stmt) {
        $user_stmt->bind_param('ss', $borrow_record['borrower_email'], $borrow_record['borrower_name']);
        $user_stmt->execute();
        $user_result = $user_stmt->get_result();
        $user = $user_result->fetch_assoc();
        $user_stmt->close();
        if ($user && isset($user['id_number']) && $user['id_number'] !== null && $user['id_number'] !== '') {
            $borrower_id_number = $user['id_number'];
        }
    }
    
    $borrower_label = $borrow_record['borrower_name'];
    if ($borrower_id_number) {
        $borrower_label .= " (ID: {$borrower_id_number})";
    }
    
    $description = "Item returned from borrow record ID: {$borrow_record['id']} by {$borrower_label}. Comments: $comments";
    
    $sql = "INSERT INTO repair_maintenance (id, date, equipment_name, serial_number, issue_description, status, created_by) 
            VALUES (?, CURDATE(), ?, NULL, ?, 'Pending', ?)";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('ssss', $id, $item_name, $description, $admin_id);
    $stmt->execute();
}

function log_return_activity(mysqli $conn, $borrow_record, $condition, $comments, $admin_id) {
    $id = generate_uuid();
    $action_type = 'item_return';
    $description = "Admin processed return of '{$borrow_record['item']}' (Qty: {$borrow_record['quantity']}) from {$borrow_record['borrower_name']}. Condition: $condition";
    
    $details = [
        'borrow_record_id' => $borrow_record['id'],
        'item' => $borrow_record['item'],
        'quantity' => $borrow_record['quantity'],
        'borrower_name' => $borrow_record['borrower_name'],
        'borrower_email' => $borrow_record['borrower_email'],
        'return_condition' => $condition,
        'return_comments' => $comments,
        'admin_id' => $admin_id
    ];
    
    $ip = $_SERVER['REMOTE_ADDR'] ?? '';
    $user_agent = $_SERVER['HTTP_USER_AGENT'] ?? '';
    
    $sql = "INSERT INTO activity_logs (id, user_id, action_type, action_description, related_item_type, related_item_id, details, ip_address, user_agent) 
            VALUES (?, ?, ?, ?, 'borrow_item', ?, ?, ?, ?)";
    
    $stmt = $conn->prepare($sql);
    $details_json = json_encode($details);
    $stmt->bind_param('ssssssss', $id, $admin_id, $action_type, $description, $borrow_record['id'], $details_json, $ip, $user_agent);
    $stmt->execute();
}

function send_return_notifications(mysqli $conn, $borrow_record, $condition, $comments) {
    // Get borrower user ID
    $user_sql = "SELECT id FROM users WHERE email=? OR CONCAT(first_name, ' ', last_name) = ?";
    $user_stmt = $conn->prepare($user_sql);
    $user_stmt->bind_param('ss', $borrow_record['borrower_email'], $borrow_record['borrower_name']);
    $user_stmt->execute();
    $user_result = $user_stmt->get_result();
    $user = $user_result->fetch_assoc();
    
    if ($user) {
        // Send notification to borrower
        $notification_data = [
            'type' => 'borrow_return_processed',
            'borrow_record_id' => $borrow_record['id'],
            'item' => $borrow_record['item'],
            'quantity' => $borrow_record['quantity'],
            'return_condition' => $condition,
            'return_comments' => $comments,
            'user_id' => $user['id'],
            'timestamp' => date('Y-m-d H:i:s'),
            'title' => 'Item Return Processed',
            'message' => "Your return of {$borrow_record['quantity']} x {$borrow_record['item']} has been processed. Condition: $condition",
            'actionUrl' => '/my-borrows'
        ];
        
        send_websocket_notification($user['id'], $notification_data);
    }
    
    // If item needs repair, notify maintenance team
    if ($condition !== 'good') {
        notify_maintenance_team($conn, $borrow_record, $condition, $comments);
    }
}

function notify_maintenance_team(mysqli $conn, $borrow_record, $condition, $comments) {
    // Get maintenance team users (assuming role 'maintenance' or 'admin')
    $maintenance_sql = "SELECT id FROM users WHERE role IN ('maintenance', 'admin')";
    $maintenance_stmt = $conn->prepare($maintenance_sql);
    $maintenance_stmt->execute();
    $maintenance_result = $maintenance_stmt->get_result();
    
    $borrower_id_number = null;
    $user_sql = "SELECT id_number FROM users WHERE email=? OR CONCAT(first_name, ' ', last_name) = ?";
    $user_stmt = $conn->prepare($user_sql);
    if ($user_stmt) {
        $user_stmt->bind_param('ss', $borrow_record['borrower_email'], $borrow_record['borrower_name']);
        $user_stmt->execute();
        $user_result = $user_stmt->get_result();
        $user = $user_result->fetch_assoc();
        $user_stmt->close();
        if ($user && isset($user['id_number']) && $user['id_number'] !== null && $user['id_number'] !== '') {
            $borrower_id_number = $user['id_number'];
        }
    }
    
    $borrower_label = $borrow_record['borrower_name'];
    if ($borrower_id_number) {
        $borrower_label .= " (ID: {$borrower_id_number})";
    }
    
    while ($maintenance_user = $maintenance_result->fetch_assoc()) {
        $notification_data = [
            'type' => 'repair_needed',
            'borrow_record_id' => $borrow_record['id'],
            'item' => $borrow_record['item'],
            'quantity' => $borrow_record['quantity'],
            'condition' => $condition,
            'comments' => $comments,
            'borrower_name' => $borrower_label,
            'borrower_id_number' => $borrower_id_number,
            'user_id' => $maintenance_user['id'],
            'timestamp' => date('Y-m-d H:i:s'),
            'title' => 'Item Needs Repair',
            'message' => "{$borrow_record['item']} returned with condition: $condition by {$borrower_label}. Comments: $comments",
            'actionUrl' => '/maintenance'
        ];
        
        send_websocket_notification($maintenance_user['id'], $notification_data);
    }
}

function handle_delete(mysqli $conn): void {
    parse_str($_SERVER['QUERY_STRING'] ?? '', $query);
    $id = $query['id'] ?? null;
    if (!$id) {
        send_json(['success' => false, 'error' => 'Missing id'], 400);
    }

    $sql = "DELETE FROM borrow_items WHERE id=?";
    $stmt = $conn->prepare($sql);
    if (!$stmt) {
        send_json(['success' => false, 'error' => $conn->error], 500);
    }

    $stmt->bind_param('s', $id);

    if (!$stmt->execute()) {
        send_json(['success' => false, 'error' => $stmt->error], 500);
    }

    send_json(['success' => true]);
}

function send_borrow_notification($borrow_record, $new_status, $rejection_reason = null) {
    // Get borrower user ID
    global $conn;
    $user_sql = "SELECT id FROM users WHERE email=? OR CONCAT(first_name, ' ', last_name) = ?";
    $user_stmt = $conn->prepare($user_sql);
    $user_stmt->bind_param('ss', $borrow_record['borrower_email'], $borrow_record['borrower_name']);
    $user_stmt->execute();
    $user_result = $user_stmt->get_result();
    $user = $user_result->fetch_assoc();
    
    if (!$user) {
        return;
    }

    $condition = $borrow_record['return_condition'] ?? 'good';
    $notes = $borrow_record['return_notes'] ?? '';
    $returned_on = $borrow_record['actual_return_date'] ?? null;

    $title = $new_status === 'returned' ? 'Item Returned' : 'Borrow Status Update';
    $message_parts = [];
    $message_parts[] = "Your borrowed item '{$borrow_record['item']}' has been marked as {$new_status}.";
    if ($returned_on) {
        $message_parts[] = "Returned on: " . (new DateTime($returned_on))->format('M j, Y');
    }
    if ($condition) {
        $message_parts[] = "Condition: {$condition}";
    }
    if ($notes) {
        $message_parts[] = "Notes: {$notes}";
    }
    $message_parts[] = "Quantity: {$borrow_record['quantity']}";
    $message = implode(' | ', $message_parts);

    $notification_data = [
        'type' => 'borrow_status_update',
        'borrow_id' => $borrow_record['id'],
        'item' => $borrow_record['item'],
        'quantity' => $borrow_record['quantity'],
        'old_status' => $borrow_record['status'],
        'new_status' => $new_status,
        'rejection_reason' => $rejection_reason,
        'return_condition' => $condition,
        'return_notes' => $notes,
        'returned_on' => $returned_on,
        'user_id' => $user['id'],
        'timestamp' => date('Y-m-d H:i:s'),
        'title' => $title,
        'message' => $message,
        'actionUrl' => '/my-borrows'
    ];

    // Send WebSocket notification
    send_websocket_notification($user['id'], $notification_data);
    
    // Also notify admins about status changes
    notify_admins_about_borrow_update($notification_data);
}

function notify_admins_about_borrow_update($notification_data) {
    global $conn;
    
    // Get all admin users
    $admin_sql = "SELECT id FROM users WHERE role='admin'";
    $admin_result = $conn->query($admin_sql);
    
    while ($admin = $admin_result->fetch_assoc()) {
        $admin_notification = [
            'type' => 'admin_borrow_update',
            ...$notification_data
        ];
        send_websocket_notification($admin['id'], $admin_notification);
    }
}

function send_admin_notification($conn, $borrower_name, $item, $quantity, $borrow_id) {
    $notification_data = [
        'item' => $item,
        'quantity' => $quantity,
        'borrower_name' => $borrower_name,
        'borrow_id' => $borrow_id,
        'new_status' => 'pending', // Add status for proper WebSocket handling
        'old_status' => null,
        'user_id' => null, // Not applicable for admin notifications of new requests
        'timestamp' => date('Y-m-d H:i:s'),
        'title' => 'New Borrow Request',
        'message' => "{$borrower_name} has requested to borrow {$quantity} x {$item}",
        'actionUrl' => '/borrow-items'
    ];
    
    notify_admins_about_borrow_update($notification_data);
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
    
    $id = generate_uuid();
    $title = $data['title'] ?? 'Notification';
    $message = $data['message'] ?? '';
    $type = $data['type'] ?? 'general';
    $action_url = $data['actionUrl'] ?? null;
    $data_json = json_encode($data);
    
    $sql = "INSERT INTO notifications (id, user_id, title, message, type, data, action_url) VALUES (?, ?, ?, ?, ?, ?, ?)";
    $stmt = $conn->prepare($sql);
    
    if ($stmt) {
        $stmt->bind_param('sssssss', $id, $user_id, $title, $message, $type, $data_json, $action_url);
        $stmt->execute();
        $stmt->close();
    }
}

function send_websocket_notification_to_admins($data) {
    global $conn;
    
    // Get all admin users
    $admin_sql = "SELECT id FROM users WHERE role='admin'";
    $admin_result = $conn->query($admin_sql);
    
    while ($admin = $admin_result->fetch_assoc()) {
        send_websocket_notification($admin['id'], $data);
    }
}
?>
