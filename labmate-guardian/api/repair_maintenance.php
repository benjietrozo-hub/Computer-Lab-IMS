<?php
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/helpers.php';
require_once __DIR__ . '/trash/TrashService.php';
require_once __DIR__ . '/activity_log_helper.php';

// Set CORS headers
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Max-Age: 3600");
header("Content-Type: application/json");

// Handle CORS preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    send_json(['success' => true]);
}

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
    $result = $conn->query('SELECT * FROM repair_maintenance WHERE deleted_at IS NULL ORDER BY created_at DESC');
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

    $date = $conn->real_escape_string($input['date'] ?? '');
    $equipment_name = $conn->real_escape_string($input['equipment_name'] ?? '');
    $serial_number = $conn->real_escape_string($input['serial_number'] ?? '');
    $issue_description = $conn->real_escape_string($input['issue_description'] ?? '');
    $action_taken = $conn->real_escape_string($input['action_taken'] ?? '');
    $technician_name = $conn->real_escape_string($input['technician_name'] ?? '');
    $status = $conn->real_escape_string($input['status'] ?? 'Pending');
    $created_by = $conn->real_escape_string($input['created_by'] ?? '');

    $sql = "INSERT INTO repair_maintenance (id, date, equipment_name, serial_number, issue_description, action_taken, technician_name, status, created_by, created_at) VALUES (UUID(),?,?,?,?,?,?,?,?,NOW())";
    $stmt = $conn->prepare($sql);
    if (!$stmt) {
        send_json(['success' => false, 'error' => $conn->error], 500);
    }

    $stmt->bind_param('ssssssss', $date, $equipment_name, $serial_number, $issue_description, $action_taken, $technician_name, $status, $created_by);

    if (!$stmt->execute()) {
        send_json(['success' => false, 'error' => $stmt->error], 500);
    }

    $repair_id = $stmt->insert_id;

    // Log repair creation
    logCreate('repair_maintenance', 'repair_maintenance', $repair_id, $equipment_name, [
        'status' => $status,
        'issue_description' => $issue_description
    ]);

    send_json(['success' => true], 201);
}

