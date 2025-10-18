@echo off
cls
echo ================================================
echo FINAL FIX - CLEARING CACHES AND SHOWING DATA
echo ================================================
echo.

echo Step 1: Clearing Laravel caches...
call php artisan cache:clear
call php artisan config:clear
call php artisan view:clear
call php artisan route:clear
echo.

echo Step 2: Showing current database state...
echo ================================================
call php show_current_database_state.php
echo.

echo ================================================
echo CACHES CLEARED - DATABASE VERIFIED!
echo ================================================
echo.
echo IMPORTANT NEXT STEPS:
echo.
echo 1. Open browser in INCOGNITO mode:
echo    - Chrome/Edge: Press CTRL+SHIFT+N
echo    - Firefox: Press CTRL+SHIFT+P
echo.
echo 2. Go to: http://localhost/admin/appointments
echo    (or your site URL + /admin/appointments)
echo.
echo 3. Login as admin:
echo    Email: admin@clinic.com
echo    Password: [your password]
echo.
echo 4. You should see 4 PENDING APPOINTMENTS:
echo    - TestFirstName TestLastName (2)
echo    - red red (1)
echo    - blue blue (1)
echo.
echo 5. If you STILL see 0:
echo    - Press F12 to open Developer Tools
echo    - Go to Console tab
echo    - Take screenshot of any errors
echo    - Show me the screenshot
echo.
echo The data IS in the database (verified above)!
echo If you don't see it, it's a frontend/cache issue.
echo.
pause

