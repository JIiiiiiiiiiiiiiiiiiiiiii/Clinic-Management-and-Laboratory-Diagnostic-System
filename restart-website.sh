#!/bin/bash

# Restart script for St. James Clinic website on AWS Ubuntu
# Location: /var/www/html/Clinic-Management-and-Laboratory-Diagnostic-System

PROJECT_DIR="/var/www/html/Clinic-Management-and-Laboratory-Diagnostic-System"

# Navigate to project directory
cd "$PROJECT_DIR" || exit

echo "=== Restarting St. James Clinic Website ==="
echo "Project directory: $PROJECT_DIR"
echo ""

# Option 1: If using Apache web server
if systemctl is-active --quiet apache2; then
    echo "Detected Apache web server"
    echo "Restarting Apache..."
    sudo systemctl restart apache2
    echo "Apache restarted successfully"
fi

# Option 2: If using Nginx web server
if systemctl is-active --quiet nginx; then
    echo "Detected Nginx web server"
    echo "Restarting Nginx..."
    sudo systemctl restart nginx
    echo "Nginx restarted successfully"
fi

# Restart PHP-FPM (adjust version if needed: php8.2-fpm, php8.3-fpm, etc.)
if systemctl is-active --quiet php8.2-fpm; then
    echo "Restarting PHP 8.2-FPM..."
    sudo systemctl restart php8.2-fpm
    echo "PHP-FPM restarted successfully"
elif systemctl is-active --quiet php-fpm; then
    echo "Restarting PHP-FPM..."
    sudo systemctl restart php-fpm
    echo "PHP-FPM restarted successfully"
fi

# Clear Laravel caches
echo ""
echo "Clearing Laravel caches..."
php artisan optimize:clear
php artisan config:clear
php artisan cache:clear
php artisan view:clear
php artisan route:clear

echo ""
echo "Re-optimizing Laravel..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Restart queue workers if using queues
if systemctl is-active --quiet supervisor; then
    echo ""
    echo "Restarting Supervisor (queue workers)..."
    sudo systemctl restart supervisor
    sudo supervisorctl reread
    sudo supervisorctl update
    sudo supervisorctl restart all
    echo "Queue workers restarted"
fi

# Check service status
echo ""
echo "=== Service Status ==="
echo "Apache status:"
sudo systemctl status apache2 --no-pager -l | head -n 3 || echo "Apache not running"

echo ""
echo "Nginx status:"
sudo systemctl status nginx --no-pager -l | head -n 3 || echo "Nginx not running"

echo ""
echo "PHP-FPM status:"
sudo systemctl status php8.2-fpm --no-pager -l | head -n 3 || sudo systemctl status php-fpm --no-pager -l | head -n 3 || echo "PHP-FPM not running"

echo ""
echo "=== Website restart completed ==="

