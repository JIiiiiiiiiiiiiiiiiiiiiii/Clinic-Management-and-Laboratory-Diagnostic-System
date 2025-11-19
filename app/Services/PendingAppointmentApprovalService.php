<?php

namespace App\Services;

use App\Models\PendingAppointment;
use App\Models\Appointment;
use App\Models\Visit;
use App\Models\BillingTransaction;
use App\Models\AppointmentBillingLink;
use App\Models\Patient;
use App\Models\Specialist;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class PendingAppointmentApprovalService
{
    /**
     * Approve a pending appointment and create all necessary records
     * 
     * @param PendingAppointment $pendingAppointment
     * @param array $adminData
     * @return array
     */
    public function approvePendingAppointment(PendingAppointment $pendingAppointment, array $adminData = []): array
    {
        return DB::transaction(function () use ($pendingAppointment, $adminData) {
            try {
                Log::info('Starting pending appointment approval', [
                    'pending_appointment_id' => $pendingAppointment->id,
                    'patient_name' => $pendingAppointment->patient_name,
                    'appointment_type' => $pendingAppointment->appointment_type
                ]);

                // Step 1: Find or create patient
                $patient = $this->findOrCreatePatient($pendingAppointment);

                // Step 2: Create appointment record
                $appointment = $this->createAppointmentFromPending($pendingAppointment, $patient, $adminData);

                // Step 3: Create visit record
                $visit = $this->createVisitFromAppointment($appointment);

                // Step 4: Set billing status to pending for manual processing
                $appointment->update(['billing_status' => 'pending']);

                // Step 5: Skip auto-generating billing transaction - admin will handle this manually
                // $billingTransaction = $this->createBillingTransactionFromAppointment($appointment);
                // $billingLink = $this->createBillingLink($appointment, $billingTransaction);

                // Step 6: Delete the pending appointment since it's now approved
                $pendingAppointmentId = $pendingAppointment->id;
                $pendingAppointment->delete();

                // Step 7: Notify patient
                $this->notifyPatient($appointment, $adminData['admin_notes'] ?? null);

                Log::info('Pending appointment approved successfully', [
                    'pending_appointment_id' => $pendingAppointmentId,
                    'appointment_id' => $appointment->id,
                    'visit_id' => $visit->id,
                    'note' => 'Billing transaction will be created manually by admin'
                ]);

                return [
                    'success' => true,
                    'pending_appointment_id' => $pendingAppointmentId,
                    'appointment' => $appointment,
                    'visit' => $visit,
                    'note' => 'Billing transaction will be created manually by admin'
                ];

            } catch (\Exception $e) {
                Log::error('Failed to approve pending appointment', [
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString(),
                    'pending_appointment_id' => $pendingAppointment->id
                ]);
                throw $e;
            }
        });
    }

    /**
     * Find or create patient from pending appointment
     */
    private function findOrCreatePatient(PendingAppointment $pendingAppointment): Patient
    {
        // Try to find existing patient by ID first
        if ($pendingAppointment->patient_id && $pendingAppointment->patient_id !== 'TBD') {
            $patient = Patient::find((int)$pendingAppointment->patient_id);
            if ($patient) {
                return $patient;
            }
            
            // Try by patient_no
            $patient = Patient::where('patient_no', $pendingAppointment->patient_id)->first();
            if ($patient) {
                return $patient;
            }
        }

        // Create new patient from pending appointment data
        $nameParts = explode(' ', trim($pendingAppointment->patient_name));
        $firstName = $nameParts[0] ?? 'Unknown';
        $lastName = count($nameParts) > 1 ? implode(' ', array_slice($nameParts, 1)) : 'Unknown';
        
        $patientData = [
            'first_name' => $firstName,
            'last_name' => $lastName,
            'birthdate' => $pendingAppointment->birthdate ?? '1990-01-01',
            'age' => $pendingAppointment->age ?? 30,
            'sex' => $pendingAppointment->sex ?? 'male',
            'civil_status' => $pendingAppointment->civil_status ?? 'single',
            'nationality' => $pendingAppointment->nationality ?? 'Filipino',
            'address' => $pendingAppointment->address ?? 'Not specified',
            'present_address' => $pendingAppointment->present_address ?? 'Not specified',
            'mobile_no' => $pendingAppointment->contact_number ?? 'Not specified',
            'emergency_name' => $pendingAppointment->emergency_name ?? 'Not specified',
            'emergency_relation' => $pendingAppointment->emergency_relation ?? 'Self',
            'attending_physician' => $pendingAppointment->attending_physician ?? 'To be assigned',
            'arrival_date' => $pendingAppointment->arrival_date ?? now()->toDateString(),
            'arrival_time' => $pendingAppointment->arrival_time ?? now()->format('H:i:s'),
            'time_seen' => $pendingAppointment->time_seen ?? now()->format('H:i:s'),
        ];

        // Generate patient number
        $maxId = Patient::max('id');
        $nextId = $maxId ? $maxId + 1 : 1;
        $patientData['patient_no'] = 'P' . str_pad($nextId, 4, '0', STR_PAD_LEFT);
        
        // Generate patient_code if not provided
        if (!isset($patientData['patient_code']) || empty($patientData['patient_code'])) {
            $patientData['patient_code'] = 'P' . str_pad($nextId, 3, '0', STR_PAD_LEFT);
        }

        $patient = Patient::create($patientData);
        
        Log::info('Patient created during approval', [
            'patient_id' => $patient->id,
            'patient_no' => $patient->patient_no,
            'pending_appointment_id' => $pendingAppointment->id
        ]);

        return $patient;
    }

    /**
     * Create appointment from pending appointment
     */
    private function createAppointmentFromPending(PendingAppointment $pendingAppointment, Patient $patient, array $adminData): Appointment
    {
        // Map appointment_source to source (appointments table uses 'source', not 'appointment_source')
        $source = 'Online'; // Default
        if ($pendingAppointment->appointment_source) {
            // Map pending appointment_source values to appointments source enum values
            $appointmentSource = strtolower($pendingAppointment->appointment_source);
            if ($appointmentSource === 'online' || $appointmentSource === 'Online') {
                $source = 'Online';
            } elseif ($appointmentSource === 'walk_in' || $appointmentSource === 'walk-in' || $appointmentSource === 'Walk-in') {
                $source = 'Walk-in';
            }
        } elseif ($pendingAppointment->source) {
            // Use source field if available
            $source = $pendingAppointment->source === 'Online' ? 'Online' : 'Walk-in';
        }
        
        // Generate appointment_code before creation
        // Get the next appointment ID to generate the code
        $lastAppointment = Appointment::orderBy('id', 'desc')->first();
        $nextId = $lastAppointment ? $lastAppointment->id + 1 : 1;
        $appointmentCode = 'A' . str_pad($nextId, 4, '0', STR_PAD_LEFT);
        
        $appointmentData = [
            'appointment_code' => $appointmentCode, // Required field - generate before creation
            'patient_id' => $patient->id,
            'specialist_id' => $pendingAppointment->specialist_id ? (int) $pendingAppointment->specialist_id : null,
            'appointment_type' => $pendingAppointment->appointment_type,
            'specialist_type' => $pendingAppointment->specialist_type,
            'appointment_date' => $pendingAppointment->appointment_date,
            'appointment_time' => $pendingAppointment->appointment_time,
            'duration' => $pendingAppointment->duration,
            'price' => null, // Will be calculated after creation
            'additional_info' => $pendingAppointment->notes ?? $pendingAppointment->special_requirements ?? null,
            'source' => $source, // Use 'source' field, not 'appointment_source'
            'status' => 'Confirmed',
            // Note: appointment_source and booking_method columns were removed from appointments table
            // They only exist in pending_appointments table
        ];

        $appointment = Appointment::create($appointmentData);
        
        // Calculate and set price using the Appointment model's calculatePrice method
        $calculatedPrice = $appointment->calculatePrice();
        $appointment->update([
            'price' => $calculatedPrice,
            'final_total_amount' => $calculatedPrice, // Set final_total_amount to the same as price when no lab tests
            'total_lab_amount' => 0 // No lab tests initially
        ]);
        
        Log::info('Appointment created from pending', [
            'appointment_id' => $appointment->id,
            'patient_id' => $patient->id,
            'pending_appointment_id' => $pendingAppointment->id,
            'appointment_type' => $appointment->appointment_type,
            'calculated_price' => $calculatedPrice,
            'final_price' => $appointment->fresh()->price
        ]);

        return $appointment;
    }

    /**
     * Create visit from appointment
     */
    private function createVisitFromAppointment(Appointment $appointment): Visit
    {
        // Load the appointment's specialist relationship
        $appointment->load('specialist');
        
        $staffId = null;
        
        // Try to find a user that matches the specialist
        if ($appointment->specialist) {
            $specialist = $appointment->specialist;
            
            // Normalize specialist name: remove titles, suffixes, and extra spaces
            $normalizeName = function($name) {
                // Remove common titles and suffixes (case insensitive)
                $name = preg_replace('/\b(MD\.?|Dr\.?|Doctor|Mr\.?|Mrs\.?|Ms\.?)\b\.?/i', '', $name);
                // Remove extra spaces and trim
                $name = preg_replace('/\s+/', ' ', trim($name));
                return $name;
            };
            
            $normalizedSpecialistName = $normalizeName($specialist->name);
            
            // Extract first and last name parts for better matching
            $nameParts = array_filter(explode(' ', $normalizedSpecialistName)); // Filter empty parts
            $firstName = $nameParts[0] ?? '';
            $lastName = end($nameParts) ?? '';
            
            Log::info('Mapping specialist to user', [
                'specialist_id' => $specialist->specialist_id,
                'specialist_name' => $specialist->name,
                'normalized_name' => $normalizedSpecialistName,
                'first_name' => $firstName,
                'last_name' => $lastName,
                'specialist_role' => $specialist->role
            ]);
            
            // Strategy 1: Exact match (normalized) - normalize user names too
            $allUsers = User::all();
            $user = null;
            foreach ($allUsers as $u) {
                $normalizedUserName = $normalizeName($u->name);
                if (strcasecmp($normalizedUserName, $normalizedSpecialistName) === 0) {
                    $user = $u;
                    break;
                }
            }
            
            // Strategy 2: Match by first and last name (both must match)
            if (!$user && $firstName && $lastName) {
                $allUsers = User::all();
                foreach ($allUsers as $u) {
                    $normalizedUserName = $normalizeName($u->name);
                    $userNameParts = array_filter(explode(' ', $normalizedUserName));
                    $userFirstName = $userNameParts[0] ?? '';
                    $userLastName = end($userNameParts) ?? '';
                    
                    if (strcasecmp($firstName, $userFirstName) === 0 && strcasecmp($lastName, $userLastName) === 0) {
                        $user = $u;
                        break;
                    }
                }
            }
            
            // Strategy 3: Match by last name only (more flexible)
            if (!$user && $lastName) {
                $allUsers = User::all();
                foreach ($allUsers as $u) {
                    $normalizedUserName = $normalizeName($u->name);
                    $userNameParts = array_filter(explode(' ', $normalizedUserName));
                    $userLastName = end($userNameParts) ?? '';
                    
                    if (strcasecmp($lastName, $userLastName) === 0) {
                        $user = $u;
                        break;
                    }
                }
            }
            
            // Strategy 4: Match by role and last name (most specific fallback)
            if (!$user) {
                $roleMapping = [
                    'Doctor' => 'doctor',
                    'Nurse' => 'nurse',
                    'MedTech' => 'medtech',
                ];
                
                $userRole = $roleMapping[$specialist->role] ?? null;
                
                if ($userRole && $lastName) {
                    $usersWithRole = User::where('role', $userRole)->get();
                    foreach ($usersWithRole as $u) {
                        $normalizedUserName = $normalizeName($u->name);
                        $userNameParts = array_filter(explode(' ', $normalizedUserName));
                        $userLastName = end($userNameParts) ?? '';
                        
                        if (strcasecmp($lastName, $userLastName) === 0) {
                            $user = $u;
                            break;
                        }
                    }
                }
            }
            
            if ($user) {
                $staffId = $user->id;
                Log::info('Successfully mapped specialist to user', [
                    'specialist_name' => $specialist->name,
                    'user_id' => $user->id,
                    'user_name' => $user->name,
                    'user_role' => $user->role
                ]);
            } else {
                Log::warning('Could not find matching user for specialist', [
                    'specialist_id' => $specialist->specialist_id,
                    'specialist_name' => $specialist->name,
                    'specialist_role' => $specialist->role
                ]);
            }
        }
        
        // If still no staff ID, try to find by specialist_type from appointment (only if we have a specialist name to match)
        if (!$staffId && $appointment->specialist_type && $appointment->specialist) {
            $roleMapping = [
                'doctor' => 'doctor',
                'Doctor' => 'doctor',
                'medtech' => 'medtech',
                'MedTech' => 'medtech',
                'nurse' => 'nurse',
                'Nurse' => 'nurse',
            ];
            
            $userRole = $roleMapping[$appointment->specialist_type] ?? null;
            if ($userRole && $appointment->specialist) {
                // Try to match by specialist name parts with role
                $specialist = $appointment->specialist;
                $normalizeName = function($name) {
                    $name = preg_replace('/\b(MD\.?|Dr\.?|Doctor|Mr\.?|Mrs\.?|Ms\.?)\b\.?/i', '', $name);
                    $name = preg_replace('/\s+/', ' ', trim($name));
                    return $name;
                };
                
                $normalizedSpecialistName = $normalizeName($specialist->name);
                $nameParts = array_filter(explode(' ', $normalizedSpecialistName));
                $lastName = end($nameParts) ?? '';
                
                if ($lastName) {
                    $usersWithRole = User::where('role', $userRole)->get();
                    foreach ($usersWithRole as $u) {
                        $normalizedUserName = $normalizeName($u->name);
                        $userNameParts = array_filter(explode(' ', $normalizedUserName));
                        $userLastName = end($userNameParts) ?? '';
                        
                        if (strcasecmp($lastName, $userLastName) === 0) {
                            $staffId = $u->id;
                            Log::info('Matched specialist to user by role and last name', [
                                'specialist_name' => $specialist->name,
                                'user_id' => $u->id,
                                'user_name' => $u->name
                            ]);
                            break;
                        }
                    }
                }
            }
        }
        
        // Final fallback to current user or admin (only if we couldn't find a match)
        // This ensures we always have an attending staff, but logs a warning
        if (!$staffId) {
            Log::warning('No matching user found for appointment specialist, using fallback', [
                'appointment_id' => $appointment->id,
                'specialist_id' => $appointment->specialist_id,
                'specialist_name' => $appointment->specialist ? $appointment->specialist->name : null
            ]);
            
            $staffId = auth()->id();
            if (!$staffId) {
                $adminUser = User::where('role', 'admin')->first();
                $staffId = $adminUser ? $adminUser->id : 1;
            }
        }

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
        
        // Generate visit_code before creation
        $lastVisit = Visit::orderBy('id', 'desc')->first();
        $nextVisitId = $lastVisit ? $lastVisit->id + 1 : 1;
        $visitCode = 'V' . str_pad($nextVisitId, 4, '0', STR_PAD_LEFT);
        
        $visitData = [
            'appointment_id' => $appointment->id,
            'patient_id' => $appointment->patient_id,
            'visit_date_time_time' => $visitDateTime, // Only this column exists in the database
            'purpose' => $appointment->appointment_type,
            'status' => 'scheduled',
            'attending_staff_id' => $staffId,
            'visit_code' => $visitCode, // Required field - generate before creation
        ];

        $visit = Visit::create($visitData);
        
        Log::info('Visit created from appointment', [
            'visit_id' => $visit->id,
            'visit_code' => $visit->visit_code,
            'appointment_id' => $appointment->id,
            'appointment_code' => $appointment->appointment_code,
            'patient_id' => $appointment->patient_id,
            'attending_staff_id' => $staffId,
            'specialist_id' => $appointment->specialist_id,
            'specialist_name' => $appointment->specialist ? $appointment->specialist->name : null,
            'specialist_type' => $appointment->specialist_type,
            'purpose' => $appointment->appointment_type,
            'visit_date_time_time' => $visitDateTime,
            'status' => 'scheduled'
        ]);

        return $visit;
    }

    /**
     * Create billing transaction from appointment
     */
    private function createBillingTransactionFromAppointment(Appointment $appointment): BillingTransaction
    {
        // Get doctor ID based on specialist type
        $doctorId = null;
        if ($appointment->specialist_type === 'doctor') {
            $doctorId = $appointment->specialist_id;
        }

        $transactionData = [
            'appointment_id' => $appointment->id,
            'patient_id' => $appointment->patient_id,
            'doctor_id' => $doctorId,
            'total_amount' => $appointment->price,
            'amount' => $appointment->price,
            'status' => 'pending',
            'transaction_date' => now(),
            'created_by' => auth()->id() ?? 1,
            'payment_type' => 'cash',
            'payment_method' => 'cash',
            'transaction_id' => 'TXN-' . str_pad(BillingTransaction::max('id') + 1, 6, '0', STR_PAD_LEFT),
        ];

        $billingTransaction = BillingTransaction::create($transactionData);
        
        Log::info('Billing transaction created from appointment', [
            'billing_transaction_id' => $billingTransaction->id,
            'appointment_id' => $appointment->id,
            'patient_id' => $appointment->patient_id,
            'amount' => $appointment->price
        ]);

        return $billingTransaction;
    }

    /**
     * Create billing link between appointment and transaction
     */
    private function createBillingLink(Appointment $appointment, BillingTransaction $billingTransaction): AppointmentBillingLink
    {
        $billingLink = AppointmentBillingLink::create([
            'appointment_id' => $appointment->id,
            'billing_transaction_id' => $billingTransaction->id,
            'appointment_type' => $appointment->appointment_type,
            'appointment_price' => $appointment->price,
            'status' => 'pending',
        ]);

        Log::info('Billing link created', [
            'billing_link_id' => $billingLink->id,
            'appointment_id' => $appointment->id,
            'billing_transaction_id' => $billingTransaction->id
        ]);

        return $billingLink;
    }

    /**
     * Notify patient about approval
     */
    private function notifyPatient(Appointment $appointment, ?string $adminNotes = null): void
    {
        try {
            $patient = Patient::find($appointment->patient_id);
            if (!$patient || !$patient->user_id) {
                Log::warning('Patient or user not found for notification', [
                    'appointment_id' => $appointment->id,
                    'patient_id' => $appointment->patient_id
                ]);
                return;
            }

            $user = User::find($patient->user_id);
            if (!$user) {
                Log::warning('User not found for notification', [
                    'patient_id' => $patient->id,
                    'user_id' => $patient->user_id
                ]);
                return;
            }

            $message = "Your appointment for {$appointment->appointment_type} on {$appointment->appointment_date} at {$appointment->appointment_time} has been approved and confirmed.";
            if ($adminNotes) {
                $message .= " Admin notes: {$adminNotes}";
            }

            $notification = Notification::create([
                'type' => 'appointment',
                'title' => 'Appointment Approved',
                'message' => $message,
                'data' => [
                    'appointment_id' => $appointment->id,
                    'status' => 'Confirmed',
                    'appointment_date' => $appointment->appointment_date,
                    'appointment_time' => $appointment->appointment_time,
                    'admin_notes' => $adminNotes,
                ],
                'user_id' => $user->id,
                'related_id' => $appointment->id,
                'related_type' => 'Appointment',
            ]);

            Log::info('Patient notification sent', [
                'notification_id' => $notification->id,
                'user_id' => $user->id,
                'appointment_id' => $appointment->id
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to notify patient', [
                'error' => $e->getMessage(),
                'appointment_id' => $appointment->id
            ]);
        }
    }
}
