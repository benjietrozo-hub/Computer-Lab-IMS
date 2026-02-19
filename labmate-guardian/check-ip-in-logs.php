<?php
/**
 * Check if IP addresses are being stored in activity logs
 */

require_once __DIR__ . '/api/db.php';

$conn = get_db_connection();

echo "Checking recent activity logs for IP addresses...\n\n";

$sql = "SELECT id, user_name, action, module, ip_address, real_ip, created_at 
        FROM activity_logs 
        ORDER BY created_at DESC 
        LIMIT 10";

$result = $conn->query($sql);

if ($result && $result->num_rows > 0) {
    echo "Recent Activity Logs:\n";
    echo str_repeat("=", 100) . "\n";
    printf("%-5s %-20s %-10s %-15s %-20s %-20s %-20s\n", 
        "ID", "User", "Action", "Module", "IP Address", "Real IP", "Created At");
    echo str_repeat("-", 100) . "\n";
    
    while ($row = $result->fetch_assoc()) {
        printf("%-5s %-20s %-10s %-15s %-20s %-20s %-20s\n",
            $row['id'],
            substr($row['user_name'] ?? 'N/A', 0, 20),
            substr($row['action'], 0, 10),
            substr($row['module'], 0, 15),
            $row['ip_address'] ?? 'NULL',
            $row['real_ip'] ?? 'NULL',
            $row['created_at']
        );
    }
    echo str_repeat("=", 100) . "\n\n";
    
    // Count logs with IP addresses
    $countSql = "SELECT 
        COUNT(*) as total,
        COUNT(ip_address) as with_ip,
        COUNT(real_ip) as with_real_ip
        FROM activity_logs";
    
    $countResult = $conn->query($countSql);
    if ($countResult) {
        $counts = $countResult->fetch_assoc();
        echo "Statistics:\n";
        echo "  Total logs: {$counts['total']}\n";
        echo "  Logs with IP address: {$counts['with_ip']}\n";
        echo "  Logs with real IP: {$counts['with_real_ip']}\n";
        
        if ($counts['with_ip'] > 0) {
            echo "\n✅ IP addresses are being stored correctly!\n";
        } else {
            echo "\n⚠️  No IP addresses found in logs.\n";
        }
    }
} else {
    echo "No activity logs found.\n";
}

$conn->close();
