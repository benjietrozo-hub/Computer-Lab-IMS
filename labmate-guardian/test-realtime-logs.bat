@echo off
echo ========================================
echo Real-Time Activity Logs Diagnostic
echo ========================================
echo.
echo This will test if real-time logging is working
echo.

cd /d "%~dp0"
node diagnose-realtime-logs.js

echo.
echo ========================================
pause
