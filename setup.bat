@echo off
echo ========================================
echo St. James Clinic Management System
echo Complete Setup Script
echo ========================================
echo.

echo [1/8] Installing PHP dependencies...
composer install
if %errorlevel% neq 0 (
    echo ERROR: Composer install failed!
    pause
    exit /b 1
)

echo [2/8] Installing JavaScript dependencies...
npm install
if %errorlevel% neq 0 (
    echo ERROR: NPM install failed!
    pause
    exit /b 1
)

echo [3/8] Copying environment file...
if not exist .env (
    copy .env.example .env
    echo Environment file created. Please update database credentials in .env
) else (
    echo Environment file already exists.
)

echo [4/8] Generating application key...
php artisan key:generate
if %errorlevel% neq 0 (
    echo ERROR: Key generation failed!
    pause
    exit /b 1
)

echo [5/8] Running database migrations...
php artisan migrate --force
if %errorlevel% neq 0 (
    echo ERROR: Database migration failed!
    echo Please check your database configuration in .env
    pause
    exit /b 1
)

echo [6/8] Running database seeders...
php artisan db:seed --class=UserRoleSeeder
php artisan db:seed --class=LabTestSeeder
php artisan db:seed --class=InventorySeeder
if %errorlevel% neq 0 (
    echo WARNING: Some seeders failed, but continuing...
)

echo [7/8] Building assets...
npm run build
if %errorlevel% neq 0 (
    echo WARNING: Asset build failed, but continuing...
)

echo [8/8] Clearing caches...
php artisan optimize:clear

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Default Login Credentials:
echo Admin: admin@stjames.com / password
echo Hospital: hospital@stjames.com / password
echo Doctor: doctor@stjames.com / password
echo.
echo Start the server with: php artisan serve
echo Then visit: http://127.0.0.1:8000
echo.
pause
