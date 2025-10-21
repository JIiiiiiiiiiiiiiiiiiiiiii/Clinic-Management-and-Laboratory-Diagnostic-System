<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Add patient_code to patients table
        Schema::table('patients', function (Blueprint $table) {
            if (!Schema::hasColumn('patients', 'patient_code')) {
                $table->string('patient_code', 10)->unique()->after('id');
            }
        });

        // Add appointment_code to appointments table
        Schema::table('appointments', function (Blueprint $table) {
            if (!Schema::hasColumn('appointments', 'appointment_code')) {
                $table->string('appointment_code', 10)->unique()->after('id');
            }
        });

        // Add visit_code to visits table
        Schema::table('visits', function (Blueprint $table) {
            if (!Schema::hasColumn('visits', 'visit_code')) {
                $table->string('visit_code', 10)->unique()->after('id');
            }
        });

        // Add transaction_code to billing_transactions table
        Schema::table('billing_transactions', function (Blueprint $table) {
            if (!Schema::hasColumn('billing_transactions', 'transaction_code')) {
                $table->string('transaction_code', 15)->unique()->after('id');
            }
        });

        // Create staff table
        if (!Schema::hasTable('staff')) {
            Schema::create('staff', function (Blueprint $table) {
                $table->id();
                $table->string('staff_code', 10)->unique();
                $table->string('name', 255);
                $table->enum('role', ['Doctor', 'MedTech', 'Admin']);
                $table->string('specialization', 100)->nullable();
                $table->string('contact', 20)->nullable();
                $table->string('email', 100)->nullable();
                $table->enum('status', ['Active', 'Inactive'])->default('Active');
                $table->timestamps();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('patients', function (Blueprint $table) {
            $table->dropColumn('patient_code');
        });

        Schema::table('appointments', function (Blueprint $table) {
            $table->dropColumn('appointment_code');
        });

        Schema::table('visits', function (Blueprint $table) {
            $table->dropColumn('visit_code');
        });

        Schema::table('billing_transactions', function (Blueprint $table) {
            $table->dropColumn('transaction_code');
        });

        Schema::dropIfExists('staff');
    }
};