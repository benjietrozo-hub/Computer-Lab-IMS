<?php
/**
 * Test script to show what activity logs look like with different IP addresses
 * This simulates what you'll see in production
 */

require_once __DIR__ . '/api/db.php';

$conn = get_db_connection();

echo "Creating test activity logs with different IP addresses...\n";
echo "This simulates what you'll see in production.\n\n";

// Sample IP addresses from different locations
$testIPs = [
    ['ip' => '203.123.45.67', 'location' => 'Public Internet - Philippines'],
    ['ip' => '192.168.1.105', 'location' => 'Local Network - Office'],
    ['ip' => '198.51.100.42', 'location' => 'Public Internet - USA'],
    ['ip' => '10.0.0.45', 'location' => 'Private Network - Campus'],
    ['ip' => '2001:db8:85a3::8a2e:370:7334', 'location' => 'IPv6 - Modern Network'],
    ['ip' => '172.16.0.100', 'location' => 'Private Network - Lab'],
];

$testUsers = [
    ['name' => 'John Doe', 'email' => 'john@example.com', 'action' => 'login'],
    ['name' => 'Jane Smith', 'email' => 'jane@example.com', 'action' => 'create'],
    ['name' => 'Bob Johnson', 'email' => 'bob@example.com', 'action' => 'update'],
    ['name' => 'Alice Brown', 'email' => 'alice@example.com', 'action' => 'delete'],
    ['name' => 'Charlie Wilson', 'email' => 'charlie@example.com', 'action' => 'login'],
    ['name' => 'Diana Davis', 'email' => 'diana@example.com', 'action' => 'create'],
];

echo "Inserting test logs...\n\n";

foreach ($testIPs as $index => $ipData) {
    $user = $testUsers[$index];
    
    $sql = "INSERT INTO activity_logs (
        user_id, user_name, user_email, user_role,
        action, module, entity_type, entity_id, entity_name,
        description, ip_address, user_agent,
        device_type, browser, os, severity
    ) VALUES (
        NULL, ?, ?, 'user',
        ?, 'inventory', 'equipment', 123, 'Test Equipment',
        ?, ?, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0',
        'desktop', 'Chrome 120', 'Windows 10', 'info'
    )";
    
    $stmt = $conn->prepare($sql);
    $description = "{$user['action']} from {$ipData['location']}";
    
    $stmt->bind_param(
        'sssss',
        $user['name'],
        $user['email'],
        $user['action'],
        $description,
        $ipData['ip']
    );
    
    if ($stmt->execute()) {
        echo "✅ Created log: {$user['name']} - {$user['action']} - IP: {$ipData['ip']}\n";
        echo "   Location: {$ipData['location']}\n\n";
    } else {
        echo "❌ Failed to create log for {$user['name']}\n\n";
    }
    
    $stmt->close();
}

echo "\n" . str_repeat("=", 80) . "\n";
echo "Test logs created! Now check the Activity Logs page to see different IPs.\n";
echo str_repeat("=", 80) . "\n\n";

// Display what the table will look like
echo "What you'll see in the Activity Logs table:\n\n";
echo "┌─────────────────────┬──────────────────┬────────┬───────────────────────────┐\n";
echo "│ User                │ Action           │ IP Address        │ Location              │\n";
echo "├─────────────────────┼──────────────────┼───────────────────┼───────────────────────┤\n";

foreach ($testIPs as $index => $ipData) {
    $user = $testUsers[$index];
    printf("│ %-19s │ %-16s │ %-17s │ %-21s │\n",
        substr($user['name'], 0, 19),
        substr($user['action'], 0, 16),
        substr($ipData['ip'], 0, 17),
        substr($ipData['location'], 0, 21)
    );
}

echo "└─────────────────────┴──────────────────┴───────────────────┴───────────────────────┘\n\n";

echo "Compare this to your current logs (all showing ::1 for localhost).\n";
echo "In production, you'll see diverse IPs like the ones above!\n";

$conn->close();
