<?php
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/helpers.php';
require_once __DIR__ . '/trash/TrashService.php';
require_once __DIR__ . '/activity_log_helper.php';

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
    // Check if this is a request for a specific user (for profile viewing)
    parse_str($_SERVER['QUERY_STRING'] ?? '', $query);
    $specificUserId = $query['id'] ?? null;
    $email = $query['email'] ?? null;
    
    if ($specificUserId) {
        // Return specific user data, including root admin if requested
        $stmt = $conn->prepare("SELECT id, email, role, id_number, avatar_url, first_name, middle_name, last_name, created_at FROM users WHERE id = ? LIMIT 1");
        if (!$stmt) {
            send_json(['success' => false, 'error' => $conn->error], 500);
        }
        $stmt->bind_param('s', $specificUserId);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($row = $result->fetch_assoc()) {
            send_json(['success' => true, 'data' => [$row]]);
        } else {
            send_json(['success' => false, 'error' => 'User not found'], 404);
        }
        return;
    }
    
    if ($email) {
        // Return user data by email
        $stmt = $conn->prepare("SELECT id, email, role, id_number, avatar_url, first_name, middle_name, last_name, created_at FROM users WHERE email = ? LIMIT 1");
        if (!$stmt) {
            send_json(['success' => false, 'error' => $conn->error], 500);
        }
        $stmt->bind_param('s', $email);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($row = $result->fetch_assoc()) {
            send_json(['success' => true, 'data' => [$row]]);
        } else {
            send_json(['success' => false, 'error' => 'User not found'], 404);
        }
        return;
    }
    
    // For general users list, exclude the root admin account and soft-deleted users
    $result = $conn->query("SELECT id, email, role, id_number, avatar_url, first_name, middle_name, last_name, created_at FROM users WHERE id != '6717' AND email != 'benjie.trozo@csucc.edu.ph' AND deleted_at IS NULL ORDER BY created_at DESC");
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

    $email = trim($input['email'] ?? '');
    $password = $input['password'] ?? '';
    $role = $input['role'] ?? 'user';
    $id_number = $input['id_number'] ?? null;
    $first_name = $input['first_name'] ?? null;
    $middle_name = $input['middle_name'] ?? null;
    $last_name = $input['last_name'] ?? null;

    if ($email === '' || $password === '') {
        send_json(['success' => false, 'error' => 'Email and password are required'], 400);
    }

    // Handle role transition - only convert student to user for database compatibility
    // Keep instructor as is since we want to distinguish it from student
    if ($role === 'student') {
        $role = 'user';
    }

    if (!in_array($role, ['admin', 'user', 'instructor'], true)) {
        $role = 'user';
    }

    // Validate ID number format if provided
    if ($id_number && !preg_match('/^\d{4}-\d{4}$/', $id_number)) {
        send_json(['success' => false, 'error' => 'ID number must be in format xxxx-xxxx'], 400);
    }

    $stmt = $conn->prepare('SELECT id FROM users WHERE email = ? LIMIT 1');
    if (!$stmt) {
        send_json(['success' => false, 'error' => $conn->error], 500);
    }
    $stmt->bind_param('s', $email);
    $stmt->execute();
    $result = $stmt->get_result();
    if ($result && $result->num_rows > 0) {
        send_json(['success' => false, 'error' => 'Email already exists'], 400);
    }

    $hash = password_hash($password, PASSWORD_BCRYPT);
    
    // Generate a numeric ID for the users table (which uses int(11) AUTO_INCREMENT)
    $result = $conn->query("SELECT MAX(id) as max_id FROM users");
    $row = $result->fetch_assoc();
    $id = ($row['max_id'] ?? 0) + 1;

    $stmt = $conn->prepare('INSERT INTO users (id, email, password_hash, role, id_number, first_name, middle_name, last_name, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())');
    if (!$stmt) {
        send_json(['success' => false, 'error' => $conn->error], 500);
    }
    $stmt->bind_param('isssssss', $id, $email, $hash, $role, $id_number, $first_name, $middle_name, $last_name);

    if (!$stmt->execute()) {
        send_json(['success' => false, 'error' => $stmt->error], 500);
    }

    // Log user creation
    $user_name = trim(($first_name ?? '') . ' ' . ($last_name ?? ''));
    logCreate('users', 'user', $id, $user_name ?: $email, [
        'email' => $email,
        'role' => $role,
        'id_number' => $id_number
    ]);

    // Convert back to frontend role format for response
    $frontend_role = ($role === 'user') ? 'student' : $role;
    send_json(['success' => true, 'user' => [
        'id' => $id, 
        'email' => $email, 
        'role' => $frontend_role, 
        'id_number' => $id_number,
        'first_name' => $first_name,
        'middle_name' => $middle_name,
        'last_name' => $last_name
    ]], 201);
}

