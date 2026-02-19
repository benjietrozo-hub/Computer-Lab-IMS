<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-User-ID, X-User-Role');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'db.php';
require_once 'ActivityLogger.php';

// Get headers
$headers = getallheaders();
$userId = $headers['X-User-ID'] ?? $headers['X-User-Id'] ?? null;
$userRole = $headers['X-User-Role'] ?? null;

// Check if user is admin
if ($userRole !== 'admin') {
    http_response_code(403);
    echo json_encode([
        'success' => false,
        'error' => 'Access denied. Admin privileges required.'
    ]);
    exit();
}

$db = get_db_connection();
$logger = new ActivityLogger($db);

$method = $_SERVER['REQUEST_METHOD'];

try {
    if ($method === 'GET') {
        // Get filters from query parameters
        $filters = [
            'user_id' => $_GET['user_id'] ?? null,
            'action' => $_GET['action'] ?? null,
            'module' => $_GET['module'] ?? null,
            'entity_type' => $_GET['entity_type'] ?? null,
            'severity' => $_GET['severity'] ?? null,
            'device_type' => $_GET['device_type'] ?? null,
            'start_date' => $_GET['start_date'] ?? null,
            'end_date' => $_GET['end_date'] ?? null,
            'search' => $_GET['search'] ?? null,
            'limit' => $_GET['limit'] ?? 100,
            'offset' => $_GET['offset'] ?? 0
        ];
        
        // Remove null values
        $filters = array_filter($filters, function($value) {
            return $value !== null && $value !== '';
        });
        
        // Get stats if requested
        if (isset($_GET['stats']) && $_GET['stats'] === 'true') {
            $stats = $logger->getStats($filters);
            echo json_encode([
                'success' => true,
                'data' => $stats
            ]);
            exit();
        }
        
        // Get logs
        $logs = $logger->getLogs($filters);
        
        echo json_encode([
            'success' => true,
            'data' => $logs,
            'count' => count($logs)
        ]);
        
    } else {
        http_response_code(405);
        echo json_encode([
            'success' => false,
            'error' => 'Method not allowed'
        ]);
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
