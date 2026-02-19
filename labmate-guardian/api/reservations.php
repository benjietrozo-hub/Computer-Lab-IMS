<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once 'db.php';
require_once __DIR__ . '/trash/TrashService.php';
require_once __DIR__ . '/activity_log_helper.php';

class ReservationsAPI {
    private $conn;
    
    public function __construct() {
        $this->conn = get_db_connection();
    }
    
    public function handleRequest() {
        $method = $_SERVER['REQUEST_METHOD'];
        
        switch ($method) {
            case 'GET':
                $this->getReservations();
                break;
            case 'POST':
                $this->createReservation();
                break;
            case 'PUT':
                $this->updateReservation();
                break;
            case 'DELETE':
                $this->deleteReservation();
                break;
            default:
                $this->sendResponse(['error' => 'Method not allowed'], 405);
        }
    }
    
    private function getReservations() {
        $equipment_id = $_GET['equipment_id'] ?? null;
        $date = $_GET['date'] ?? null;
        $user_id = $_GET['user_id'] ?? null;
        $status = $_GET['status'] ?? null;
        
        $sql = "SELECT r.*, u.first_name, u.last_name, ie.name as equipment_name 
                FROM equipment_reservations r 
                LEFT JOIN users u ON r.user_id = u.id 
                LEFT JOIN inventory_equipment ie ON r.equipment_id = ie.id 
                WHERE r.deleted_at IS NULL";
        
        $params = [];
        $types = "";
        
        if ($equipment_id) {
            $sql .= " AND r.equipment_id = ?";
            $params[] = $equipment_id;
            $types .= "s";
        }
        
        if ($date) {
            $sql .= " AND r.reservation_date = ?";
            $params[] = $date;
            $types .= "s";
        }
        
        if ($user_id) {
            $sql .= " AND r.user_id = ?";
            $params[] = $user_id;
            $types .= "i";
        }
        
        if ($status) {
            $sql .= " AND r.status = ?";
            $params[] = $status;
            $types .= "s";
        }
        
        $sql .= " ORDER BY r.reservation_date, r.start_time";
        
        $stmt = $this->conn->prepare($sql);
        
        if (!empty($params)) {
            $stmt->bind_param($types, ...$params);
        }
        
        $stmt->execute();
        $result = $stmt->get_result();
        $reservations = [];
        
        while ($row = $result->fetch_assoc()) {
            $reservations[] = [
                'id' => $row['id'],
                'reservation_number' => $row['reservation_number'],
                'equipment_id' => $row['equipment_id'],
                'user_id' => $row['user_id'],
                'reservation_date' => $row['reservation_date'],
                'start_time' => $row['start_time'],
                'end_time' => $row['end_time'],
                'quantity_reserved' => $row['quantity_reserved'],
                'purpose' => $row['purpose'],
                'user_type' => $row['user_type'],
                'contact_info' => $row['contact_info'],
                'status' => $row['status'],
                'approved_by' => $row['approved_by'],
                'approved_at' => $row['approved_at'],
                'rejection_reason' => $row['rejection_reason'],
                'notes' => $row['notes'],
                'penalty_amount' => isset($row['penalty_amount']) ? (float)$row['penalty_amount'] : 0,
                'penalty_paid' => isset($row['penalty_paid']) ? (bool)$row['penalty_paid'] : false,
                'created_at' => $row['created_at'],
                'updated_at' => $row['updated_at'],
                'user_name' => trim($row['first_name'] . ' ' . $row['last_name']),
                'equipment_name' => $row['equipment_name']
            ];
        }
        
        $this->sendResponse(['reservations' => $reservations]);
    }
    
