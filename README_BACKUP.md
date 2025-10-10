# 🏥 Clinic Management and Laboratory Diagnostic System

## 📋 System Overview

A comprehensive clinic management system built with Laravel 12 and React/TypeScript, featuring complete inventory management, patient tracking, laboratory operations, and financial management.

## ✨ Key Features

### 🏥 **Complete Clinic Management**
- Patient registration and management
- Appointment scheduling and tracking
- Medical history and visit records
- Patient transfer system

### 🧪 **Laboratory System**
- Lab test management
- Order processing and tracking
- Result management
- Report generation

### 📦 **Advanced Inventory Management**
- Real-time stock tracking
- Department-specific inventory (Doctor & Nurse, Med Tech)
- Movement tracking (IN/OUT)
- Low stock alerts
- Comprehensive reporting with PDF/Excel export

### 💰 **Financial Management**
- Billing and transaction management
- Doctor payment system
- Expense tracking
- Financial reporting

### 📊 **Reporting & Analytics**
- Real-time dashboards
- Comprehensive reports
- Export capabilities (PDF/Excel)
- Activity tracking

## 🚀 Quick Start

### Prerequisites
- PHP 8.2+
- Composer
- Node.js 18+
- SQLite/MySQL/PostgreSQL

### Installation
```bash
# Clone the repository
git clone https://github.com/basiertoronnel/Clinic-.git
cd Clinic-

# Switch to backup branch
git checkout Back-up

# Install dependencies
composer install
npm install

# Setup environment
cp .env.example .env
php artisan key:generate

# Setup database
php artisan migrate
php artisan db:seed

# Build frontend
npm run build

# Start server
php artisan serve
```

## 🗄️ Database Structure

### Core Tables
- **inventory_items** - Inventory management
- **inventory_movements** - Stock movement tracking
- **patients** - Patient records
- **appointments** - Appointment scheduling
- **lab_orders** - Laboratory orders
- **billing_transactions** - Financial transactions
- **reports** - Generated reports

### Key Relationships
- Inventory items ↔ movements (one-to-many)
- Patients ↔ appointments (one-to-many)
- Users ↔ reports (one-to-many)

## 🔐 Authentication & Roles

### User Roles
- **Admin**: Full system access
- **Doctor**: Patient management, appointments
- **Nurse**: Patient care, inventory access
- **Med Tech**: Laboratory operations, inventory
- **Hospital Admin**: Hospital-level management

### Default Credentials
- Admin: `admin@clinic.com` / `password`
- Doctor: `doctor@clinic.com` / `password`
- Nurse: `nurse@clinic.com` / `password`
- Med Tech: `medtech@clinic.com` / `password`

## 📦 Inventory Management Features

### Department-Specific Views
- **Doctor & Nurse Supplies**: Medical equipment and supplies
- **Med Tech Supplies**: Laboratory equipment and reagents

### Stock Management
- Real-time stock tracking
- Movement history (IN/OUT)
- Low stock alerts
- Status tracking (In Stock, Low Stock, Out of Stock)

### Reporting System
- Consumed vs Rejected reports
- Movement tracking reports
- Department-wise analytics
- Export to PDF/Excel

## 🧪 Laboratory Features

- Test management and categorization
- Order processing workflow
- Result entry and validation
- Report generation
- Quality control tracking

## 💰 Financial Features

- Transaction management
- Doctor payment calculations
- Expense tracking
- Financial reporting
- Billing integration

## 🛠️ Technical Stack

### Backend
- **Laravel 12** - PHP framework
- **Inertia.js** - SPA framework
- **SQLite/MySQL** - Database
- **Laravel Excel** - Export functionality
- **DomPDF** - PDF generation

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Radix UI** - Component library
- **Lucide React** - Icons

## 📊 System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (React/TS)    │◄──►│   (Laravel)     │◄──►│   (SQLite)      │
│                 │    │                 │    │                 │
│ • Inventory UI  │    │ • Controllers   │    │ • Tables        │
│ • Patient UI    │    │ • Models        │    │ • Relations     │
│ • Reports UI    │    │ • Services      │    │ • Indexes       │
│ • Admin UI      │    │ • Exports       │    │ • Constraints   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🔧 Development

### Code Structure
```
app/
├── Http/Controllers/     # API controllers
├── Models/              # Eloquent models
├── Exports/             # Excel/PDF exports
├── Services/            # Business logic
└── Events/              # Event handling

resources/js/
├── pages/               # React pages
├── components/          # Reusable components
└── layouts/            # Page layouts
```

### Database Migrations
- All migrations are properly ordered
- Foreign key constraints maintained
- Data integrity ensured
- Rollback capabilities included

## 📈 Performance Features

- Database indexing for optimal queries
- Caching for frequently accessed data
- Optimized frontend builds
- Efficient API responses

## 🔒 Security Features

- Role-based access control
- Input validation and sanitization
- CSRF protection
- SQL injection prevention
- XSS protection

## 📝 Documentation

- Comprehensive code documentation
- API documentation
- Database schema documentation
- Setup and deployment guides

## 🚀 Deployment

### Production Setup
1. Configure environment variables
2. Set up production database
3. Run migrations
4. Build frontend assets
5. Configure web server

### Docker Support
- Docker configuration included
- Multi-stage builds
- Production optimizations

## 📞 Support

For technical support or questions:
1. Check the documentation
2. Review GitHub issues
3. Contact the development team

## 🔄 Version History

- **v1.0.0** - Initial release with complete functionality
- **Back-up branch** - Stable, production-ready version
- **3-interface-UI** - Latest development features

---

**Repository**: https://github.com/basiertoronnel/Clinic-
**Backup Branch**: `Back-up`
**Status**: Production Ready ✅
**Last Updated**: January 10, 2025
