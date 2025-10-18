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
        // Skip this migration for now - it's trying to recreate existing tables
        echo "Skipping recreate basic tables migration - tables already exist\n";
        return;
        // 1️⃣ patients table
        Schema::create('patients', function (Blueprint $table) {
            $table->id('patient_id');
            $table->string('patient_code', 10)->unique()->nullable();
            $table->string('last_name', 100);
            $table->string('first_name', 100);
            $table->string('middle_name', 100)->nullable();
            $table->date('birthdate')->nullable();
            $table->integer('age')->nullable();
            $table->enum('sex', ['Male', 'Female'])->nullable();
            $table->string('nationality', 50)->nullable();
            $table->string('civil_status', 50)->nullable();
            $table->text('address')->nullable();
            $table->string('telephone_no', 20)->nullable();
            $table->string('mobile_no', 20)->nullable();
            $table->string('emergency_name', 100)->nullable();
            $table->string('emergency_relation', 50)->nullable();
            $table->string('insurance_company', 100)->nullable();
            $table->string('hmo_name', 100)->nullable();
            $table->string('hmo_id_no', 100)->nullable();
            $table->string('approval_code', 100)->nullable();
            $table->date('validity')->nullable();
            $table->text('drug_allergies')->nullable();
            $table->text('past_medical_history')->nullable();
            $table->text('family_history')->nullable();
            $table->text('social_history')->nullable();
            $table->text('obgyn_history')->nullable();
            $table->enum('status', ['Active', 'Inactive'])->default('Active');
            $table->timestamps();
        });

        // 2️⃣ staff table
        Schema::create('staff', function (Blueprint $table) {
            $table->id('staff_id');
            $table->string('staff_code', 10)->unique()->nullable();
            $table->string('name', 255);
            $table->enum('role', ['Doctor', 'MedTech', 'Admin']);
            $table->string('specialization', 100)->nullable();
            $table->string('contact', 20)->nullable();
            $table->string('email', 100)->nullable();
            $table->enum('status', ['Active', 'Inactive'])->default('Active');
            $table->timestamps();
        });

        // 3️⃣ appointments table
        Schema::create('appointments', function (Blueprint $table) {
            $table->id('appointment_id');
            $table->string('appointment_code', 10)->unique()->nullable();
            $table->unsignedBigInteger('patient_id');
            $table->unsignedBigInteger('specialist_id')->nullable();
            $table->string('appointment_type', 100)->nullable();
            $table->enum('specialist_type', ['Doctor', 'MedTech'])->nullable();
            $table->date('appointment_date')->nullable();
            $table->time('appointment_time')->nullable();
            $table->string('duration', 50)->default('30 min');
            $table->decimal('price', 10, 2)->default(0.00);
            $table->text('additional_info')->nullable();
            $table->enum('source', ['Online', 'Walk-in'])->default('Walk-in');
            $table->enum('status', ['Pending', 'Confirmed', 'Cancelled', 'Completed'])->default('Pending');
            $table->text('admin_notes')->nullable();
            $table->enum('billing_status', ['pending', 'in_transaction', 'paid', 'cancelled'])->default('pending');
            $table->timestamps();
            
            $table->foreign('patient_id')->references('patient_id')->on('patients')->onDelete('restrict');
            $table->foreign('specialist_id')->references('staff_id')->on('staff')->onDelete('set null');
        });

        // 4️⃣ visits table
        Schema::create('visits', function (Blueprint $table) {
            $table->id('visit_id');
            $table->string('visit_code', 10)->unique()->nullable();
            $table->unsignedBigInteger('appointment_id')->unique();
            $table->unsignedBigInteger('patient_id');
            $table->unsignedBigInteger('staff_id')->nullable();
            $table->string('purpose', 255)->nullable();
            $table->enum('status', ['Ongoing', 'Completed'])->default('Ongoing');
            $table->datetime('visit_date')->nullable();
            $table->timestamps();
            
            $table->foreign('appointment_id')->references('appointment_id')->on('appointments')->onDelete('cascade');
            $table->foreign('patient_id')->references('patient_id')->on('patients')->onDelete('restrict');
            $table->foreign('staff_id')->references('staff_id')->on('staff')->onDelete('set null');
        });

        // 5️⃣ billing_transactions table
        Schema::create('billing_transactions', function (Blueprint $table) {
            $table->id('transaction_id');
            $table->string('transaction_code', 15)->unique()->nullable();
            $table->unsignedBigInteger('appointment_id')->unique();
            $table->unsignedBigInteger('patient_id');
            $table->unsignedBigInteger('specialist_id')->nullable();
            $table->decimal('amount', 10, 2)->default(0.00);
            $table->enum('payment_method', ['Cash', 'Card', 'HMO'])->nullable();
            $table->string('reference_no', 100)->nullable();
            $table->text('notes')->nullable();
            $table->enum('status', ['Pending', 'Paid', 'Cancelled'])->default('Pending');
            $table->timestamps();
            
            $table->foreign('appointment_id')->references('appointment_id')->on('appointments')->onDelete('cascade');
            $table->foreign('patient_id')->references('patient_id')->on('patients')->onDelete('restrict');
            $table->foreign('specialist_id')->references('staff_id')->on('staff')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('billing_transactions');
        Schema::dropIfExists('visits');
        Schema::dropIfExists('appointments');
        Schema::dropIfExists('patients');
        Schema::dropIfExists('staff');
    }
};