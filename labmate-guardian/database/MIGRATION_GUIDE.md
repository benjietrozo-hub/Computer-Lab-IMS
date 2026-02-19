# How to Run Trash Migrations

## ⚡ Quick Start (Choose ONE method)

### Method 1: Using Batch Script (Easiest) ⭐

1. Open **Command Prompt** (cmd)
2. Navigate to database folder:
   ```cmd
   cd path\to\labmate-guardian\database
   ```
3. Run the script:
   ```cmd
   run_trash_migrations.bat
   ```
4. Enter your MySQL password when prompted
5. Type `Y` to confirm
6. Done! ✅

---

### Method 2: Single SQL File (Recommended for phpMyAdmin)

1. Open **phpMyAdmin** in your browser
2. Select your `labmate_guardian` database
3. Click the **SQL** tab
4. Open the file: `labmate-guardian/database/all_trash_migrations.sql`
5. Copy ALL the content
6. Paste into phpMyAdmin SQL box
7. Click **Go**
8. Done! ✅

---

### Method 3: MySQL Command Line

1. Open **Command Prompt**
2. Navigate to database folder:
   ```cmd
   cd path\to\labmate-guardian\database
   ```
3. Run this single command:
   ```cmd
   mysql -u root -p labmate_guardian < all_trash_migrations.sql
   ```
4. Enter your password
5. Done! ✅

---

### Method 4: Individual Migrations (Manual)

If you prefer to run them one by one:

```cmd
cd path\to\labmate-guardian\database\migrations

mysql -u root -p labmate_guardian < 001_add_soft_delete_columns.sql
mysql -u root -p labmate_guardian < 002_create_trash_audit_log.sql
mysql -u root -p labmate_guardian < 003_create_trash_config.sql
```

---

## ✅ Verify Migrations Worked

After running migrations, verify in phpMyAdmin or MySQL:

```sql
-- Check if columns were added
DESCRIBE inventory_equipment;
-- Should see: deleted_at, deleted_by, original_module

-- Check if new tables exist
SHOW TABLES LIKE 'trash%';
-- Should see: trash_audit_log, trash_config

-- Check config was inserted
SELECT * FROM trash_config;
-- Should see: 1 row with retention_days=30
```

---

## 🐛 Troubleshooting

### Error: "Table doesn't exist"
**Solution:** Make sure you're connected to the correct database (`labmate_guardian`)

### Error: "Column already exists"
**Solution:** Migrations already ran. You're good to go!

### Error: "Access denied"
**Solution:** Check your MySQL username and password

### Error: "Foreign key constraint fails"
**Solution:** Make sure the `users` table exists and has an `id` column

---

## 🔄 Rollback (If Needed)

To undo the migrations:

```cmd
cd path\to\labmate-guardian\database\migrations
mysql -u root -p labmate_guardian < rollback_001_remove_soft_delete_columns.sql
```

Then manually drop the new tables:
```sql
DROP TABLE trash_audit_log;
DROP TABLE trash_config;
```

---

## 📝 What Gets Changed

### Tables Modified (7 tables):
- ✅ inventory_equipment
- ✅ users
- ✅ equipment_reservations
- ✅ borrow_requests
- ✅ incident_reports
- ✅ lost_found
- ✅ visitor_logs

**Columns Added to Each:**
- `deleted_at` - When item was deleted
- `deleted_by` - User who deleted it
- `original_module` - Which module it came from

### Tables Created (2 new tables):
- ✅ trash_audit_log - Tracks all trash operations
- ✅ trash_config - Stores retention settings

---

## 🎉 After Migration

Once migrations are complete:

1. **Test the trash page:**
   - Navigate to `http://localhost:5173/trash`
   - You should see the trash interface

2. **Next steps:**
   - Update modules to use soft delete
   - See `INTEGRATION_EXAMPLE.md` for details

---

## 💡 Tips

- **Backup first!** Always backup your database before migrations
- **Test locally** before running on production
- **Check logs** if something goes wrong
- **Ask for help** if you get stuck

---

## 🚀 Quick Command Reference

```cmd
# Navigate to database folder
cd labmate-guardian\database

# Run all migrations (batch script)
run_trash_migrations.bat

# Or run all migrations (single file)
mysql -u root -p labmate_guardian < all_trash_migrations.sql

# Verify
mysql -u root -p labmate_guardian -e "SHOW TABLES LIKE 'trash%';"
```

---

**Need help?** Check the other documentation files or ask! 😊
