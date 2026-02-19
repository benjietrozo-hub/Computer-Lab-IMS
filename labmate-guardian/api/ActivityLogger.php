<?php
/**
 * Activity Logger Class
 * Logs all system activities for admin monitoring
 */

require_once __DIR__ . '/UserAgentParser.php';
require_once __DIR__ . '/IPHelper.php';

class ActivityLogger {
    private $conn;
    
    public function __construct($db) {
        $this->conn = $db;
    }
    
    /**
     * Log an activity
     */
    public function log($data) {
        try {
            // Parse User-Agent for device/browser/OS information
            $userAgent = $data['user_agent'] ?? $_SERVER['HTTP_USER_AGENT'] ?? '';
            $uaParser = new UserAgentParser($userAgent);
            $parsedUA = $uaParser->parse();
            
            // Get real IP address (handles X-Forwarded-For)
            $ipInfo = IPHelper::getClientIP();
            $userRole = $data['user_role'] ?? null;
            
            // Determine which IP to store based on privacy policy
            // Admins: Keep full IP for audit trail
            // Regular users: Can be anonymized later for long-term storage
            $ipAddress = $ipInfo['ip'];
            $realIP = $ipInfo['real_ip'];
            
            $sql = "INSERT INTO activity_logs (
                user_id, user_name, user_email, user_role,
                action, module, entity_type, entity_id, entity_name,
                description, ip_address, real_ip, user_agent,
                device_type, browser, os, is_bot,
                old_values, new_values, metadata, severity
            ) VALUES (
                ?, ?, ?, ?,
                ?, ?, ?, ?, ?,
                ?, ?, ?, ?,
                ?, ?, ?, ?,
                ?, ?, ?, ?
            )";
            
            $stmt = $this->conn->prepare($sql);
            
            if (!$stmt) {
                error_log("Activity Logger Prepare Error: " . $this->conn->error);
                return false;
            }
            
            // JSON encode arrays
            $old_values = isset($data['old_values']) ? json_encode($data['old_values']) : null;
            $new_values = isset($data['new_values']) ? json_encode($data['new_values']) : null;
            $metadata = isset($data['metadata']) ? json_encode($data['metadata']) : null;
            
            $stmt->bind_param(
                'issssssssssssssssisss',
                $data['user_id'],
                $data['user_name'],
                $data['user_email'],
                $data['user_role'],
                $data['action'],
                $data['module'],
                $data['entity_type'],
                $data['entity_id'],
                $data['entity_name'],
                $data['description'],
                $ipAddress,
                $realIP,
                $userAgent,
                $parsedUA['device_type'],
                $parsedUA['browser'],
                $parsedUA['os'],
                $parsedUA['is_bot'],
                $old_values,
                $new_values,
                $metadata,
                $data['severity']
            );
            
            $result = $stmt->execute();
            
            // Get the inserted ID
            $insertedId = $this->conn->insert_id;
            
            $stmt->close();
            
            // Broadcast to WebSocket for real-time updates
            if ($result && $insertedId) {
                $broadcastData = array_merge($data, [
                    'id' => $insertedId,
                    'device_type' => $parsedUA['device_type'],
                    'browser' => $parsedUA['browser'],
                    'os' => $parsedUA['os'],
                    'is_bot' => $parsedUA['is_bot'],
                    'ip_address' => $ipAddress
                ]);
                $this->broadcastLog($broadcastData);
            }
            
            return $result;
        } catch (Exception $e) {
            error_log("Activity Logger Error: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Broadcast log to WebSocket server for real-time updates
     */
    private function broadcastLog($data) {
        try {
            $ch = curl_init();
            
            $logPayload = [
                'log' => [
                    'id' => $data['id'] ?? null,
                    'user_id' => $data['user_id'],
                    'user_name' => $data['user_name'],
                    'user_email' => $data['user_email'],
                    'user_role' => $data['user_role'],
                    'action' => $data['action'],
                    'module' => $data['module'],
                    'entity_type' => $data['entity_type'],
                    'entity_id' => $data['entity_id'],
                    'entity_name' => $data['entity_name'],
                    'description' => $data['description'],
                    'severity' => $data['severity'],
                    'device_type' => $data['device_type'] ?? 'unknown',
                    'browser' => $data['browser'] ?? 'Unknown',
                    'os' => $data['os'] ?? 'Unknown',
                    'is_bot' => $data['is_bot'] ?? false,
                    'ip_address' => $data['ip_address'] ?? null,
                    'created_at' => date('Y-m-d H:i:s')
                ]
            ];
            
            curl_setopt($ch, CURLOPT_URL, 'http://localhost:8082/broadcast-activity-log');
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($logPayload));
            curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_TIMEOUT, 1); // Short timeout to not block
            
            curl_exec($ch);
            curl_close($ch);
        } catch (Exception $e) {
            // Don't fail if WebSocket broadcast fails
            error_log("WebSocket broadcast failed: " . $e->getMessage());
        }
    }
    
