@echo off
echo ========================================
echo Device & Browser Tracking Migration
echo ========================================
echo.
echo This will add device, browser, and OS tracking to Activity Logs
echo.
pause

echo.
echo Running migration...
echo.

mysql -u root -p labmate_guardian < migrations\006_add_device_browser_columns.sql

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo Migration completed successfully!
    echo ========================================
    echo.
    echo New features available:
    echo - Device type detection (mobile/desktop/tablet/bot)
    echo - Browser identification
    echo - Operating system detection
    echo - X-Forwarded-For IP support
    echo - Enhanced security monitoring
    echo.
    echo Please refresh your Activity Logs page to see the changes.
    echo.
) else (
    echo.
    echo ========================================
    echo Migration failed!
    echo ========================================
    echo.
    echo Please check:
    echo 1. MySQL is running
    echo 2. Database credentials are correct
    echo 3. You have permission to alter tables
    echo.
    echo See DEVICE_TRACKING_MIGRATION.md for manual migration steps.
    echo.
)

pause