    private function createReservation() {
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (!$data) {
            $this->sendResponse(['error' => 'Invalid JSON data'], 400);
            return;
        }
        
        $required_fields = ['equipment_id', 'user_id', 'reservation_date', 'start_time', 'end_time', 'quantity_reserved'];
        foreach ($required_fields as $field) {
            if (!isset($data[$field]) || empty($data[$field])) {
                $this->sendResponse(['error' => "Missing required field: $field"], 400);
                return;
            }
        }

        if (!is_numeric($data['quantity_reserved']) || (int)$data['quantity_reserved'] <= 0) {
            $this->sendResponse(['error' => 'Quantity must be a positive number'], 400);
            return;
        }

        $reservationDate = $data['reservation_date'];
        $startTime = $data['start_time'];
        $endTime = $data['end_time'];

        $startTimestamp = strtotime($reservationDate . ' ' . $startTime);
        $endTimestamp = strtotime($reservationDate . ' ' . $endTime);

        if ($startTimestamp === false || $endTimestamp === false) {
            $this->sendResponse(['error' => 'Invalid start or end time'], 400);
            return;
        }

        if ($endTimestamp <= $startTimestamp) {
            $this->sendResponse(['error' => 'End time must be after start time'], 400);
            return;
        }

        $now = time();
        if ($startTimestamp < $now) {
            $this->sendResponse(['error' => 'Cannot create reservations in the past'], 400);
            return;
        }
        
        // Generate reservation number
        $reservation_number = $this->generateReservationNumber($data['user_type'] ?? 'student');
        
        // Check for conflicts
        if ($this->hasConflicts($data)) {
            $this->sendResponse(['error' => 'Reservation conflicts with existing bookings'], 409);
            return;
        }
        
        if (!$this->checkEquipmentAvailability($data['equipment_id'], $data['reservation_date'], $data['start_time'], $data['end_time'], (int)$data['quantity_reserved'])) {
            $this->sendResponse(['error' => 'Insufficient equipment quantity available'], 409);
            return;
        }
        
        $auto_approve = $this->getSetting('reservation_auto_approve') === 'true';
        $require_approval = $this->getSetting('reservation_require_approval') === 'true';
        
        $status = 'pending';
        if ($auto_approve && !$require_approval) {
            $status = 'approved';
        }
        
        $id = $this->generateUUID();
        
        $sql = "INSERT INTO equipment_reservations (id, reservation_number, equipment_id, user_id, reservation_date, start_time, end_time, quantity_reserved, purpose, user_type, contact_info, status, created_at) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())";
        
        $stmt = $this->conn->prepare($sql);
        if (!$stmt) {
            $this->sendResponse(['error' => 'Database error: ' . $this->conn->error], 500);
        }

        $equipmentId = $data['equipment_id'];
        $userId = $data['user_id'];
        $reservationDate = $data['reservation_date'];
        $startTimeParam = $data['start_time'];
        $endTimeParam = $data['end_time'];
        $quantityReserved = (int)$data['quantity_reserved'];
        $purpose = isset($data['purpose']) ? $data['purpose'] : null;
        $userType = isset($data['user_type']) ? $data['user_type'] : 'student';
        $contactInfo = isset($data['contact_info']) ? $data['contact_info'] : null;
        $statusParam = $status;

        $stmt->bind_param(
            "sssssissssss",
            $id,
            $reservation_number,
            $equipmentId,
            $userId,
            $reservationDate,
            $startTimeParam,
            $endTimeParam,
            $quantityReserved,
            $purpose,
            $userType,
            $contactInfo,
            $statusParam
        );
        
        if ($stmt->execute()) {
            $reservation = $this->getReservationById($id);
            
            // Log reservation creation
            logCreate('reservations', 'reservation', $id, $reservation_number, [
                'equipment_id' => $equipmentId,
                'reservation_date' => $reservationDate,
                'quantity' => $quantityReserved,
                'status' => $status
            ]);
            
            $this->sendResponse(['success' => true, 'reservation' => $reservation], 201);
        } else {
            $this->sendResponse(['error' => 'Failed to create reservation'], 500);
        }
    }
    
    private function updateReservation() {
        $data = json_decode(file_get_contents('php://input'), true);
        $id = $_GET['id'] ?? null;
        
        if (!$id) {
            $this->sendResponse(['error' => 'Reservation ID required'], 400);
            return;
        }
        
        if (!$data) {
            $this->sendResponse(['error' => 'Invalid JSON data'], 400);
            return;
        }
        
        $allowed_fields = ['status', 'approved_by', 'rejection_reason', 'notes'];
        $updates = [];
        $params = [];
        $types = "";
        
        foreach ($allowed_fields as $field) {
            if (isset($data[$field])) {
                $updates[] = "$field = ?";
                $params[] = $data[$field];
                $types .= "s";
            }
        }
        
        if (empty($updates)) {
            $this->sendResponse(['error' => 'No valid fields to update'], 400);
            return;
        }
        
        // Add approved_at if status is being changed to approved
        if (isset($data['status']) && $data['status'] === 'approved') {
            $updates[] = "approved_at = NOW()";
        }
        
        $params[] = $id;
        $types .= "s";
        
        $sql = "UPDATE equipment_reservations SET " . implode(', ', $updates) . " WHERE id = ?";
        
        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param($types, ...$params);
        
        if ($stmt->execute()) {
            $reservation = $this->getReservationById($id);
            
            // Log reservation update
            logUpdate('reservations', 'reservation', $id, $reservation['reservation_number'] ?? $id, null, $data);
            
            $this->sendResponse(['success' => true, 'reservation' => $reservation]);
        } else {
            $this->sendResponse(['error' => 'Failed to update reservation'], 500);
        }
    }
    
