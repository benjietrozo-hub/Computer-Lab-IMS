<?php
/**
 * Test script to verify activity log broadcasting
 */

// Simulate a test activity log broadcast
$testLog = [
    'log' => [
        'id' => 999999,
        'user_id' => 6717,
        'user_name' => 'Test Admin',
        'user_email' => 'test@example.com',
        'user_role' => 'admin',
        'action' => 'test',
        'module' => 'testing',
        'entity_type' => 'test',
        'entity_id' => 1,
        'entity_name' => 'Test Entity',
        'description' => 'This is a test activity log broadcast',
        'severity' => 'info',
        'device_type' => 'desktop',
        'browser' => 'Chrome 120',
        'os' => 'Windows 11',
        'is_bot' => false,
        'created_at' => date('Y-m-d H:i:s')
    ]
];

echo "Sending test activity log broadcast...\n";
echo "Log data: " . json_encode($testLog, JSON_PRETTY_PRINT) . "\n\n";

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'http://localhost:8082/broadcast-activity-log');
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($testLog));
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 5);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);
curl_close($ch);

echo "HTTP Status Code: $httpCode\n";
if ($error) {
    echo "cURL Error: $error\n";
}
echo "Response: $response\n";

if ($httpCode === 200) {
    $result = json_decode($response, true);
    if ($result && $result['success']) {
        echo "\n✅ SUCCESS! Broadcast sent to {$result['sent']} admin clients out of {$result['adminCount']} total admin clients ({$result['totalClients']} total clients)\n";
    } else {
        echo "\n❌ FAILED! Response indicates failure\n";
    }
} else {
    echo "\n❌ FAILED! HTTP error code: $httpCode\n";
}
