<?php

namespace App\Services;

use App\Models\Patient;
use App\Models\Appointment;
use App\Models\Visit;
use App\Models\BillingTransaction;
use App\Models\AppointmentBillingLink;
use App\Models\DailyTransaction;
use App\Models\PendingAppointment;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class SystemWideDataIntegrityService
{
    /**
     * Fix all data integrity issues across the system
     */
    public function fixAllDataIntegrityIssues()
    {
        try {
            Log::info('Starting comprehensive system data integrity fix');

            // Step 1: Fix patient data integrity
            $this->fixPatientDataIntegrity();

            // Step 2: Fix appointment data integrity
            $this->fixAppointmentDataIntegrity();

            // Step 3: Fix visit data integrity
            $this->fixVisitDataIntegrity();

            // Step 4: Fix billing transaction data integrity
            $this->fixBillingTransactionDataIntegrity();

            // Step 5: Fix appointment billing links
            $this->fixAppointmentBillingLinks();

            // Step 6: Fix daily transactions
            $this->fixDailyTransactions();

            // Step 7: Fix pending appointments
            $this->fixPendingAppointments();

            // Step 8: Sync all data relationships
            $this->syncAllDataRelationships();

            Log::info('System data integrity fix completed successfully');

            return [
                'success' => true,
                'message' => 'All data integrity issues have been fixed',
                'fixed_issues' => [
                    'patient_data' => 'Fixed',
                    'appointment_data' => 'Fixed',
                    'visit_data' => 'Fixed',
                    'billing_data' => 'Fixed',
                    'daily_transactions' => 'Fixed',
                    'pending_appointments' => 'Fixed'
                ]
            ];

        } catch (\Exception $e) {
            Log::error('System data integrity fix failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return [
                'success' => false,
                'message' => 'Failed to fix data integrity issues: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Fix patient data integrity issues
     */
    private function fixPatientDataIntegrity()
    {
        Log::info('Fixing patient data integrity');

        // Fix patients without user_id
        $patientsWithoutUser = Patient::whereNull('user_id')->get();
        foreach ($patientsWithoutUser as $patient) {
            // Try to find user by email or create a new one
            $user = User::where('email', $patient->mobile_no . '@clinic.local')->first();
            if (!$user) {
                $user = User::create([
                    'name' => $patient->first_name . ' ' . $patient->last_name,
                    'email' => $patient->mobile_no . '@clinic.local',
                    'password' => bcrypt('password123'),
                    'role' => 'patient'
                ]);
            }
            $patient->update(['user_id' => $user->id]);
        }

        // Fix patients without patient_no
        $patientsWithoutCode = Patient::whereNull('patient_no')->get();
        foreach ($patientsWithoutCode as $patient) {
            $nextId = Patient::max('id') + 1;
            $patient->update(['patient_no' => 'P' . str_pad($nextId, 4, '0', STR_PAD_LEFT)]);
        }

        // Fix patients without required fields
        $patientsWithMissingFields = Patient::where(function($query) {
            $query->whereNull('arrival_date')
                  ->orWhereNull('arrival_time')
                  ->orWhereNull('attending_physician')
                  ->orWhereNull('time_seen');
        })->get();

        foreach ($patientsWithMissingFields as $patient) {
            $patient->update([
                'arrival_date' => $patient->arrival_date ?? now()->toDateString(),
                'arrival_time' => $patient->arrival_time ?? now()->format('H:i:s'),
                'attending_physician' => $patient->attending_physician ?? 'To be assigned',
                'time_seen' => $patient->time_seen ?? now()->format('H:i:s'),
                'emergency_name' => $patient->emergency_name ?? 'N/A',
                'emergency_relation' => $patient->emergency_relation ?? 'N/A',
                'insurance_company' => $patient->insurance_company ?? 'N/A',
                'drug_allergies' => $patient->drug_allergies ?? 'NONE',
                'food_allergies' => $patient->food_allergies ?? 'NONE',
                'past_medical_history' => $patient->past_medical_history ?? 'N/A',
                'family_history' => $patient->family_history ?? 'N/A',
                'social_history' => $patient->social_history ?? 'N/A',
                'obgyn_history' => $patient->obgyn_history ?? 'N/A',
                'status' => $patient->status ?? 'active'
            ]);
        }

        Log::info('Patient data integrity fixed', ['fixed_count' => $patientsWithMissingFields->count()]);
    }

    /**
     * Fix appointment data integrity issues
     */
    private function fixAppointmentDataIntegrity()
    {
        Log::info('Fixing appointment data integrity');

        // Fix appointments without proper patient_id
        $appointmentsWithInvalidPatient = Appointment::whereNull('patient_id')
            ->orWhere('patient_id', '')
            ->get();

        foreach ($appointmentsWithInvalidPatient as $appointment) {
            // Try to find patient by name
            $patient = Patient::where('first_name', 'LIKE', '%' . explode(' ', $appointment->patient_name)[0] . '%')
                ->where('last_name', 'LIKE', '%' . explode(' ', $appointment->patient_name)[1] . '%')
                ->first();

            if ($patient) {
                $appointment->update(['patient_id' => $patient->id]);
            }
        }

        // Fix appointments without proper specialist_id
        $appointmentsWithInvalidSpecialist = Appointment::whereNull('specialist_id')
            ->orWhere('specialist_id', '')
            ->get();

        foreach ($appointmentsWithInvalidSpecialist as $appointment) {
            // Set default specialist or find by name
            $appointment->update([
                'specialist_id' => 1, // Default specialist
                'specialist_name' => $appointment->specialist_name ?? 'Unknown'
            ]);
        }

        // Fix appointments without proper status
        $appointmentsWithInvalidStatus = Appointment::whereNull('status')
            ->orWhere('status', '')
            ->get();

        foreach ($appointmentsWithInvalidStatus as $appointment) {
            $appointment->update(['status' => 'Pending']);
        }

        // Fix appointments without proper source
        $appointmentsWithInvalidSource = Appointment::whereNull('source')
            ->orWhere('source', '')
            ->get();

        foreach ($appointmentsWithInvalidSource as $appointment) {
            $appointment->update(['source' => 'Walk-in']);
        }

        // Fix appointments without proper price
        $appointmentsWithoutPrice = Appointment::whereNull('price')
            ->orWhere('price', 0)
            ->get();

        foreach ($appointmentsWithoutPrice as $appointment) {
            $price = $this->calculateAppointmentPrice($appointment->appointment_type);
            $appointment->update(['price' => $price]);
        }

        Log::info('Appointment data integrity fixed', ['fixed_count' => $appointmentsWithInvalidPatient->count()]);
    }

    /**
     * Fix visit data integrity issues
     */
    private function fixVisitDataIntegrity()
    {
        Log::info('Fixing visit data integrity');

        // Fix visits without proper appointment_id
        $visitsWithInvalidAppointment = Visit::whereNull('appointment_id')
            ->orWhere('appointment_id', '')
            ->get();

        foreach ($visitsWithInvalidAppointment as $visit) {
            // Try to find appointment by patient and date
            $appointment = Appointment::where('patient_id', $visit->patient_id)
                ->whereDate('appointment_date', $visit->visit_date_time_time ?? now())
                ->first();

            if ($appointment) {
                $visit->update(['appointment_id' => $appointment->id]);
            }
        }

        // Fix visits without proper patient_id
        $visitsWithInvalidPatient = Visit::whereNull('patient_id')
            ->orWhere('patient_id', '')
            ->get();

        foreach ($visitsWithInvalidPatient as $visit) {
            if ($visit->appointment) {
                $visit->update(['patient_id' => $visit->appointment->patient_id]);
            }
        }

        // Fix visits without proper status
        $visitsWithInvalidStatus = Visit::whereNull('status')
            ->orWhere('status', '')
            ->get();

        foreach ($visitsWithInvalidStatus as $visit) {
            $visit->update(['status' => 'Ongoing']);
        }

        // Fix visits without proper visit_code
        $visitsWithoutCode = Visit::whereNull('visit_code')
            ->orWhere('visit_code', '')
            ->get();

        foreach ($visitsWithoutCode as $visit) {
            $nextId = Visit::max('id') + 1;
            $visit->update(['visit_code' => 'V' . str_pad($nextId, 4, '0', STR_PAD_LEFT)]);
        }

        Log::info('Visit data integrity fixed', ['fixed_count' => $visitsWithInvalidAppointment->count()]);
    }

    /**
     * Fix billing transaction data integrity issues
     */
    private function fixBillingTransactionDataIntegrity()
    {
        Log::info('Fixing billing transaction data integrity');

        // Fix billing transactions without proper patient_id
        $billingWithInvalidPatient = BillingTransaction::whereNull('patient_id')
            ->orWhere('patient_id', '')
            ->get();

        foreach ($billingWithInvalidPatient as $transaction) {
            if ($transaction->appointment) {
                $transaction->update(['patient_id' => $transaction->appointment->patient_id]);
            }
        }

        // Fix billing transactions without proper appointment_id
        $billingWithInvalidAppointment = BillingTransaction::whereNull('appointment_id')
            ->orWhere('appointment_id', '')
            ->get();

        foreach ($billingWithInvalidAppointment as $transaction) {
            // Try to find appointment by patient and date
            $appointment = Appointment::where('patient_id', $transaction->patient_id)
                ->whereDate('appointment_date', $transaction->transaction_date ?? now())
                ->first();

            if ($appointment) {
                $transaction->update(['appointment_id' => $appointment->id]);
            }
        }

        // Fix billing transactions without proper status
        $billingWithInvalidStatus = BillingTransaction::whereNull('status')
            ->orWhere('status', '')
            ->get();

        foreach ($billingWithInvalidStatus as $transaction) {
            $transaction->update(['status' => 'pending']);
        }

        // Fix billing transactions without proper transaction_id
        $billingWithoutTransactionId = BillingTransaction::whereNull('transaction_id')
            ->orWhere('transaction_id', '')
            ->get();

        foreach ($billingWithoutTransactionId as $transaction) {
            $nextId = BillingTransaction::max('id') + 1;
            $transaction->update(['transaction_id' => 'TXN-' . str_pad($nextId, 6, '0', STR_PAD_LEFT)]);
        }

        Log::info('Billing transaction data integrity fixed', ['fixed_count' => $billingWithInvalidPatient->count()]);
    }

    /**
     * Fix appointment billing links
     */
    private function fixAppointmentBillingLinks()
    {
        Log::info('Fixing appointment billing links');

        // Create missing billing links for appointments
        $appointmentsWithoutBilling = Appointment::whereDoesntHave('billingLinks')->get();

        foreach ($appointmentsWithoutBilling as $appointment) {
            // Create billing transaction if it doesn't exist
            $billingTransaction = BillingTransaction::where('appointment_id', $appointment->id)->first();
            
            if (!$billingTransaction) {
                $billingTransaction = BillingTransaction::create([
                    'appointment_id' => $appointment->id,
                    'patient_id' => $appointment->patient_id,
                    'total_amount' => $appointment->price,
                    'amount' => $appointment->price,
                    'status' => 'pending',
                    'transaction_date' => now(),
                    'created_by' => 1,
                    'transaction_id' => 'TXN-' . str_pad(BillingTransaction::max('id') + 1, 6, '0', STR_PAD_LEFT)
                ]);
            }

            // Create billing link
            AppointmentBillingLink::create([
                'appointment_id' => $appointment->id,
                'billing_transaction_id' => $billingTransaction->id,
                'appointment_type' => $appointment->appointment_type,
                'appointment_price' => $appointment->price,
                'status' => 'pending'
            ]);
        }

        Log::info('Appointment billing links fixed', ['fixed_count' => $appointmentsWithoutBilling->count()]);
    }

    /**
     * Fix daily transactions
     */
    private function fixDailyTransactions()
    {
        Log::info('Fixing daily transactions');

        // Clear existing daily transactions
        DailyTransaction::truncate();

        // Get all billing transactions
        $billingTransactions = BillingTransaction::with(['patient', 'appointmentLinks.appointment'])->get();

        foreach ($billingTransactions as $transaction) {
            DailyTransaction::create([
                'transaction_date' => $transaction->transaction_date ?? now()->toDateString(),
                'transaction_type' => 'billing',
                'transaction_id' => $transaction->transaction_id,
                'patient_name' => $transaction->patient ? $transaction->patient->first_name . ' ' . $transaction->patient->last_name : 'Unknown',
                'specialist_name' => 'Unknown',
                'amount' => $transaction->total_amount,
                'payment_method' => $transaction->payment_method ?? 'Cash',
                'status' => $transaction->status,
                'description' => $transaction->description ?? 'Payment for appointment',
                'items_count' => $transaction->appointmentLinks->count(),
                'appointments_count' => $transaction->appointmentLinks->count(),
                'original_transaction_id' => $transaction->id,
                'original_table' => 'billing_transactions'
            ]);
        }

        Log::info('Daily transactions fixed', ['created_count' => $billingTransactions->count()]);
    }

    /**
     * Fix pending appointments
     */
    private function fixPendingAppointments()
    {
        Log::info('Fixing pending appointments');

        // Fix pending appointments without proper patient_id
        $pendingWithInvalidPatient = PendingAppointment::whereNull('patient_id')
            ->orWhere('patient_id', '')
            ->get();

        foreach ($pendingWithInvalidPatient as $pending) {
            // Try to find patient by name
            $patient = Patient::where('first_name', 'LIKE', '%' . explode(' ', $pending->patient_name)[0] . '%')
                ->where('last_name', 'LIKE', '%' . explode(' ', $pending->patient_name)[1] . '%')
                ->first();

            if ($patient) {
                $pending->update(['patient_id' => $patient->id]);
            }
        }

        // Fix pending appointments without proper status
        $pendingWithInvalidStatus = PendingAppointment::whereNull('status')
            ->orWhere('status', '')
            ->get();

        foreach ($pendingWithInvalidStatus as $pending) {
            $pending->update(['status' => 'Pending Approval']);
        }

        Log::info('Pending appointments fixed', ['fixed_count' => $pendingWithInvalidPatient->count()]);
    }

    /**
     * Sync all data relationships
     */
    private function syncAllDataRelationships()
    {
        Log::info('Syncing all data relationships');

        // Sync appointments with visits
        $appointmentsWithoutVisits = Appointment::whereDoesntHave('visit')->get();
        foreach ($appointmentsWithoutVisits as $appointment) {
            if ($appointment->status === 'Confirmed' || $appointment->status === 'Completed') {
                // Format the visit date properly - combine appointment date and time
                $appointmentDate = $appointment->appointment_date;
                $appointmentTime = $appointment->appointment_time;
                
                // Handle different date/time formats
                if (is_string($appointmentDate)) {
                    $appointmentDate = date('Y-m-d', strtotime($appointmentDate));
                } else {
                    $appointmentDate = $appointmentDate->format('Y-m-d');
                }
                
                if (is_string($appointmentTime)) {
                    $appointmentTime = date('H:i:s', strtotime($appointmentTime));
                } else {
                    $appointmentTime = $appointmentTime->format('H:i:s');
                }
                
                $visitDateTime = $appointmentDate . ' ' . $appointmentTime;
                
                Visit::create([
                    'appointment_id' => $appointment->id,
                    'patient_id' => $appointment->patient_id,
                    'purpose' => $appointment->appointment_type,
                    'visit_date_time' => $visitDateTime,
                    'visit_date_time_time' => $visitDateTime,
                    'status' => 'Ongoing',
                    'visit_code' => 'V' . str_pad(Visit::max('id') + 1, 4, '0', STR_PAD_LEFT)
                ]);
            }
        }

        Log::info('Data relationships synced', ['created_visits' => $appointmentsWithoutVisits->count()]);
    }

    /**
     * Calculate appointment price
     */
    private function calculateAppointmentPrice($appointmentType)
    {
        $prices = [
            'consultation' => 300,
            'general_consultation' => 300,
            'checkup' => 300,
            'fecalysis' => 500,
            'fecalysis_test' => 500,
            'cbc' => 500,
            'urinalysis' => 500,
            'urinarysis_test' => 500,
            'x-ray' => 700,
            'ultrasound' => 800,
        ];

        return $prices[$appointmentType] ?? 300;
    }
}
