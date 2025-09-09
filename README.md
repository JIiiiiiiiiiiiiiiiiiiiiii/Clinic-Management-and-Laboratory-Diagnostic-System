# St. James Clinic Management and Laboratory Diagnostic System

Modern clinic and laboratory management built with Laravel 12, Inertia.js, and React (TypeScript). It provides Patient Management, Laboratory Diagnostics, and Inventory Management with role-based access, robust validation, and exportable reports (Excel/PDF/Word).

## Features

- Patient Management: Master records, visit history, lab orders linkage, duplicate prevention, tabbed details
- Laboratory: Test templates, orders, results entry/verification, printable/exportable reports
- Inventory: Items (supplies), stock levels, transactions (in/out/rejected), multi-report exports
- Role-based access control (admin, doctor, medtech, cashier, patient)
- Global toast notifications and consistent UX with shadcn/ui

## Prerequisites

- PHP 8.2+
- Composer
- Node.js 18+
- XAMPP or equivalent (MySQL), enabled PHP extensions: mbstring, openssl, pdo_mysql, xml, ctype, json, tokenizer, curl, fileinfo, gd

## Installation

1. Clone the repo

```
git clone https://github.com/JIiiiiiiiiiiiiiiiiiiiiii/Clinic-Management-and-Laboratory-Diagnostic-System.git
cd Clinic-Management-and-Laboratory-Diagnostic-System/stjames-clinic-noauth
```

2. Install PHP deps

```
composer install
```

3. Install JS deps

```
npm install
```

4. Create and configure .env

```
cp .env.example .env
# Update DB_* values for your MySQL
# Ensure APP_URL=http://127.0.0.1:8000
```

5. Generate app key

```
php artisan key:generate
```

6. Run migrations and seeders

```
php artisan migrate --graceful --ansi
php artisan db:seed --class=UserRoleSeeder --ansi
php artisan db:seed --class=LabTestSeeder --ansi
php artisan db:seed --class=InventorySeeder --ansi
```

7. Build assets (dev)

```
npm run dev
```

8. Run the app

```
php artisan serve
```

## Common Issues

- Excel export requires PHP GD extension. Enable `extension=gd` in your `php.ini` and restart PHP/Apache.
- If you receive 404 on export endpoints, ensure routes are loaded under `/admin/inventory/reports/*/export` and you are authenticated as an admin.
- Clear caches after environment changes:

```
php artisan optimize:clear
```

## Usage Notes

- Inventory → Reports: Each report page has an Export dropdown for Excel/PDF/Word.
- Laboratory → Reports/Orders: Export dropdowns available for bulk orders and per-order results.
- Patient Management: Create patients; visits are managed under the patient details tabs; lab orders can be created in context of a visit.

## Tests

```
php artisan test
```

## License

MIT