    /**
     * Quick log methods for common actions
     */
    public function logLogin($user) {
        return $this->log([
            'user_id' => $user['id'] ?? null,
            'user_name' => ($user['first_name'] ?? '') . ' ' . ($user['last_name'] ?? ''),
            'user_email' => $user['email'] ?? null,
            'user_role' => $user['role'] ?? null,
            'action' => 'login',
            'module' => 'authentication',
            'entity_type' => 'user',
            'entity_id' => $user['id'] ?? null,
            'entity_name' => $user['email'] ?? null,
            'description' => 'User logged in',
            'ip_address' => $_SERVER['REMOTE_ADDR'] ?? null,
            'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? null,
            'severity' => 'info'
        ]);
    }
    
    public function logLogout($user) {
        return $this->log([
            'user_id' => $user['id'] ?? null,
            'user_name' => ($user['first_name'] ?? '') . ' ' . ($user['last_name'] ?? ''),
            'user_email' => $user['email'] ?? null,
            'user_role' => $user['role'] ?? null,
            'action' => 'logout',
            'module' => 'authentication',
            'entity_type' => 'user',
            'entity_id' => $user['id'] ?? null,
            'entity_name' => $user['email'] ?? null,
            'description' => 'User logged out',
            'ip_address' => $_SERVER['REMOTE_ADDR'] ?? null,
            'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? null,
            'severity' => 'info'
        ]);
    }
    
    public function logCreate($user, $module, $entityType, $entityId, $entityName, $data = []) {
        return $this->log([
            'user_id' => $user['id'] ?? null,
            'user_name' => ($user['first_name'] ?? '') . ' ' . ($user['last_name'] ?? ''),
            'user_email' => $user['email'] ?? null,
            'user_role' => $user['role'] ?? null,
            'action' => 'create',
            'module' => $module,
            'entity_type' => $entityType,
            'entity_id' => $entityId,
            'entity_name' => $entityName,
            'description' => "Created {$entityType}: {$entityName}",
            'ip_address' => $_SERVER['REMOTE_ADDR'] ?? null,
            'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? null,
            'new_values' => $data,
            'severity' => 'info'
        ]);
    }
    
    public function logUpdate($user, $module, $entityType, $entityId, $entityName, $oldData = [], $newData = []) {
        return $this->log([
            'user_id' => $user['id'] ?? null,
            'user_name' => ($user['first_name'] ?? '') . ' ' . ($user['last_name'] ?? ''),
            'user_email' => $user['email'] ?? null,
            'user_role' => $user['role'] ?? null,
            'action' => 'update',
            'module' => $module,
            'entity_type' => $entityType,
            'entity_id' => $entityId,
            'entity_name' => $entityName,
            'description' => "Updated {$entityType}: {$entityName}",
            'ip_address' => $_SERVER['REMOTE_ADDR'] ?? null,
            'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? null,
            'old_values' => $oldData,
            'new_values' => $newData,
            'severity' => 'info'
        ]);
    }
    
    public function logDelete($user, $module, $entityType, $entityId, $entityName) {
        return $this->log([
            'user_id' => $user['id'] ?? null,
            'user_name' => ($user['first_name'] ?? '') . ' ' . ($user['last_name'] ?? ''),
            'user_email' => $user['email'] ?? null,
            'user_role' => $user['role'] ?? null,
            'action' => 'delete',
            'module' => $module,
            'entity_type' => $entityType,
            'entity_id' => $entityId,
            'entity_name' => $entityName,
            'description' => "Deleted {$entityType}: {$entityName}",
            'ip_address' => $_SERVER['REMOTE_ADDR'] ?? null,
            'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? null,
            'severity' => 'warning'
        ]);
    }
    
    public function logRestore($user, $module, $entityType, $entityId, $entityName) {
        return $this->log([
            'user_id' => $user['id'] ?? null,
            'user_name' => ($user['first_name'] ?? '') . ' ' . ($user['last_name'] ?? ''),
            'user_email' => $user['email'] ?? null,
            'user_role' => $user['role'] ?? null,
            'action' => 'restore',
            'module' => $module,
            'entity_type' => $entityType,
            'entity_id' => $entityId,
            'entity_name' => $entityName,
            'description' => "Restored {$entityType}: {$entityName}",
            'ip_address' => $_SERVER['REMOTE_ADDR'] ?? null,
            'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? null,
            'severity' => 'info'
        ]);
    }
    
