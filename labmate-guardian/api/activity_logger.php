<?php

function log_activity(mysqli $conn, array $data): void {
    $required_fields = ['admin_id', 'admin_email', 'admin_name', 'action', 'table_name', 'record_id'];
    
    foreach ($required_fields as $field) {
        if (!isset($data[$field]) || empty($data[$field])) {
            error_log("Activity log missing required field: $field");
            return;
        }
    }

    $sql = "INSERT INTO activity_log (
        admin_id, admin_email, admin_name, action, table_name, record_id, 
        record_description, old_values, new_values, ip_address, user_agent
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

    $stmt = $conn->prepare($sql);
    if (!$stmt) {
        error_log("Failed to prepare activity log statement: " . $conn->error);
        return;
    }

    $ip_address = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    $user_agent = $_SERVER['HTTP_USER_AGENT'] ?? 'unknown';
    
    $old_values = isset($data['old_values']) ? json_encode($data['old_values']) : null;
    $new_values = isset($data['new_values']) ? json_encode($data['new_values']) : null;

    $stmt->bind_param(
        'issssssssss',
        $data['admin_id'],
        $data['admin_email'],
        $data['admin_name'],
        $data['action'],
        $data['table_name'],
        $data['record_id'],
        $data['record_description'] ?? null,
        $old_values,
        $new_values,
        $ip_address,
        $user_agent
    );

    if (!$stmt->execute()) {
        error_log("Failed to log activity: " . $stmt->error);
    }

    $stmt->close();
}

function get_admin_from_token(mysqli $conn, string $token): ?array {
    // Extract admin info from JWT or session token
    // For now, we'll use a simple approach - in production, use proper JWT validation
    $headers = getallheaders();
    $authorization = $headers['Authorization'] ?? '';
    
    if (strpos($authorization, 'Bearer ') === 0) {
        $token = substr($authorization, 7);
        // For demo purposes, we'll extract user ID from token
        // In production, validate JWT properly
        $parts = explode('.', $token);
        if (isset($parts[1])) {
            $payload = json_decode(base64_decode($parts[1]), true);
            if (isset($payload['user_id'])) {
                $sql = "SELECT id, email, CONCAT(first_name, ' ', last_name) as name 
                        FROM users 
                        WHERE id = ? AND role IN ('admin', 'instructor')";
                $stmt = $conn->prepare($sql);
                $stmt->bind_param('i', $payload['user_id']);
                $stmt->execute();
                $result = $stmt->get_result();
                $admin = $result->fetch_assoc();
                $stmt->close();
                return $admin;
            }
        }
    }
    
    return null;
}

?>
