<?php
require_once 'db.php';

echo "Creating activity_log table...\n";

$conn = get_db_connection();

// Check if table already exists
$sql = "SHOW TABLES LIKE 'activity_log'";
$result = $conn->query($sql);
if ($result->num_rows > 0) {
    echo "Table 'activity_log' already exists!\n";
    $conn->close();
    exit;
}

// Create activity_log table
$sql = "CREATE TABLE activity_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    admin_id INT NOT NULL,
    admin_email VARCHAR(255) NOT NULL,
    admin_name VARCHAR(255) NOT NULL,
    action VARCHAR(50) NOT NULL,
    table_name VARCHAR(50) NOT NULL,
    record_id VARCHAR(100) NOT NULL,
    record_description TEXT,
    old_values JSON,
    new_values JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_admin_id (admin_id),
    INDEX idx_action (action),
    INDEX idx_table_name (table_name),
    INDEX idx_created_at (created_at)
)";

if ($conn->query($sql)) {
    echo "Table 'activity_log' created successfully!\n";
} else {
    echo "Error creating table: " . $conn->error . "\n";
}

$conn->close();
?>
