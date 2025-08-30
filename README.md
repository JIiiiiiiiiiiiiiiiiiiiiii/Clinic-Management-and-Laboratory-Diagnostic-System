# St. James Clinic Management System

A comprehensive clinic management system built with Laravel and React, featuring patient management, appointments, laboratory tests, inventory management, and billing.

## Features

### Core Functionality

- **User Management**: Multi-role system (Admin, Staff, Doctor, Laboratory Technician, Patient)
- **Patient Management**: Complete patient records with medical history
- **Appointment Scheduling**: Advanced scheduling system with time slots
- **Consultation Management**: Doctor consultations with diagnosis and prescriptions
- **Laboratory Management**: Test requests, results tracking, and sample management
- **Inventory Management**: Medical supplies, medications, and equipment tracking
- **Billing & Payments**: Comprehensive billing system with payment tracking
- **Custom Clinical Records**: Flexible system for clinics to create custom medical forms

### Laboratory Tests

- **CBC (Complete Blood Count)**: Full blood analysis with detailed parameters
- **Urinalysis**: Comprehensive urine examination
- **Fecalysis**: Stool analysis for parasites and abnormalities
- **Custom Tests**: Extensible system for additional laboratory procedures

### Security & Access Control

- Role-based access control
- Secure authentication system
- Audit trails for all medical records
- Data privacy compliance

## System Requirements

- PHP 8.2 or higher
- MySQL 8.0 or higher / MariaDB 10.5 or higher
- Composer
- Node.js 18+ and npm
- Laravel 12.0

## Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd stjames-clinic-noauth
```

### 2. Install PHP Dependencies

```bash
composer install
```

### 3. Install Node.js Dependencies

```bash
npm install
```

### 4. Environment Configuration

Copy the environment file and configure your database:

```bash
cp .env.example .env
```

Update the `.env` file with your database credentials:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=clinic_management_system
DB_USERNAME=your_username
DB_PASSWORD=your_password
```

### 5. Generate Application Key

```bash
php artisan key:generate
```

### 6. Database Setup

#### Option A: Using Laravel Migrations (Recommended)

```bash
php artisan migrate
php artisan db:seed
```

#### Option B: Using SQL Script

Run the provided SQL script in your MySQL client:

```bash
mysql -u your_username -p < database/setup.sql
```

### 7. Build Frontend Assets

```bash
npm run build
```

### 8. Start the Development Server

```bash
php artisan serve
```

## Default Users

After running the seeder, the following users are created with password `password`:

- **Admin**: `admin` - Full system access
- **Staff**: `staff` - Patient and appointment management
- **Doctor**: `doctor` - Consultations and medical records
- **Lab Tech**: `labtech` - Laboratory test management
- **Patient**: `patient` - Patient portal access

## Database Schema

### Core Tables

- `users` - User accounts with role-based access
- `patients` - Patient information and medical records
- `appointments` - Appointment scheduling and management
- `consultations` - Doctor consultations and medical notes
- `laboratory_tests` - Available laboratory test catalog
- `laboratory_requests` - Test requests and status tracking
- `inventory` - Medical supplies and equipment
- `billing` - Patient billing and payment tracking

### Laboratory Results Tables

- `cbc_results` - Complete Blood Count results
- `urinalysis_results` - Urine analysis results
- `fecalysis_results` - Stool examination results

### Custom Clinical Records

- `custom_clinical_records` - Template definitions for custom forms
- `custom_clinical_record_values` - Actual values for custom records

## API Endpoints

### Appointments

- `GET /management/appointment` - List appointments
- `POST /management/appointment` - Create appointment
- `GET /management/appointment/{id}` - Show appointment
- `PUT /management/appointment/{id}` - Update appointment
- `DELETE /management/appointment/{id}` - Delete appointment
- `PATCH /management/appointment/{id}/status` - Update status
- `GET /management/appointment/slots` - Get available slots

### Patients

- `GET /management/patient` - List patients
- `POST /management/patient` - Create patient
- `GET /management/patient/{id}` - Show patient
- `PUT /management/patient/{id}` - Update patient
- `DELETE /management/patient/{id}` - Delete patient

## Custom Clinical Records

The system supports creating custom clinical record types that clinics can define based on their specific needs:

### Creating Custom Records

1. Define the record structure with field names and types
2. Store the structure as JSON in the `fields` column
3. Create instances of the record for patients
4. Store actual values in the `field_values` JSON column

### Example Custom Record

```json
{
    "fields": [
        { "name": "blood_pressure", "type": "text", "label": "Blood Pressure" },
        { "name": "temperature", "type": "decimal", "label": "Temperature (°C)" },
        { "name": "pulse_rate", "type": "integer", "label": "Pulse Rate (bpm)" },
        { "name": "notes", "type": "textarea", "label": "Additional Notes" }
    ]
}
```

## Development

### Running Tests

```bash
php artisan test
```

### Code Quality

```bash
composer pint
```

### Database Migrations

```bash
php artisan make:migration create_new_table
php artisan migrate
php artisan migrate:rollback
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please contact the development team or create an issue in the repository.

## Changelog

### Version 1.0.0

- Initial release
- Core clinic management functionality
- User role management
- Patient and appointment management
- Laboratory test system
- Inventory management
- Billing and payments
- Custom clinical records support