function handle_put(mysqli $conn): void {
    try {
        parse_str($_SERVER['QUERY_STRING'] ?? '', $query);
        $id = $query['id'] ?? null;
        if (!$id) {
            send_json(['success' => false, 'error' => 'Missing id'], 400);
        }

        $old_sql = "SELECT * FROM repair_maintenance WHERE id = ?";
        $old_stmt = $conn->prepare($old_sql);
        if (!$old_stmt) {
            send_json(['success' => false, 'error' => $conn->error], 500);
        }
        $old_stmt->bind_param('s', $id);
        if (!$old_stmt->execute()) {
            send_json(['success' => false, 'error' => $old_stmt->error], 500);
        }
        $old_result = $old_stmt->get_result();
        if (!$old_result) {
            send_json(['success' => false, 'error' => $old_stmt->error ?: 'Failed to fetch record'], 500);
        }
        $old_values = $old_result->fetch_assoc();
        $old_stmt->close();

        if (!$old_values) {
            send_json(['success' => false, 'error' => 'Record not found'], 404);
        }

        $input = get_json_input();

        $date = $conn->real_escape_string($input['date'] ?? '');
        $equipment_name = $conn->real_escape_string($input['equipment_name'] ?? '');
        $serial_number = $conn->real_escape_string($input['serial_number'] ?? '');
        $issue_description = $conn->real_escape_string($input['issue_description'] ?? '');
        $action_taken = $conn->real_escape_string($input['action_taken'] ?? '');
        $technician_name = $conn->real_escape_string($input['technician_name'] ?? '');
        $status = $conn->real_escape_string($input['status'] ?? 'Pending');

        if ($status === 'Completed') {
            $current_sql = "SELECT status FROM repair_maintenance WHERE id = ?";
            $current_stmt = $conn->prepare($current_sql);
            if (!$current_stmt) {
                send_json(['success' => false, 'error' => $conn->error], 500);
            }
            $current_stmt->bind_param('s', $id);
            if (!$current_stmt->execute()) {
                send_json(['success' => false, 'error' => $current_stmt->error], 500);
            }
            $current_result = $current_stmt->get_result();
            if (!$current_result) {
                send_json(['success' => false, 'error' => $current_stmt->error ?: 'Failed to fetch current status'], 500);
            }
            $current_record = $current_result->fetch_assoc();
            $current_stmt->close();
            
            if ($current_record && $current_record['status'] !== 'Completed') {
                $admin_password = $input['admin_password'] ?? null;
                $admin_id = $input['admin_id'] ?? null;
                
                if (!$admin_password || !$admin_id) {
                    send_json(['success' => false, 'error' => 'Admin password and ID required for completion confirmation'], 400);
                }
                
                $admin_sql = "SELECT password_hash FROM users WHERE id = ? AND role IN ('admin', 'maintenance')";
                $admin_stmt = $conn->prepare($admin_sql);
                if (!$admin_stmt) {
                    send_json(['success' => false, 'error' => $conn->error], 500);
                }
                $admin_stmt->bind_param('s', $admin_id);
                if (!$admin_stmt->execute()) {
                    send_json(['success' => false, 'error' => $admin_stmt->error], 500);
                }
                $admin_result = $admin_stmt->get_result();
                if (!$admin_result) {
                    send_json(['success' => false, 'error' => $admin_stmt->error ?: 'Failed to fetch admin user'], 500);
                }
                $admin_user = $admin_result->fetch_assoc();
                $admin_stmt->close();
                
                if (!$admin_user || !password_verify($admin_password, $admin_user['password_hash'])) {
                    send_json(['success' => false, 'error' => 'Invalid admin password'], 401);
                }
            }
        }

        $sql = "UPDATE repair_maintenance SET date=?, equipment_name=?, serial_number=?, issue_description=?, action_taken=?, technician_name=?, status=?, updated_at=NOW() WHERE id=?";
        $stmt = $conn->prepare($sql);
        if (!$stmt) {
            send_json(['success' => false, 'error' => $conn->error], 500);
        }

        $stmt->bind_param('ssssssss', $date, $equipment_name, $serial_number, $issue_description, $action_taken, $technician_name, $status, $id);

        if (!$stmt->execute()) {
            send_json(['success' => false, 'error' => $stmt->error], 500);
        }

        // Log repair update
        $action_desc = "Updated repair record for: $equipment_name";
        if ($status === 'Completed' && $old_values['status'] !== 'Completed') {
            $action_desc .= " (MARKED AS COMPLETED)";
        }
        logUpdate('repair_maintenance', 'repair_maintenance', $id, $equipment_name, $old_values, $input);

        send_json(['success' => true]);
    } catch (\Throwable $e) {
        error_log('repair_maintenance handle_put error: ' . $e->getMessage() . ' in ' . $e->getFile() . ':' . $e->getLine());
        send_json(['success' => false, 'error' => 'Server error while updating repair record'], 500);
    }
}

function handle_delete(mysqli $conn): void {
    parse_str($_SERVER['QUERY_STRING'] ?? '', $query);
    $id = $query['id'] ?? null;
    if (!$id) {
        send_json(['success' => false, 'error' => 'Missing id'], 400);
    }

    // Get current user from session/headers
    $headers = getallheaders();
    $userId = $headers['X-User-Id'] ?? null;
    
    // If no user ID provided, try to get the first admin user
    if (!$userId) {
        $userResult = $conn->query("SELECT id FROM users WHERE role='admin' LIMIT 1");
        if ($userResult && $userResult->num_rows > 0) {
            $user = $userResult->fetch_assoc();
            $userId = $user['id'];
        }
    }

    // Use TrashService for soft delete
    try {
        $trashService = new TrashService($conn);
        $result = $trashService->softDelete(
            'repair_maintenance',
            $id,
            $userId ? (int)$userId : null,
            'Repair & Maintenance'
        );
        
        if ($result['success']) {
            // Log repair deletion
            logDelete('repair_maintenance', 'repair_maintenance', $id, 'Repair record');
            
            send_json(['success' => true, 'message' => 'Repair record moved to trash. You can restore it from the Trash page.']);
        } else {
            send_json(['success' => false, 'error' => $result['error']], 500);
        }
    } catch (Exception $e) {
        error_log("Exception in repair_maintenance delete: " . $e->getMessage());
        send_json(['success' => false, 'error' => 'Failed to delete repair record'], 500);
    }
}
