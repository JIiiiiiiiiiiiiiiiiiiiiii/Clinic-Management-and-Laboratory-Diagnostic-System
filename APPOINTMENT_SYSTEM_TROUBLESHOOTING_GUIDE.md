# Online Appointment System Troubleshooting Guide

## 🚨 Common Issues When Pulling the Code

### 1. **Database Migration Issues**

**Problem**: `SQLSTATE[42S02]: Base table or view not found: 1146 Table 'clinic_system.appointments' doesn't exist`

**Solution**:
```bash
# Run migrations in the correct order
php artisan migrate:fresh --seed
```

**Required Migrations** (in order):
- `create_patients_table`
- `create_specialists_table` 
- `create_appointments_table`
- `create_visits_table`
- `create_billing_transactions_table`

### 2. **Missing Database Seeders**

**Problem**: No specialists available for appointment booking

**Solution**:
```bash
# Run specific seeders
php artisan db:seed --class=UserRoleSeeder
php artisan db:seed --class=SpecialistsSeeder
php artisan db:seed --class=LabTestSeeder
```

### 3. **Environment Configuration Issues**

**Problem**: Database connection errors or missing environment variables

**Solution**:
```bash
# Copy environment file
cp .env.example .env

# Generate application key
php artisan key:generate

# Configure database in .env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=clinic_system
DB_USERNAME=root
DB_PASSWORD=
```

### 4. **Missing Dependencies**

**Problem**: `Class 'App\Models\Specialist' not found`

**Solution**:
```bash
# Install PHP dependencies
composer install

# Install Node.js dependencies
npm install

# Clear caches
php artisan config:clear
php artisan cache:clear
php artisan route:clear
```

### 5. **Foreign Key Constraint Issues**

**Problem**: `SQLSTATE[23000]: Integrity constraint violation: 1452 Cannot add or update a child row`

**Solution**:
```bash
# Check if specialists table has data
php artisan tinker
>>> App\Models\Specialist::count()

# If 0, run seeder
php artisan db:seed --class=SpecialistsSeeder
```

### 6. **Appointment Creation Fails**

**Problem**: "Patient not found" or "Specialist not found" errors

**Root Causes**:
1. **Missing Specialists**: No specialists in database
2. **Invalid Patient Data**: Required fields missing
3. **Database Constraints**: Foreign key violations

**Debug Steps**:
```bash
# Check database state
php artisan tinker
>>> App\Models\Specialist::all()
>>> App\Models\Patient::count()
>>> App\Models\User::where('role', 'admin')->count()
```

### 7. **API Route Issues**

**Problem**: 404 errors on appointment API endpoints

**Solution**:
```bash
# Check if routes are registered
php artisan route:list --name=appointment

# Clear route cache
php artisan route:clear
php artisan config:clear
```

### 8. **Authentication Issues**

**Problem**: "Unauthenticated" errors when creating appointments

**Solution**:
```bash
# Ensure user is logged in
# Check if user has proper role
php artisan tinker
>>> App\Models\User::where('role', 'patient')->first()
```

## 🔧 Complete Setup Process

### Step 1: Environment Setup
```bash
# Clone repository
git clone https://github.com/JIiiiiiiiiiiiiiiiiiiiiii/Clinic-Management-and-Laboratory-Diagnostic-System.git
cd Clinic-Management-and-Laboratory-Diagnostic-System

# Install dependencies
composer install
npm install
```

### Step 2: Database Setup
```bash
# Create database
mysql -u root -p
CREATE DATABASE clinic_system;

# Configure .env file
cp .env.example .env
# Edit .env with your database credentials

# Generate key
php artisan key:generate
```

### Step 3: Database Migration & Seeding
```bash
# Fresh migration with seeders
php artisan migrate:fresh --seed

# Or run specific seeders
php artisan db:seed --class=UserRoleSeeder
php artisan db:seed --class=SpecialistsSeeder
php artisan db:seed --class=LabTestSeeder
```

### Step 4: Build Assets
```bash
# Build frontend assets
npm run build

# Or for development
npm run dev
```

### Step 5: Start Application
```bash
# Start Laravel server
php artisan serve

# In another terminal, start queue worker (if using queues)
php artisan queue:work
```

## 🧪 Testing the Appointment System

### Test User Accounts (Created by UserRoleSeeder):
- **Admin**: admin@clinic.com / password
- **Doctor**: doctor@clinic.com / password  
- **Patient**: patient@clinic.com / password

### Test Appointment Creation:
```bash
# Test via API
curl -X POST http://localhost:8000/api/online-appointments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "patient": {
      "first_name": "John",
      "last_name": "Doe", 
      "mobile_no": "09123456789",
      "birthdate": "1990-01-01"
    },
    "appointment": {
      "appointment_type": "consultation",
      "specialist_type": "Doctor",
      "specialist_id": 1,
      "date": "2024-01-15",
      "time": "10:00 AM"
    }
  }'
```

## 🚨 Critical Dependencies

### Required PHP Extensions:
- `mbstring`
- `openssl` 
- `pdo_mysql`
- `xml`
- `ctype`
- `json`
- `tokenizer`
- `curl`
- `fileinfo`
- `gd` (for Excel exports)

### Required Database Tables:
1. `users` (with roles: admin, doctor, patient, medtech, cashier)
2. `patients` (with proper patient_no generation)
3. `specialists` (with Doctor/MedTech roles)
4. `appointments` (with proper foreign keys)
5. `visits` (linked to appointments)
6. `billing_transactions` (for billing integration)

## 🔍 Debugging Commands

```bash
# Check database connection
php artisan tinker
>>> DB::connection()->getPdo()

# Check if all required tables exist
>>> Schema::hasTable('appointments')
>>> Schema::hasTable('patients')
>>> Schema::hasTable('specialists')

# Check data integrity
>>> App\Models\Specialist::count()
>>> App\Models\User::where('role', 'admin')->count()
>>> App\Models\Patient::count()

# Test appointment creation
>>> $service = new App\Services\AppointmentCreationService()
>>> $result = $service->createAppointmentWithPatient($appointmentData, $patientData)
```

## 📞 Support

If you encounter issues not covered in this guide:

1. Check Laravel logs: `storage/logs/laravel.log`
2. Enable debug mode: `APP_DEBUG=true` in `.env`
3. Check database constraints and foreign keys
4. Verify all seeders have run successfully
5. Ensure proper user authentication and roles

## ✅ Success Indicators

Your appointment system is working correctly when:
- ✅ Database migrations run without errors
- ✅ All seeders complete successfully  
- ✅ Users can be created with proper roles
- ✅ Specialists are available for booking
- ✅ API endpoints respond correctly
- ✅ Appointments can be created via API
- ✅ Patients are auto-generated
- ✅ Visits are auto-created after appointment approval
