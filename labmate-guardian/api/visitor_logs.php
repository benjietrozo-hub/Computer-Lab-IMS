<?php
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/helpers.php';
require_once __DIR__ . '/trash/TrashService.php';

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
    $result = $conn->query('SELECT * FROM visitor_logs WHERE deleted_at IS NULL ORDER BY created_at DESC');
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

    $name = $conn->real_escape_string($input['name'] ?? '');
    $purpose = $conn->real_escape_string($input['purpose'] ?? '');
    $date = $conn->real_escape_string($input['date'] ?? '');
    $time_in = $conn->real_escape_string($input['time_in'] ?? '');
    $time_out = $conn->real_escape_string($input['time_out'] ?? null);
    $signature = $conn->real_escape_string($input['signature'] ?? '');
    $created_by = $conn->real_escape_string($input['created_by'] ?? '');

    $sql = "INSERT INTO visitor_logs (id, name, purpose, date, time_in, time_out, signature, created_by, created_at) VALUES (UUID(),?,?,?,?,?,?,?,NOW())";
    $stmt = $conn->prepare($sql);
    if (!$stmt) {
        send_json(['success' => false, 'error' => $conn->error], 500);
    }

    $stmt->bind_param('sssssss', $name, $purpose, $date, $time_in, $time_out, $signature, $created_by);

    if (!$stmt->execute()) {
        send_json(['success' => false, 'error' => $stmt->error], 500);
    }

    send_json(['success' => true], 201);
}

function handle_put(mysqli $conn): void {
    parse_str($_SERVER['QUERY_STRING'] ?? '', $query);
    $id = $query['id'] ?? null;
    if (!$id) {
        send_json(['success' => false, 'error' => 'Missing id'], 400);
    }

    $input = get_json_input();

    $name = $conn->real_escape_string($input['name'] ?? '');
    $purpose = $conn->real_escape_string($input['purpose'] ?? '');
    $date = $conn->real_escape_string($input['date'] ?? '');
    $time_in = $conn->real_escape_string($input['time_in'] ?? '');
    $time_out = $conn->real_escape_string($input['time_out'] ?? null);
    $signature = $conn->real_escape_string($input['signature'] ?? '');

    $sql = "UPDATE visitor_logs SET name=?, purpose=?, date=?, time_in=?, time_out=?, signature=? WHERE id=?";
    $stmt = $conn->prepare($sql);
    if (!$stmt) {
        send_json(['success' => false, 'error' => $conn->error], 500);
    }

    $stmt->bind_param('sssssss', $name, $purpose, $date, $time_in, $time_out, $signature, $id);

    if (!$stmt->execute()) {
        send_json(['success' => false, 'error' => $stmt->error], 500);
    }

    send_json(['success' => true]);
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
    $trashService = new TrashService($conn);
    $result = $trashService->softDelete(
        'visitor_log',
        $id,
        $userId ? (int)$userId : null,
        'Visitor Logs'
    );
    
    if ($result['success']) {
        send_json(['success' => true, 'message' => 'Visitor log moved to trash. You can restore it from the Trash page.']);
    } else {
        send_json(['success' => false, 'error' => $result['error']], 500);
    }
}