    private function deleteReservation() {
        $id = $_GET['id'] ?? null;
        
        if (!$id) {
            $this->sendResponse(['error' => 'Reservation ID required'], 400);
            return;
        }
        
        // Get current user from session/headers
        $headers = getallheaders();
        $userId = $headers['X-User-Id'] ?? null;
        
        // If no user ID provided, try to get the first admin user
        if (!$userId) {
            $userResult = $this->conn->query("SELECT id FROM users WHERE role='admin' LIMIT 1");
            if ($userResult && $userResult->num_rows > 0) {
                $user = $userResult->fetch_assoc();
                $userId = $user['id'];
            }
        }
        
        // Get reservation details for logging
        $res_sql = "SELECT reservation_number FROM equipment_reservations WHERE id = ?";
        $res_stmt = $this->conn->prepare($res_sql);
        $res_stmt->bind_param('s', $id);
        $res_stmt->execute();
        $res_result = $res_stmt->get_result();
        $res_data = $res_result->fetch_assoc();
        $res_stmt->close();
        
        // Use TrashService for soft delete
        $trashService = new TrashService($this->conn);
        $result = $trashService->softDelete(
            'reservation',
            $id,
            $userId ? (int)$userId : null,
            'Reservations'
        );
        
        if ($result['success']) {
            // Log reservation deletion
            if ($res_data) {
                logDelete('reservations', 'reservation', $id, $res_data['reservation_number'] ?? $id);
            }
            $this->sendResponse(['success' => true, 'message' => 'Reservation moved to trash. You can restore it from the Trash page.']);
        } else {
            $this->sendResponse(['error' => $result['error']], 500);
        }
    }
    
    private function hasConflicts($data) {
        $sql = "SELECT COUNT(*) as count FROM equipment_reservations 
                WHERE equipment_id = ? AND reservation_date = ? AND status = 'approved' AND deleted_at IS NULL
                AND ((start_time < ? AND end_time > ?) OR (start_time < ? AND end_time > ?) OR (start_time >= ? AND end_time <= ?))";
        
        $stmt = $this->conn->prepare($sql);
        if (!$stmt) {
            $this->sendResponse(['error' => 'Database error: ' . $this->conn->error], 500);
        }
        $stmt->bind_param("ssssssss", 
            $data['equipment_id'], 
            $data['reservation_date'], 
            $data['start_time'], 
            $data['start_time'], 
            $data['end_time'], 
            $data['end_time'], 
            $data['start_time'], 
            $data['end_time']
        );
        
        $stmt->execute();
        $result = $stmt->get_result();
        $row = $result->fetch_assoc();
        
        return $row['count'] > 0;
    }
    
    private function checkEquipmentAvailability($equipment_id, $date, $start_time, $end_time, $quantity) {
        // Get total equipment quantity
        $sql = "SELECT quantity FROM inventory_equipment WHERE id = ? AND deleted_at IS NULL";
        $stmt = $this->conn->prepare($sql);
        if (!$stmt) {
            $this->sendResponse(['error' => 'Database error: ' . $this->conn->error], 500);
        }
        $stmt->bind_param("s", $equipment_id);
        $stmt->execute();
        $result = $stmt->get_result();
        $equipment = $result->fetch_assoc();
        
        if (!$equipment) {
            return false;
        }
        
        // Get total reserved quantity for the time slot
        $sql = "SELECT SUM(quantity_reserved) as total_reserved FROM equipment_reservations 
                WHERE equipment_id = ? AND reservation_date = ? AND status = 'approved' AND deleted_at IS NULL
                AND ((start_time < ? AND end_time > ?) OR (start_time < ? AND end_time > ?) OR (start_time >= ? AND end_time <= ?))";
        
        $stmt = $this->conn->prepare($sql);
        if (!$stmt) {
            $this->sendResponse(['error' => 'Database error: ' . $this->conn->error], 500);
        }
        $stmt->bind_param("ssssssss", 
            $equipment_id, 
            $date, 
            $start_time, 
            $start_time, 
            $end_time, 
            $end_time, 
            $start_time, 
            $end_time
        );
        
        $stmt->execute();
        $result = $stmt->get_result();
        $row = $result->fetch_assoc();
        
        $total_reserved = $row['total_reserved'] ?? 0;
        
        return ($total_reserved + $quantity) <= $equipment['quantity'];
    }
    
