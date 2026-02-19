# Quick Test: Real-Time Activity Logs

## 🚀 Quick Start (3 Steps)

### Step 1: Start Server
```bash
cd labmate-guardian
node notification-server-simple.js
```
✅ Look for: `Notification server running on http://localhost:8082`

### Step 2: Open Activity Logs as Admin
1. Login as admin
2. Go to Activity Logs page
3. Check button shows: **"Real-Time ON"** with 🟢 green pulsing dot

### Step 3: Test It
Run test script in new terminal:
```bash
cd labmate-guardian
node test-activity-log-broadcast.js
```
✅ Look for: New log appears at top of Activity Logs table

## 🔍 What to Check

### Browser Console (F12)
```
✅ Setting up WebSocket connection for admin user: [id] admin
✅ Activity Logs WebSocket connected
✅ Sending identify message: {...}
✅ Server confirmed identification: {...}
```

### Server Console
```
✅ 🔌 New WebSocket client connected. Total clients: 1
✅ 📨 Received message from client: {type: 'identify', ...}
✅ ✅ Client identified: userId=[id], role=admin
```

### Activity Logs Page
- 🟢 Green pulsing indicator on "Real-Time ON" button
- New logs appear instantly at top of table
- Stats update in real-time
- Toast notifications for warnings/errors

## ❌ Troubleshooting

| Problem | Solution |
|---------|----------|
| "Real-Time (Disconnected)" | Start notification server |
| No green indicator | Check browser console for errors |
| No logs appearing | Run test script to verify broadcast |
| Server not starting | Check if port 8082 is in use |

## 🧪 Full Test Sequence

1. **Start server** → See "running on http://localhost:8082"
2. **Login as admin** → Navigate to Activity Logs
3. **Check connection** → Green indicator appears
4. **Run test script** → Test log appears
5. **Perform real action** → Create/update/delete something
6. **Verify real-time** → Log appears immediately

## 📊 Success Criteria

- [x] WebSocket connects automatically
- [x] Green indicator shows when connected
- [x] Test script sends log successfully
- [x] Real activities appear in real-time
- [x] Stats update automatically
- [x] Toast notifications work

## 🆘 Need Help?

See detailed guide: `REALTIME_LOGS_TROUBLESHOOTING.md`
