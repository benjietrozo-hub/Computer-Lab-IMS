@echo off
REM Batch script to run trash/recycle bin migrations
REM Usage: run_trash_migrations.bat [database_name] [username]

echo ========================================
echo Trash/Recycle Bin Migration Script
echo ========================================
echo.

REM Set default values
set DB_NAME=labmate_guardian
set DB_USER=root

REM Override with command line arguments if provided
if not "%1"=="" set DB_NAME=%1
if not "%2"=="" set DB_USER=%2

echo Database: %DB_NAME%
echo Username: %DB_USER%
echo.
echo This will run the following migrations:
echo 1. Add soft delete columns to all entity tables
echo 2. Create trash_audit_log table
echo 3. Create trash_config table
echo.

set /p CONFIRM="Do you want to continue? (Y/N): "
if /i not "%CONFIRM%"=="Y" (
    echo Migration cancelled.
    exit /b
)

echo.
echo Running migrations...
echo.

REM Run migration 001
echo [1/3] Adding soft delete columns...
mysql -u %DB_USER% -p %DB_NAME% < migrations\001_add_soft_delete_columns.sql
if %ERRORLEVEL% neq 0 (
    echo ERROR: Migration 001 failed!
    exit /b 1
)
echo Migration 001 completed successfully.
echo.

REM Run migration 002
echo [2/3] Creating trash_audit_log table...
mysql -u %DB_USER% -p %DB_NAME% < migrations\002_create_trash_audit_log.sql
if %ERRORLEVEL% neq 0 (
    echo ERROR: Migration 002 failed!
    exit /b 1
)
echo Migration 002 completed successfully.
echo.

REM Run migration 003
echo [3/3] Creating trash_config table...
mysql -u %DB_USER% -p %DB_NAME% < migrations\003_create_trash_config.sql
if %ERRORLEVEL% neq 0 (
    echo ERROR: Migration 003 failed!
    exit /b 1
)
echo Migration 003 completed successfully.
echo.

echo ========================================
echo All migrations completed successfully!
echo ========================================
echo.
echo Next steps:
echo 1. Update module delete handlers to use soft delete
echo 2. Test the trash feature at /trash
echo 3. Configure retention settings
echo.

pause
