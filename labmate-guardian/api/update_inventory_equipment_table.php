<?php
require_once 'db.php';

echo "Updating inventory_equipment table...\n";

$conn = get_db_connection();

// Add price column
$sql = "ALTER TABLE inventory_equipment ADD COLUMN price DECIMAL(10,2) DEFAULT 0.00 AFTER `condition`";
if ($conn->query($sql)) {
    echo "Added price column successfully!\n";
} else {
    echo "Error adding price column: " . $conn->error . "\n";
}

// Add assigned_to column
$sql = "ALTER TABLE inventory_equipment ADD COLUMN assigned_to VARCHAR(255) DEFAULT NULL AFTER price";
if ($conn->query($sql)) {
    echo "Added assigned_to column successfully!\n";
} else {
    echo "Error adding assigned_to column: " . $conn->error . "\n";
}

// Add updated_at column if it doesn't exist
$sql = "ALTER TABLE inventory_equipment ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER created_at";
if ($conn->query($sql)) {
    echo "Added updated_at column successfully!\n";
} else {
    echo "Error adding updated_at column: " . $conn->error . "\n";
}

$conn->close();
echo "Table update completed!\n";
?>
