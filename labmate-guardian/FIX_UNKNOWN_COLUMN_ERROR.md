# Fix "Unknown Column" Error - Mark as Returned

## Problem
When clicking "Mark as Returned", you get an error like:
- "Unknown column 'return_condition' in 'field list'"
- "Unknown column 'return_comments' in 'field list'"
- "Unknown column 'return_processed_by' in 'field list'"

## Cause
The `borrow_items` table is missing columns needed to track return information.

## Solution - Quick Fix (3 Steps)

### Step 1: Open the Fix Page
Open your browser and go to:
```
http://localhost/labmate/labmate-guardian/fix-borrow-items-columns.html
```

This page will:
- ✅ Check which columns are missing
- ✅ Show you how to add them
- ✅ Verify the fix worked

### Step 2: Run the Migration

**EASIEST METHOD:**
1. Open File Explorer
2. Go to: `labmate-guardian/database/`
3. Double-click: `run_borrow_items_migration.bat`
4. Wait for success message
5. Press any key to close

**OR use phpMyAdmin:**
1. Open http://localhost/phpmyadmin
2. Select `labmate_guardian` database
3. Click "SQL" tab
4. Copy and paste this SQL:

```sql
-- Add return_condition column
ALTER TABLE borrow_items 
ADD COLUMN return_condition VARCHAR(50) DEFAULT NULL AFTER status;

-- Add return_comments column
ALTER TABLE borrow_items 
ADD COLUMN return_comments TEXT DEFAULT NULL AFTER return_condition;

-- Add return_processed_by column
ALTER TABLE borrow_items 
ADD COLUMN return_processed_by CHAR(36) DEFAULT NULL AFTER return_comments;

-- Add return_processed_at column
ALTER TABLE borrow_items 
ADD COLUMN return_processed_at DATETIME DEFAULT NULL AFTER return_processed_by;

-- Add actual_return_date column
ALTER TABLE borrow_items 
ADD COLUMN actual_return_date DATE DEFAULT NULL AFTER return_date;

-- Add foreign key
ALTER TABLE borrow_items 
ADD CONSTRAINT fk_borrow_items_return_processed_by 
FOREIGN KEY (return_processed_by) REFERENCES users(id) ON DELETE SET NULL;
```

5. Click "Go"

### Step 3: Verify and Test
1. Go back to the fix page: http://localhost/labmate/labmate-guardian/fix-borrow-items-columns.html
2. Click "Verify Columns Added"
3. Should see ✅ "All columns are now present!"
4. Go to Borrow Items Management
5. Try marking an item as returned
6. Should work now! 🎉

## What These Columns Do

| Column | Type | Purpose |
|--------|------|---------|
| `return_condition` | VARCHAR(50) | Tracks condition: good, damaged, needs_repair |
| `return_comments` | TEXT | Admin notes about the returned item |
| `return_processed_by` | CHAR(36) | ID of admin who processed the return |
| `return_processed_at` | DATETIME | When the return was processed |
| `actual_return_date` | DATE | Actual date item was returned |

## Files Created
- `database/migrations/008_add_borrow_items_return_columns.sql` - Migration script
- `database/run_borrow_items_migration.bat` - Easy runner
- `check-borrow-items-columns.php` - Column checker
- `fix-borrow-items-columns.html` - Interactive fix page

## Troubleshooting

### "Table 'labmate_guardian.borrow_items' doesn't exist"
- Your database name might be different
- Check in phpMyAdmin what your database is called
- Update the batch file with correct database name

### "Access denied for user 'root'"
- Your MySQL password might not be empty
- Edit `run_borrow_items_migration.bat`
- Change line: `set MYSQL_PASSWORD=` to `set MYSQL_PASSWORD=your_password`

### "Column already exists"
- Some columns might already be there
- The migration script is safe to run multiple times
- It will skip columns that already exist

### Still getting errors after migration?
1. Refresh your browser (Ctrl+F5)
2. Check PHP error log: `C:\xampp\apache\logs\error.log`
3. Verify columns exist in phpMyAdmin
4. Try the test page: http://localhost/labmate/labmate-guardian/test-mark-as-returned.html

## After Fix Works
Once the columns are added and Mark as Returned works:
- Items marked as "good" condition → inventory quantity increases
- Items marked as "damaged" or "needs repair" → added to Repair/Maintenance
- Borrowers receive notifications about their returns
- Activity logs track all return transactions
- Admin can see return history with conditions and notes

## Need Help?
Run the interactive fix page and follow the step-by-step instructions:
```
http://localhost/labmate/labmate-guardian/fix-borrow-items-columns.html
```
