@echo off
echo ========================================
echo Running Borrow Items Return Columns Migration
echo ========================================
echo.

REM Set your MySQL credentials here
set MYSQL_USER=root
set MYSQL_PASSWORD=
set MYSQL_DATABASE=labmate_guardian
set MYSQL_PATH=C:\xampp\mysql\bin\mysql.exe

echo Checking MySQL connection...
"%MYSQL_PATH%" -u%MYSQL_USER% -p%MYSQL_PASSWORD% -e "SELECT 'MySQL connection successful!' AS status;" 2>nul
if errorlevel 1 (
    echo ERROR: Cannot connect to MySQL!
    echo Please check:
    echo 1. MySQL is running in XAMPP
    echo 2. Username and password are correct
    echo 3. MySQL path is correct
    pause
    exit /b 1
)

echo.
echo Running migration 008_add_borrow_items_return_columns.sql...
"%MYSQL_PATH%" -u%MYSQL_USER% -p%MYSQL_PASSWORD% %MYSQL_DATABASE% < migrations\008_add_borrow_items_return_columns.sql

if errorlevel 1 (
    echo.
    echo ERROR: Migration failed!
    echo Check the error message above.
    pause
    exit /b 1
)

echo.
echo ========================================
echo Migration completed successfully!
echo ========================================
echo.
echo The following columns have been added to borrow_items table:
echo - return_condition (VARCHAR 50)
echo - return_comments (TEXT)
echo - return_processed_by (CHAR 36)
echo - return_processed_at (DATETIME)
echo - actual_return_date (DATE)
echo.
echo You can now use the Mark as Returned feature!
echo.
pause
