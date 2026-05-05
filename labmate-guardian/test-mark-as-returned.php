<?php
// Test script to debug mark as returned functionality
header('Content-Type: application/json');
error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once __DIR__ . '/api/db.php';

// Get test data
$conn = get_db_connection();

// Get a borrowed item
$sql = "SELECT * FROM borrow_items WHERE status = 'borrowed' LIMIT 1";
$result = $conn->query($sql);
$item = $result->fetch_assoc();

if (!$item) {
    echo json_encode(['error' => 'No borrowed items found for testing']);
    exit;
}

// Get an admin user
$admin_sql = "SELECT id, role, email FROM users WHERE role IN ('admin', 'staff', 'instructor', 'teacher') LIMIT 1";
$admin_result = $conn->query($admin_sql);
$admin = $admin_result->fetch_assoc();

if (!$admin) {
    echo json_encode(['error' => 'No admin user found for testing']);
    exit;
}

echo json_encode([
    'test_item' => [
        'id' => $item['id'],
        'borrower_name' => $item['borrower_name'],
        'item' => $item['item'],
        'quantity' => $item['quantity'],
        'status' => $item['status']
    ],
    'test_admin' => [
        'id' => $admin['id'],
        'role' => $admin['role'],
        'email' => $admin['email']
    ],
    'test_url' => "http://localhost/labmate/labmate-guardian/api/borrow_items.php?id={$item['id']}",
    'test_payload' => [
        'status' => 'returned',
        'return_condition' => 'good',
        'return_notes' => 'Test return',
        'admin_id' => $admin['id']
    ],
    'curl_command' => "curl -X PUT \"http://localhost/labmate/labmate-guardian/api/borrow_items.php?id={$item['id']}\" -H \"Content-Type: application/json\" -d '{\"status\":\"returned\",\"return_condition\":\"good\",\"return_notes\":\"Test return\",\"admin_id\":\"{$admin['id']}\"}'",
    'instructions' => [
        '1. Copy the curl_command above',
        '2. Run it in your terminal/command prompt',
        '3. Check the response',
        '4. Or use the test button below in the HTML version'
    ]
]);
?>
