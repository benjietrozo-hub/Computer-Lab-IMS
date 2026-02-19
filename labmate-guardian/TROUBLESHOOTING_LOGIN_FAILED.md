# Troubleshooting: Login Failed Not Logging

## Issue
Failed login attempts are not appearing in Activity Logs.

---

## 🔍 Diagnosis

### Step 1: Check if Migration Was Run

**Run this URL in your browser:**
```
http://localhost/labmate/labmate-guardian/api/check_activity_logs_schema.php
```

**Expected Response:**
```json
{
  "success": true,
  "migration_needed": false,
  "missing_columns": [],
  "message": "All columns exist. Migration already applied."
}
```

**If you see `"migration_needed": true`**, the database migration hasn't been run yet!

---

## ✅ Solution

### Option 1: Run Migration Script (Recommended)

```bash
# Open Command Prompt
cd C:\xampp\htdocs\labmate\labmate-guardian\database
run_device_tracking_migration.bat
```

**Expected Output:**
```
========================================
Migration completed successfully!
========================================
```

### Option 2: Manual Migration (phpMyAdmin)

1. Open **phpMyAdmin**: http://localhost/phpmyadmin
2. Select **`labmate_guardian`** database
3. Click **SQL** tab
4. Open file: `database/migrations/006_add_device_browser_columns.sql`
5. Copy entire contents
6. Paste into SQL tab
7. Click **Go**

**Expected Result:**
```
Query executed successfully
```

### Option 3: MySQL Command Line

```bash
cd C:\xampp\htdocs\labmate\labmate-guardian\database\migrations
mysql -u root -p labmate_guardian < 006_add_device_browser_columns.sql
```

---

## 🧪 Test Failed Login Logging

### Step 1: Try Failed Login

1. Go to login page
2. Enter valid email but **wrong password**
3. Click Login

### Step 2: Check Activity Logs

1. Log in with correct credentials
2. Go to Activity Logs page
3. Filter by:
   - Action: **Login Failed** (or search "login_failed")
   - Severity: **Warning**

**Expected Result:**
You should see the failed login attempt with:
- ✅ User email
- ✅ Device type (desktop/mobile/tablet)
- ✅ Browser (Chrome/Firefox/Safari/etc.)
- ✅ OS (Windows/macOS/Linux/etc.)
- ✅ IP address
- ✅ Severity: Warning

---

## 🔧 Additional Checks

### Check 1: Verify Database Connection

**Run this URL:**
```
http://localhost/labmate/labmate-guardian/api/status.php
```

**Expected:** Should return success

### Check 2: Check PHP Error Log

**Location:** `C:\xampp\apache\logs\error.log`

**Look for:**
- "Activity Logger Prepare Error"
- "Activity Logger Error"
- SQL syntax errors

### Check 3: Check Browser Console

1. Open browser DevTools (F12)
2. Go to Console tab
3. Try failed login
4. Look for errors

### Check 4: Check Network Tab

1. Open browser DevTools (F12)
2. Go to Network tab
3. Try failed login
4. Check the `/api/auth_login.php` request
5. Verify it returns 401 status

---

## 🐛 Common Issues

### Issue 1: Migration Not Run

**Symptom:** `check_activity_logs_schema.php` shows `"migration_needed": true`

**Solution:** Run the migration (see above)

### Issue 2: MySQL Not Running

**Symptom:** Cannot connect to database

**Solution:**
1. Open XAMPP Control Panel
2. Start MySQL
3. Try again

### Issue 3: Wrong Database Name

**Symptom:** Table not found error

**Solution:**
1. Check `api/db.php` for database name
2. Verify database exists in phpMyAdmin
3. Update database name if needed

### Issue 4: Permissions Error

**Symptom:** "Access denied" or "Permission denied"

**Solution:**
1. Check MySQL user has ALTER TABLE permission
2. Try running as root user
3. Grant permissions if needed:
```sql
GRANT ALL PRIVILEGES ON labmate_guardian.* TO 'your_user'@'localhost';
FLUSH PRIVILEGES;
```

### Issue 5: Columns Already Exist

**Symptom:** "Duplicate column name" error

**Solution:**
Migration already run! Check if logging works now.

---

## 📊 Verify Migration Success

### SQL Query to Check Columns

```sql
DESCRIBE activity_logs;
```

**Should show these columns:**
- `device_type` VARCHAR(50)
- `browser` VARCHAR(100)
- `os` VARCHAR(100)
- `is_bot` BOOLEAN
- `real_ip` VARCHAR(45)

### SQL Query to Check Indexes

```sql
SHOW INDEX FROM activity_logs WHERE Key_name IN ('idx_device_type', 'idx_browser', 'idx_is_bot');
```

**Should return 3 rows** (one for each index)

---

## 🔍 Manual Test

### Test Failed Login Logging Directly

Create a test file: `test_failed_login.php`

```php
<?php
require_once 'api/db.php';
require_once 'api/ActivityLogger.php';

$conn = get_db_connection();
$logger = new ActivityLogger($conn);

$result = $logger->log([
    'user_id' => null,
    'user_name' => null,
    'user_email' => 'test@example.com',
    'user_role' => null,
    'action' => 'login_failed',
    'module' => 'authentication',
    'entity_type' => 'user',
    'entity_id' => null,
    'entity_name' => 'test@example.com',
    'description' => 'Test failed login attempt',
    'severity' => 'warning'
]);

if ($result) {
    echo "✅ Failed login logged successfully!\n";
} else {
    echo "❌ Failed to log failed login\n";
    echo "Check error log: C:\\xampp\\apache\\logs\\error.log\n";
}
```

**Run:**
```
http://localhost/labmate/labmate-guardian/test_failed_login.php
```

**Expected:** "✅ Failed login logged successfully!"

---

## 📞 Still Not Working?

### Collect Diagnostic Information

1. **Check migration status:**
   ```
   http://localhost/labmate/labmate-guardian/api/check_activity_logs_schema.php
   ```

2. **Check PHP error log:**
   ```
   C:\xampp\apache\logs\error.log
   ```

3. **Check MySQL error log:**
   ```
   C:\xampp\mysql\data\mysql_error.log
   ```

4. **Check browser console:**
   - Open DevTools (F12)
   - Look for JavaScript errors

5. **Check network requests:**
   - Open DevTools (F12) → Network tab
   - Try failed login
   - Check `/api/auth_login.php` response

### Report Issue

If still not working, provide:
- Output from `check_activity_logs_schema.php`
- Relevant errors from PHP error log
- Browser console errors
- Network request/response details

---

## ✅ Success Checklist

After fixing:
- [ ] Migration completed successfully
- [ ] `check_activity_logs_schema.php` shows all columns exist
- [ ] Failed login attempt appears in Activity Logs
- [ ] Device/browser/OS information shown
- [ ] IP address captured
- [ ] Severity shows "warning"
- [ ] Real-time update works (if WebSocket running)

---

## 🎯 Quick Fix Summary

**Most Common Issue:** Migration not run

**Quick Fix:**
```bash
cd C:\xampp\htdocs\labmate\labmate-guardian\database
run_device_tracking_migration.bat
```

**Verify:**
```
http://localhost/labmate/labmate-guardian/api/check_activity_logs_schema.php
```

**Test:**
1. Try failed login
2. Check Activity Logs
3. Should see failed login with device info

---

**Last Updated:** February 2, 2026  
**Related Files:**
- `database/migrations/006_add_device_browser_columns.sql`
- `api/ActivityLogger.php`
- `api/auth_login.php`
- `api/check_activity_logs_schema.php`

