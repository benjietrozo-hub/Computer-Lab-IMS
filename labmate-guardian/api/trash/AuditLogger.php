<?php
// Task 2.2: Create AuditLogger service
// Logs all trash operations to the audit trail

require_once __DIR__ . '/../db.php';

class AuditLogger {
    private $conn;

    public function __construct($dbConnection) {
        $this->conn = $dbConnection;
    }

    /**
     * Logs trash operations to audit table
     * 
     * @param string $action 'soft_delete', 'restore', 'permanent_delete', 'auto_cleanup'
     * @param string $entityType Entity type (inventory, user, etc.)
     * @param string $entityId Entity ID
     * @param int $userId User performing the action
     * @param array $metadata Additional metadata (optional)
     * @return bool Success status
     */
    public function logTrashOperation(
        string $action,
        string $entityType,
        string $entityId,
        int $userId,
        array $metadata = []
    ): bool {
        try {
            $stmt = $this->conn->prepare("
                INSERT INTO trash_audit_log 
                (entity_type, entity_id, action, user_id, metadata) 
                VALUES (?, ?, ?, ?, ?)
            ");

            $metadataJson = !empty($metadata) ? json_encode($metadata) : null;

            $stmt->bind_param(
                'sssis',
                $entityType,
                $entityId,
                $action,
                $userId,
                $metadataJson
            );

            return $stmt->execute();
        } catch (Exception $e) {
            error_log("Audit logging failed: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Retrieves audit trail with filters
     * 
     * @param array $filters Associative array of filters
     * @return array Array of audit log entries
     */
    public function getAuditTrail(array $filters = []): array {
        $query = "
            SELECT 
                tal.id,
                tal.entity_type,
                tal.entity_id,
                tal.action,
                tal.user_id,
                tal.timestamp,
                tal.metadata,
                CONCAT(u.first_name, ' ', u.last_name) as username,
                u.email
            FROM trash_audit_log tal
            LEFT JOIN users u ON tal.user_id = u.id
            WHERE 1=1
        ";

        $params = [];
        $types = '';

        // Apply filters
        if (!empty($filters['entity_type'])) {
            $query .= " AND tal.entity_type = ?";
            $params[] = $filters['entity_type'];
            $types .= 's';
        }

        if (!empty($filters['action'])) {
            $query .= " AND tal.action = ?";
            $params[] = $filters['action'];
            $types .= 's';
        }

        if (!empty($filters['user_id'])) {
            $query .= " AND tal.user_id = ?";
            $params[] = $filters['user_id'];
            $types .= 'i';
        }

        if (!empty($filters['date_from'])) {
            $query .= " AND tal.timestamp >= ?";
            $params[] = $filters['date_from'];
            $types .= 's';
        }

        if (!empty($filters['date_to'])) {
            $query .= " AND tal.timestamp <= ?";
            $params[] = $filters['date_to'];
            $types .= 's';
        }

        $query .= " ORDER BY tal.timestamp DESC";

        // Apply pagination
        if (isset($filters['limit'])) {
            $query .= " LIMIT ?";
            $params[] = $filters['limit'];
            $types .= 'i';

            if (isset($filters['offset'])) {
                $query .= " OFFSET ?";
                $params[] = $filters['offset'];
                $types .= 'i';
            }
        }

        $stmt = $this->conn->prepare($query);

        if (!empty($params)) {
            $stmt->bind_param($types, ...$params);
        }

        $stmt->execute();
        $result = $stmt->get_result();

        $auditLogs = [];
        while ($row = $result->fetch_assoc()) {
            if ($row['metadata']) {
                $row['metadata'] = json_decode($row['metadata'], true);
            }
            $auditLogs[] = $row;
        }

        return $auditLogs;
    }

    /**
     * Get count of audit log entries matching filters
     */
    public function getAuditCount(array $filters = []): int {
        $query = "SELECT COUNT(*) as count FROM trash_audit_log WHERE 1=1";

        $params = [];
        $types = '';

        if (!empty($filters['entity_type'])) {
            $query .= " AND entity_type = ?";
            $params[] = $filters['entity_type'];
            $types .= 's';
        }

        if (!empty($filters['action'])) {
            $query .= " AND action = ?";
            $params[] = $filters['action'];
            $types .= 's';
        }

        if (!empty($filters['user_id'])) {
            $query .= " AND user_id = ?";
            $params[] = $filters['user_id'];
            $types .= 'i';
        }

        $stmt = $this->conn->prepare($query);

        if (!empty($params)) {
            $stmt->bind_param($types, ...$params);
        }

        $stmt->execute();
        $result = $stmt->get_result();
        $row = $result->fetch_assoc();

        return (int)$row['count'];
    }
}
