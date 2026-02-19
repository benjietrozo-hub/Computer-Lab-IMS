<?php
/**
 * Activity Log Helper Functions
 * Quick helper functions to log activities from any API endpoint
 */

require_once __DIR__ . '/ActivityLogger.php';

/**
 * Get or create ActivityLogger instance
 */
function getActivityLogger() {
    static $logger = null;
    if ($logger === null) {
        global $conn;
        if (!isset($conn)) {
            require_once __DIR__ . '/db.php';
            $conn = get_db_connection();
        }
        $logger = new ActivityLogger($conn);
    }
    return $logger;
}

/**
 * Get current user from headers
 */
function getCurrentUserFromHeaders() {
    $headers = getallheaders();
    $userId = $headers['X-User-ID'] ?? $headers['X-User-Id'] ?? null;
    $userRole = $headers['X-User-Role'] ?? null;
    
    if (!$userId) {
        return null;
    }
    
    // Fetch user details from database
    global $conn;
    if (!isset($conn)) {
        require_once __DIR__ . '/db.php';
        $conn = get_db_connection();
    }
    
    $stmt = $conn->prepare('SELECT id, email, first_name, last_name, role FROM users WHERE id = ? LIMIT 1');
    $stmt->bind_param('i', $userId);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result && $result->num_rows > 0) {
        return $result->fetch_assoc();
    }
    
    return [
        'id' => $userId,
        'role' => $userRole,
        'first_name' => '',
        'last_name' => '',
        'email' => ''
    ];
}

/**
 * Quick log function for common operations
 */
function logActivity($action, $module, $entityType, $entityId, $entityName, $description = null, $severity = 'info', $oldValues = null, $newValues = null) {
    try {
        $logger = getActivityLogger();
        $user = getCurrentUserFromHeaders();
        
        if (!$user) {
            // Log system action if no user
            $user = [
                'id' => null,
                'first_name' => 'System',
                'last_name' => '',
                'email' => null,
                'role' => null
            ];
        }
        
        $logger->log([
            'user_id' => $user['id'],
            'user_name' => trim(($user['first_name'] ?? '') . ' ' . ($user['last_name'] ?? '')),
            'user_email' => $user['email'] ?? null,
            'user_role' => $user['role'] ?? null,
            'action' => $action,
            'module' => $module,
            'entity_type' => $entityType,
            'entity_id' => $entityId,
            'entity_name' => $entityName,
            'description' => $description ?? ucfirst($action) . " {$entityType}: {$entityName}",
            'ip_address' => $_SERVER['REMOTE_ADDR'] ?? null,
            'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? null,
            'old_values' => $oldValues,
            'new_values' => $newValues,
            'severity' => $severity
        ]);
    } catch (Exception $e) {
        // Don't fail the main operation if logging fails
        error_log("Activity logging failed: " . $e->getMessage());
    }
}

/**
 * Quick log for create operations
 */
function logCreate($module, $entityType, $entityId, $entityName, $data = null) {
    logActivity('create', $module, $entityType, $entityId, $entityName, null, 'info', null, $data);
}

/**
 * Quick log for update operations
 */
function logUpdate($module, $entityType, $entityId, $entityName, $oldData = null, $newData = null) {
    logActivity('update', $module, $entityType, $entityId, $entityName, null, 'info', $oldData, $newData);
}

/**
 * Quick log for delete operations
 */
function logDelete($module, $entityType, $entityId, $entityName) {
    logActivity('delete', $module, $entityType, $entityId, $entityName, null, 'warning');
}

/**
 * Quick log for restore operations
 */
function logRestore($module, $entityType, $entityId, $entityName) {
    logActivity('restore', $module, $entityType, $entityId, $entityName, null, 'info');
}
