<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Models\BillingTransaction;
use App\Models\AppointmentBillingLink;
use App\Models\Appointment;
use App\Models\Patient;
use App\Models\User;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Fix existing billing transactions with proper patient and doctor data
        $transactions = BillingTransaction::with(['appointmentLinks.appointment'])->get();

        foreach ($transactions as $transaction) {
            foreach ($transaction->appointmentLinks as $link) {
                if ($link->appointment) {
                    $appointment = $link->appointment;
                    
                    // Parse patient name into first and last name
                    $nameParts = explode(' ', trim($appointment->patient_name), 2);
                    $firstName = $nameParts[0] ?? '';
                    $lastName = $nameParts[1] ?? '';

                    // Update or create patient record with actual appointment data
                    $patient = Patient::updateOrCreate(
                        ['patient_no' => $appointment->patient_id],
                        [
                            'first_name' => $firstName,
                            'last_name' => $lastName,
                            'patient_no' => $appointment->patient_id,
                            'present_address' => 'Not provided',
                            'mobile_no' => $appointment->contact_number ?? 'Not provided',
                            'birthdate' => '1990-01-01',
                            'age' => 30,
                            'sex' => 'Male',
                            'informant_name' => 'Not provided',
                            'relationship' => 'Not provided',
                            'created_by' => $transaction->created_by,
                        ]
                    );

                    // Find the doctor from the appointment
                    $doctor = null;
                    if ($appointment->specialist_type === 'doctor' && $appointment->specialist_id) {
                        $doctor = User::where('role', 'doctor')
                                     ->where('id', $appointment->specialist_id)
                                     ->first();
                    }

                    // Update the billing transaction with proper patient and doctor IDs
                    $transaction->update([
                        'patient_id' => $patient->id,
                        'doctor_id' => $doctor ? $doctor->id : null,
                    ]);
                    
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
        // This migration is not reversible as it fixes data
    }
};