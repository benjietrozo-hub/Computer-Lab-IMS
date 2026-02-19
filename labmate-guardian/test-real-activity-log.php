<?php
/**
 * Test script to create a real activity log and verify it broadcasts with ID
 */

require_once __DIR__ . '/api/db.php';
require_once __DIR__ . '/api/ActivityLogger.php';

$conn = get_db_connection();
$logger = new ActivityLogger($conn);

echo "Creating a test activity log...\n\n";

$testUser = [
    'id' => 6717,
    'first_name' => 'Test',
    'last_name' => 'Admin',
    'email' => 'test@example.com',
    'role' => 'admin'
];

$result = $logger->log([
    'user_id' => $testUser['id'],
    'user_name' => $testUser['first_name'] . ' ' . $testUser['last_name'],
    'user_email' => $testUser['email'],
    'user_role' => $testUser['role'],
    'action' => 'test',
    'module' => 'testing',
    'entity_type' => 'test',
    'entity_id' => 999,
    'entity_name' => 'Test Entity ' . time(),
    'description' => 'This is a test activity log created at ' . date('Y-m-d H:i:s'),
    'severity' => 'info',
    'user_agent' => 'Test Script/1.0'
]);

if ($result) {
    $insertedId = $conn->insert_id;
    echo "✅ SUCCESS! Activity log created with ID: $insertedId\n";
    echo "The log should have been broadcast to all connected admin clients.\n";
    echo "Check your browser's Activity Logs page to see if it appears in real-time.\n";
} else {
    echo "❌ FAILED! Could not create activity log.\n";
}

$conn->close();
