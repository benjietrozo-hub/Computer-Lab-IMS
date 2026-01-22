<?php
require_once 'db.php';

echo "Creating borrow_waiting_list table...\n";

$conn = get_db_connection();

$sql = "CREATE TABLE IF NOT EXISTS borrow_waiting_list (
    id CHAR(36) NOT NULL PRIMARY KEY,
    equipment_id CHAR(36) NOT NULL,
    user_id CHAR(36) NOT NULL,
    quantity_needed INT NOT NULL,
    borrow_request_id CHAR(36) NOT NULL,
    preferred_date DATE NULL,
    preferred_start_time TIME NULL,
    preferred_end_time TIME NULL,
    purpose TEXT NULL,
    priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
    status ENUM('waiting', 'notified', 'fulfilled', 'cancelled') DEFAULT 'waiting',
    notified_at DATETIME NULL,
    fulfilled_at DATETIME NULL,
    notes TEXT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_equipment_status (equipment_id, status),
    INDEX idx_user_status (user_id, status),
    INDEX idx_priority_created (priority DESC, created_at ASC),
    INDEX idx_borrow_request (borrow_request_id),
    
    FOREIGN KEY (equipment_id) REFERENCES inventory_equipment(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (borrow_request_id) REFERENCES borrow_requests(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";

if ($conn->query($sql)) {
    echo "Table borrow_waiting_list created successfully!\n";
} else {
    echo "Error creating table: " . $conn->error . "\n";
}

$conn->close();
?>