    /**
     * Get activity logs with filters
     */
    public function getLogs($filters = []) {
        try {
            $sql = "SELECT * FROM activity_logs WHERE 1=1";
            $params = [];
            $types = '';
            
            // Apply filters
            if (!empty($filters['user_id'])) {
                $sql .= " AND user_id = ?";
                $params[] = $filters['user_id'];
                $types .= 'i';
            }
            
            if (!empty($filters['action'])) {
                $sql .= " AND action = ?";
                $params[] = $filters['action'];
                $types .= 's';
            }
            
            if (!empty($filters['module'])) {
                $sql .= " AND module = ?";
                $params[] = $filters['module'];
                $types .= 's';
            }
            
            if (!empty($filters['entity_type'])) {
                $sql .= " AND entity_type = ?";
                $params[] = $filters['entity_type'];
                $types .= 's';
            }
            
            if (!empty($filters['severity'])) {
                $sql .= " AND severity = ?";
                $params[] = $filters['severity'];
                $types .= 's';
            }
            
            if (!empty($filters['device_type'])) {
                $sql .= " AND device_type = ?";
                $params[] = $filters['device_type'];
                $types .= 's';
            }
            
            if (!empty($filters['start_date'])) {
                $sql .= " AND created_at >= ?";
                $params[] = $filters['start_date'];
                $types .= 's';
            }
            
            if (!empty($filters['end_date'])) {
                $sql .= " AND created_at <= ?";
                $params[] = $filters['end_date'] . ' 23:59:59';
                $types .= 's';
            }
            
            if (!empty($filters['search'])) {
                $sql .= " AND (user_name LIKE ? OR user_email LIKE ? OR description LIKE ? OR entity_name LIKE ?)";
                $searchTerm = '%' . $filters['search'] . '%';
                $params[] = $searchTerm;
                $params[] = $searchTerm;
                $params[] = $searchTerm;
                $params[] = $searchTerm;
                $types .= 'ssss';
            }
            
            // Order by most recent first
            $sql .= " ORDER BY created_at DESC";
            
            // Limit
            $limit = $filters['limit'] ?? 100;
            $offset = $filters['offset'] ?? 0;
            $sql .= " LIMIT ? OFFSET ?";
            $params[] = (int)$limit;
            $params[] = (int)$offset;
            $types .= 'ii';
            
            $stmt = $this->conn->prepare($sql);
            
            if (!$stmt) {
                error_log("Get Logs Prepare Error: " . $this->conn->error);
                return [];
            }
            
            // Bind parameters if any
            if (!empty($params)) {
                $stmt->bind_param($types, ...$params);
            }
            
            $stmt->execute();
            $result = $stmt->get_result();
            $logs = $result->fetch_all(MYSQLI_ASSOC);
            $stmt->close();
            
            return $logs;
        } catch (Exception $e) {
            error_log("Get Logs Error: " . $e->getMessage());
            return [];
        }
    }
    
    /**
     * Get log statistics
     */
    public function getStats($filters = []) {
        try {
            $sql = "SELECT 
                COUNT(*) as total_logs,
                COUNT(DISTINCT user_id) as unique_users,
                COUNT(CASE WHEN severity = 'error' THEN 1 END) as error_count,
                COUNT(CASE WHEN severity = 'warning' THEN 1 END) as warning_count,
                COUNT(CASE WHEN severity = 'critical' THEN 1 END) as critical_count,
                COUNT(CASE WHEN action = 'login' THEN 1 END) as login_count,
                COUNT(CASE WHEN action = 'delete' THEN 1 END) as delete_count
            FROM activity_logs WHERE 1=1";
            
            $params = [];
            $types = '';
            
            if (!empty($filters['start_date'])) {
                $sql .= " AND created_at >= ?";
                $params[] = $filters['start_date'];
                $types .= 's';
            }
            
            if (!empty($filters['end_date'])) {
                $sql .= " AND created_at <= ?";
                $params[] = $filters['end_date'] . ' 23:59:59';
                $types .= 's';
            }
            
            $stmt = $this->conn->prepare($sql);
            
            if (!$stmt) {
                error_log("Get Stats Prepare Error: " . $this->conn->error);
                return [];
            }
            
            if (!empty($params)) {
                $stmt->bind_param($types, ...$params);
            }
            
            $stmt->execute();
            $result = $stmt->get_result();
            $stats = $result->fetch_assoc();
            $stmt->close();
            
            return $stats;
        } catch (Exception $e) {
            error_log("Get Stats Error: " . $e->getMessage());
            return [];
        }
    }
}
