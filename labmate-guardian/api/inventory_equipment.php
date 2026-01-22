<?php
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/helpers.php';
require_once __DIR__ . '/activity_logger.php';

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
    $category = $_GET['category'] ?? null;
    $search = $_GET['search'] ?? null;
    $assigned_to = $_GET['assigned_to'] ?? null;
    
    $sql = "SELECT * FROM inventory_equipment WHERE 1=1";
    $params = [];
    $types = "";
    
    if ($category) {
        $sql .= " AND category = ?";
        $params[] = $category;
        $types .= "s";
    }
    
    if ($search) {
        $sql .= " AND (name LIKE ? OR item_description LIKE ? OR serial_number LIKE ?)";
        $searchTerm = "%$search%";
        $params[] = $searchTerm;
        $params[] = $searchTerm;
        $params[] = $searchTerm;
        $types .= "sss";
    }
    
    if ($assigned_to) {
        $sql .= " AND assigned_to = ?";
        $params[] = $assigned_to;
        $types .= "s";
    }
    
    $sql .= " ORDER BY created_at DESC";
    
    $stmt = $conn->prepare($sql);
    if (!empty($params)) {
        $stmt->bind_param($types, ...$params);
    }
    
    $stmt->execute();
    $result = $stmt->get_result();
    
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
    $name = $conn->real_escape_string($input['name'] ?? '');
    $category = $conn->real_escape_string($input['category'] ?? '');
    $item_description = $conn->real_escape_string($input['item_description'] ?? '');
    $serial_number = $conn->real_escape_string($input['serial_number'] ?? '');
    $quantity = (int)($input['quantity'] ?? 0);
    $purpose = $conn->real_escape_string($input['purpose'] ?? '');
    $date_returned = $conn->real_escape_string($input['date_returned'] ?? '');
    $condition = $conn->real_escape_string($input['condition'] ?? '');
    $price = (float)($input['price'] ?? 0);
    $assigned_to = $conn->real_escape_string($input['assigned_to'] ?? '');
    $created_by = $conn->real_escape_string($input['created_by'] ?? '');

    // Generate an ID for the new record
    $id = bin2hex(random_bytes(16));

    $sql = "INSERT INTO inventory_equipment (id, date, name, category, item_description, serial_number, quantity, purpose, date_returned, `condition`, price, assigned_to, created_by, created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,NOW())";

    $stmt = $conn->prepare($sql);
    if (!$stmt) {
        send_json(['success' => false, 'error' => $conn->error], 500);
    }

    $stmt->bind_param('sssssissssdsss', $id, $date, $name, $category, $item_description, $serial_number, $quantity, $purpose, $date_returned, $condition, $price, $assigned_to, $created_by);

    if (!$stmt->execute()) {
        send_json(['success' => false, 'error' => $stmt->error], 500);
    }

    // Log activity
    $admin = get_admin_from_token($conn, '');
    if ($admin) {
        log_activity($conn, [
            'admin_id' => $admin['id'],
            'admin_email' => $admin['email'],
            'admin_name' => $admin['name'],
            'action' => 'CREATE',
            'table_name' => 'inventory_equipment',
            'record_id' => $id,
            'record_description' => "Added new equipment: $name (Category: $category, Quantity: $quantity)",
            'new_values' => $input
        ]);
    }

    send_json(['success' => true, 'id' => $id], 201);
}

