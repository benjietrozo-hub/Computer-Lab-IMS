# Code Cleanup Plan - labmate-guardian

## Summary
Removing **42 obsolete files** (~830 KB) to clean up the codebase while maintaining full functionality.

---

## Files to Delete (42 total)

### Phase 1: Test Files (13 files)
```
api/test_activity_logging.php
api/test_activity_logs.php
api/test_api.php
api/test_borrow_items_soft_delete.php
api/test_cors.php
api/test_endpoint.php
api/test_inventory.php
api/test_logout_logging.php
api/test_realtime_logging.php
api/test_repair_api.php
api/test_repair_soft_delete.php
api/test_reservation_soft_delete.php
api/test_trash.php
api/test_trash_reservations.php
```

### Phase 2: Debug Files (4 files)
```
api/debug_auth.php
api/debug_inventory.php
api/simple_test.php
api/check_borrow_requests_table.php
api/check_reservations_table.php
```

### Phase 3: Database Utilities (9 files)
```
api/create_activity_log_table.php
api/create_activity_logs_table.php
database/check_activity_logs.php
database/fix_activity_logs_fk.php
database/migrate_incident_reports.php
database/migrate_lostfound.php
database/run_activity_logs_migration.php
database/create_borrow_waiting_list_table.php
database/create_notifications_table.php
database/create_repair_maintenance_table.php
```

### Phase 4: Obsolete Documentation (21 files)
```
ACTIVITY_LOGS_IMPLEMENTATION.md
ACTIVITY_LOGS_INTEGRATION_COMPLETE.md
ACTIVITY_LOGS_SETUP.md
ACTIVITY_LOGS_SUMMARY.md
QUICK_START_ACTIVITY_LOGS.md
REALTIME_ACTIVITY_LOGS.md
REALTIME_QUICK_START.md
BUGFIX_DELETE_ERROR.md
BUGFIX_RESTORE_ENDPOINT.md
DEBUG_REALTIME.md
FIX_REALTIME_ISSUE.md
WEBSOCKET_LOOP_FIX.md
LOGOUT_LOGGING_ADDED.md
IMPLEMENTATION_STATUS.md
IMPLEMENTATION_SUMMARY.md
SOFT_DELETE_AUDIT.md
SOFT_DELETE_IMPLEMENTATION_COMPLETE.md
TRASH_ARCHITECTURE.md
TRASH_CHECKLIST.md
TRASH_IMPLEMENTATION.md
TRASH_INTEGRATION_COMPLETE.md
TRASH_QUICKSTART.md
INTEGRATION_EXAMPLE.md
```

### Phase 5: Temporary Files (5 files)
```
test-websocket.html
check-realtime.bat
install-deps.bat
start-dev.bat
```

### Phase 6: Duplicate Files (1 file)
```
api/activity_logger.php (superseded by ActivityLogger.php)
```

---

## Code Cleanup

### Remove Unused Imports
- src/pages/Inventory.tsx: Remove `Filter` icon
- src/pages/BorrowItems.tsx: Remove `Wrench`, `Cpu` icons
- src/pages/Reservations.tsx: Remove `Phone`, `Mail` icons

### Remove Dead Code
- src/pages/Inventory.tsx: Remove commented WebSocket code (lines 32-38)

---

## Backup Strategy
1. Create git branch: `git checkout -b cleanup-unused-files`
2. Commit after each phase
3. Test after each phase

---

## Verification
After cleanup, verify:
- [ ] Application starts successfully
- [ ] All pages load without errors
- [ ] Activity Logs work
- [ ] Trash functionality works
- [ ] Real-time updates work
- [ ] No console errors
