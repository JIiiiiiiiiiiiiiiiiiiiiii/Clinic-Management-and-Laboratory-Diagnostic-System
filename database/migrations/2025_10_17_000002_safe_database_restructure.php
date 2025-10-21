<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Create staff table if it doesn't exist
        if (!Schema::hasTable('staff')) {
            Schema::create('staff', function (Blueprint $table) {
                $table->id('staff_id');
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

        // 2. Add missing columns to patients table
        $this->addMissingPatientColumns();

        // 3. Add missing columns to appointments table
        $this->addMissingAppointmentColumns();

        // 4. Add missing columns to visits table
        $this->addMissingVisitColumns();

        // 5. Add missing columns to billing_transactions table
        $this->addMissingBillingColumns();

        // 6. Generate codes for existing records
        $this->generateCodesForExistingRecords();
    }

    /**
     * Add missing columns to patients table
     */
    private function addMissingPatientColumns()
    {
        Schema::table('patients', function (Blueprint $table) {
            if (!Schema::hasColumn('patients', 'patient_code')) {
                $table->string('patient_code', 10)->nullable()->after('id');
            }
            if (!Schema::hasColumn('patients', 'last_name')) {
                $table->string('last_name', 100)->nullable()->after('patient_code');
            }
            if (!Schema::hasColumn('patients', 'first_name')) {
                $table->string('first_name', 100)->nullable()->after('last_name');
            }
            if (!Schema::hasColumn('patients', 'middle_name')) {
                $table->string('middle_name', 100)->nullable()->after('first_name');
            }
            if (!Schema::hasColumn('patients', 'birthdate')) {
                $table->date('birthdate')->nullable()->after('middle_name');
            }
            if (!Schema::hasColumn('patients', 'age')) {
                $table->integer('age')->nullable()->after('birthdate');
            }
            if (!Schema::hasColumn('patients', 'sex')) {
                $table->enum('sex', ['Male', 'Female'])->nullable()->after('age');
            }
            if (!Schema::hasColumn('patients', 'nationality')) {
                $table->string('nationality', 50)->nullable()->after('sex');
            }
            if (!Schema::hasColumn('patients', 'civil_status')) {
                $table->string('civil_status', 50)->nullable()->after('nationality');
            }
            if (!Schema::hasColumn('patients', 'address')) {
                $table->text('address')->nullable()->after('civil_status');
            }
            if (!Schema::hasColumn('patients', 'telephone_no')) {
                $table->string('telephone_no', 20)->nullable()->after('address');
            }
            if (!Schema::hasColumn('patients', 'mobile_no')) {
                $table->string('mobile_no', 20)->nullable()->after('telephone_no');
            }
            if (!Schema::hasColumn('patients', 'emergency_name')) {
                $table->string('emergency_name', 100)->nullable()->after('mobile_no');
            }
            if (!Schema::hasColumn('patients', 'emergency_relation')) {
                $table->string('emergency_relation', 50)->nullable()->after('emergency_name');
            }
            if (!Schema::hasColumn('patients', 'insurance_company')) {
                $table->string('insurance_company', 100)->nullable()->after('emergency_relation');
            }
            if (!Schema::hasColumn('patients', 'hmo_name')) {
                $table->string('hmo_name', 100)->nullable()->after('insurance_company');
            }
            if (!Schema::hasColumn('patients', 'hmo_id_no')) {
                $table->string('hmo_id_no', 100)->nullable()->after('hmo_name');
            }
            if (!Schema::hasColumn('patients', 'approval_code')) {
                $table->string('approval_code', 100)->nullable()->after('hmo_id_no');
            }
            if (!Schema::hasColumn('patients', 'validity')) {
                $table->date('validity')->nullable()->after('approval_code');
            }
            if (!Schema::hasColumn('patients', 'drug_allergies')) {
                $table->text('drug_allergies')->nullable()->after('validity');
            }
            if (!Schema::hasColumn('patients', 'past_medical_history')) {
                $table->text('past_medical_history')->nullable()->after('drug_allergies');
            }
            if (!Schema::hasColumn('patients', 'family_history')) {
                $table->text('family_history')->nullable()->after('past_medical_history');
            }
            if (!Schema::hasColumn('patients', 'social_history')) {
                $table->text('social_history')->nullable()->after('family_history');
            }
            if (!Schema::hasColumn('patients', 'obgyn_history')) {
                $table->text('obgyn_history')->nullable()->after('social_history');
            }
            if (!Schema::hasColumn('patients', 'status')) {
                $table->enum('status', ['Active', 'Inactive'])->default('Active')->after('obgyn_history');
            }
        });
    }

    /**
     * Add missing columns to appointments table
     */
    private function addMissingAppointmentColumns()
    {
        Schema::table('appointments', function (Blueprint $table) {
            if (!Schema::hasColumn('appointments', 'appointment_code')) {
                $table->string('appointment_code', 10)->nullable()->after('id');
            }
            if (!Schema::hasColumn('appointments', 'patient_id')) {
                $table->unsignedBigInteger('patient_id')->nullable()->after('appointment_code');
            }
            if (!Schema::hasColumn('appointments', 'specialist_id')) {
                $table->unsignedBigInteger('specialist_id')->nullable()->after('patient_id');
            }
            if (!Schema::hasColumn('appointments', 'specialist_type')) {
                $table->enum('specialist_type', ['Doctor', 'MedTech'])->nullable()->after('specialist_id');
            }
            if (!Schema::hasColumn('appointments', 'price')) {
                $table->decimal('price', 10, 2)->default(0.00)->after('duration');
            }
            if (!Schema::hasColumn('appointments', 'additional_info')) {
                $table->text('additional_info')->nullable()->after('price');
            }
            if (!Schema::hasColumn('appointments', 'source')) {
                $table->enum('source', ['Online', 'Walk-in'])->default('Walk-in')->after('additional_info');
            }
            if (!Schema::hasColumn('appointments', 'admin_notes')) {
                $table->text('admin_notes')->nullable()->after('source');
            }
        });
    }

    /**
     * Add missing columns to visits table
     */
    private function addMissingVisitColumns()
    {
        Schema::table('visits', function (Blueprint $table) {
            if (!Schema::hasColumn('visits', 'visit_code')) {
                $table->string('visit_code', 10)->nullable()->after('id');
            }
            if (!Schema::hasColumn('visits', 'appointment_id')) {
                $table->unsignedBigInteger('appointment_id')->nullable()->after('visit_code');
            }
            if (!Schema::hasColumn('visits', 'patient_id')) {
                $table->unsignedBigInteger('patient_id')->nullable()->after('appointment_id');
            }
            if (!Schema::hasColumn('visits', 'staff_id')) {
                $table->unsignedBigInteger('staff_id')->nullable()->after('patient_id');
            }
            if (!Schema::hasColumn('visits', 'purpose')) {
                $table->string('purpose', 255)->nullable()->after('staff_id');
            }
            if (!Schema::hasColumn('visits', 'status')) {
                $table->enum('status', ['Ongoing', 'Completed'])->default('Ongoing')->after('purpose');
            }
            if (!Schema::hasColumn('visits', 'visit_date')) {
                $table->datetime('visit_date')->nullable()->after('status');
            }
        });
    }

    /**
     * Add missing columns to billing_transactions table
     */
    private function addMissingBillingColumns()
    {
        Schema::table('billing_transactions', function (Blueprint $table) {
            if (!Schema::hasColumn('billing_transactions', 'transaction_code')) {
                $table->string('transaction_code', 15)->nullable()->after('id');
            }
            if (!Schema::hasColumn('billing_transactions', 'appointment_id')) {
                $table->unsignedBigInteger('appointment_id')->nullable()->after('transaction_code');
            }
            if (!Schema::hasColumn('billing_transactions', 'patient_id')) {
                $table->unsignedBigInteger('patient_id')->nullable()->after('appointment_id');
            }
            if (!Schema::hasColumn('billing_transactions', 'specialist_id')) {
                $table->unsignedBigInteger('specialist_id')->nullable()->after('patient_id');
            }
            if (!Schema::hasColumn('billing_transactions', 'amount')) {
                $table->decimal('amount', 10, 2)->default(0.00)->after('specialist_id');
            }
            if (!Schema::hasColumn('billing_transactions', 'payment_method')) {
                $table->enum('payment_method', ['Cash', 'Card', 'HMO'])->nullable()->after('amount');
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
    }

    /**
     * Generate codes for existing records
     */
    private function generateCodesForExistingRecords()
    {
        // Generate patient codes
        $patients = DB::table('patients')->whereNull('patient_code')->get();
        foreach ($patients as $patient) {
            $code = 'P' . str_pad($patient->id, 4, '0', STR_PAD_LEFT);
            DB::table('patients')->where('id', $patient->id)->update(['patient_code' => $code]);
        }

        // Generate appointment codes
        $appointments = DB::table('appointments')->whereNull('appointment_code')->get();
        foreach ($appointments as $appointment) {
            $code = 'A' . str_pad($appointment->id, 4, '0', STR_PAD_LEFT);
            DB::table('appointments')->where('id', $appointment->id)->update(['appointment_code' => $code]);
        }

        // Generate visit codes
        $visits = DB::table('visits')->whereNull('visit_code')->get();
        foreach ($visits as $visit) {
            $code = 'V' . str_pad($visit->id, 4, '0', STR_PAD_LEFT);
            DB::table('visits')->where('id', $visit->id)->update(['visit_code' => $code]);
        }

        // Generate transaction codes
        $transactions = DB::table('billing_transactions')->whereNull('transaction_code')->get();
        foreach ($transactions as $transaction) {
            $code = 'TXN-' . str_pad($transaction->id, 6, '0', STR_PAD_LEFT);
            DB::table('billing_transactions')->where('id', $transaction->id)->update(['transaction_code' => $code]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // This migration is not reversible as it adds essential columns
    }
};