function handle_put(mysqli $conn): void {
    parse_str($_SERVER['QUERY_STRING'] ?? '', $query);
    $id = $query['id'] ?? null;

    if (!$id) {
        send_json(['success' => false, 'error' => 'Missing id'], 400);
    }

    $input = get_json_input();
    
    // Debug: Log the input data
    error_log('PUT request data: ' . json_encode($input));
    
    $email = trim($input['email'] ?? '');
    $role = $input['role'] ?? null;
    $id_number = $input['id_number'] ?? null;
    $first_name = $input['first_name'] ?? null;
    $middle_name = $input['middle_name'] ?? null;
    $last_name = $input['last_name'] ?? null;

    if ($email === '') {
        send_json(['success' => false, 'error' => 'Email is required'], 400);
    }

    // Validate role if provided
    if ($role !== null) {
        // Handle role transition - only convert student to user for database compatibility
        // Keep instructor as is since we want to distinguish it from student
        if ($role === 'student') {
            $role = 'user';
        }

        if (!in_array($role, ['admin', 'user', 'instructor'], true)) {
            send_json(['success' => false, 'error' => 'Invalid role'], 400);
        }
    }

    // Validate ID number format if provided
    if ($id_number && !preg_match('/^\d{4}-\d{4}$/', $id_number)) {
        send_json(['success' => false, 'error' => 'ID number must be in format xxxx-xxxx'], 400);
    }

    // Ensure email is unique (excluding this user)
    $stmt = $conn->prepare('SELECT id FROM users WHERE email = ? AND id != ? LIMIT 1');
    if (!$stmt) {
        send_json(['success' => false, 'error' => $conn->error], 500);
    }
    $stmt->bind_param('ss', $email, $id);
    $stmt->execute();
    $result = $stmt->get_result();
    if ($result && $result->num_rows > 0) {
        send_json(['success' => false, 'error' => 'Email already in use'], 400);
    }

    // Get old values for logging
    $old_sql = "SELECT * FROM users WHERE id = ?";
    $old_stmt = $conn->prepare($old_sql);
    $old_stmt->bind_param('s', $id);
    $old_stmt->execute();
    $old_result = $old_stmt->get_result();
    $old_values = $old_result->fetch_assoc();
    $old_stmt->close();

    // Build dynamic UPDATE query based on provided fields
    $update_fields = ['email = ?'];
    $bind_params = [$email];
    $bind_types = 's';
    
    if ($role !== null) {
        $update_fields[] = 'role = ?';
        $bind_params[] = $role;
        $bind_types .= 's';
    }
    
    if ($id_number !== null) {
        $update_fields[] = 'id_number = ?';
        $bind_params[] = $id_number;
        $bind_types .= 's';
    }
    
    if ($first_name !== null) {
        $update_fields[] = 'first_name = ?';
        $bind_params[] = $first_name;
        $bind_types .= 's';
    }
    
    if ($middle_name !== null) {
        $update_fields[] = 'middle_name = ?';
        $bind_params[] = $middle_name;
        $bind_types .= 's';
    }
    
    if ($last_name !== null) {
        $update_fields[] = 'last_name = ?';
        $bind_params[] = $last_name;
        $bind_types .= 's';
    }
    
    $bind_params[] = $id;
    $bind_types .= 's';
    
    $sql = 'UPDATE users SET ' . implode(', ', $update_fields) . ' WHERE id = ?';
    
    // Debug: Log the SQL and parameters
    error_log('SQL: ' . $sql);
    error_log('Params: ' . json_encode($bind_params));
    
    $stmt = $conn->prepare($sql);
    if (!$stmt) {
        send_json(['success' => false, 'error' => $conn->error], 500);
    }
    $stmt->bind_param($bind_types, ...$bind_params);

    if (!$stmt->execute()) {
        send_json(['success' => false, 'error' => $stmt->error], 500);
    }

    // Log user update
    $user_name = trim(($first_name ?? $old_values['first_name'] ?? '') . ' ' . ($last_name ?? $old_values['last_name'] ?? ''));
    logUpdate('users', 'user', $id, $user_name ?: $email, $old_values, $input);

    send_json(['success' => true]);
}

function handle_delete(mysqli $conn): void {
    parse_str($_SERVER['QUERY_STRING'] ?? '', $query);
    $id = $query['id'] ?? null;
    $admin_id = $query['admin_id'] ?? null;

    if (!$id) {
        send_json(['success' => false, 'error' => 'Missing id'], 400);
    }
    
    // If no admin ID provided, try to get the first admin user
    if (!$admin_id) {
        $userResult = $conn->query("SELECT id FROM users WHERE role='admin' LIMIT 1");
        if ($userResult && $userResult->num_rows > 0) {
            $user = $userResult->fetch_assoc();
            $admin_id = $user['id'];
        }
    }

    // Protect root admin from deletion
    $stmt = $conn->prepare("SELECT email FROM users WHERE id = ? LIMIT 1");
    if (!$stmt) {
        send_json(['success' => false, 'error' => $conn->error], 500);
    }
    $stmt->bind_param('s', $id);
    $stmt->execute();
    $result = $stmt->get_result();
    $row = $result ? $result->fetch_assoc() : null;

    if ($row && ($id === '6717' || $row['email'] === 'benjie.trozo@csucc.edu.ph')) {
        send_json(['success' => false, 'error' => 'Cannot delete root admin account'], 400);
    }

    // Get user details for logging
    $user_sql = "SELECT first_name, last_name, email FROM users WHERE id = ?";
    $user_stmt = $conn->prepare($user_sql);
    $user_stmt->bind_param('s', $id);
    $user_stmt->execute();
    $user_result = $user_stmt->get_result();
    $user_data = $user_result->fetch_assoc();
    $user_stmt->close();

    // Use soft delete instead of hard delete
    $trashService = new TrashService($conn);
    $result = $trashService->softDelete(
        'user',
        $id,
        $admin_id ? (int)$admin_id : null,
        'Users'
    );

    if ($result['success']) {
        // Log user deletion
        if ($user_data) {
            $user_name = trim(($user_data['first_name'] ?? '') . ' ' . ($user_data['last_name'] ?? ''));
            logDelete('users', 'user', $id, $user_name ?: $user_data['email']);
        }
        send_json(['success' => true, 'message' => 'User moved to trash. You can restore it from the Trash page.']);
    } else {
        send_json(['success' => false, 'error' => $result['error']], 500);
    }
}
