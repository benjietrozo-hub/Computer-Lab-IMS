<?php
// Enable error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Set headers
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

// Test database connection
require_once 'db.php';
$conn = get_db_connection();

if ($conn->connect_error) {
    echo json_encode([
        'success' => false,
        'error' => 'Database connection failed: ' . $conn->connect_error
    ]);
    exit;
}

// Get the data
$sql = "SELECT * FROM inventory_equipment ORDER BY created_at DESC";
$result = $conn->query($sql);

if (!$result) {
    echo json_encode([
        'success' => false,
        'error' => 'Query failed: ' . $conn->error
    ]);
    exit;
}

$items = [];
while ($row = $result->fetch_assoc()) {
    $items[] = $row;
}

echo json_encode([
    'success' => true,
    'count' => count($items),
    'data' => $items
]);

$conn->close();
?>
