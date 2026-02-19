<?php
// Task 2.4: Create TrashService class with core business logic

require_once __DIR__ . '/EntityTypeMapper.php';
require_once __DIR__ . '/AuditLogger.php';
require_once __DIR__ . '/../db.php';

class TrashService {
    private $conn;
    private $auditLogger;

    public function __construct($dbConnection) {
        $this->conn = $dbConnection;
        $this->auditLogger = new AuditLogger($dbConnection);
    }

    /**
     * Fetches trash items with filters and pagination
     */
    public function getTrashItems(int $page = 1, int $pageSize = 50, array $filters = []): array {
        $offset = ($page - 1) * $pageSize;
        $entityTypes = EntityTypeMapper::getAllEntityTypes();
        $allItems = [];

        foreach ($entityTypes as $entityType) {
            // Skip if filtering by specific entity type
            if (!empty($filters['entity_type']) && $filters['entity_type'] !== $entityType) {
                continue;
            }

            $config = EntityTypeMapper::getEntityConfig($entityType);
            if (!$config) continue;

            try {
                $query = "
                    SELECT 
                        '{$entityType}' as entity_type,
                        {$config['idColumn']} as entity_id,
                        {$config['nameColumn']} as entity_name,
                        deleted_at,
                        deleted_by,
                        original_module
                    FROM {$config['table']}
                    WHERE deleted_at IS NOT NULL
                ";

                $params = [];
                $types = '';

                // Apply search filter
                if (!empty($filters['search'])) {
                    $query .= " AND {$config['nameColumn']} LIKE ?";
                    $params[] = '%' . $filters['search'] . '%';
                    $types .= 's';
                }

                // Apply deleted_by filter
                if (!empty($filters['deleted_by'])) {
                    $query .= " AND deleted_by = ?";
                    $params[] = $filters['deleted_by'];
                    $types .= 'i';
                }

                // Apply date range filters
                if (!empty($filters['date_from'])) {
                    $query .= " AND deleted_at >= ?";
                    $params[] = $filters['date_from'];
                    $types .= 's';
                }

                if (!empty($filters['date_to'])) {
                    $query .= " AND deleted_at <= ?";
                    $params[] = $filters['date_to'];
                    $types .= 's';
                }

                $stmt = $this->conn->prepare($query);
                
                if (!$stmt) {
                    error_log("Failed to prepare query for {$entityType}: " . $this->conn->error);
                    error_log("Query: " . $query);
                    continue; // Skip this entity type and continue with others
                }

                if (!empty($params)) {
                    $stmt->bind_param($types, ...$params);
                }

                if (!$stmt->execute()) {
                    error_log("Failed to execute query for {$entityType}: " . $stmt->error);
                    continue; // Skip this entity type and continue with others
                }

                $result = $stmt->get_result();

                while ($row = $result->fetch_assoc()) {
                    // Get deleted by user info
                    if ($row['deleted_by']) {
                        $userStmt = $this->conn->prepare("SELECT id, email, CONCAT(first_name, ' ', last_name) as name FROM users WHERE id = ?");
                        $userStmt->bind_param('i', $row['deleted_by']);
                        $userStmt->execute();
                        $userResult = $userStmt->get_result();
                        $user = $userResult->fetch_assoc();
                        $row['deleted_by_user'] = $user;
                    }

                    $allItems[] = $row;
                }
            } catch (Exception $e) {
                error_log("Error processing {$entityType} in getTrashItems: " . $e->getMessage());
                continue; // Skip this entity type and continue with others
            }
        }

        // Sort by deleted_at DESC (most recent first)
        usort($allItems, function($a, $b) {
            return strtotime($b['deleted_at']) - strtotime($a['deleted_at']);
        });

        // Apply pagination
        $total = count($allItems);
        $items = array_slice($allItems, $offset, $pageSize);

        return [
            'items' => $items,
            'total' => $total,
            'page' => $page,
            'pageSize' => $pageSize,
            'totalPages' => ceil($total / $pageSize)
        ];
    }

