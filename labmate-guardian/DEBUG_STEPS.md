# Debug Steps for Real-Time Activity Logs

## Step 1: Run the Diagnostic Script

Open a terminal and run:
```bash
cd labmate-guardian
node diagnose-realtime-logs.js
```

This will test:
1. If notification server is running
2. If WebSocket connection works
3. If identification works
4. If broadcasts are received

**Expected Output:**
```
🔍 Starting Real-Time Logs Diagnostic...

Test 1: Checking if notification server is running...
✅ Notification server is running (HTTP responded)

Test 2: Testing WebSocket connection...
✅ WebSocket connection established

Test 3: Sending identification as admin...
   Sent: {"type":"identify","userId":9999,"role":"admin"}
📨 Received message: identified
✅ Server confirmed identification

Test 4: Sending test broadcast...
   Broadcast response: { success: true, sent: 1, adminCount: 1, totalClients: 1 }
   ✅ Broadcast sent to 1 admin clients
📨 Received message: activity_log
✅ Received activity log broadcast!
   Log details: { action: 'test', module: 'diagnostic', ... }

============================================================
🎉 ALL TESTS PASSED!
============================================================
```

## Step 2: Check Browser Console

1. Open your browser
2. Press F12 to open Developer Tools
3. Go to Console tab
4. Login as admin
5. Navigate to Activity Logs page

**Look for these messages:**
```
Setting up WebSocket connection for admin user: [your-id] admin
✅ Activity Logs WebSocket connected
Sending identify message: {type: 'identify', userId: ..., role: 'admin'}
📨 Received WebSocket message: identified
✅ Server confirmed identification: {...}
```

## Step 3: Check What's Missing

### If diagnostic script FAILS at Test 1:
**Problem:** Notification server not running
**Solution:**
```bash
cd labmate-guardian
node notification-server-simple.js
```
Keep this terminal open!

### If diagnostic script FAILS at Test 2:
**Problem:** WebSocket server not accepting connections
**Solution:**
1. Check if port 8082 is blocked by firewall
2. Check if another process is using port 8082:
   ```bash
   netstat -ano | findstr :8082
   ```
3. Restart notification server

### If diagnostic script FAILS at Test 3:
**Problem:** Server not sending identification confirmation
**Solution:** The notification-server-simple.js file might not be updated. Check if it has this code:
```javascript
// Send confirmation back to client
ws.send(JSON.stringify({
  type: 'identified',
  userId: client.userId,
  role: client.role,
  timestamp: new Date().toISOString()
}));
```

### If diagnostic script PASSES but browser doesn't connect:
**Problem:** Browser-side issue

**Check these in browser console:**

1. **No "Setting up WebSocket connection" message:**
   - Check if you're logged in as admin
   - Check if `currentUser` is loaded (type `localStorage.getItem('user')` in console)
   - Refresh the page

2. **"Current user not available yet" message:**
   - User data hasn't loaded
   - Wait a moment and check again
   - Try refreshing the page

3. **"Not an admin user" message:**
   - You're not logged in as admin
   - Check your role: `JSON.parse(localStorage.getItem('user')).role`
   - Should be "admin"

4. **WebSocket connection error:**
   - Check if notification server is running
   - Check browser console Network tab for WebSocket connection
   - Look for ws://localhost:8082 connection

## Step 4: Test Real Activity

If everything above works, test with real activity:

1. Keep Activity Logs page open
2. Open another tab
3. Go to Inventory page
4. Create a new item
5. Switch back to Activity Logs tab
6. You should see the new log appear immediately

**Check browser console for:**
```
📨 Received WebSocket message: activity_log
📨 Received real-time activity log: {...}
```

## Step 5: Common Issues

### Issue: "Real-Time (Disconnected)" status
**Causes:**
- Notification server not running
- WebSocket connection failed
- Network/firewall blocking connection

**Debug:**
1. Check notification server terminal for errors
2. Check browser console for WebSocket errors
3. Run diagnostic script

### Issue: Connection works but no logs appear
**Causes:**
- ActivityLogger not broadcasting
- PHP curl not working
- Wrong role identification

**Debug:**
1. Check notification server terminal when you create an item
2. Should see: `📢 Broadcasting activity log: ...`
3. If not, check PHP error logs
4. Test with: `node test-activity-log-broadcast.js`

### Issue: Logs appear after refresh but not real-time
**Causes:**
- WebSocket disconnecting
- Not receiving broadcasts
- Frontend not handling messages

**Debug:**
1. Watch browser console for disconnect messages
2. Check if identification was successful
3. Run diagnostic script while Activity Logs page is open

## Step 6: Enable Verbose Logging

Add this to the top of ActivityLogs.tsx useEffect (temporarily):
```typescript
console.log('🔍 Debug Info:', {
  isAdmin,
  isRootAdmin,
  isRealTimeEnabled,
  currentUserId: currentUser?.id,
  currentUserRole: currentUser?.role,
  wsState: ws?.readyState,
  connectionStatus
});
```

This will show you exactly what's happening.

## Need More Help?

If none of the above works:

1. **Share the output of:**
   - Diagnostic script
   - Browser console (full output)
   - Notification server terminal (full output)

2. **Check these files are updated:**
   - `labmate-guardian/src/pages/ActivityLogs.tsx`
   - `labmate-guardian/notification-server-simple.js`

3. **Verify your admin user:**
   ```javascript
   // In browser console:
   const user = JSON.parse(localStorage.getItem('user'));
   console.log('User ID:', user.id);
   console.log('User Role:', user.role);
   console.log('Is Admin:', user.role === 'admin');
   ```

4. **Check WebSocket in Network tab:**
   - Open DevTools > Network tab
   - Filter by "WS" (WebSocket)
   - Look for ws://localhost:8082
   - Check if it's connected (green)
   - Click on it to see messages
