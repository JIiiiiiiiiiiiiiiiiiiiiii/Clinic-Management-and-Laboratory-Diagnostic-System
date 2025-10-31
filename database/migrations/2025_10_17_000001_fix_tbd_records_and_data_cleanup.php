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
        // Fix TBD records and generate proper codes
        $this->fixTBDRecords();
        
        // Clean up incorrect source values
        $this->cleanupIncorrectSourceValues();
        
        // Ensure all foreign key relationships are correct
        $this->fixForeignKeys();
    }

    /**
     * Fix TBD records and generate proper codes
     */
    private function fixTBDRecords()
    {
        // Fix patient codes
        $patients = DB::table('patients')
            ->where(function($query) {
                $query->whereNull('patient_code')
                      ->orWhere('patient_code', '')
                      ->orWhere('patient_code', 'like', 'TBD%');
            })
            ->get();

        foreach ($patients as $patient) {
            // Use patient_id if it exists, otherwise use id
            $patientId = $patient->patient_id ?? $patient->id ?? null;
            if ($patientId) {
                $code = 'P' . str_pad($patientId, 4, '0', STR_PAD_LEFT);
                $whereColumn = isset($patient->patient_id) ? 'patient_id' : 'id';
                DB::table('patients')
                    ->where($whereColumn, $patientId)
                    ->update(['patient_code' => $code]);
            }
        }

        // Fix appointment codes
        $appointments = DB::table('appointments')
            ->where(function($query) {
                $query->whereNull('appointment_code')
                      ->orWhere('appointment_code', '')
                      ->orWhere('appointment_code', 'like', 'TBD%');
            })
            ->get();

        foreach ($appointments as $appointment) {
            $code = 'A' . str_pad((string)$appointment->id, 4, '0', STR_PAD_LEFT);
            DB::table('appointments')
                ->where('id', $appointment->id)
                ->update(['appointment_code' => $code]);
        }

        // Fix visit codes
        $visits = DB::table('visits')
            ->where(function($query) {
                $query->whereNull('visit_code')
                      ->orWhere('visit_code', '')
                      ->orWhere('visit_code', 'like', 'TBD%');
            })
            ->get();

        foreach ($visits as $visit) {
            $code = 'V' . str_pad($visit->id, 4, '0', STR_PAD_LEFT);
            DB::table('visits')
                ->where('id', $visit->id)
                ->update(['visit_code' => $code]);
        }

        // Fix transaction codes
        $transactions = DB::table('billing_transactions')
            ->where(function($query) {
                $query->whereNull('transaction_code')
                      ->orWhere('transaction_code', '')
                      ->orWhere('transaction_code', 'like', 'TBD%');
            })
            ->get();

        foreach ($transactions as $transaction) {
            $code = 'TXN-' . str_pad($transaction->id, 6, '0', STR_PAD_LEFT);
            DB::table('billing_transactions')
                ->where('id', $transaction->id)
                ->update(['transaction_code' => $code]);
        }
    }

    /**
     * Clean up incorrect source values
     */
    private function cleanupIncorrectSourceValues()
    {
        // Fix appointments that should be 'Online' but are marked as 'Walk-in'
        // This is based on created_at timestamp and other indicators
        $onlineAppointments = DB::table('appointments')
            ->where('source', 'Walk-in')
            ->where('status', 'Pending')
            ->where('created_at', '>=', now()->subDays(30)) // Recent appointments
            ->whereNull('admin_notes') // No admin notes suggests online booking
            ->get();

        foreach ($onlineAppointments as $appointment) {
            DB::table('appointments')
                ->where('id', $appointment->id)
                ->update(['source' => 'Online']);
        }

        // Fix appointments that should be 'Walk-in' but are marked as 'Online'
        $walkInAppointments = DB::table('appointments')
            ->where('source', 'Online')
            ->where('status', 'Confirmed')
            ->whereNotNull('admin_notes') // Has admin notes suggests walk-in
            ->where('created_at', '>=', now()->subDays(7)) // Recent appointments
            ->get();

        foreach ($walkInAppointments as $appointment) {
            DB::table('appointments')
                ->where('id', $appointment->id)
                ->update(['source' => 'Walk-in']);
        }
    }

    /**
     * Fix foreign key relationships
     */
    private function fixForeignKeys()
    {
        // Update appointments to use correct patient_id (if column exists)
        if (Schema::hasColumn('appointments', 'patient_id') && Schema::hasColumn('appointments', 'patient_id_fk')) {
            $appointments = DB::table('appointments')
                ->whereNotNull('patient_id_fk')
                ->get();

            foreach ($appointments as $appointment) {
                DB::table('appointments')
                    ->where('id', $appointment->id)
                    ->update(['patient_id' => $appointment->patient_id_fk]);
            }
        }

        // Update appointments to use correct specialist_id (if column exists)
        if (Schema::hasColumn('appointments', 'specialist_id') && Schema::hasColumn('appointments', 'specialist_id_fk')) {
            $appointments = DB::table('appointments')
                ->whereNotNull('specialist_id_fk')
                ->get();

            foreach ($appointments as $appointment) {
                DB::table('appointments')
                    ->where('id', $appointment->id)
                    ->update(['specialist_id' => $appointment->specialist_id_fk]);
            }
        }

        // Update visits to use correct patient_id
        if (Schema::hasColumn('visits', 'patient_id')) {
            $visits = DB::table('visits')
                ->whereNotNull('appointment_id')
                ->get();

            foreach ($visits as $visit) {
                // Get patient_id from appointment (check both patient_id_fk and patient_id)
                $appointment = DB::table('appointments')
                    ->where('id', $visit->appointment_id)
                    ->first();

                if ($appointment) {
                    $patientId = $appointment->patient_id_fk ?? $appointment->patient_id ?? null;
                    if ($patientId) {
                        DB::table('visits')
                            ->where('id', $visit->id)
                            ->update(['patient_id' => $patientId]);
                    }
                }
            }
        }

        // Update visits to use correct staff_id (check if column exists)
        if (Schema::hasColumn('visits', 'attending_staff_id')) {
            $visits = DB::table('visits')
                ->whereNotNull('attending_staff_id')
                ->get();

            foreach ($visits as $visit) {
                DB::table('visits')
                    ->where('id', $visit->id)
                    ->update(['staff_id' => $visit->attending_staff_id]);
            }
        }

        // Update billing_transactions to use correct patient_id
        if (Schema::hasColumn('billing_transactions', 'patient_id') && Schema::hasColumn('billing_transactions', 'appointment_id')) {
            $transactions = DB::table('billing_transactions')
                ->whereNotNull('appointment_id')
                ->get();

            foreach ($transactions as $transaction) {
                // Get patient_id from appointment (check both patient_id_fk and patient_id)
                $appointment = DB::table('appointments')
                    ->where('id', $transaction->appointment_id)
                    ->first();

                if ($appointment) {
                    $patientId = $appointment->patient_id_fk ?? $appointment->patient_id ?? null;
                    if ($patientId) {
                        DB::table('billing_transactions')
                            ->where('id', $transaction->id)
                            ->update(['patient_id' => $patientId]);
                    }
                }
            }
        }

        // Update billing_transactions to use correct specialist_id
        if (Schema::hasColumn('billing_transactions', 'specialist_id') && Schema::hasColumn('billing_transactions', 'appointment_id')) {
            $transactions = DB::table('billing_transactions')
                ->whereNotNull('appointment_id')
                ->get();

            foreach ($transactions as $transaction) {
                // Get specialist_id from appointment (check both specialist_id_fk and specialist_id)
                $appointment = DB::table('appointments')
                    ->where('id', $transaction->appointment_id)
                    ->first();

                if ($appointment) {
                    $specialistId = $appointment->specialist_id_fk ?? $appointment->specialist_id ?? null;
                    if ($specialistId) {
                        DB::table('billing_transactions')
                            ->where('id', $transaction->id)
                            ->update(['specialist_id' => $specialistId]);
                    }
                }
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // This migration is not reversible as it fixes data inconsistencies
        // Reversing would reintroduce the problems
    }
};
