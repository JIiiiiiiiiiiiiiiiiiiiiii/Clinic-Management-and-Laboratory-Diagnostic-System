#!/bin/bash

# St. James Clinic - Fresh Setup Script
# This script sets up the clinic system from scratch

echo "🏥 St. James Clinic - Fresh Setup"
echo "================================="

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ .env file not found. Please copy .env.example to .env and configure it."
    exit 1
fi

echo "📦 Installing PHP dependencies..."
composer install --no-dev --optimize-autoloader

echo "📦 Installing Node.js dependencies..."
npm install

echo "🔑 Generating application key..."
php artisan key:generate

echo "🗄️ Running core database migrations..."
php artisan migrate --path=database/migrations/2025_09_04_000001_create_lab_tests_table.php
php artisan migrate --path=database/migrations/2025_09_04_000002_create_lab_orders_table.php
php artisan migrate --path=database/migrations/2025_10_06_092423_create_appointments_table.php
php artisan migrate --path=database/migrations/2025_10_06_123157_create_billing_transactions_table.php
php artisan migrate --path=database/migrations/2025_10_07_071529_create_notifications_table.php

echo "📊 Caching configuration..."
php artisan config:cache

echo "🛣️ Caching routes..."
php artisan route:cache

echo "✅ Setup complete!"
echo ""
echo "🚀 To start the development server:"
echo "   php artisan serve"
echo ""
echo "🔐 Default login credentials:"
echo "   Admin: admin@clinic.com / password"
echo "   Patient: patient@clinic.com / password"
echo "   Doctor: doctor@clinic.com / password"
echo ""
echo "🌐 Access the application at: http://localhost:8000"
