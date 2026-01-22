<?php
require_once 'db.php';

echo "Debugging Admin Authentication...\n";

$conn = get_db_connection();

// Check users table structure
echo "\n=== Users Table Structure ===\n";
$sql = "DESCRIBE users";
$result = $conn->query($sql);
while ($row = $result->fetch_assoc()) {
    echo "- " . $row['Field'] . " (" . $row['Type'] . ")\n";
}

// Check admin users
echo "\n=== Admin Users ===\n";
$sql = "SELECT id, email, first_name, last_name, role FROM users WHERE role IN ('admin', 'instructor')";
$result = $conn->query($sql);
while ($row = $result->fetch_assoc()) {
    echo "- ID: " . $row['id'] . ", Email: " . $row['email'] . ", Name: " . $row['first_name'] . " " . $row['last_name'] . ", Role: " . $row['role'] . "\n";
}

// Check password field for admin users
echo "\n=== Password Field Check ===\n";
$sql = "SELECT id, email, password_hash, role FROM users WHERE role IN ('admin', 'instructor') LIMIT 3";
$result = $conn->query($sql);
while ($row = $result->fetch_assoc()) {
    echo "- ID: " . $row['id'] . ", Email: " . $row['email'] . ", Password Hash: " . substr($row['password_hash'], 0, 20) . "..., Role: " . $row['role'] . "\n";
}

// Test password verification with common admin passwords
echo "\n=== Test Password Verification ===\n";
$test_passwords = ['admin', 'password', '123456', 'admin123'];
$sql = "SELECT id, email, password_hash FROM users WHERE role IN ('admin', 'instructor') LIMIT 1";
$result = $conn->query($sql);
if ($row = $result->fetch_assoc()) {
    echo "Testing against user: " . $row['email'] . "\n";
    foreach ($test_passwords as $pwd) {
        if (password_verify($pwd, $row['password_hash'])) {
            echo "- SUCCESS: Password '$pwd' matches!\n";
        } else {
            echo "- FAILED: Password '$pwd' does not match\n";
        }
    }
}

$conn->close();
?>
