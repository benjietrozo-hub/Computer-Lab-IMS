<?php
require_once 'db.php';

echo "Testing inventory equipment table...\n";

$conn = get_db_connection();

// Check if table exists
$sql = "SHOW TABLES LIKE 'inventory_equipment'";
$result = $conn->query($sql);
if ($result->num_rows === 0) {
    echo "ERROR: inventory_equipment table does not exist!\n";
    exit;
}

// Check table structure
$sql = "DESCRIBE inventory_equipment";
$result = $conn->query($sql);
echo "\nTable structure:\n";
while ($row = $result->fetch_assoc()) {
    echo "- " . $row['Field'] . " (" . $row['Type'] . ")\n";
}

// Check if there are any records
$sql = "SELECT COUNT(*) as count FROM inventory_equipment";
$result = $conn->query($sql);
$row = $result->fetch_assoc();
echo "\nTotal records: " . $row['count'] . "\n";

// Show sample records if any exist
if ($row['count'] > 0) {
    $sql = "SELECT * FROM inventory_equipment LIMIT 5";
    $result = $conn->query($sql);
    echo "\nSample records:\n";
    while ($row = $result->fetch_assoc()) {
        echo "- ID: " . $row['id'] . ", Name: " . $row['name'] . ", Quantity: " . $row['quantity'] . "\n";
    }
}

$conn->close();
echo "\nTest completed.\n";
?>
