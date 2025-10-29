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
        // Add patient_code to patients table
        Schema::table('patients', function (Blueprint $table) {
            if (!Schema::hasColumn('patients', 'patient_code')) {
                $table->string('patient_code', 10)->nullable()->after('id');
            }
        });

        // Generate patient codes for existing patients
        $patients = DB::table('patients')->whereNull('patient_code')->get();
        foreach ($patients as $index => $patient) {
            $code = 'P' . str_pad($patient->id, 3, '0', STR_PAD_LEFT);
            DB::table('patients')->where('id', $patient->id)->update(['patient_code' => $code]);
        }

        // Now make it unique (only if not already unique)
        try {
            Schema::table('patients', function (Blueprint $table) {
                $table->string('patient_code', 10)->unique()->change();
            });
        } catch (\Exception $e) {
            echo "Unique constraint for patient_code may already exist: " . $e->getMessage() . "\n";
        }

        // Add appointment_code to appointments table
        Schema::table('appointments', function (Blueprint $table) {
            if (!Schema::hasColumn('appointments', 'appointment_code')) {
                $table->string('appointment_code', 10)->nullable()->after('id');
            }
        });

        // Generate appointment codes for existing appointments
        $appointments = DB::table('appointments')->whereNull('appointment_code')->get();
        foreach ($appointments as $index => $appointment) {
            $code = 'A' . str_pad($appointment->id, 3, '0', STR_PAD_LEFT);
            DB::table('appointments')->where('id', $appointment->id)->update(['appointment_code' => $code]);
        }

        // Now make it unique (only if not already unique)
        try {
            Schema::table('appointments', function (Blueprint $table) {
                $table->string('appointment_code', 10)->unique()->change();
            });
        } catch (\Exception $e) {
            echo "Unique constraint for appointment_code may already exist: " . $e->getMessage() . "\n";
        }

        // Add visit_code to visits table
        Schema::table('visits', function (Blueprint $table) {
            if (!Schema::hasColumn('visits', 'visit_code')) {
                $table->string('visit_code', 10)->nullable()->after('id');
            }
        });

        // Generate visit codes for existing visits
        $visits = DB::table('visits')->whereNull('visit_code')->get();
        foreach ($visits as $index => $visit) {
            $code = 'V' . str_pad($visit->id, 3, '0', STR_PAD_LEFT);
            DB::table('visits')->where('id', $visit->id)->update(['visit_code' => $code]);
        }

        // Now make it unique (only if not already unique)
        try {
            Schema::table('visits', function (Blueprint $table) {
                $table->string('visit_code', 10)->unique()->change();
            });
        } catch (\Exception $e) {
            echo "Unique constraint for visit_code may already exist: " . $e->getMessage() . "\n";
        }

        // Add transaction_code to billing_transactions table
        Schema::table('billing_transactions', function (Blueprint $table) {
            if (!Schema::hasColumn('billing_transactions', 'transaction_code')) {
                $table->string('transaction_code', 15)->nullable()->after('id');
            }
        });

        // Generate transaction codes for existing transactions
        $transactions = DB::table('billing_transactions')->whereNull('transaction_code')->get();
        foreach ($transactions as $index => $transaction) {
            $code = 'TXN-' . str_pad($transaction->id, 6, '0', STR_PAD_LEFT);
            DB::table('billing_transactions')->where('id', $transaction->id)->update(['transaction_code' => $code]);
        }

        // Now make it unique (only if not already unique)
        try {
            Schema::table('billing_transactions', function (Blueprint $table) {
                $table->string('transaction_code', 15)->unique()->change();
            });
        } catch (\Exception $e) {
            echo "Unique constraint for transaction_code may already exist: " . $e->getMessage() . "\n";
        }

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