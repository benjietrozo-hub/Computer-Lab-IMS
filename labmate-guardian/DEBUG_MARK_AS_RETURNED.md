# Debug: Mark as Returned "Failed to Fetch" Error

## Quick Test Steps

### Step 1: Open Test Page
1. Open your browser
2. Navigate to: `http://localhost/labmate/labmate-guardian/test-mark-as-returned.html`
3. Open Browser DevTools (F12) → Console tab
4. Click "Load Test Data"
5. Click one of the test buttons
6. Check the console for detailed error messages

### Step 2: Check PHP Error Logs
Location: `C:\xampp\apache\logs\error.log`

Look for recent errors related to `borrow_items.php`

### Step 3: Test API Directly
Open a new terminal and run:

```bash
curl -X PUT "http://localhost/labmate/labmate-guardian/api/borrow_items.php?id=YOUR_ITEM_ID" -H "Content-Type: application/json" -d "{\"status\":\"returned\",\"return_condition\":\"good\",\"return_notes\":\"Test\",\"admin_id\":\"YOUR_ADMIN_ID\"}"
```

Replace `YOUR_ITEM_ID` and `YOUR_ADMIN_ID` with actual values from your database.

## Common Causes of "Failed to Fetch"

### 1. PHP Output Before JSON
**Problem:** PHP is outputting warnings, notices, or text before the JSON response

**Solution:**
- Check `api/borrow_items.php` for any `echo`, `print`, or `var_dump` statements
- Check `api/db.php`, `api/helpers.php`, `api/activity_log_helper.php` for output
- Add to top of `borrow_items.php`:
  ```php
  <?php
  error_reporting(0); // Temporarily disable error output
  ini_set('display_errors', 0);
  ```

### 2. CORS Headers Not Set
**Problem:** Browser blocking the request due to CORS

**Check:** Look in browser console for CORS errors

**Solution:** Already implemented in the file, but verify these lines exist at the top:
```php
$origin = $_SERVER['HTTP_ORIGIN'] ?? '*';
header("Access-Control-Allow-Origin: $origin");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
```

### 3. Database Connection Error
**Problem:** Database not connecting, causing PHP fatal error

**Check:**
1. Open `http://localhost/labmate/labmate-guardian/api/status.php`
2. Should return JSON with database status

**Solution:**
- Verify MySQL is running in XAMPP
- Check `api/db.php` credentials

### 4. Missing Required Functions
**Problem:** Functions like `logUpdate()` or `send_websocket_notification()` not defined

**Check:** Look for "Call to undefined function" in PHP error log

**Solution:** Verify these files are included:
- `api/helpers.php`
- `api/activity_log_helper.php`

### 5. Transaction Rollback
**Problem:** Exception thrown during transaction, but error not properly returned

**Check:** PHP error log for "Return processing error"

**Solution:** Already implemented with try-catch

## Debugging Steps

### Enable Detailed Error Logging

Add this to the TOP of `api/borrow_items.php` (after `<?php`):

```php
<?php
// Temporary debugging - REMOVE IN PRODUCTION
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/borrow_items_debug.log');

// Log all requests
file_put_contents(__DIR__ . '/borrow_items_requests.log', 
    date('Y-m-d H:i:s') . " - " . $_SERVER['REQUEST_METHOD'] . " - " . 
    ($_SERVER['QUERY_STRING'] ?? '') . " - " . 
    file_get_contents('php://input') . "\n", 
    FILE_APPEND
);
```

### Add Debug Logging to handle_put

Replace the beginning of `handle_put` function with:

```php
function handle_put(mysqli $conn): void {
    // Debug logging
    error_log("=== HANDLE_PUT CALLED ===");
    error_log("Query string: " . ($_SERVER['QUERY_STRING'] ?? 'none'));
    error_log("Input: " . file_get_contents('php://input'));
    
    parse_str($_SERVER['QUERY_STRING'] ?? '', $query);
    $id = $query['id'] ?? null;
    
    error_log("Parsed ID: " . ($id ?? 'null'));
    
    if (!$id) {
        error_log("ERROR: Missing ID");
        send_json(['success' => false, 'error' => 'Missing id'], 400);
        return;
    }

    $input = get_json_input();
    error_log("Parsed input: " . json_encode($input));
    
    // ... rest of function
```

### Check Response in Browser

In the browser console, when the error occurs, check:

```javascript
// In the Network tab:
// 1. Find the PUT request to borrow_items.php
// 2. Click on it
// 3. Check the "Response" tab
// 4. Check the "Headers" tab for Content-Type

// In the Console tab, add this to your code:
fetch(url, options)
  .then(response => {
    console.log('Response status:', response.status);
    console.log('Response headers:', [...response.headers.entries()]);
    return response.text();
  })
  .then(text => {
    console.log('Raw response:', text);
    return JSON.parse(text);
  })
  .catch(error => {
    console.error('Fetch error:', error);
  });
```

## Quick Fix: Simplified Version

If the issue persists, try this simplified version of `handle_put`:

```php
function handle_put(mysqli $conn): void {
    // Clear any output buffers
    while (ob_get_level()) {
        ob_end_clean();
    }
    
    parse_str($_SERVER['QUERY_STRING'] ?? '', $query);
    $id = $query['id'] ?? null;
    
    if (!$id) {
        send_json(['success' => false, 'error' => 'Missing id'], 400);
        return;
    }

    $input = get_json_input();
    $status = $input['status'] ?? null;
    $return_condition = $input['return_condition'] ?? 'good';
    $return_comments = $input['return_notes'] ?? '';
    $admin_id = $input['admin_id'] ?? null;

    if ($status !== 'returned') {
        send_json(['success' => false, 'error' => 'Invalid status'], 400);
        return;
    }

    if (!$admin_id) {
        send_json(['success' => false, 'error' => 'Admin ID required'], 400);
        return;
    }

    // Simple update without transaction
    $sql = "UPDATE borrow_items SET 
            status = 'returned', 
            return_condition = ?, 
            return_comments = ?, 
            return_processed_at = NOW(),
            return_processed_by = ?
            WHERE id = ?";
    
    $stmt = $conn->prepare($sql);
    if (!$stmt) {
        send_json(['success' => false, 'error' => 'Database error: ' . $conn->error], 500);
        return;
    }
    
    $stmt->bind_param('ssss', $return_condition, $return_comments, $admin_id, $id);
    
    if (!$stmt->execute()) {
        send_json(['success' => false, 'error' => 'Update failed: ' . $stmt->error], 500);
        return;
    }
    
    $stmt->close();
    send_json(['success' => true, 'message' => 'Item returned successfully']);
    return;
}
```

## What to Check Right Now

1. **Open Browser DevTools (F12)**
   - Go to Network tab
   - Try to mark an item as returned
   - Look at the PUT request
   - What is the status code? (200, 400, 500, etc.)
   - What is in the Response tab?

2. **Check PHP Error Log**
   - Open: `C:\xampp\apache\logs\error.log`
   - Look for recent errors
   - What does it say?

3. **Test with curl or Postman**
   - Does it work outside the browser?
   - If yes → Frontend issue
   - If no → Backend issue

## Tell Me

Please run the test page and tell me:
1. What do you see in the browser console?
2. What is the HTTP status code of the request?
3. What is the raw response text?
4. Are there any errors in the PHP error log?

This will help me identify the exact issue!
