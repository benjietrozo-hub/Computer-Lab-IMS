<?php
// Check if borrow_items table has all required columns
header('Content-Type: application/json');
error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once __DIR__ . '/api/db.php';

$conn = get_db_connection();

// Get all columns from borrow_items table
$sql = "SHOW COLUMNS FROM borrow_items";
$result = $conn->query($sql);

$columns = [];
$required_columns = [
    'id',
    'borrower_name',
    'borrower_email',
    'item',
    'quantity',
    'borrow_date',
    'return_date',
    'actual_return_date',
    'status',
    'return_condition',
    'return_comments',
    'return_processed_by',
    'return_processed_at',
    'created_at',
    'created_by'
];

while ($row = $result->fetch_assoc()) {
    $columns[] = [
        'Field' => $row['Field'],
        'Type' => $row['Type'],
        'Null' => $row['Null'],
        'Key' => $row['Key'],
        'Default' => $row['Default'],
        'Extra' => $row['Extra']
    ];
}

$existing_column_names = array_column($columns, 'Field');
$missing_columns = array_diff($required_columns, $existing_column_names);
$extra_columns = array_diff($existing_column_names, $required_columns);

$all_present = empty($missing_columns);

echo json_encode([
    'success' => true,
    'all_columns_present' => $all_present,
    'total_columns' => count($columns),
    'columns' => $columns,
    'required_columns' => $required_columns,
    'missing_columns' => array_values($missing_columns),
    'extra_columns' => array_values($extra_columns),
    'status' => $all_present ? 'All required columns are present!' : 'Some columns are missing!',
    'action_needed' => $all_present ? 'None - you can use Mark as Returned feature' : 'Run: database/run_borrow_items_migration.bat'
], JSON_PRETTY_PRINT);
?>
