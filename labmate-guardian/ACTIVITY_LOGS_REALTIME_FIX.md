# Activity Logs Real-Time Fix

## Problem
Activity logs were not appearing in real-time for admin users even though the WebSocket server was running.

## Root Cause
The `ActivityLogger.php` was broadcasting activity logs to the WebSocket server, but the broadcast payload was **missing the `id` field**. The frontend table requires `log.id` as the key for rendering rows, so logs without an ID were likely causing React rendering issues or being filtered out.

## Solution

### 1. Database Migration
Added device tracking columns to the `activity_logs` table:
- `device_type` - mobile, desktop, tablet, bot, unknown
- `browser` - Browser name and version
- `os` - Operating system
- `is_bot` - Whether request is from a bot/crawler
- `real_ip` - Real IP from X-Forwarded-For if behind proxy

**Migration file:** `database/migrations/006_add_device_browser_columns.sql`

**To apply:**
```bash
Get-Content database/migrations/006_add_device_browser_columns.sql | C:\xampp\mysql\bin\mysql.exe -u root labmate_guardian
```

### 2. ActivityLogger.php Changes
Updated the `log()` method to:
1. Capture the inserted ID after executing the INSERT statement
2. Include the ID in the broadcast payload
3. Include the IP address in the broadcast payload

**Before:**
```php
$result = $stmt->execute();
$stmt->close();

// Broadcast to WebSocket for real-time updates
if ($result) {
    $broadcastData = array_merge($data, [
        'device_type' => $parsedUA['device_type'],
        'browser' => $parsedUA['browser'],
        'os' => $parsedUA['os'],
        'is_bot' => $parsedUA['is_bot']
    ]);
    $this->broadcastLog($broadcastData);
}
```

**After:**
```php
$result = $stmt->execute();

// Get the inserted ID
$insertedId = $this->conn->insert_id;

$stmt->close();

// Broadcast to WebSocket for real-time updates
if ($result && $insertedId) {
    $broadcastData = array_merge($data, [
        'id' => $insertedId,
        'device_type' => $parsedUA['device_type'],
        'browser' => $parsedUA['browser'],
        'os' => $parsedUA['os'],
        'is_bot' => $parsedUA['is_bot'],
        'ip_address' => $ipAddress
    ]);
    $this->broadcastLog($broadcastData);
}
```

Updated the `broadcastLog()` method to include `id` and `ip_address`:
```php
$logPayload = [
    'log' => [
        'id' => $data['id'] ?? null,  // ← Added
        'user_id' => $data['user_id'],
        'user_name' => $data['user_name'],
        // ... other fields ...
        'ip_address' => $data['ip_address'] ?? null,  // ← Added
        'created_at' => date('Y-m-d H:i:s')
    ]
];
```

## How It Works

### Flow:
1. User performs an action (create, update, delete, etc.)
2. API endpoint calls `logActivity()` or `logCreate()`, `logUpdate()`, etc.
3. `ActivityLogger->log()` inserts the log into the database
4. The inserted ID is captured using `$this->conn->insert_id`
5. `broadcastLog()` sends a POST request to `http://localhost:8082/broadcast-activity-log`
6. The WebSocket server receives the broadcast and sends it to all connected admin clients
7. The ActivityLogs page receives the WebSocket message and adds the log to the top of the list

### WebSocket Message Format:
```json
{
  "type": "activity_log",
  "payload": {
    "id": 11,
    "user_id": 6717,
    "user_name": "Test Admin",
    "user_email": "test@example.com",
    "user_role": "admin",
    "action": "create",
    "module": "inventory",
    "entity_type": "equipment",
    "entity_id": "123",
    "entity_name": "Laptop",
    "description": "Created equipment: Laptop",
    "severity": "info",
    "device_type": "desktop",
    "browser": "Chrome 120",
    "os": "Windows 11",
    "is_bot": false,
    "ip_address": "127.0.0.1",
    "created_at": "2026-02-02 06:05:00"
  }
}
```

## Testing

### 1. Test WebSocket Broadcast
```bash
php test-activity-broadcast.php
```
This sends a test broadcast to all connected admin clients.

### 2. Test Real Activity Log
```bash
php test-real-activity-log.php
```
This creates a real activity log in the database and broadcasts it.

### 3. Test in Browser
1. Open the Activity Logs page as an admin user
2. Check the browser console for WebSocket connection messages:
   - `✅ Activity Logs WebSocket connected`
   - `✅ Server confirmed identification`
3. Perform an action (create/update/delete) in another tab
4. The new log should appear at the top of the Activity Logs page in real-time
5. A toast notification should appear for warning/error/critical logs

### 4. Test WebSocket Client
Open `test-websocket-client.html` in a browser to see raw WebSocket messages.

## Verification Checklist

- [x] Database migration applied (device tracking columns added)
- [x] ActivityLogger.php captures and broadcasts the inserted ID
- [x] ActivityLogger.php includes ip_address in broadcast
- [x] WebSocket server is running on port 8082
- [x] ActivityLogs page connects to WebSocket and identifies as admin
- [x] Real-time logs appear at the top of the list
- [x] Toast notifications appear for important logs
- [x] Table renders correctly with log.id as key

## Known Issues

### Multiple WebSocket Connections
The ActivityLogs page creates its own WebSocket connection separate from the `useWebSocket` hook. This means there are two connections per admin user:
1. One for notifications (from useWebSocket hook)
2. One for activity logs (from ActivityLogs page)

This is intentional to keep the concerns separated, but it does mean each admin user has 2 WebSocket connections.

### Filters and Real-Time Logs
When filters are applied, the `fetchLogs()` function is called, which replaces the entire logs array. This means real-time logs that were added will be lost if they don't match the current filters.

**Potential solutions:**
1. Store real-time logs separately and merge them with fetched logs
2. Apply filters to real-time logs before adding them to the list
3. Only fetch logs when explicitly requested (not on filter change)

Currently, the real-time logs will persist until the user applies filters or resets.

## Files Modified

1. `api/ActivityLogger.php` - Added ID capture and broadcast
2. `database/migrations/006_add_device_browser_columns.sql` - Device tracking columns

## Files Created

1. `test-activity-broadcast.php` - Test WebSocket broadcast
2. `test-real-activity-log.php` - Test real activity log creation
3. `test-websocket-client.html` - WebSocket test client
4. `ACTIVITY_LOGS_REALTIME_FIX.md` - This documentation

## Next Steps

1. Consider adding a "Real-Time Only" mode that doesn't fetch logs on mount
2. Add filter logic to real-time logs before adding them to the list
3. Consider merging the two WebSocket connections (notifications + activity logs)
4. Add pagination for activity logs
5. Add export functionality for filtered logs
