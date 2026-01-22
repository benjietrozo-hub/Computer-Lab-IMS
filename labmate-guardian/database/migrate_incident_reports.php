<?php
require_once __DIR__ . '/../api/db.php';

echo "Running incident reports table migration...\n";

$conn = get_db_connection();

// Check if columns already exist
$check_name = $conn->query("SHOW COLUMNS FROM incident_reports LIKE 'name'");
$check_hardware_type = $conn->query("SHOW COLUMNS FROM incident_reports LIKE 'hardware_type'");
$check_hardware_damage = $conn->query("SHOW COLUMNS FROM incident_reports LIKE 'hardware_damage'");
$check_timestamp = $conn->query("SHOW COLUMNS FROM incident_reports LIKE 'timestamp'");

$needs_migration = ($check_name->num_rows == 0) || 
                  ($check_hardware_type->num_rows == 0) || 
                  ($check_hardware_damage->num_rows == 0) || 
                  ($check_timestamp->num_rows == 0);

if (!$needs_migration) {
    echo "Migration already completed. All columns exist.\n";
    exit;
}

try {
    // Add name column
    if ($check_name->num_rows == 0) {
        $conn->query("ALTER TABLE incident_reports ADD COLUMN name VARCHAR(255) AFTER id");
        echo "Added 'name' column.\n";
    }

    // Add hardware_type column
    if ($check_hardware_type->num_rows == 0) {
        $conn->query("ALTER TABLE incident_reports ADD COLUMN hardware_type VARCHAR(100) AFTER location");
        echo "Added 'hardware_type' column.\n";
    }

    // Add hardware_damage column
    if ($check_hardware_damage->num_rows == 0) {
        $conn->query("ALTER TABLE incident_reports ADD COLUMN hardware_damage TEXT AFTER hardware_type");
        echo "Added 'hardware_damage' column.\n";
    }

    // Add timestamp column
    if ($check_timestamp->num_rows == 0) {
        $conn->query("ALTER TABLE incident_reports ADD COLUMN timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP AFTER hardware_damage");
        echo "Added 'timestamp' column.\n";
    }

    // Migrate existing data
    $conn->query("UPDATE incident_reports SET name = title WHERE name IS NULL AND title IS NOT NULL");
    echo "Migrated existing titles to name field.\n";

    $conn->query("UPDATE incident_reports SET timestamp = CONCAT(date_occurred, ' ', TIME('12:00:00')) WHERE timestamp IS NULL AND date_occurred IS NOT NULL");
    echo "Migrated existing dates to timestamp field.\n";

    echo "Migration completed successfully!\n";

} catch (Exception $e) {
    echo "Migration failed: " . $e->getMessage() . "\n";
}

$conn->close();
?>
