# Activity Logs Admin Guide

## Quick Reference for System Administrators

---

## 🎯 What is Activity Logs?

Activity Logs is a comprehensive monitoring system that tracks all user and admin actions in LabMate Guardian. It provides:
- **Security Monitoring**: Detect suspicious activities and unauthorized access
- **Audit Trail**: Complete history of who did what, when, and from where
- **Debugging**: Identify browser-specific issues and user problems
- **Compliance**: Meet audit requirements with detailed logs

---

## 🔐 Access Requirements

**Who can access Activity Logs?**
- ✅ Root Admin (ID: 6717)
- ✅ Assigned Admins (role: 'admin')
- ❌ Regular Users (no access)

**How to access:**
1. Log in as admin
2. Click "Activity Logs" in the sidebar
3. Or navigate to `/activity-logs`

---

## 📊 Understanding the Dashboard

### Statistics Cards (Top Row)

1. **Total Activities**
   - Total number of logged actions
   - Includes all user and admin activities

2. **Unique Users**
   - Number of different users who performed actions
   - Helps identify active user base

3. **Warnings/Errors**
   - Count of warning, error, and critical severity logs
   - Red flag for security issues

4. **Delete Operations**
   - Number of delete actions performed
   - Important for audit trail

---

## 🔍 Filtering Logs

### Available Filters

1. **Action Filter**
   - `Login` - User login events
   - `Logout` - User logout events
   - `Create` - New records created
   - `Update` - Records modified
   - `Delete` - Records deleted (moved to trash)
   - `Restore` - Records restored from trash
   - `Login Failed` - Failed login attempts ⚠️

2. **Module Filter**
   - `Authentication` - Login/logout/registration
   - `Inventory` - Equipment management
   - `Reservations` - Room/equipment reservations
   - `Borrow` - Borrow requests and returns
   - `Users` - User management
   - `Repair` - Maintenance and repairs
   - `Incidents` - Incident reports
   - `Lost & Found` - Lost and found items

3. **Severity Filter**
   - `Info` - Normal operations (blue)
   - `Warning` - Attention needed (yellow)
   - `Error` - Something went wrong (orange)
   - `Critical` - Serious security issue (red)

4. **Device Filter** 🆕
   - `Desktop` - Computer/laptop access
   - `Mobile` - Smartphone access
   - `Tablet` - Tablet access
   - `Bot` - Automated/crawler traffic
   - `Unknown` - Unidentified device

5. **Date Range**
   - `Start Date` - Filter from this date
   - `End Date` - Filter until this date
   - Leave empty for all dates

6. **Search**
   - Search by user name, email, description, or entity name
   - Press Enter to apply

### Quick Filter Examples

**Find failed login attempts:**
- Action: `Login Failed`
- Severity: `Warning`

**Find all mobile users:**
- Device: `Mobile`

**Find admin deletions:**
- Action: `Delete`
- Search: admin email

**Find bot traffic:**
- Device: `Bot`

---

## 📱 Understanding Device Information

### Device Icons

| Icon | Type | Description |
|------|------|-------------|
| 💻 | Desktop | Computer or laptop |
| 📱 | Mobile | Smartphone |
| 📱 | Tablet | Tablet device |
| 🤖 | Bot | Automated traffic/crawler |

### Browser Emojis

| Emoji | Browser |
|-------|---------|
| 🌐 | Chrome |
| 🦊 | Firefox |
| 🧭 | Safari |
| 🌊 | Edge |
| 🎭 | Opera |
| 💾 | Internet Explorer |

### Why Device Info Matters

1. **Security**: Detect if someone logs in from unusual device
2. **Debugging**: "It doesn't work" → Check their browser/OS
3. **Bot Detection**: Identify automated attacks
4. **User Support**: Know what device user is using

---

## 🚨 Security Monitoring

### Red Flags to Watch For

1. **Multiple Failed Logins**
   - Filter: Action = `Login Failed`
   - Could indicate brute force attack
   - Check IP address and device

2. **Unusual Device Changes**
   - User normally uses Desktop, suddenly Mobile
   - Could indicate account compromise
   - Check IP address and location

3. **Bot Traffic**
   - Filter: Device = `Bot`
   - High volume could indicate scraping
   - Check if legitimate (search engines) or malicious

4. **Critical Severity Logs**
   - Filter: Severity = `Critical`
   - Immediate attention required
   - Review description and take action

5. **Admin Actions from Unknown Devices**
   - Filter: Module = `Users`, Device = `Unknown`
   - Verify admin identity
   - Could indicate compromised account

### Recommended Daily Checks

**Morning Routine (5 minutes):**
1. Check "Warnings/Errors" count
2. Filter by Severity = `Critical` or `Error`
3. Review any failed login attempts
4. Check for unusual bot activity

**Weekly Review (15 minutes):**
1. Export CSV for the week
2. Review all delete operations
3. Check for unusual device patterns
4. Verify admin actions

---

## 🔄 Real-Time Monitoring

### Real-Time Toggle

**Location**: Top right of filters section

**States**:
- 🟢 **Real-Time ON** (Connected) - Green pulsing dot
- 🟡 **Connecting...** - Yellow spinner
- ⚪ **Real-Time OFF** - No indicator
- 🔴 **Real-Time (Disconnected)** - Connection lost

### How Real-Time Works

1. **Enable**: Click "Real-Time ON" button
2. **Connected**: Green pulsing dot appears
3. **New Logs**: Appear instantly at top of table
4. **Notifications**: Toast alerts for critical/error/warning actions
5. **Automatic**: No need to refresh page

### When to Use Real-Time

✅ **Use when:**
- Monitoring live system activity
- Investigating ongoing security incident
- Watching for specific user actions
- Testing new features

