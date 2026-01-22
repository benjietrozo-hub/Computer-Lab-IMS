<?php
require_once 'db.php';

echo "Updating equipment_reservations table...\n";

$conn = get_db_connection();

// Add reservation_number column
$sql = "ALTER TABLE equipment_reservations ADD COLUMN reservation_number VARCHAR(20) DEFAULT NULL AFTER id";
if ($conn->query($sql)) {
    echo "Added reservation_number column successfully!\n";
} else {
    echo "Error adding reservation_number column: " . $conn->error . "\n";
}

// Add user_type column
$sql = "ALTER TABLE equipment_reservations ADD COLUMN user_type ENUM('student', 'staff', 'faculty', 'visitor') DEFAULT 'student' AFTER quantity_reserved";
if ($conn->query($sql)) {
    echo "Added user_type column successfully!\n";
} else {
    echo "Error adding user_type column: " . $conn->error . "\n";
}

// Add contact_info column
$sql = "ALTER TABLE equipment_reservations ADD COLUMN contact_info TEXT DEFAULT NULL AFTER user_type";
if ($conn->query($sql)) {
    echo "Added contact_info column successfully!\n";
} else {
    echo "Error adding contact_info column: " . $conn->error . "\n";
}

// Add penalty_amount column
$sql = "ALTER TABLE equipment_reservations ADD COLUMN penalty_amount DECIMAL(10,2) DEFAULT 0.00 AFTER notes";
if ($conn->query($sql)) {
    echo "Added penalty_amount column successfully!\n";
} else {
    echo "Error adding penalty_amount column: " . $conn->error . "\n";
}

// Add penalty_paid column
$sql = "ALTER TABLE equipment_reservations ADD COLUMN penalty_paid BOOLEAN DEFAULT FALSE AFTER penalty_amount";
if ($conn->query($sql)) {
    echo "Added penalty_paid column successfully!\n";
} else {
    echo "Error adding penalty_paid column: " . $conn->error . "\n";
}

// Add updated_at column if it doesn't exist
$sql = "ALTER TABLE equipment_reservations ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER created_at";
if ($conn->query($sql)) {
    echo "Added updated_at column successfully!\n";
} else {
    echo "Error adding updated_at column: " . $conn->error . "\n";
}

$conn->close();
echo "Reservations table update completed!\n";
?>
