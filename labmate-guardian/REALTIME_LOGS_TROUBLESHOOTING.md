# Real-Time Activity Logs Troubleshooting Guide

## Overview
This guide helps troubleshoot issues with real-time activity logs not appearing for admin accounts.

## What Was Fixed

### 1. WebSocket Connection Dependencies
**Problem**: The WebSocket useEffect only depended on `isRealTimeEnabled`, causing it to not reconnect when user state changed.

**Solution**: Updated dependencies to include:
- `isRealTimeEnabled`
- `isAdmin`
- `isRootAdmin`
- `currentUser?.id`
- `currentUser?.role`

### 2. User State Validation
**Problem**: WebSocket tried to connect before user data was fully loaded.

**Solution**: Added check to ensure `currentUser?.id` exists before attempting connection.

### 3. Enhanced Logging
**Problem**: Difficult to debug connection issues.

**Solution**: Added comprehensive logging throughout the connection flow:
- Client-side: Connection attempts, identification, message receipt
- Server-side: Client connections, identification confirmations, broadcast details

### 4. WebSocket Import
**Problem**: Missing WebSocket import in notification server.

**Solution**: Added `WebSocket` to imports from 'ws' package.

## How to Verify It's Working

### Step 1: Start the Notification Server
```bash
cd labmate-guardian
node notification-server-simple.js
```

You should see:
```
Notification server running on http://localhost:8082
```

### Step 2: Login as Admin
1. Open the application in your browser
2. Login with an admin account
3. Navigate to Activity Logs page

### Step 3: Check Browser Console
Look for these messages in the browser console:
```
Setting up WebSocket connection for admin user: [userId] [role]
✅ Activity Logs WebSocket connected
Sending identify message: {type: 'identify', userId: ..., role: 'admin'}
✅ Server confirmed identification: {...}
```

### Step 4: Check Server Console
Look for these messages in the server console:
```
🔌 New WebSocket client connected. Total clients: 1
📨 Received message from client: {type: 'identify', userId: ..., role: 'admin'}
✅ Client identified: userId=[userId], role=admin
```

### Step 5: Test Broadcasting
Run the test script:
```bash
node test-activity-log-broadcast.js
```

Expected output:
```
✅ Broadcast test result: { success: true, sent: 1, adminCount: 1, totalClients: 1 }
   Sent to 1 admin clients out of 1 admins (1 total clients)
```

In the browser console, you should see:
```
📨 Received WebSocket message: activity_log
📨 Received real-time activity log: {...}
```

### Step 6: Trigger Real Activity
Perform any action in the system (create, update, delete) and watch for:
- Server console: `📢 Broadcasting activity log: ...`
- Browser console: `📨 Received real-time activity log: ...`
- Activity Logs page: New log appears at the top of the table

## Common Issues

### Issue 1: "Real-Time (Disconnected)" Status
**Symptoms**: Button shows "Real-Time (Disconnected)" even when enabled.

**Causes**:
1. Notification server not running
2. WebSocket connection blocked by firewall
3. Port 8082 already in use

**Solutions**:
1. Start notification server: `node notification-server-simple.js`
2. Check firewall settings
3. Check if port is available: `netstat -ano | findstr :8082`

### Issue 2: Connection Established But No Logs Received
**Symptoms**: WebSocket shows connected but no real-time updates.

**Causes**:
1. Client not properly identified as admin
2. ActivityLogger not broadcasting
3. WebSocket server not routing to admin clients

**Solutions**:
1. Check browser console for "Server confirmed identification"
2. Verify user role is exactly "admin" (case-sensitive)
3. Check server console for broadcast messages
4. Run test script to verify broadcast functionality

### Issue 3: Logs Appear After Refresh But Not Real-Time
**Symptoms**: Logs show up when page is refreshed but not in real-time.

**Causes**:
1. WebSocket connection not maintained
2. ActivityLogger broadcast failing silently
3. Frontend not handling messages correctly

**Solutions**:
1. Check for WebSocket disconnect messages in console
2. Check PHP error logs for curl errors
3. Verify message handler in ActivityLogs.tsx

### Issue 4: Multiple Duplicate Logs
**Symptoms**: Each activity appears multiple times.

**Causes**:
1. Multiple WebSocket connections established
2. Multiple tabs open with Activity Logs page

**Solutions**:
1. Close duplicate tabs
2. Check for multiple "WebSocket connected" messages
3. Refresh the page to reset connection

## Testing Checklist

- [ ] Notification server is running
- [ ] Logged in as admin user
- [ ] Activity Logs page loaded
- [ ] "Real-Time ON" button shows green indicator
- [ ] Browser console shows WebSocket connected
- [ ] Server console shows client identified
- [ ] Test broadcast script works
- [ ] Real activity triggers real-time updates
- [ ] Toast notifications appear for warnings/errors
- [ ] Stats update in real-time

## Debug Mode

To enable verbose logging, open browser console and run:
```javascript
localStorage.setItem('debug_websocket', 'true');
```

Then refresh the page. To disable:
```javascript
localStorage.removeItem('debug_websocket');
```

## Architecture Overview

```
User Action (e.g., Create Item)
    ↓
API Endpoint (e.g., inventory_equipment.php)
    ↓
ActivityLogger->log()
    ↓
Database Insert (activity_logs table)
    ↓
ActivityLogger->broadcastLog()
    ↓
HTTP POST to http://localhost:8082/broadcast-activity-log
    ↓
Notification Server receives broadcast
    ↓
Server identifies admin clients (role === 'admin')
    ↓
WebSocket message sent to all admin clients
    ↓
ActivityLogs.tsx receives message
    ↓
Updates logs state and stats
    ↓
UI updates with new log entry
```

## Support

If issues persist after following this guide:
1. Check all console logs (browser and server)
2. Verify database has activity_logs table
3. Test with the provided test script
4. Check network tab for WebSocket connection
5. Verify no proxy/firewall blocking WebSocket connections