❌ **Disable when:**
- Reviewing historical data
- Exporting reports
- System is slow (reduces load)
- Not actively monitoring

---

## 📥 Exporting Data

### CSV Export

**Button**: "Export CSV" (top right)

**Includes**:
- Date/Time
- User name and email
- Action and module
- Entity affected
- Description
- Device type 🆕
- Browser 🆕
- Operating System 🆕
- IP Address 🆕
- Severity

**Use Cases**:
- Monthly audit reports
- Security incident investigation
- Compliance documentation
- Data analysis in Excel

**File Name Format**: `activity-logs-YYYY-MM-DD.csv`

---

## 🔎 Viewing Log Details

### How to View Details

1. Find the log in the table
2. Click "View" button in Actions column
3. Modal opens with full details

### Details Modal Sections

**1. Basic Information**
- Date/Time (exact timestamp)
- User (name and email)
- Action (what was done)
- Module (where it happened)
- Entity Type and ID (what was affected)
- Severity level
- IP Address (full or anonymized)

**2. Device & Browser Information** 🆕
- Device Type (with icon)
- Browser (name and version)
- Operating System
- Bot indicator (if applicable)

**3. Description**
- Human-readable summary of action

**4. Old Values** (if applicable)
- Data before the change
- JSON format

**5. New Values** (if applicable)
- Data after the change
- JSON format

**6. User Agent (Full)** 🆕
- Complete User-Agent string
- Technical details for debugging

---

## 🛡️ Privacy & Compliance

### IP Address Handling

**Admin Users:**
- Full IP address stored
- Required for audit trail
- Never anonymized

**Regular Users:**
- Full IP stored initially
- Can be anonymized after 30 days
- Complies with GDPR/CCPA

**Behind Proxy:**
- Real IP captured from X-Forwarded-For
- Shows both proxy IP and real IP

### Data Retention

**Recommended Policy:**
- Regular user logs: 90 days
- Admin action logs: 1+ year
- Bot traffic: 30 days
- Critical incidents: Indefinite

### GDPR/CCPA Compliance

**User Rights:**
- Right to access: Export their logs
- Right to deletion: Delete user logs on request
- Right to know: Inform what data is collected

**What We Log:**
- User actions (what they did)
- IP addresses (where they were)
- Device/browser (what they used)
- Timestamps (when it happened)

---

## 🐛 Troubleshooting

### Issue: No logs appearing

**Check:**
1. Are you logged in as admin?
2. Is the date range too narrow?
3. Are filters too restrictive?
4. Try clicking "Reset" button

### Issue: Real-Time not working

**Check:**
1. Is WebSocket server running? (`node notification-server-simple.js`)
2. Is port 8082 open?
3. Check browser console for errors
4. Try toggling Real-Time OFF then ON

### Issue: Device shows "unknown"

**Reason:**
- User-Agent is empty or blocked
- Old browser not recognized
- Privacy extension blocking User-Agent

**Action:**
- Check full User-Agent in details modal
- Update UserAgentParser.php if needed

### Issue: IP shows proxy address

**Reason:**
- Behind load balancer/proxy
- X-Forwarded-For not configured

**Action:**
- Check "Real IP" field in details modal
- Configure web server to pass X-Forwarded-For header

---

## 📞 Common Questions

### Q: Can regular users see Activity Logs?
**A:** No, only admins (root and assigned) have access.

### Q: How long are logs kept?
**A:** Currently indefinite. Implement data retention policy as needed.

### Q: Can I delete logs?
**A:** Not through UI. Must be done directly in database (not recommended).

### Q: What's the difference between "Delete" and "Permanent Delete"?
**A:** "Delete" moves to trash (logged as 'delete'). "Permanent Delete" removes forever (logged as 'permanent_delete').

### Q: Why do I see bot traffic?
**A:** Bots include search engines (Google, Bing), scrapers, and API clients. Some are legitimate, some are not.

### Q: Can I track a specific user?
**A:** Yes, use the Search field to enter their name or email.

### Q: What does "X-Forwarded-For" mean?
**A:** It's the real client IP when behind a proxy or load balancer.

### Q: How do I investigate a security incident?
**A:** 
1. Note the time of incident
2. Filter by date range
3. Filter by severity (Warning/Error/Critical)
4. Check IP addresses and devices
5. Export CSV for documentation

---

## 🎓 Best Practices

### Daily
- ✅ Check for critical/error logs
- ✅ Review failed login attempts
- ✅ Monitor bot traffic

### Weekly
- ✅ Export CSV for records
- ✅ Review all delete operations
- ✅ Check for unusual patterns

### Monthly
- ✅ Generate audit report
- ✅ Review admin actions
- ✅ Update security policies

### When Investigating Issues
- ✅ Use date range to narrow down
- ✅ Check device/browser info
- ✅ Review full User-Agent string
- ✅ Compare IP addresses
- ✅ Export data for documentation

---

## 🚀 Quick Start Checklist

For new admins:

- [ ] Log in as admin
- [ ] Navigate to Activity Logs
- [ ] Familiarize yourself with statistics cards
- [ ] Try each filter option
- [ ] Enable Real-Time monitoring
- [ ] View details of a log entry
- [ ] Export a CSV file
- [ ] Bookmark this guide

---

## 📚 Additional Resources

- **Migration Guide**: `database/DEVICE_TRACKING_MIGRATION.md`
- **Implementation Details**: `DEVICE_TRACKING_IMPLEMENTATION.md`
- **Database Schema**: `database/migrations/006_add_device_browser_columns.sql`
- **API Documentation**: Check `api/ActivityLogger.php` comments

---

**Last Updated**: February 2, 2026  
**Version**: 2.0 (with Device Tracking)  
**Support**: Check documentation or contact system administrator