function handle_put(mysqli $conn): void {
    parse_str($_SERVER['QUERY_STRING'] ?? '', $query);
    $id = $query['id'] ?? null;

    if (!$id) {
        send_json(['success' => false, 'error' => 'Missing id'], 400);
    }

    // Get old values for logging
    $old_sql = "SELECT * FROM inventory_equipment WHERE id = ?";
    $old_stmt = $conn->prepare($old_sql);
    $old_stmt->bind_param('s', $id);
    $old_stmt->execute();
    $old_result = $old_stmt->get_result();
    $old_values = $old_result->fetch_assoc();
    $old_stmt->close();

    if (!$old_values) {
        send_json(['success' => false, 'error' => 'Record not found'], 404);
    }

    $input = get_json_input();

    $date = $conn->real_escape_string($input['date'] ?? '');
    $name = $conn->real_escape_string($input['name'] ?? '');
    $category = $conn->real_escape_string($input['category'] ?? '');
    $item_description = $conn->real_escape_string($input['item_description'] ?? '');
    $serial_number = $conn->real_escape_string($input['serial_number'] ?? '');
    $quantity = (int)($input['quantity'] ?? 0);
    $purpose = $conn->real_escape_string($input['purpose'] ?? '');
    $date_returned = $conn->real_escape_string($input['date_returned'] ?? '');
    $condition = $conn->real_escape_string($input['condition'] ?? '');
    $price = (float)($input['price'] ?? 0);
    $assigned_to = $conn->real_escape_string($input['assigned_to'] ?? '');

    $sql = "UPDATE inventory_equipment SET date=?, name=?, category=?, item_description=?, serial_number=?, quantity=?, purpose=?, date_returned=?, `condition`=?, price=?, assigned_to=? WHERE id=?";

    $stmt = $conn->prepare($sql);
    if (!$stmt) {
        send_json(['success' => false, 'error' => $conn->error], 500);
    }

    $stmt->bind_param('sssssisessdss', $date, $name, $category, $item_description, $serial_number, $quantity, $purpose, $date_returned, $condition, $price, $assigned_to, $id);

    if (!$stmt->execute()) {
        send_json(['success' => false, 'error' => $stmt->error], 500);
    }

    // Log activity
    $admin = get_admin_from_token($conn, '');
    if ($admin) {
        log_activity($conn, [
            'admin_id' => $admin['id'],
            'admin_email' => $admin['email'],
            'admin_name' => $admin['name'],
            'action' => 'UPDATE',
            'table_name' => 'inventory_equipment',
            'record_id' => $id,
            'record_description' => "Updated equipment: $name (Category: $category, Quantity: $quantity)",
            'old_values' => $old_values,
            'new_values' => $input
        ]);
    }

    send_json(['success' => true]);
}

function handle_delete(mysqli $conn): void {
    parse_str($_SERVER['QUERY_STRING'] ?? '', $query);
    $id = $query['id'] ?? null;

    if (!$id) {
        send_json(['success' => false, 'error' => 'Missing id'], 400);
    }

    // Get old values for logging
    $old_sql = "SELECT * FROM inventory_equipment WHERE id = ?";
    $old_stmt = $conn->prepare($old_sql);
    $old_stmt->bind_param('s', $id);
    $old_stmt->execute();
    $old_result = $old_stmt->get_result();
    $old_values = $old_result->fetch_assoc();
    $old_stmt->close();

    if (!$old_values) {
        send_json(['success' => false, 'error' => 'Record not found'], 404);
    }

    $id = $conn->real_escape_string($id);
    $sql = "DELETE FROM inventory_equipment WHERE id = ?";

    $stmt = $conn->prepare($sql);
    if (!$stmt) {
        send_json(['success' => false, 'error' => $conn->error], 500);
    }

    $stmt->bind_param('s', $id);

    if (!$stmt->execute()) {
        send_json(['success' => false, 'error' => $stmt->error], 500);
    }

    // Log activity
    $admin = get_admin_from_token($conn, '');
    if ($admin) {
        log_activity($conn, [
            'admin_id' => $admin['id'],
            'admin_email' => $admin['email'],
            'admin_name' => $admin['name'],
            'action' => 'DELETE',
            'table_name' => 'inventory_equipment',
            'record_id' => $id,
            'record_description' => "Deleted equipment: {$old_values['name']} (Category: {$old_values['category']}, Quantity: {$old_values['quantity']})",
            'old_values' => $old_values
        ]);
    }

    send_json(['success' => true]);
}
