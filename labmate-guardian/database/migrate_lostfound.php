<?php
require_once __DIR__ . '/../api/db.php';

echo "Running lost_found table migration...\n";

$conn = get_db_connection();

// Check if timestamp column already exists
$check_timestamp = $conn->query("SHOW COLUMNS FROM lost_found LIKE 'timestamp'");

$needs_migration = $check_timestamp->num_rows == 0;

if (!$needs_migration) {
    echo "Migration already completed. Timestamp column exists.\n";
    exit;
}

try {
    // Add timestamp column
    $conn->query("ALTER TABLE lost_found ADD COLUMN timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP AFTER contact_info");
    echo "Added 'timestamp' column.\n";

    // Migrate existing data
    $conn->query("UPDATE lost_found SET timestamp = CONCAT(date_occurred, ' ', TIME('12:00:00')) WHERE timestamp IS NULL AND date_occurred IS NOT NULL");
    echo "Migrated existing dates to timestamp field.\n";

    echo "Migration completed successfully!\n";

} catch (Exception $e) {
    echo "Migration failed: " . $e->getMessage() . "\n";
}

$conn->close();
?>