    private function getReservationById($id) {
        $sql = "SELECT r.*, u.first_name, u.last_name, ie.name as equipment_name 
                FROM equipment_reservations r 
                LEFT JOIN users u ON r.user_id = u.id 
                LEFT JOIN inventory_equipment ie ON r.equipment_id = ie.id 
                WHERE r.id = ? AND r.deleted_at IS NULL";
        
        $stmt = $this->conn->prepare($sql);
        if (!$stmt) {
            $this->sendResponse(['error' => 'Database error: ' . $this->conn->error], 500);
        }
        $stmt->bind_param("s", $id);
        $stmt->execute();
        $result = $stmt->get_result();
        $row = $result->fetch_assoc();
        
        if ($row) {
            return [
                'id' => $row['id'],
                'reservation_number' => $row['reservation_number'],
                'equipment_id' => $row['equipment_id'],
                'user_id' => $row['user_id'],
                'reservation_date' => $row['reservation_date'],
                'start_time' => $row['start_time'],
                'end_time' => $row['end_time'],
                'quantity_reserved' => $row['quantity_reserved'],
                'purpose' => $row['purpose'],
                'user_type' => $row['user_type'],
                'contact_info' => $row['contact_info'],
                'status' => $row['status'],
                'approved_by' => $row['approved_by'],
                'approved_at' => $row['approved_at'],
                'rejection_reason' => $row['rejection_reason'],
                'notes' => $row['notes'],
                'penalty_amount' => isset($row['penalty_amount']) ? (float)$row['penalty_amount'] : 0,
                'penalty_paid' => isset($row['penalty_paid']) ? (bool)$row['penalty_paid'] : false,
                'created_at' => $row['created_at'],
                'updated_at' => $row['updated_at'],
                'user_name' => trim($row['first_name'] . ' ' . $row['last_name']),
                'equipment_name' => $row['equipment_name']
            ];
        }
        
        return null;
    }
    
    private function getSetting($key) {
        $sql = "SELECT setting_value FROM system_settings WHERE setting_key = ?";
        $stmt = $this->conn->prepare($sql);
        if (!$stmt) {
            return null;
        }
        $stmt->bind_param("s", $key);
        $stmt->execute();
        $result = $stmt->get_result();
        $row = $result->fetch_assoc();
        
        return $row['setting_value'] ?? null;
    }
    
    private function generateReservationNumber($userType) {
        $prefix = '';
        switch ($userType) {
            case 'staff':
                $prefix = 'STF';
                break;
            case 'faculty':
                $prefix = 'FAC';
                break;
            case 'visitor':
                $prefix = 'VIS';
                break;
            case 'student':
            default:
                $prefix = 'STD';
                break;
        }
        
        $year = date('Y');
        $sequence = $this->getNextReservationSequence($userType);
        
        return $prefix . '-' . $year . '-' . str_pad($sequence, 4, '0', STR_PAD_LEFT);
    }
    
    private function getNextReservationSequence($userType) {
        $sql = "SELECT COUNT(*) as count FROM equipment_reservations WHERE user_type = ? AND YEAR(created_at) = ?";
        $stmt = $this->conn->prepare($sql);
        if (!$stmt) {
            return 1;
        }
        $year = date('Y');
        $stmt->bind_param('ss', $userType, $year);
        $stmt->execute();
        $result = $stmt->get_result();
        $row = $result->fetch_assoc();
        return ($row['count'] ?? 0) + 1;
    }
    
    private function generateUUID() {
        return sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
            mt_rand(0, 0xffff), mt_rand(0, 0xffff),
            mt_rand(0, 0xffff),
            mt_rand(0, 0x0fff) | 0x4000,
            mt_rand(0, 0x3fff) | 0x8000,
            mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
        );
    }
    
    private function sendResponse($data, $statusCode = 200) {
        http_response_code($statusCode);
        echo json_encode($data);
        exit;
    }
}

$api = new ReservationsAPI();
$api->handleRequest();
?>
