<?php
require_once 'db.php';
require_once 'helpers.php';

echo "Testing inventory API response...\n";

$conn = get_db_connection();

// Test the exact query used in handle_get
$category = null;
$search = null;
$assigned_to = null;

$sql = "SELECT * FROM inventory_equipment WHERE 1=1";
$params = [];
$types = "";

if ($category) {
    $sql .= " AND category = ?";
    $params[] = $category;
    $types .= "s";
}

if ($search) {
    $sql .= " AND (name LIKE ? OR item_description LIKE ? OR serial_number LIKE ?)";
    $searchTerm = "%$search%";
    $params[] = $searchTerm;
    $params[] = $searchTerm;
    $params[] = $searchTerm;
    $types .= "sss";
}

if ($assigned_to) {
    $sql .= " AND assigned_to = ?";
    $params[] = $assigned_to;
    $types .= "s";
}

$sql .= " ORDER BY created_at DESC";

echo "SQL Query: " . $sql . "\n";
echo "Parameters: " . json_encode($params) . "\n";
echo "Types: " . $types . "\n\n";

$stmt = $conn->prepare($sql);
if (!empty($params)) {
    $stmt->bind_param($types, ...$params);
}

$stmt->execute();
$result = $stmt->get_result();

if (!$result) {
    echo "ERROR: Query failed - " . $conn->error . "\n";
} else {
    $rows = [];
    while ($row = $result->fetch_assoc()) {
        $rows[] = $row;
    }
    
    echo "SUCCESS: Found " . count($rows) . " records\n";
    
    // Test JSON response
    $response = ['success' => true, 'data' => $rows];
    echo "JSON Response: " . json_encode($response) . "\n";
}

$conn->close();
?>
