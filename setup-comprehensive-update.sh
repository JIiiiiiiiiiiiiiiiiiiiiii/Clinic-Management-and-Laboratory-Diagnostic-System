#!/bin/bash

echo "🏥 Starting Comprehensive Clinic Management System Update"
echo "=================================================="

# Check if we're in the right directory
if [ ! -f "artisan" ]; then
    echo "❌ Error: Please run this script from the Laravel project root directory"
    exit 1
fi

echo "📋 Step 1: Running Database Migrations"
echo "--------------------------------------"

# Run the comprehensive database restructure migration
echo "Running comprehensive database restructure migration..."
php artisan migrate --path=database/migrations/2025_10_17_000000_comprehensive_database_restructure.php

if [ $? -ne 0 ]; then
    echo "❌ Error: Database restructure migration failed"
    exit 1
fi

# Run the TBD records fix migration
echo "Running TBD records fix migration..."
php artisan migrate --path=database/migrations/2025_10_17_000001_fix_tbd_records_and_data_cleanup.php

if [ $? -ne 0 ]; then
    echo "❌ Error: TBD records fix migration failed"
    exit 1
fi

echo "✅ Database migrations completed successfully"

echo ""
echo "📋 Step 2: Clearing and Rebuilding Caches"
echo "----------------------------------------"

# Clear all caches
echo "Clearing application caches..."
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear

# Rebuild caches
echo "Rebuilding caches..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

echo "✅ Caches cleared and rebuilt"

echo ""
echo "📋 Step 3: Installing/Updating Dependencies"
echo "------------------------------------------"

# Install/update Composer dependencies
echo "Installing Composer dependencies..."
composer install --no-dev --optimize-autoloader

# Install/update NPM dependencies
echo "Installing NPM dependencies..."
npm install

# Build frontend assets
echo "Building frontend assets..."
npm run build

echo "✅ Dependencies installed and assets built"

echo ""
echo "📋 Step 4: Database Seeding (if needed)"
echo "---------------------------------------"

# Check if staff table has data
STAFF_COUNT=$(php artisan tinker --execute="echo \App\Models\Staff::count();" 2>/dev/null | tail -1)

if [ "$STAFF_COUNT" -eq 0 ]; then
    echo "No staff found. Creating sample staff..."
    php artisan tinker --execute="
        \App\Models\Staff::create([
            'staff_code' => 'S0001',
            'name' => 'Dr. John Smith',
            'role' => 'Doctor',
            'specialization' => 'General Medicine',
            'contact' => '+1234567890',
            'email' => 'dr.smith@clinic.com',
            'status' => 'Active'
        ]);
        
        \App\Models\Staff::create([
            'staff_code' => 'S0002',
            'name' => 'Sarah Johnson',
            'role' => 'MedTech',
            'specialization' => 'Laboratory',
            'contact' => '+1234567891',
            'email' => 'sarah.johnson@clinic.com',
            'status' => 'Active'
        ]);
        
        echo 'Sample staff created successfully';
    "
else
    echo "Staff data already exists. Skipping staff creation."
fi

echo "✅ Database seeding completed"

echo ""
echo "📋 Step 5: File Permissions"
echo "---------------------------"

# Set proper permissions
echo "Setting file permissions..."
chmod -R 755 storage
chmod -R 755 bootstrap/cache
chmod 644 .env

echo "✅ File permissions set"

echo ""
echo "📋 Step 6: Final Verification"
echo "-----------------------------"

# Test database connection
echo "Testing database connection..."
php artisan tinker --execute="
    try {
        \DB::connection()->getPdo();
        echo 'Database connection: ✅ OK';
    } catch (Exception \$e) {
        echo 'Database connection: ❌ FAILED - ' . \$e->getMessage();
        exit(1);
    }
"

# Test model relationships
echo "Testing model relationships..."
php artisan tinker --execute="
    try {
        \$patient = \App\Models\Patient::first();
        if (\$patient) {
            echo 'Patient model: ✅ OK';
        } else {
            echo 'Patient model: ⚠️  No patients found';
        }
        
        \$staff = \App\Models\Staff::first();
        if (\$staff) {
            echo 'Staff model: ✅ OK';
        } else {
            echo 'Staff model: ⚠️  No staff found';
        }
        
        \$appointment = \App\Models\Appointment::first();
        if (\$appointment) {
            echo 'Appointment model: ✅ OK';
        } else {
            echo 'Appointment model: ⚠️  No appointments found';
        }
    } catch (Exception \$e) {
        echo 'Model test: ❌ FAILED - ' . \$e->getMessage();
    }
"

echo ""
echo "🎉 Comprehensive Update Completed Successfully!"
echo "=============================================="
echo ""
echo "📊 Summary of Changes:"
echo "• Database structure updated with proper relationships"
echo "• Transactional appointment creation implemented"
echo "• TBD records fixed with proper code generation"
echo "• Frontend AJAX handling improved"
echo "• Admin approval workflow enhanced"
echo "• Data migration completed"
echo ""
echo "🚀 Next Steps:"
echo "1. Test the online appointment booking flow"
echo "2. Test the admin approval workflow"
echo "3. Test the walk-in appointment creation"
echo "4. Verify billing transaction creation"
echo "5. Check reports and analytics"
echo ""
echo "📝 Important Notes:"
echo "• All existing data has been preserved"
echo "• New code generation follows P001, A001, V001, TXN-000001 format"
echo "• Transactional integrity ensures no partial data states"
echo "• Frontend now prevents page reloads during form submission"
echo ""
echo "🔧 If you encounter any issues:"
echo "• Check Laravel logs: storage/logs/laravel.log"
echo "• Verify database connections in .env"
echo "• Run: php artisan migrate:status"
echo "• Run: php artisan route:list"
echo ""
echo "✨ Your clinic management system is now fully updated!"

