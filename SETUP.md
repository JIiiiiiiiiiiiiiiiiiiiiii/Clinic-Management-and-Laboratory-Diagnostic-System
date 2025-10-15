# 🏥 St. James Clinic - Setup Guide

## Quick Start

### Prerequisites
- PHP 8.1+ with extensions: BCMath, Ctype, cURL, DOM, Fileinfo, JSON, Mbstring, OpenSSL, PCRE, PDO, Tokenizer, XML, GD
- Composer
- Node.js 16+ and npm
- MySQL 5.7+ or MariaDB 10.3+
- Git

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/basiertoronnel/Clinic-.git
   cd Clinic-
   ```

2. **Install dependencies**
   ```bash
   composer install
   npm install
   ```

3. **Environment setup**
   ```bash
   cp .env.example .env
   # Edit .env file with your database credentials
   ```

4. **Database setup**
   ```bash
   php artisan key:generate
   php artisan migrate --path=database/migrations/2025_09_04_000001_create_lab_tests_table.php
   php artisan migrate --path=database/migrations/2025_09_04_000002_create_lab_orders_table.php
   php artisan migrate --path=database/migrations/2025_10_06_092423_create_appointments_table.php
   php artisan migrate --path=database/migrations/2025_10_06_123157_create_billing_transactions_table.php
   php artisan migrate --path=database/migrations/2025_10_07_071529_create_notifications_table.php
   ```

5. **Cache configuration**
   ```bash
   php artisan config:cache
   php artisan route:cache
   ```

6. **Start the server**
   ```bash
   php artisan serve
   ```

### Quick Setup Scripts

**For Linux/Mac:**
```bash
chmod +x setup-fresh.sh
./setup-fresh.sh
```

**For Windows:**
```cmd
setup-fresh.bat
```

## 🔐 Default Login Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@clinic.com | password |
| Patient | patient@clinic.com | password |
| Doctor | doctor@clinic.com | password |
| Lab Tech | labtech@clinic.com | password |
| Med Tech | medtech@clinic.com | password |
| Cashier | cashier@clinic.com | password |

## 🌐 Access URLs

- **Main Application**: http://localhost:8000
- **Admin Dashboard**: http://localhost:8000/admin/dashboard
- **Patient Dashboard**: http://localhost:8000/patient/dashboard-simple

## 🚀 Features

### Admin Features
- Complete patient management
- Appointment scheduling and management
- Billing and financial management
- Inventory management
- Laboratory management
- Reports and analytics
- Real-time notifications

### Patient Features
- Online appointment booking
- Appointment management
- Medical records access
- Real-time notifications
- Profile management

## 🛠️ Troubleshooting

### Common Issues

1. **Migration errors**: Run only the core migrations listed above
2. **Permission errors**: Ensure proper file permissions on storage/ and bootstrap/cache/
3. **Database connection**: Verify your .env database credentials
4. **Composer issues**: Run `composer install --no-dev --optimize-autoloader`

### Database Requirements

The system requires these core tables:
- users
- patients
- lab_tests
- lab_orders
- appointments
- billing_transactions
- notifications

## 📞 Support

For technical support or questions, please refer to the documentation or contact the development team.

---

**Note**: This is a development setup. For production deployment, additional security measures and optimizations are required.
