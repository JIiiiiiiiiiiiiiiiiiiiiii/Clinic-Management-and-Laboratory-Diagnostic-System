<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Models\BillingTransaction;
use App\Models\Patient;
use App\Models\AppointmentBillingLink;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Get all billing transactions that have null patient_id but have appointment links
        $transactions = BillingTransaction::whereNull('patient_id')
            ->whereHas('appointmentLinks')
            ->with('appointmentLinks.appointment')
            ->get();

        foreach ($transactions as $transaction) {
            foreach ($transaction->appointmentLinks as $link) {
                if ($link->appointment) {
                    $appointment = $link->appointment;
                    
                    // Create or find patient record
                    $patient = Patient::firstOrCreate(
                        ['patient_no' => $appointment->patient_id],
                        [
                            'first_name' => $appointment->patient_name,
                            'last_name' => '', // We'll extract this from patient_name if needed
                            'patient_no' => $appointment->patient_id,
                            'present_address' => 'N/A',
                            'mobile_no' => $appointment->contact_number ?? 'N/A',
                            'birthdate' => '1990-01-01', // Default birthdate
                            'age' => 30, // Default age
                            'sex' => 'Male',
                            'informant_name' => 'N/A',
                            'relationship' => 'N/A',
                            'created_by' => $transaction->created_by,
                        ]
                    );

                    // Update the billing transaction to link to the patient
                    $transaction->update(['patient_id' => $patient->id]);
                    
                    // Only process the first appointment link to avoid duplicates
                    break;
                }
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // This migration is not easily reversible
        // We'll leave the patient records as they are
    }
};