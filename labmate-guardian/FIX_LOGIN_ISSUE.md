# Fix Login Issue (401 Unauthorized)

## 🚨 The Real Problem

You're getting **401 Unauthorized** errors when trying to login. This means:
- The login API is working
- But your credentials are being rejected
- This is NOT a real-time logs issue - you can't even log in!

## 🔍 Step 1: Check if Users Exist

Open this URL in your browser:
```
http://localhost/labmate/labmate-guardian/api/check_users.php
```

**What you should see:**
```json
{
  "success": true,
  "total_users": X,
  "role_counts": {
    "admin": 1,
    "user": Y
  },
  "users": [...]
}
```

### If you see an error:
- **"Database connection failed"** → Your database isn't running or config is wrong
- **"Table 'users' doesn't exist"** → Database not set up properly
- **Network error** → XAMPP/Apache not running

### If you see users but can't login:
- Your password might be wrong
- The password hash might be corrupted
- Continue to Step 2

## 🔍 Step 2: Test Login with Tool

Open this file in your browser:
```
labmate-guardian/test-login.html
```

Or navigate to:
```
file:///[path-to-your-project]/labmate-guardian/test-login.html
```

**Enter your credentials and click "Test Login"**

### Possible Results:

#### ✅ "Login Successful"
- Your credentials are correct!
- The issue is in the frontend app, not the API
- Check browser console in the actual app for errors

#### ❌ "Invalid credentials"
- Wrong email or password
- User doesn't exist
- Password hash is wrong
- Continue to Step 3

#### ❌ "Request Failed"
- XAMPP/Apache not running
- Wrong API URL
- CORS issue

## 🔍 Step 3: Check Your Credentials

### Option A: Check what email you're using

In the database, run:
```sql
SELECT id, email, role, first_name, last_name FROM users WHERE role = 'admin';
```

**This shows all admin users and their emails.**

### Option B: Reset admin password

If you know the admin email but forgot password, run this SQL:

```sql
-- Replace 'admin@example.com' with your admin email
-- This sets password to: admin123

UPDATE users 
SET password_hash = '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'
WHERE email = 'admin@example.com';
```

**Now try logging in with:**
- Email: admin@example.com (or your admin email)
- Password: admin123

### Option C: Create a new admin user

Run this SQL to create a test admin:

```sql
INSERT INTO users (email, password_hash, role, first_name, last_name, created_at)
VALUES (
    'testadmin@test.com',
    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'admin',
    'Test',
    'Admin',
    NOW()
);
```

**Now try logging in with:**
- Email: testadmin@test.com
- Password: admin123

## 🔍 Step 4: Check Database Connection

### Test 1: Can PHP connect to MySQL?

Create a file `labmate-guardian/api/test_db.php`:

```php
<?php
require_once __DIR__ . '/db.php';
header('Content-Type: application/json');

try {
    $conn = get_db_connection();
    echo json_encode([
        'success' => true,
        'message' => 'Database connected successfully!',
        'server_info' => $conn->server_info
    ]);
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
```

Then open: `http://localhost/labmate/labmate-guardian/api/test_db.php`

### Test 2: Is XAMPP running?

1. Open XAMPP Control Panel
2. Check if **Apache** is running (green)
3. Check if **MySQL** is running (green)
4. If not, click "Start" for both

### Test 3: Is the database created?

1. Open phpMyAdmin: `http://localhost/phpmyadmin`
2. Look for database: `labmate_guardian`
3. If it doesn't exist, create it:
   - Click "New" in left sidebar
   - Database name: `labmate_guardian`
   - Collation: `utf8mb4_general_ci`
   - Click "Create"
4. Import the database:
   - Select `labmate_guardian` database
   - Click "Import" tab
   - Choose file: `labmate-guardian/database/labmate_guardian.sql`
   - Click "Go"

## 🔍 Step 5: Check Frontend Login Code

If the API works but the app doesn't, check the Login page:

<function_calls>
<invoke name="readFile">
<parameter name="explanation">Check the Login.tsx to see if there's an issue with how it's calling the API