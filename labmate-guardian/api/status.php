<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-User-ID, X-User-Role, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once 'db.php';

class StatusAPI {
    private $conn;
    
    public function __construct() {
        $this->conn = get_db_connection();
    }
    
    public function handleRequest() {
        $method = $_SERVER['REQUEST_METHOD'];
        
        switch ($method) {
            case 'GET':
                $this->getStatuses();
                break;
            default:
                $this->sendResponse(['error' => 'Method not allowed'], 405);
        }
    }
    
    private function getStatuses() {
        // Get real counts from database
        $statuses = [];
        
        // Available items - items with quantity > 0 and not damaged/under maintenance
        $available_sql = "SELECT SUM(quantity) as count FROM inventory_equipment WHERE quantity > 0 AND (`condition` IS NULL OR `condition` NOT IN ('damaged', 'under_repair'))";
        $stmt = $this->conn->prepare($available_sql);
        $stmt->execute();
        $result = $stmt->get_result();
        $row = $result->fetch_assoc();
        $statuses[] = [
            'id' => 1,
            'name' => 'Available',
            'description' => 'Item is available for borrowing',
            'color' => '#10b981',
            'is_default' => true,
            'item_count' => $row['count'] ?? 0,
            'created_at' => '2024-01-15T10:30:00Z'
        ];
        
        // Borrowed items - count from borrow_items table
        $borrowed_sql = "SELECT COUNT(*) as count FROM borrow_items WHERE status = 'borrowed'";
        $stmt = $this->conn->prepare($borrowed_sql);
        $stmt->execute();
        $result = $stmt->get_result();
        $row = $result->fetch_assoc();
        $statuses[] = [
            'id' => 2,
            'name' => 'Borrowed',
            'description' => 'Item is currently borrowed',
            'color' => '#3b82f6',
            'is_default' => false,
            'item_count' => $row['count'],
            'created_at' => '2024-01-15T10:30:00Z'
        ];
        
        // Under Maintenance items - count from repair_maintenance table
        $maintenance_sql = "SELECT COUNT(*) as count FROM repair_maintenance WHERE status IN ('Pending', 'In Progress', 'pending', 'in_progress')";
        $stmt = $this->conn->prepare($maintenance_sql);
        $stmt->execute();
        $result = $stmt->get_result();
        $row = $result->fetch_assoc();
        $statuses[] = [
            'id' => 3,
            'name' => 'Under Maintenance',
            'description' => 'Item is under maintenance',
            'color' => '#f59e0b',
            'is_default' => false,
            'item_count' => $row['count'],
            'created_at' => '2024-01-15T10:30:00Z'
        ];
        
        // Damaged items - count from inventory_equipment where condition is damaged
        $damaged_sql = "SELECT SUM(quantity) as count FROM inventory_equipment WHERE `condition` = 'damaged'";
        $stmt = $this->conn->prepare($damaged_sql);
        $stmt->execute();
        $result = $stmt->get_result();
        $row = $result->fetch_assoc();
        $statuses[] = [
            'id' => 4,
            'name' => 'Damaged',
            'description' => 'Item is damaged and needs repair',
            'color' => '#ef4444',
            'is_default' => false,
            'item_count' => $row['count'] ?? 0,
            'created_at' => '2024-01-15T10:30:00Z'
        ];
        
        // Reserved items - count from equipment_reservations table
        $reserved_sql = "SELECT COUNT(*) as count FROM equipment_reservations WHERE status IN ('pending', 'approved')";
        $stmt = $this->conn->prepare($reserved_sql);
        $stmt->execute();
        $result = $stmt->get_result();
        $row = $result->fetch_assoc();
        $statuses[] = [
            'id' => 5,
            'name' => 'Reserved',
            'description' => 'Item is reserved for future use',
            'color' => '#8b5cf6',
            'is_default' => false,
            'item_count' => $row['count'],
            'created_at' => '2024-01-15T10:30:00Z'
        ];
        
        $this->sendResponse(['statuses' => $statuses]);
    }
    
    private function sendResponse($data, $statusCode = 200) {
        http_response_code($statusCode);
        echo json_encode($data);
        exit;
    }
}

$api = new StatusAPI();
$api->handleRequest();
?>
