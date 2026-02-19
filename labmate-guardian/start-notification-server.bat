@echo off
echo ========================================
echo Starting Notification Server
echo ========================================
echo.
echo This server handles real-time notifications
echo and activity log broadcasts.
echo.
echo Keep this window open while using the app!
echo.
echo Press Ctrl+C to stop the server
echo ========================================
echo.

cd /d "%~dp0"
node notification-server-simple.js

pause
