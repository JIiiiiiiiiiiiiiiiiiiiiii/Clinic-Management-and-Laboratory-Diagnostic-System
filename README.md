# St. James Clinic Management and Laboratory Diagnostic System

[![Laravel](https://img.shields.io/badge/Laravel-12.x-red.svg)](https://laravel.com)
[![React](https://img.shields.io/badge/React-19.x-blue.svg)](https://reactjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org)
[![PHP](https://img.shields.io/badge/PHP-8.2+-purple.svg)](https://www.php.net)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Status](https://img.shields.io/badge/Status-Production-brightgreen.svg)]()

A comprehensive, modern clinic and laboratory management system built with Laravel 12, Inertia.js, and React (TypeScript). This system provides complete patient management, laboratory diagnostics, appointment scheduling, billing, and inventory management with role-based access control, robust validation, and exportable reports in multiple formats (Excel/PDF/Word).

## Table of Contents

- [Project Title & Description](#st-james-clinic-management-and-laboratory-diagnostic-system)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Prerequisites](#prerequisites)
- [Installation Instructions](#installation-instructions)
- [Testing](#testing)
- [FAQs/Known Issues](#faqsknown-issues)
- [Acknowledgments/Credits](#acknowledgmentscredits)

## Features

### Patient Management
- Master Patient Records: Complete patient profiles with demographics, contact information, and medical history
- Visit History: Comprehensive tracking of all patient visits with detailed notes
- Lab Orders Linkage: Direct integration between patient records and laboratory orders
- Duplicate Prevention: Advanced algorithms to prevent duplicate patient entries
- Tabbed Details View: Organized patient information with tabs for visits, lab orders, appointments, and billing
- Patient Transfer: System for transferring patient records between departments or facilities
- Export Capabilities: Export patient data in Excel, CSV, and PDF formats

### Laboratory Management
- Test Templates: Pre-configured laboratory test templates with reference values
- Lab Orders: Create and manage laboratory orders for patients
- Results Entry: Comprehensive interface for entering and verifying lab results
- Result Verification: Multi-level verification system for critical results
- Printable Reports: Professional lab reports with customizable templates
- Exportable Reports: Export lab results in Excel, PDF, and Word formats
- Test Categories: Organized test management by categories and subcategories

### Appointment Management
- Appointment Scheduling: Full-featured appointment booking system
- Walk-in Appointments: Support for walk-in patients with automatic visit creation
- Appointment Types: Support for consultations, procedures, and lab tests
- Status Tracking: Real-time appointment status (pending, confirmed, completed, cancelled)
- Specialist Assignment: Assign appointments to specific doctors or specialists
- Calendar Integration: Visual calendar view for appointment management
- Automated Reminders: System for appointment confirmations and reminders

### Billing & Payments
- Transaction Management: Complete billing transaction system
- Multiple Payment Methods: Support for cash, card, HMO, and other payment methods
- Discount Management: Apply discounts and calculate final amounts
- Appointment Billing: Link billing transactions to appointments
- Payment Tracking: Track payment status and history
- Financial Reports: Generate revenue and transaction reports
- HMO Integration: Support for HMO provider billing

### Inventory Management
- Stock Management: Track inventory items and stock levels
- Transactions: Record inventory in/out/rejected transactions
- Low Stock Alerts: Automatic alerts for low inventory levels
- Category Management: Organize inventory by categories
- Multi-format Exports: Export inventory reports in Excel, PDF, and CSV
- Usage Tracking: Track inventory usage by department and user

### Role-Based Access Control
- Admin: Full system access and configuration
- Doctor: Patient management, appointments, lab orders, reports
- Nurse: Patient management, appointments, inventory, reports
- MedTech: Laboratory management, inventory, reports
- Cashier: Billing and payment processing
- Hospital Staff: Limited access to patient records and reports
- Patient: View own records and appointments

### Dashboard & Analytics
- Role-Specific Dashboards: Customized dashboards for each user role
- Real-time Statistics: Live statistics for patients, appointments, and revenue
- Charts & Graphs: Visual analytics with Recharts integration
- Recent Activities: Quick access to recent system activities
- Quick Actions: Fast access to common tasks

### User Interface
- Modern Design: Built with shadcn/ui components and Tailwind CSS
- Responsive Layout: Fully responsive design for desktop and mobile
- Dark Mode Support: Optional dark theme
- Toast Notifications: Global notification system
- Accessible: WCAG compliant components
- Type-Safe: Full TypeScript support

## Technology Stack

### Backend
- Framework: Laravel 12.x
- PHP: 8.2+
- Database: MySQL
- ORM: Eloquent ORM
- Authentication: Laravel Sanctum
- Permissions: Spatie Laravel Permission
- PDF Generation: DomPDF (barryvdh/laravel-dompdf)
- Excel Export: Maatwebsite Excel

### Frontend
- Framework: React 19.x
- Language: TypeScript 5.9
- UI Framework: Inertia.js 2.x
- Styling: Tailwind CSS 4.x
- Component Library: shadcn/ui (Radix UI primitives)
- Charts: Recharts
- Date Handling: date-fns, dayjs
- Form Validation: Zod
- Build Tool: Vite 7.x

### Development Tools
- Testing: Pest PHP (PHPUnit)
- Code Quality: Laravel Pint, ESLint, Prettier
- Package Manager: Composer (PHP), npm (Node.js)
- Version Control: Git

### Server Requirements
- Web Server: Apache/Nginx
- PHP Extensions: mbstring, openssl, pdo_mysql, xml, ctype, json, tokenizer, curl, fileinfo, gd
- Node.js: 18+ (for asset compilation)

## Prerequisites

Before installing, ensure you have the following installed on your system:

- PHP 8.2 or higher
- Composer (PHP dependency manager)
- Node.js 18 or higher (with npm)
- MySQL 5.7+ or MariaDB 10.3+
- XAMPP (recommended for Windows) or equivalent LAMP/WAMP stack

### Required PHP Extensions
- mbstring
- openssl
- pdo_mysql
- xml
- ctype
- json
- tokenizer
- curl
- fileinfo
- gd (for Excel export)

## Installation Instructions

### Step 1: Clone the Repository

```bash
git clone https://github.com/JIiiiiiiiiiiiiiiiiiiiiii/Clinic-Management-and-Laboratory-Diagnostic-System.git
cd Clinic-Management-and-Laboratory-Diagnostic-System/stjames-clinic-noauth
```

### Step 2: Install PHP Dependencies

```bash
composer install
```

### Step 3: Install Node.js Dependencies

```bash
npm install
```

### Step 4: Environment Configuration

Copy the example environment file and configure it:

```bash
cp .env.example .env
```

Edit `.env` file and update the following values:

```env
APP_NAME="St. James Clinic"
APP_ENV=local
APP_DEBUG=true
APP_URL=http://127.0.0.1:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=stjames_clinic
DB_USERNAME=root
DB_PASSWORD=
```

### Step 5: Generate Application Key

```bash
php artisan key:generate
```

### Step 6: Create Database

Create a new MySQL database:

```sql
CREATE DATABASE stjames_clinic CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### Step 7: Run Database Migrations

```bash
php artisan migrate --graceful
```

### Step 8: Seed Database

Run the seeders to populate initial data:

```bash
php artisan db:seed --class=UserRoleSeeder
php artisan db:seed --class=LabTestSeeder
php artisan db:seed --class=InventorySeeder
```

Or run all seeders:

```bash
php artisan db:seed
```

### Step 9: Build Frontend Assets

For development:

```bash
npm run dev
```

For production:

```bash
npm run build
```

### Step 10: Start the Application

```bash
php artisan serve
```

The application will be available at `http://127.0.0.1:8000`

### Default Login Credentials

After seeding, you can login with:

- Admin: `admin@stjames.com` / `password`
- Doctor: `doctor@stjames.com` / `password`
- Cashier: `cashier@stjames.com` / `password`

Important: Change these passwords immediately after first login!

### Additional Configuration

#### Enable PHP Extensions

Edit `php.ini` (usually in `C:\xampp\php\php.ini` for XAMPP) and uncomment:

```ini
extension=mbstring
extension=openssl
extension=pdo_mysql
extension=fileinfo
extension=gd
extension=curl
extension=xml
extension=zip
```

Restart Apache after making changes.

#### Set File Permissions

Ensure the following directories are writable:

- `storage/`
- `bootstrap/cache/`

On Windows, ensure these folders have proper write permissions.

## Testing

This project uses [Pest PHP](https://pestphp.com/) for testing, which is built on top of PHPUnit.

### Running Tests

Run all tests:

```bash
php artisan test
```

Or using Pest directly:

```bash
./vendor/bin/pest
```

### Test Structure

- Unit Tests: Located in `tests/Unit/`
- Feature Tests: Located in `tests/Feature/`

### Available Test Suites

- Authentication Tests: `tests/Feature/Auth/`
  - AuthenticationTest.php
  - EmailVerificationTest.php
  - PasswordResetTest.php
  - RegistrationTest.php

- Feature Tests:
  - DashboardTest.php
  - PatientAppointmentVisitRelationshipsTest.php
  - Settings tests (ProfileUpdateTest.php, PasswordUpdateTest.php)

### Running Specific Tests

Run a specific test file:

```bash
php artisan test --filter DashboardTest
```

Run tests with coverage:

```bash
php artisan test --coverage
```

### Test Configuration

Test configuration is in `phpunit.xml`. The test environment uses:
- In-memory database for faster tests
- Array cache and session drivers
- Disabled external services (mail, queue, etc.)

## FAQs/Known Issues

### Common Issues

#### Excel Export Not Working

Problem: Excel export fails or generates corrupted files.

Solution:
1. Enable PHP GD extension in `php.ini`:
   ```ini
   extension=gd
   ```
2. Restart Apache/PHP-FPM
3. Clear application cache:
   ```bash
   php artisan optimize:clear
   ```

#### 404 Errors on Export Endpoints

Problem: Getting 404 errors when trying to export reports.

Solution:
- Ensure you are authenticated as an admin
- Verify routes are loaded: `php artisan route:list`
- Check that routes are under `/admin/inventory/reports/*/export`
- Clear route cache: `php artisan route:clear`

#### Database Connection Failed

Problem: Cannot connect to MySQL database.

Solution:
1. Verify MySQL is running (check XAMPP Control Panel)
2. Check database credentials in `.env` file
3. Verify database `stjames_clinic` exists
4. Check MySQL port (default: 3306)
5. Ensure MySQL user has proper permissions

#### Port 8000 Already in Use

Problem: `php artisan serve` fails because port 8000 is in use.

Solution:
```bash
php artisan serve --port=8001
```

Or stop the process using port 8000.

#### Memory Limit Exceeded

Problem: "Allowed memory size exhausted" errors during installation.

Solution:
1. Edit `php.ini`:
   ```ini
   memory_limit = 512M
   ```
2. Or run composer with increased memory:
   ```bash
   php -d memory_limit=512M composer install
   ```

#### npm install Fails

Problem: npm installation fails with errors.

Solution:
1. Clear npm cache:
   ```bash
   npm cache clean --force
   ```
2. Delete `node_modules` and `package-lock.json`
3. Run `npm install` again
4. If using Node.js 18+, ensure compatibility

#### Blank Page or JavaScript Errors

Problem: Application loads but shows blank page or JavaScript errors.

Solution:
1. Build frontend assets:
   ```bash
   npm run build
   ```
2. Clear browser cache
3. Check browser console (F12) for errors
4. Verify `public/build/` directory exists
5. Run `php artisan optimize:clear`

#### Session/Cache Issues

Problem: Changes not reflecting or session problems.

Solution:
```bash
php artisan optimize:clear
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### Known Limitations

1. File Upload Size: Default PHP upload limit is 2MB. Increase in `php.ini` if needed:
   ```ini
   upload_max_filesize = 10M
   post_max_size = 10M
   ```

2. Concurrent Users: For production, use proper web server (Apache/Nginx) instead of `php artisan serve`.

3. Email Configuration: Email features require proper SMTP configuration in `.env`.

4. Large Datasets: Some reports may be slow with very large datasets. Consider pagination or background jobs.

### Performance Optimization

For production deployment:

1. Enable OPcache in PHP
2. Use Redis for cache and sessions
3. Enable database query caching
4. Use CDN for static assets
5. Optimize images and assets
6. Enable gzip compression

## Acknowledgments/Credits

### Development Team

This project was developed as a capstone project for St. James Clinic Management System.

### Technologies & Libraries

- Laravel Framework: [Laravel](https://laravel.com) - The PHP Framework for Web Artisans
- React: [React](https://reactjs.org) - A JavaScript library for building user interfaces
- Inertia.js: [Inertia.js](https://inertiajs.com) - The modern monolith
- shadcn/ui: [shadcn/ui](https://ui.shadcn.com) - Beautifully designed components
- Tailwind CSS: [Tailwind CSS](https://tailwindcss.com) - A utility-first CSS framework
- Spatie Laravel Permission: [Spatie](https://spatie.be/docs/laravel-permission) - Role and permission management
- Maatwebsite Excel: [Maatwebsite](https://docs.laravel-excel.com) - Excel file import/export
- DomPDF: [DomPDF](https://github.com/dompdf/dompdf) - PDF generation

### Special Thanks

- Laravel community for excellent documentation and support
- React and TypeScript communities
- All open-source contributors whose packages made this project possible

### License

This project is licensed under the MIT License - see the LICENSE file for details.

---

Version: 1.0.0  
Last Updated: 2025  
Maintained By: St. James Clinic Development Team

For detailed installation instructions, see `INSTALLATION_MANUAL.txt` in the project root.
