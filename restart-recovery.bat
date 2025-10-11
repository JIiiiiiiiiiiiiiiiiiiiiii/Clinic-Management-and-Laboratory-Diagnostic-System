@echo off
echo ========================================
echo   CLINIC MANAGEMENT SYSTEM - RECOVERY
echo ========================================
echo.

echo [1/5] Checking Git status...
git status
echo.

echo [2/5] Pulling latest changes from GitHub...
git pull origin Back-up
echo.

echo [3/5] Installing PHP dependencies...
composer install
echo.

echo [4/5] Installing Node.js dependencies...
npm install
echo.

echo [5/5] Starting development server...
echo Starting Laravel development server on http://127.0.0.1:8000
echo.
echo Press Ctrl+C to stop the server
echo.
php artisan serve

pause
