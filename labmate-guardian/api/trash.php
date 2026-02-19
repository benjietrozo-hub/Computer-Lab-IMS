<?php
// Task 7.1: Create TrashController with all endpoints
// API endpoints for trash/recycle bin operations

// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/trash/TrashService.php';
require_once __DIR__ . '/trash/AuditLogger.php';
require_once __DIR__ . '/activity_log_helper.php';

// Get database connection
$conn = get_db_connection();

// Initialize services
$trashService = new TrashService($conn);
$auditLogger = new AuditLogger($conn);

// Get request method and path
$method = $_SERVER['REQUEST_METHOD'];
$path = $_SERVER['REQUEST_URI'];
$pathParts = explode('/', trim(parse_url($path, PHP_URL_PATH), '/'));

// Debug logging
error_log("Trash API - Method: $method, Path: $path");

// Simple authentication check (you should implement proper JWT validation)
function getUserFromRequest() {
    // For now, return a mock user. Replace with actual JWT validation
    $headers = getallheaders();
    $authHeader = $headers['Authorization'] ?? '';
    
    // Mock user for development
    return [
        'id' => 6717,
        'role' => 'root_admin',
        'username' => 'admin'
    ];
}

function sendResponse($data, $statusCode = 200) {
    http_response_code($statusCode);
    echo json_encode($data);
    exit();
}

function sendError($message, $code = 'ERROR', $statusCode = 400) {
    sendResponse([
        'success' => false,
        'error' => [
            'code' => $code,
            'message' => $message
        ]
    ], $statusCode);
}

// Get current user
$currentUser = getUserFromRequest();
if (!$currentUser) {
    sendError('Unauthorized', 'UNAUTHORIZED', 401);
}

// Route handling
try {
    // GET - Handle with action parameter or path
    if ($method === 'GET') {
        $action = $_GET['action'] ?? '';
        
        // GET ?action=count - Get trash item count
        if ($action === 'count' || strpos($path, '/count') !== false) {
            $count = $trashService->getTrashCount();
            sendResponse([
                'success' => true,
                'count' => $count
            ]);
        }
        // GET - List trash items (default)
        else {
            $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
            $pageSize = isset($_GET['pageSize']) ? (int)$_GET['pageSize'] : 50;
            
            $filters = [];
            if (isset($_GET['entity_type'])) $filters['entity_type'] = $_GET['entity_type'];
            if (isset($_GET['search'])) $filters['search'] = $_GET['search'];
            if (isset($_GET['deleted_by'])) $filters['deleted_by'] = (int)$_GET['deleted_by'];
            if (isset($_GET['date_from'])) $filters['date_from'] = $_GET['date_from'];
            if (isset($_GET['date_to'])) $filters['date_to'] = $_GET['date_to'];
            
            $result = $trashService->getTrashItems($page, $pageSize, $filters);
            sendResponse([
                'success' => true,
                'data' => $result
            ]);
        }
    }
    
    // GET /api/trash/audit - Get audit trail
    elseif ($method === 'GET' && strpos($path, '/api/trash/audit') !== false) {
        $filters = [];
        if (isset($_GET['entity_type'])) $filters['entity_type'] = $_GET['entity_type'];
        if (isset($_GET['action'])) $filters['action'] = $_GET['action'];
        if (isset($_GET['user_id'])) $filters['user_id'] = (int)$_GET['user_id'];
        if (isset($_GET['date_from'])) $filters['date_from'] = $_GET['date_from'];
        if (isset($_GET['date_to'])) $filters['date_to'] = $_GET['date_to'];
        if (isset($_GET['limit'])) $filters['limit'] = (int)$_GET['limit'];
        if (isset($_GET['offset'])) $filters['offset'] = (int)$_GET['offset'];
        
        $auditLogs = $auditLogger->getAuditTrail($filters);
        $total = $auditLogger->getAuditCount($filters);
        
        sendResponse([
            'success' => true,
            'data' => [
                'logs' => $auditLogs,
                'total' => $total
            ]
        ]);
    }
    
    // POST - Restore single item (check for /restore/ in path)
    elseif ($method === 'POST' && strpos($path, '/restore/') !== false) {
        // Extract entity ID from path
        preg_match('#/restore/([^/?]+)#', $path, $matches);
        $entityId = $matches[1] ?? '';
        
        $input = json_decode(file_get_contents('php://input'), true);
        $entityType = $input['entity_type'] ?? '';
        
        if (!$entityType) {
            sendError('Entity type is required', 'VALIDATION_ERROR');
        }
        
        if (!$entityId) {
            sendError('Entity ID is required', 'VALIDATION_ERROR');
        }
        
        $result = $trashService->restoreItem($entityType, $entityId, $currentUser['id']);
        
        if ($result['success']) {
            // Log restore operation
            logRestore('trash', $entityType, $entityId, $entityId);
            sendResponse($result);
        } else {
            sendError($result['error'], $result['conflicts'] ?? 'RESTORE_FAILED', 400);
        }
    }
    
    // POST - Restore multiple items (check for /restore-bulk in path)
    elseif ($method === 'POST' && strpos($path, '/restore-bulk') !== false) {
        $input = json_decode(file_get_contents('php://input'), true);
        $items = $input['items'] ?? [];
        
        if (empty($items)) {
            sendError('Items array is required', 'VALIDATION_ERROR');
        }
        
        $result = $trashService->restoreBulk($items, $currentUser['id']);
        sendResponse([
            'success' => true,
            'data' => $result
        ]);
    }
    
    // DELETE - Permanently delete single item (check for /permanent/ in path)
    elseif ($method === 'DELETE' && strpos($path, '/permanent/') !== false) {
        // Extract entity ID from path
        preg_match('#/permanent/([^/?]+)#', $path, $matches);
        $entityId = $matches[1] ?? '';
        
        $input = json_decode(file_get_contents('php://input'), true);
        $entityType = $input['entity_type'] ?? '';
        
        if (!$entityType) {
            sendError('Entity type is required', 'VALIDATION_ERROR');
        }
        
        if (!$entityId) {
            sendError('Entity ID is required', 'VALIDATION_ERROR');
        }
        
        $result = $trashService->permanentDelete($entityType, $entityId, $currentUser['id'], $currentUser['role']);
        
        if ($result['success']) {
            // Log permanent delete operation
            logActivity('permanent_delete', 'trash', $entityType, $entityId, $entityId, 
                "Permanently deleted {$entityType}: {$entityId}", 'critical');
            sendResponse($result);
        } else {
            $statusCode = ($result['error'] === 'Permission denied. Only Root Admin can permanently delete items.') ? 403 : 400;
            sendError($result['error'], 'PERMANENT_DELETE_FAILED', $statusCode);
        }
    }
    
    // DELETE - Permanently delete multiple items (check for /permanent-bulk in path)
    elseif ($method === 'DELETE' && strpos($path, '/permanent-bulk') !== false) {
        $input = json_decode(file_get_contents('php://input'), true);
        $items = $input['items'] ?? [];
        
        if (empty($items)) {
            sendError('Items array is required', 'VALIDATION_ERROR');
        }
        
        $result = $trashService->permanentDeleteBulk($items, $currentUser['id'], $currentUser['role']);
        sendResponse([
            'success' => true,
            'data' => $result
        ]);
    }
    
    else {
        sendError('Endpoint not found', 'NOT_FOUND', 404);
    }
    
} catch (Exception $e) {
    error_log("Trash API error: " . $e->getMessage());
    error_log("Stack trace: " . $e->getTraceAsString());
    sendError('Internal server error: ' . $e->getMessage(), 'SERVER_ERROR', 500);
}
