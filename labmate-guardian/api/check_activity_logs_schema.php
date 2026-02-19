<?php
/**
 * Diagnostic Script: Check Activity Logs Table Schema
 * Run this to verify if the device tracking migration has been applied
 */

require_once __DIR__ . '/db.php';

header('Content-Type: application/json');

try {
    $conn = get_db_connection();
    
    // Get table structure
    $result = $conn->query("DESCRIBE activity_logs");
    
    if (!$result) {
        throw new Exception("Failed to describe table: " . $conn->error);
    }
    
    $columns = [];
    while ($row = $result->fetch_assoc()) {
        $columns[] = $row;
    }
    
    // Check for new columns
    $requiredColumns = ['device_type', 'browser', 'os', 'is_bot', 'real_ip'];
    $existingColumns = array_column($columns, 'Field');
    
    $missingColumns = array_diff($requiredColumns, $existingColumns);
    $migrationNeeded = count($missingColumns) > 0;
    
    echo json_encode([
        'success' => true,
        'migration_needed' => $migrationNeeded,
        'missing_columns' => array_values($missingColumns),
        'existing_columns' => $existingColumns,
        'all_columns' => $columns,
        'message' => $migrationNeeded 
            ? 'Migration required! Run: database/run_device_tracking_migration.bat' 
            : 'All columns exist. Migration already applied.'
    ], JSON_PRETTY_PRINT);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ], JSON_PRETTY_PRINT);
}
