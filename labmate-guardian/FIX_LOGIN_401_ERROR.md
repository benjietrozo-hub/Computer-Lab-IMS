# Fix Login 401 Unauthorized Error

## 🚨 The Problem

You're getting **401 Unauthorized** errors when trying to login. This means your credentials are being rejected.

## 🔍 Quick Diagnosis (5 steps)

### Step 1: Check if users exist in database

Open in browser:
```
http://localhost/labmate/labmate-guardian/api/check_users.php
```

**Expected:** List of users with their emails and roles  
**If error:** Database not set up or XAMPP not running

### Step 2: Test login with diagnostic tool

Open in browser:
```
file:///C:/xampp/htdocs/labmate/labmate-guardian/test-login.html
```
(Adjust path to match your setup)

Enter your credentials and click "Test Login"

### Step 3: Check XAMPP is running

1. Open XAMPP Control Panel
2. Verify **Apache** is running (green)
3. Verify **MySQL** is running (green)
4. If not, click "Start" for both

### Step 4: Check database exists

1. Open phpMyAdmin: `http://localhost/phpmyadmin`
2. Look for database: `labmate_guardian`
3. If missing, import: `database/labmate_guardian.sql`

### Step 5: Reset admin password

If you forgot your password, run this SQL in phpMyAdmin:

```sql
-- This sets password to: admin123
UPDATE users 
SET password_hash = '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'
WHERE role = 'admin'
LIMIT 1;
```

Then login with password: **admin123**

## 📋 Detailed Troubleshooting

### Issue: "Database connection failed"

**Cause:** MySQL not running or wrong credentials

**Fix:**
1. Start MySQL in XAMPP
2. Check `api/config.php` settings:
   ```php
   const DB_HOST = '127.0.0.1';
   const DB_PORT = 3306;
   const DB_NAME = 'labmate_guardian';
   const DB_USER = 'root';
   const DB_PASS = '';
   ```

### Issue: "Invalid credentials"

**Cause:** Wrong email/password or user doesn't exist

**Fix:**
1. Check what users exist:
   ```
   http://localhost/labmate/labmate-guardian/api/check_users.php
   ```
2. Use the exact email shown
3. Reset password using SQL above

### Issue: "Table 'users' doesn't exist"

**Cause:** Database not imported

**Fix:**
1. Open phpMyAdmin
2. Select `labmate_guardian` database (create if needed)
3. Click "Import"
4. Choose file: `database/labmate_guardian.sql`
5. Click "Go"

### Issue: Network error / Can't reach API

**Cause:** Apache not running or wrong URL

**Fix:**
1. Start Apache in XAMPP
2. Verify URL: `http://localhost/labmate/labmate-guardian/api/auth_login.php`
3. Should show: `{"success":false,"error":"Method not allowed"}`
   (This is correct - it means API is working but needs POST)

## 🔧 Create Test Admin User

If you need a fresh admin account, run this SQL:

```sql
INSERT INTO users (email, password_hash, role, first_name, last_name, created_at)
VALUES (
    'admin@test.com',
    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'admin',
    'Test',
    'Admin',
    NOW()
);
```

**Login with:**
- Email: admin@test.com
- Password: admin123

## ✅ Verification Checklist

- [ ] XAMPP Apache is running
- [ ] XAMPP MySQL is running
- [ ] Database `labmate_guardian` exists
- [ ] Table `users` exists with data
- [ ] `check_users.php` shows users
- [ ] `test-login.html` tool works
- [ ] You know the correct admin email
- [ ] Password is correct (or reset to admin123)

## 🎯 Once Login Works

After you can successfully login as admin:

1. Navigate to Activity Logs page
2. Follow the real-time logs setup:
   - Start notification server: `node notification-server-simple.js`
   - Look for green pulsing dot
   - Test with: `node diagnose-realtime-logs.js`

See `START_HERE_REALTIME_FIX.md` for real-time logs setup.

## 📞 Still Not Working?

### Collect this information:

1. **Output of check_users.php:**
   ```
   http://localhost/labmate/labmate-guardian/api/check_users.php
   ```

2. **XAMPP status:**
   - Is Apache running?
   - Is MySQL running?
   - What ports are they using?

3. **Database check:**
   - Does `labmate_guardian` database exist?
   - Does `users` table exist?
   - How many users are in the table?

4. **Test login result:**
   - What does `test-login.html` show?
   - Exact error message?

5. **Browser console:**
   - Full error messages from console
   - Network tab showing the request/response

## 💡 Common Mistakes

1. **Wrong email format** - Must match exactly what's in database
2. **Case sensitive** - Email might be case-sensitive
3. **Spaces** - No spaces before/after email
4. **Old password** - Password was changed but you're using old one
5. **Wrong database** - Multiple databases with similar names
6. **Port conflict** - XAMPP using different port than 80

## 🚀 Quick Fix Commands

### Reset ALL admin passwords to "admin123":
```sql
UPDATE users 
SET password_hash = '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'
WHERE role = 'admin';
```

### Check if any admin exists:
```sql
SELECT * FROM users WHERE role = 'admin';
```

### Create admin if none exists:
```sql
INSERT INTO users (email, password_hash, role, first_name, last_name, created_at)
VALUES ('admin@admin.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', 'Admin', 'User', NOW());
```

---

**Remember:** The 401 error means authentication failed. Fix your credentials first, then worry about real-time logs!
