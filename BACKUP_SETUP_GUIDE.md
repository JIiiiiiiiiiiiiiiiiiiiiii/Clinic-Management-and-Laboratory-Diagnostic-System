# Clinic Management System - Backup Setup Guide

## 🚀 Quick Setup for New Developers

This guide ensures smooth setup when cloning the repository from the "Back-up" branch.

## 📋 Prerequisites

- PHP 8.2 or higher
- Composer
- Node.js 18+ and npm
- SQLite (included) or MySQL/PostgreSQL
- Git

## 🔧 Installation Steps

### 1. Clone the Repository
```bash
git clone https://github.com/basiertoronnel/Clinic-.git
cd Clinic-
git checkout Back-up
```

### 2. Install PHP Dependencies
```bash
composer install
```

### 3. Install Node.js Dependencies
```bash
npm install
```

### 4. Environment Setup
```bash
cp .env.example .env
php artisan key:generate
```

### 5. Database Setup
```bash
# Run migrations
php artisan migrate

# Seed the database with sample data
php artisan db:seed
```

### 6. Build Frontend Assets
```bash
npm run build
```

### 7. Start the Application
```bash
php artisan serve
```

## 🗄️ Database Configuration

The system uses SQLite by default (database/database.sqlite). For production, update .env:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=clinic_management
DB_USERNAME=your_username
DB_PASSWORD=your_password
```

## 📦 Key Features Included

### ✅ Complete Inventory Management System
- Item management with categories
- Stock tracking and movements
- Department-specific views (Doctor & Nurse, Med Tech)
- Comprehensive reporting with PDF/Excel export
- Real-time stock updates

### ✅ Patient Management
- Patient registration and profiles
- Visit tracking
- Medical history
- Transfer management

### ✅ Laboratory System
- Lab test management
- Order processing
- Result tracking
- Report generation

### ✅ Billing & Payments
- Transaction management
- Doctor payment system
- Financial reporting
- Expense tracking

### ✅ Appointment System
- Appointment scheduling
- Status tracking
- Notification system

## 🔐 Default Login Credentials

After seeding, you can use these test accounts:

- **Admin**: admin@clinic.com / password
- **Doctor**: doctor@clinic.com / password
- **Nurse**: nurse@clinic.com / password
- **Med Tech**: medtech@clinic.com / password

## 🛠️ Troubleshooting

### Common Issues:

1. **Permission Errors (Linux/Mac)**:
   ```bash
   chmod -R 755 storage bootstrap/cache
   ```

2. **Database Connection Issues**:
   - Ensure SQLite file exists: `touch database/database.sqlite`
   - Check .env configuration

3. **Frontend Build Issues**:
   ```bash
   npm run dev  # For development
   npm run build  # For production
   ```

4. **Missing Dependencies**:
   ```bash
   composer install --no-dev
   npm ci
   ```

## 📊 Database Structure

### Key Tables:
- `inventory_items` - Inventory management
- `inventory_movements` - Stock movements
- `patients` - Patient records
- `appointments` - Appointment scheduling
- `lab_orders` - Laboratory orders
- `billing_transactions` - Financial transactions
- `reports` - Generated reports

## 🚀 Production Deployment

1. **Environment Setup**:
   ```bash
   APP_ENV=production
   APP_DEBUG=false
   ```

2. **Database Migration**:
   ```bash
   php artisan migrate --force
   ```

3. **Asset Optimization**:
   ```bash
   npm run build
   php artisan config:cache
   php artisan route:cache
   php artisan view:cache
   ```

## 📝 Development Notes

- All code is properly documented
- Follows Laravel best practices
- React components use TypeScript
- Database relationships are properly configured
- Comprehensive error handling included

## 🔄 Version Control

- **Back-up branch**: Complete working system
- **3-interface-UI branch**: Latest development
- **master branch**: Stable releases

## 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Review Laravel/React documentation
3. Check GitHub issues

---

**Last Updated**: January 10, 2025
**Version**: 1.0.0
**Status**: Production Ready ✅
