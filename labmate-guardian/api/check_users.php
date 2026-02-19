<?php
/**
 * User Check Script
 * This script helps diagnose login issues by showing what users exist
 */

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/helpers.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

try {
    $conn = get_db_connection();
    
    // Get all users (without passwords)
    $sql = "SELECT id, email, role, first_name, last_name, created_at FROM users ORDER BY id";
    $result = $conn->query($sql);
    
    if (!$result) {
        send_json([
            'success' => false,
            'error' => 'Query failed: ' . $conn->error
        ], 500);
    }
    
    $users = [];
    while ($row = $result->fetch_assoc()) {
        $users[] = $row;
    }
    
    // Get counts by role
    $sql = "SELECT role, COUNT(*) as count FROM users GROUP BY role";
    $result = $conn->query($sql);
    $roleCounts = [];
    while ($row = $result->fetch_assoc()) {
        $roleCounts[$row['role']] = $row['count'];
    }
    
    send_json([
        'success' => true,
        'total_users' => count($users),
        'role_counts' => $roleCounts,
        'users' => $users,
        'message' => 'Found ' . count($users) . ' users in database'
    ]);
    
} catch (Exception $e) {
    send_json([
        'success' => false,
        'error' => $e->getMessage()
    ], 500);
}
