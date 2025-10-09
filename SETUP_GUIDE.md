# 🏥 St. James Clinic Management System - Setup Guide

## 🚨 IMPORTANT: Complete Setup Instructions

If you're getting database errors after cloning this repository, follow these steps exactly:

## 📋 Prerequisites

Make sure you have these installed:
- **PHP 8.2+** (with required extensions)
- **Composer** (latest version)
- **Node.js 18+** and **npm**
- **MySQL 8.0+** or **MariaDB 10.3+**
- **XAMPP/WAMP/MAMP** (for local development)

## 🔧 Required PHP Extensions

Enable these in your `php.ini`:
```ini
extension=mbstring
extension=openssl
extension=pdo_mysql
extension=xml
extension=ctype
extension=json
extension=tokenizer
extension=curl
extension=fileinfo
extension=gd
```

## 🚀 Step-by-Step Installation

### 1. Clone and Navigate
```bash
git clone https://github.com/JIiiiiiiiiiiiiiiiiiiiiii/Clinic-Management-and-Laboratory-Diagnostic-System.git
cd Clinic-Management-and-Laboratory-Diagnostic-System
git checkout 3-interface-UI
```

### 2. Install Dependencies
```bash
# Install PHP dependencies
composer install

# Install JavaScript dependencies
npm install
```

### 3. Environment Configuration
```bash
# Copy environment file
cp .env.example .env

# Generate application key
php artisan key:generate
```

### 4. Database Configuration
Update your `.env` file with correct database settings:
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=st_james_clinic
DB_USERNAME=your_username
DB_PASSWORD=your_password
APP_URL=http://127.0.0.1:8000
```

### 5. Database Setup
```bash
# Create database (run this in MySQL)
CREATE DATABASE st_james_clinic;

# Run migrations
php artisan migrate --force

# Run seeders
php artisan db:seed --class=UserRoleSeeder
php artisan db:seed --class=LabTestSeeder
php artisan db:seed --class=InventorySeeder
```

### 6. Build Assets
```bash
# For development
npm run dev

# For production
npm run build
```

### 7. Start the Application
```bash
php artisan serve
```

## 🔐 Default Login Credentials

After running the seeders, you can login with:

**Admin Account:**
- Email: `admin@stjames.com`
- Password: `password`

**Hospital Admin:**
- Email: `hospital@stjames.com`
- Password: `password`

**Doctor:**
- Email: `doctor@stjames.com`
- Password: `password`

## 🛠️ Common Issues & Solutions

### Issue 1: Database Connection Error
**Solution:**
```bash
# Check if MySQL is running
# Verify database credentials in .env
# Ensure database exists
```

### Issue 2: Migration Errors
**Solution:**
```bash
# Reset database (WARNING: This will delete all data)
php artisan migrate:fresh --seed
```

### Issue 3: Permission Errors
**Solution:**
```bash
# Set proper permissions
chmod -R 755 storage
chmod -R 755 bootstrap/cache
```

### Issue 4: Excel Export Not Working
**Solution:**
- Enable GD extension in php.ini
- Restart web server
- Clear cache: `php artisan optimize:clear`

### Issue 5: 404 Errors on Reports
**Solution:**
```bash
# Clear all caches
php artisan optimize:clear
php artisan route:clear
php artisan config:clear
```

## 📊 Features Available

### Reports & Analytics
- **Dashboard**: Daily, Monthly, Yearly tabs
- **Categories**: Laboratory, Inventory, Appointments, Specialist Management, Billing
- **Export**: Excel, PDF, Word formats
- **Filters**: Date range, status, search

### User Roles
- **Admin**: Full system access
- **Hospital Admin**: Hospital management
- **Doctor**: Patient and appointment management
- **Medtech**: Laboratory management
- **Cashier**: Billing and transactions
- **Patient**: View own records

## 🚨 Troubleshooting

### If you still get database errors:

1. **Check PHP version:**
```bash
php -v
```

2. **Check MySQL connection:**
```bash
php artisan tinker
# Then run: DB::connection()->getPdo();
```

3. **Reset everything:**
```bash
php artisan migrate:fresh --seed
php artisan optimize:clear
npm run build
```

4. **Check file permissions:**
```bash
chmod -R 755 storage bootstrap/cache
```

## 📞 Support

If you're still having issues:
1. Check the error logs in `storage/logs/`
2. Verify all prerequisites are installed
3. Ensure database is running and accessible
4. Check PHP extensions are enabled

## 🎯 Quick Test

After setup, test these URLs:
- Admin Dashboard: `http://127.0.0.1:8000/admin/dashboard`
- Hospital Dashboard: `http://127.0.0.1:8000/hospital/dashboard`
- Reports: `http://127.0.0.1:8000/admin/reports` or `http://127.0.0.1:8000/hospital/reports`

---

**Last Updated:** October 9, 2025
**Repository:** [Clinic-Management-and-Laboratory-Diagnostic-System](https://github.com/JIiiiiiiiiiiiiiiiiiiiiii/Clinic-Management-and-Laboratory-Diagnostic-System/tree/3-interface-UI)