    /**
     * Get count of trash items
     */
    public function getTrashCount(): int {
        $count = 0;
        $entityTypes = EntityTypeMapper::getAllEntityTypes();

        foreach ($entityTypes as $entityType) {
            $tableName = EntityTypeMapper::getTableName($entityType);
            if (!$tableName) continue;

            $stmt = $this->conn->prepare("
                SELECT COUNT(*) as count 
                FROM {$tableName} 
                WHERE deleted_at IS NOT NULL
            ");
            $stmt->execute();
            $result = $stmt->get_result();
            $row = $result->fetch_assoc();
            $count += (int)$row['count'];
        }

        return $count;
    }

    /**
     * Soft delete an item
     */
    public function softDelete(string $entityType, string $entityId, ?int $userId, string $moduleName): array {
        if (!EntityTypeMapper::isValidEntityType($entityType)) {
            return ['success' => false, 'error' => 'Invalid entity type'];
        }

        $tableName = EntityTypeMapper::getTableName($entityType);
        $idColumn = EntityTypeMapper::getIdColumn($entityType);

        try {
            $this->conn->begin_transaction();

            $stmt = $this->conn->prepare("
                UPDATE {$tableName}
                SET deleted_at = NOW(),
                    deleted_by = ?,
                    original_module = ?
                WHERE {$idColumn} = ?
            ");

            $stmt->bind_param('iss', $userId, $moduleName, $entityId);
            $stmt->execute();

            if ($stmt->affected_rows === 0) {
                $this->conn->rollback();
                return ['success' => false, 'error' => 'Item not found'];
            }

            // Log the operation (only if userId is provided)
            if ($userId !== null) {
                $this->auditLogger->logTrashOperation(
                    'soft_delete',
                    $entityType,
                    $entityId,
                    $userId,
                    ['module' => $moduleName]
                );
            }

            $this->conn->commit();

            return ['success' => true, 'message' => 'Item moved to trash'];
        } catch (Exception $e) {
            $this->conn->rollback();
            error_log("Soft delete failed: " . $e->getMessage());
            error_log("Stack trace: " . $e->getTraceAsString());
            return ['success' => false, 'error' => 'Database error: ' . $e->getMessage()];
        }
    }

    /**
     * Restore a soft-deleted item
     */
    public function restoreItem(string $entityType, string $entityId, int $userId): array {
        if (!EntityTypeMapper::isValidEntityType($entityType)) {
            return ['success' => false, 'error' => 'Invalid entity type'];
        }

        // Check for conflicts
        $conflicts = $this->checkRestoreConflicts($entityType, $entityId);
        if ($conflicts) {
            return ['success' => false, 'error' => 'Conflict detected', 'conflicts' => $conflicts];
        }

        $tableName = EntityTypeMapper::getTableName($entityType);
        $idColumn = EntityTypeMapper::getIdColumn($entityType);

        try {
            $this->conn->begin_transaction();

            $stmt = $this->conn->prepare("
                UPDATE {$tableName}
                SET deleted_at = NULL,
                    deleted_by = NULL,
                    original_module = NULL
                WHERE {$idColumn} = ? AND deleted_at IS NOT NULL
            ");

            $stmt->bind_param('s', $entityId);
            $stmt->execute();

            if ($stmt->affected_rows === 0) {
                $this->conn->rollback();
                return ['success' => false, 'error' => 'Item not found in trash'];
            }

            // Log the operation
            $this->auditLogger->logTrashOperation(
                'restore',
                $entityType,
                $entityId,
                $userId
            );

            $this->conn->commit();

            return ['success' => true, 'message' => 'Item restored successfully'];
        } catch (Exception $e) {
            $this->conn->rollback();
            error_log("Restore failed: " . $e->getMessage());
            return ['success' => false, 'error' => 'Database error'];
        }
    }

    /**
     * Restore multiple items
     */
    public function restoreBulk(array $items, int $userId): array {
        $succeeded = [];
        $failed = [];

        foreach ($items as $item) {
            $result = $this->restoreItem($item['entity_type'], $item['entity_id'], $userId);
            
            if ($result['success']) {
                $succeeded[] = $item['entity_id'];
            } else {
                $failed[] = [
                    'id' => $item['entity_id'],
                    'reason' => $result['error']
                ];
            }
        }

        return [
            'succeeded' => $succeeded,
            'failed' => $failed
        ];
    }

    /**
     * Permanently delete an item
     */
    public function permanentDelete(string $entityType, string $entityId, int $userId, string $userRole): array {
        // Check permission - only Root Admin can permanently delete
        if ($userRole !== 'root_admin') {
            return ['success' => false, 'error' => 'Permission denied. Only Root Admin can permanently delete items.'];
        }

        if (!EntityTypeMapper::isValidEntityType($entityType)) {
            return ['success' => false, 'error' => 'Invalid entity type'];
        }

        $tableName = EntityTypeMapper::getTableName($entityType);
        $idColumn = EntityTypeMapper::getIdColumn($entityType);

        try {
            $this->conn->begin_transaction();

            $stmt = $this->conn->prepare("
                DELETE FROM {$tableName}
                WHERE {$idColumn} = ? AND deleted_at IS NOT NULL
            ");

            $stmt->bind_param('s', $entityId);
            $stmt->execute();

            if ($stmt->affected_rows === 0) {
                $this->conn->rollback();
                return ['success' => false, 'error' => 'Item not found in trash'];
            }

            // Log the operation
            $this->auditLogger->logTrashOperation(
                'permanent_delete',
                $entityType,
                $entityId,
                $userId
            );

            $this->conn->commit();

            return ['success' => true, 'message' => 'Item permanently deleted'];
        } catch (Exception $e) {
            $this->conn->rollback();
            error_log("Permanent delete failed: " . $e->getMessage());
            return ['success' => false, 'error' => 'Database error'];
        }
    }

    /**
     * Permanently delete multiple items
     */
    public function permanentDeleteBulk(array $items, int $userId, string $userRole): array {
        $succeeded = [];
        $failed = [];

        foreach ($items as $item) {
            $result = $this->permanentDelete($item['entity_type'], $item['entity_id'], $userId, $userRole);
            
            if ($result['success']) {
                $succeeded[] = $item['entity_id'];
            } else {
                $failed[] = [
                    'id' => $item['entity_id'],
                    'reason' => $result['error']
                ];
            }
        }

        return [
            'succeeded' => $succeeded,
            'failed' => $failed
        ];
    }

    /**
     * Check for restoration conflicts
     */
    private function checkRestoreConflicts(string $entityType, string $entityId): ?array {
        // For now, return null (no conflicts)
        // This can be extended to check for duplicate identifiers, missing parents, etc.
        return null;
    }

    /**
     * Auto-cleanup job: removes items past retention period
     */
    public function autoCleanup(int $retentionDays): array {
        $deleted = [];
        $entityTypes = EntityTypeMapper::getAllEntityTypes();

        foreach ($entityTypes as $entityType) {
            $tableName = EntityTypeMapper::getTableName($entityType);
            $idColumn = EntityTypeMapper::getIdColumn($entityType);

            if (!$tableName) continue;

            try {
                // Find expired items
                $stmt = $this->conn->prepare("
                    SELECT {$idColumn} as id
                    FROM {$tableName}
                    WHERE deleted_at IS NOT NULL 
                    AND deleted_at < DATE_SUB(NOW(), INTERVAL ? DAY)
                ");

                $stmt->bind_param('i', $retentionDays);
                $stmt->execute();
                $result = $stmt->get_result();

                $expiredIds = [];
                while ($row = $result->fetch_assoc()) {
                    $expiredIds[] = $row['id'];
                }

                // Delete expired items
                if (!empty($expiredIds)) {
                    $placeholders = implode(',', array_fill(0, count($expiredIds), '?'));
                    $deleteStmt = $this->conn->prepare("
                        DELETE FROM {$tableName}
                        WHERE {$idColumn} IN ({$placeholders})
                    ");

                    $types = str_repeat('s', count($expiredIds));
                    $deleteStmt->bind_param($types, ...$expiredIds);
                    $deleteStmt->execute();

                    // Log each deletion
                    foreach ($expiredIds as $id) {
                        $this->auditLogger->logTrashOperation(
                            'auto_cleanup',
                            $entityType,
                            $id,
                            1, // System user
                            ['retention_days' => $retentionDays]
                        );
                    }

                    $deleted[$entityType] = count($expiredIds);
                }
            } catch (Exception $e) {
                error_log("Auto-cleanup failed for {$entityType}: " . $e->getMessage());
            }
        }

        return [
            'success' => true,
            'deleted' => $deleted,
            'total' => array_sum($deleted)
        ];
    }
}
