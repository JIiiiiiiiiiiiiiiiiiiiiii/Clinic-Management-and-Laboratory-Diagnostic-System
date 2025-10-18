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
        // Add essential fields to patients table
        Schema::table('patients', function (Blueprint $table) {
            if (!Schema::hasColumn('patients', 'patient_code')) {
                $table->string('patient_code', 10)->unique()->after('id');
            }
            if (!Schema::hasColumn('patients', 'status')) {
                $table->enum('status', ['Active', 'Inactive'])->default('Active')->after('obstetrics_gynecology_history');
            }
        });

        // Add essential fields to appointments table
        Schema::table('appointments', function (Blueprint $table) {
            if (!Schema::hasColumn('appointments', 'appointment_code')) {
                $table->string('appointment_code', 10)->unique()->after('id');
            }
            if (!Schema::hasColumn('appointments', 'patient_id_fk')) {
                $table->foreignId('patient_id_fk')->nullable()->constrained('patients')->onDelete('cascade')->after('appointment_code');
            }
            if (!Schema::hasColumn('appointments', 'specialist_id_fk')) {
                $table->foreignId('specialist_id_fk')->nullable()->constrained('users')->onDelete('cascade')->after('patient_id_fk');
            }
            if (!Schema::hasColumn('appointments', 'specialist_type')) {
                $table->enum('specialist_type', ['Doctor', 'MedTech'])->nullable()->after('specialist_id_fk');
            }
            if (!Schema::hasColumn('appointments', 'source')) {
                $table->enum('source', ['Online', 'Walk-in'])->default('Walk-in')->after('special_requirements');
            }
            if (!Schema::hasColumn('appointments', 'admin_notes')) {
                $table->text('admin_notes')->nullable()->after('source');
            }
        });

        // Add essential fields to visits table
        Schema::table('visits', function (Blueprint $table) {
            if (!Schema::hasColumn('visits', 'visit_code')) {
                $table->string('visit_code', 10)->unique()->after('id');
            }
            if (!Schema::hasColumn('visits', 'status')) {
                $table->enum('status', ['Ongoing', 'Completed'])->default('Ongoing')->after('visit_type');
            }
        });

        // Add essential fields to billing_transactions table
        Schema::table('billing_transactions', function (Blueprint $table) {
            if (!Schema::hasColumn('billing_transactions', 'transaction_code')) {
                $table->string('transaction_code', 15)->unique()->after('id');
            }
            if (!Schema::hasColumn('billing_transactions', 'appointment_id')) {
                $table->foreignId('appointment_id')->nullable()->constrained()->onDelete('cascade')->after('transaction_code');
            }
            if (!Schema::hasColumn('billing_transactions', 'specialist_id')) {
                $table->foreignId('specialist_id')->nullable()->constrained('users')->onDelete('cascade')->after('patient_id');
            }
            if (!Schema::hasColumn('billing_transactions', 'amount')) {
                $table->decimal('amount', 10, 2)->nullable()->after('specialist_id');
            }
            if (!Schema::hasColumn('billing_transactions', 'payment_method')) {
                $table->enum('payment_method', ['Cash', 'Card', 'HMO'])->default('Cash')->after('amount');
            }
            if (!Schema::hasColumn('billing_transactions', 'reference_no')) {
                $table->string('reference_no', 100)->nullable()->after('payment_method');
            }
            if (!Schema::hasColumn('billing_transactions', 'notes')) {
                $table->text('notes')->nullable()->after('reference_no');
            }
            if (!Schema::hasColumn('billing_transactions', 'status')) {
                $table->enum('status', ['Pending', 'Paid', 'Cancelled'])->default('Pending')->after('notes');
            }
        });

        // Create staff table if it doesn't exist
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
            $table->dropColumn(['patient_code', 'status']);
        });

        Schema::table('appointments', function (Blueprint $table) {
            $table->dropColumn(['appointment_code', 'patient_id_fk', 'specialist_id_fk', 'specialist_type', 'source', 'admin_notes']);
        });

        Schema::table('visits', function (Blueprint $table) {
            $table->dropColumn(['visit_code', 'status']);
        });

        Schema::table('billing_transactions', function (Blueprint $table) {
            $table->dropColumn(['transaction_code', 'appointment_id', 'specialist_id', 'amount', 'payment_method', 'reference_no', 'notes', 'status']);
        });

        Schema::dropIfExists('staff');
    }
};