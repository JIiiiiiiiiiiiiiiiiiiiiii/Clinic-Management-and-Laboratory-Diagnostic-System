<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class Appointment extends Model
{
    use HasFactory;
    
    protected $primaryKey = "id";

    protected $fillable = [
        "appointment_code",
        "sequence_number",
        "patient_id",
        "appointment_type",
        "price",
        "total_lab_amount",
        "final_total_amount",
        "specialist_type",
        "specialist_id",
        "appointment_date",
        "appointment_time",
        "duration",
        "status",
        // Note: appointment_source and booking_method were removed from appointments table
        // They are kept here for backward compatibility but should not be used in create/update
        // "appointment_source", // Column removed - use 'source' instead
        // "booking_method", // Column removed
        "billing_status",
        "billing_reference",
        "confirmation_sent",
        "admin_notes",
        "additional_info",
        "source", // Use this instead of appointment_source
        "patient_id_fk",
        "unique_appointment_key",
        "created_by",
    ];

    protected $casts = [
        "appointment_date" => "date",
        "appointment_time" => "datetime:H:i:s",
        "price" => "decimal:2",
        "total_lab_amount" => "decimal:2",
        "final_total_amount" => "decimal:2",
    ];


    // Relationships
    public function patient()
    {
        // Patient model uses 'id' as primary key
        // But foreign key might point to 'patient_id' column if it exists
        // Try 'id' first (standard Laravel primary key)
        return $this->belongsTo(Patient::class, "patient_id", "id");
    }

    public function specialist()
    {
        // Specialist model uses 'specialist_id' as primary key
        return $this->belongsTo(Specialist::class, "specialist_id", "specialist_id");
    }
    
    /**
     * Get patient with fallback strategies
     * This method tries multiple approaches to find the patient
     */
    public function getPatientWithFallback()
    {
        // Check both patient_id and patient_id_fk columns
        $patientIdToSearch = $this->patient_id ?? $this->patient_id_fk ?? null;
        
        // If no patient_id found, try to extract from unique_appointment_key
        // Format: APT-{patient_id}-{specialist_id}-{date}-{time}
        // Note: patient_id can be empty (double dash: APT--1-...)
        if (!$patientIdToSearch && $this->unique_appointment_key) {
            $parts = explode('-', $this->unique_appointment_key);
            if (count($parts) >= 2 && $parts[0] === 'APT') {
                // Skip 'APT', get patient_id (index 1)
                // Handle empty patient_id (double dash) - parts[1] will be empty string
                $extractedPatientId = $parts[1] ?? null;
                
                // Check if it's a valid numeric patient_id (not empty string)
                if ($extractedPatientId !== null && $extractedPatientId !== '' && is_numeric($extractedPatientId)) {
                    $patientIdToSearch = (int) $extractedPatientId;
                    \Log::info('Appointment::getPatientWithFallback - Extracted patient_id from unique_appointment_key', [
                        'appointment_id' => $this->id,
                        'unique_appointment_key' => $this->unique_appointment_key,
                        'extracted_patient_id' => $patientIdToSearch,
                    ]);
                } else {
                    \Log::info('Appointment::getPatientWithFallback - Patient_id is empty in unique_appointment_key', [
                        'appointment_id' => $this->id,
                        'unique_appointment_key' => $this->unique_appointment_key,
                        'parts' => $parts,
                    ]);
                }
            }
        }
        
        if (!$patientIdToSearch) {
            \Log::warning('Appointment::getPatientWithFallback - No patient_id or patient_id_fk', [
                'appointment_id' => $this->id,
                'patient_id' => $this->patient_id,
                'patient_id_fk' => $this->patient_id_fk,
                'unique_appointment_key' => $this->unique_appointment_key,
            ]);
            return null;
        }
        
        \Log::info('Appointment::getPatientWithFallback - Starting search', [
            'appointment_id' => $this->id,
            'appointment_patient_id' => $this->patient_id,
            'appointment_patient_id_fk' => $this->patient_id_fk,
            'using_id' => $patientIdToSearch,
        ]);
        
        // Try relationship first (if loaded)
        if ($this->relationLoaded('patient')) {
            if ($this->patient) {
                \Log::info('Appointment::getPatientWithFallback - Found via relationship', [
                    'patient_id' => $this->patient->id ?? 'unknown',
                ]);
                return $this->patient;
            } else {
                \Log::warning('Appointment::getPatientWithFallback - Relationship loaded but patient is null', [
                    'appointment_patient_id' => $this->patient_id,
                ]);
            }
        }
        
        // Strategy 1: Try with 'id' (Patient model primary key - most common case)
        try {
            $patient = \App\Models\Patient::where('id', $patientIdToSearch)->first();
            if ($patient) {
                \Log::info('Appointment::getPatientWithFallback - Found via id query', [
                    'patient_id' => $patient->id,
                    'searched_id' => $patientIdToSearch,
                ]);
                return $patient;
            }
        } catch (\Exception $e) {
            \Log::warning('Appointment::getPatientWithFallback - Failed id query', [
                'error' => $e->getMessage(),
            ]);
        }
        
        // Strategy 2: Try with 'patient_id' column if it exists (foreign key might point to this)
        try {
            if (\Illuminate\Support\Facades\Schema::hasColumn('patients', 'patient_id')) {
                $patient = \App\Models\Patient::where('patient_id', $patientIdToSearch)->first();
                if ($patient) {
                    \Log::info('Appointment::getPatientWithFallback - Found via patient_id column', [
                        'patient_id' => $patient->patient_id ?? $patient->id,
                        'searched_id' => $patientIdToSearch,
                    ]);
                    return $patient;
                }
            }
        } catch (\Exception $e) {
            \Log::warning('Appointment::getPatientWithFallback - Failed patient_id query', [
                'error' => $e->getMessage(),
            ]);
        }
        
        // Strategy 3: Try raw query to check what actually exists
        try {
            $rawPatient = DB::table('patients')
                ->where('id', $patientIdToSearch)
                ->first();
            
            if ($rawPatient) {
                \Log::info('Appointment::getPatientWithFallback - Found via raw query (id)', [
                    'patient_id' => $rawPatient->id ?? 'unknown',
                    'searched_id' => $patientIdToSearch,
                ]);
                // Convert to Eloquent model
                return \App\Models\Patient::find($rawPatient->id ?? $patientIdToSearch);
            }
            
            // Try patient_id column if it exists
            if (\Illuminate\Support\Facades\Schema::hasColumn('patients', 'patient_id')) {
                $rawPatient = DB::table('patients')
                    ->where('patient_id', $patientIdToSearch)
                    ->first();
                
                if ($rawPatient) {
                    \Log::info('Appointment::getPatientWithFallback - Found via raw query (patient_id)', [
                        'patient_id' => $rawPatient->patient_id ?? 'unknown',
                        'searched_id' => $patientIdToSearch,
                    ]);
                    // Try to get the actual id to load the model
                    $actualId = $rawPatient->id ?? $rawPatient->patient_id ?? null;
                    if ($actualId) {
                        return \App\Models\Patient::find($actualId);
                    }
                }
            }
        } catch (\Exception $e) {
            \Log::warning('Appointment::getPatientWithFallback - Failed raw query', [
                'error' => $e->getMessage(),
            ]);
        }
        
        \Log::warning('Appointment::getPatientWithFallback - Patient not found after all strategies', [
            'appointment_id' => $this->id,
            'appointment_patient_id' => $this->patient_id,
            'appointment_patient_id_fk' => $this->patient_id_fk,
            'searched_id' => $patientIdToSearch,
        ]);
        
        return null;
    }
    
    /**
     * Get specialist with fallback strategies
     */
    public function getSpecialistWithFallback()
    {
        // Check both specialist_id and specialist_id_fk columns
        $specialistIdToSearch = $this->specialist_id ?? $this->specialist_id_fk ?? null;
        
        // If no specialist_id found, try to extract from unique_appointment_key
        // Format: APT-{patient_id}-{specialist_id}-{date}-{time}
        // Note: patient_id can be empty (double dash: APT--1-...), so specialist_id is at index 2
        if (!$specialistIdToSearch && $this->unique_appointment_key) {
            $parts = explode('-', $this->unique_appointment_key);
            if (count($parts) >= 3 && $parts[0] === 'APT') {
                // Skip 'APT' and patient_id (which might be empty), get specialist_id (index 2)
                $extractedSpecialistId = $parts[2] ?? null;
                
                // Check if it's a valid numeric specialist_id
                if ($extractedSpecialistId !== null && $extractedSpecialistId !== '' && is_numeric($extractedSpecialistId)) {
                    $specialistIdToSearch = (int) $extractedSpecialistId;
                    \Log::info('Appointment::getSpecialistWithFallback - Extracted specialist_id from unique_appointment_key', [
                        'appointment_id' => $this->id,
                        'unique_appointment_key' => $this->unique_appointment_key,
                        'extracted_specialist_id' => $specialistIdToSearch,
                    ]);
                } else {
                    \Log::info('Appointment::getSpecialistWithFallback - Specialist_id is empty or invalid in unique_appointment_key', [
                        'appointment_id' => $this->id,
                        'unique_appointment_key' => $this->unique_appointment_key,
                        'parts' => $parts,
                        'extracted_specialist_id' => $extractedSpecialistId,
                    ]);
                }
            }
        }
        
        if (!$specialistIdToSearch) {
            \Log::warning('Appointment::getSpecialistWithFallback - No specialist_id or specialist_id_fk', [
                'appointment_id' => $this->id,
                'specialist_id' => $this->specialist_id,
                'specialist_id_fk' => $this->specialist_id_fk,
                'unique_appointment_key' => $this->unique_appointment_key,
            ]);
            return null;
        }
        
        \Log::info('Appointment::getSpecialistWithFallback - Starting search', [
            'appointment_id' => $this->id,
            'appointment_specialist_id' => $this->specialist_id,
            'appointment_specialist_id_fk' => $this->specialist_id_fk,
            'using_id' => $specialistIdToSearch,
        ]);
        
        // Try relationship first (if loaded)
        if ($this->relationLoaded('specialist')) {
            if ($this->specialist) {
                \Log::info('Appointment::getSpecialistWithFallback - Found via relationship', [
                    'specialist_id' => $this->specialist->specialist_id,
                ]);
                return $this->specialist;
            } else {
                \Log::warning('Appointment::getSpecialistWithFallback - Relationship loaded but specialist is null', [
                    'appointment_specialist_id' => $this->specialist_id,
                ]);
            }
        }
        
        // Strategy 1: Use find() which automatically uses the primary key (specialist_id)
        try {
            $specialist = \App\Models\Specialist::find($specialistIdToSearch);
            if ($specialist) {
                \Log::info('Appointment::getSpecialistWithFallback - Found via find()', [
                    'specialist_id' => $specialist->specialist_id,
                    'searched_id' => $specialistIdToSearch,
                ]);
                return $specialist;
            }
        } catch (\Exception $e) {
            \Log::warning('Appointment::getSpecialistWithFallback - Failed find()', [
                'error' => $e->getMessage(),
            ]);
        }
        
        // Strategy 2: Try where() with specialist_id
        try {
            $specialist = \App\Models\Specialist::where('specialist_id', $specialistIdToSearch)->first();
            if ($specialist) {
                \Log::info('Appointment::getSpecialistWithFallback - Found via where()', [
                    'specialist_id' => $specialist->specialist_id,
                    'searched_id' => $specialistIdToSearch,
                ]);
                return $specialist;
            }
        } catch (\Exception $e) {
            \Log::warning('Appointment::getSpecialistWithFallback - Failed where()', [
                'error' => $e->getMessage(),
            ]);
        }
        
        // Strategy 3: Try raw query
        try {
            $rawSpecialist = DB::table('specialists')
                ->where('specialist_id', $specialistIdToSearch)
                ->first();
            
            if ($rawSpecialist) {
                \Log::info('Appointment::getSpecialistWithFallback - Found via raw query', [
                    'specialist_id' => $rawSpecialist->specialist_id ?? 'unknown',
                    'searched_id' => $specialistIdToSearch,
                ]);
                // Convert to Eloquent model
                return \App\Models\Specialist::find($rawSpecialist->specialist_id ?? $specialistIdToSearch);
            }
        } catch (\Exception $e) {
            \Log::warning('Appointment::getSpecialistWithFallback - Failed raw query', [
                'error' => $e->getMessage(),
            ]);
        }
        
        \Log::warning('Appointment::getSpecialistWithFallback - Specialist not found after all strategies', [
            'appointment_id' => $this->id,
            'appointment_specialist_id' => $this->specialist_id,
            'appointment_specialist_id_fk' => $this->specialist_id_fk,
            'searched_id' => $specialistIdToSearch,
        ]);
        
        return null;
    }

    public function visit()
    {
        return $this->hasOne(Visit::class, "appointment_id", "id");
    }

    public function visits()
    {
        return $this->hasMany(Visit::class, "appointment_id", "id");
    }

    public function billingLinks()
    {
        return $this->hasMany(AppointmentBillingLink::class, "appointment_id", "id");
    }

    public function labTests()
    {
        return $this->hasMany(AppointmentLabTest::class);
    }

    public function labOrders()
    {
        return $this->hasManyThrough(LabOrder::class, AppointmentLabOrder::class, 'appointment_id', 'id', 'id', 'lab_order_id');
    }

    public function billingTransactions()
    {
        return $this->hasManyThrough(
            BillingTransaction::class,
            AppointmentBillingLink::class,
            'appointment_id',
            'id',
            'id',
            'billing_transaction_id'
        );
    }

    // Scopes
    public function scopePendingBilling($query)
    {
        return $query->where("billing_status", "pending");
    }

    public function scopeConfirmed($query)
    {
        return $query->where("status", "Confirmed");
    }

    public function scopeByDate($query, $date)
    {
        return $query->whereDate("appointment_date", $date);
    }

    public function scopeBySpecialist($query, $specialistId)
    {
        return $query->where("specialist_id", $specialistId);
    }

    // Methods
    public function calculatePrice()
    {
        return match($this->appointment_type) {
            'consultation' => 350.00,
            'general_consultation' => 350.00, // Keep for backward compatibility
            'checkup' => 300.00,
            'fecalysis' => 90.00,
            'fecalysis_test' => 90.00,
            'cbc' => 245.00,
            'urinalysis' => 140.00,
            'urinarysis_test' => 140.00, // Keep for backward compatibility
            'x-ray' => 700.00,
            'ultrasound' => 800.00,
            'follow-up' => 280.00, // 20% discount for follow-up
            'check-up' => 420.00, // 20% premium for check-up
            'emergency' => 525.00, // 50% premium for emergency
            default => 300.00,
        };
    }

    public function generateUniqueKey()
    {
        // For manual transactions, include microtime and uniqid to make them unique
        // This allows multiple manual transactions for the same patient/specialist/date/time
        // Transactions should allow duplicates since a patient can visit multiple times
        if ($this->appointment_type === 'manual_transaction') {
            // Use microtime(true) for high precision timestamp, and uniqid() for additional uniqueness
            // This ensures even transactions created in the same second are unique
            $uniqueId = $this->id ? $this->id : (microtime(true) * 10000) . '-' . uniqid('', true);
            
            // Handle date/time formatting safely
            $dateStr = $this->appointment_date instanceof \Carbon\Carbon 
                ? $this->appointment_date->format("Y-m-d") 
                : (is_string($this->appointment_date) ? $this->appointment_date : date('Y-m-d'));
            
            $timeStr = $this->appointment_time instanceof \Carbon\Carbon 
                ? $this->appointment_time->format("H-i-s") 
                : (is_string($this->appointment_time) ? str_replace(':', '-', substr($this->appointment_time, 0, 8)) : date('H-i-s'));
            
            return "APT-MANUAL-" . $this->patient_id . "-" . ($this->specialist_id ?? 'NULL') . "-" . $dateStr . "-" . $timeStr . "-" . $uniqueId;
        }
        
        // For regular appointments, use the standard format
        $dateStr = $this->appointment_date instanceof \Carbon\Carbon 
            ? $this->appointment_date->format("Y-m-d") 
            : (is_string($this->appointment_date) ? $this->appointment_date : date('Y-m-d'));
        
        $timeStr = $this->appointment_time instanceof \Carbon\Carbon 
            ? $this->appointment_time->format("H-i-s") 
            : (is_string($this->appointment_time) ? str_replace(':', '-', substr($this->appointment_time, 0, 8)) : date('H-i-s'));
        
        return "APT-" . $this->patient_id . "-" . $this->specialist_id . "-" . $dateStr . "-" . $timeStr;
    }

    public function checkForDuplicates()
    {
        // Skip duplicate checking for manual transactions (they're not real appointments)
        // Transactions should allow duplicates since a patient can visit multiple times
        if ($this->appointment_type === 'manual_transaction') {
            \Log::info('Skipping duplicate check for manual_transaction', [
                'appointment_id' => $this->id,
                'appointment_type' => $this->appointment_type,
                'patient_id' => $this->patient_id,
            ]);
            return null;
        }
        
        $uniqueKey = $this->generateUniqueKey();
        
        \Log::info('Checking for duplicates', [
            'appointment_id' => $this->id,
            'appointment_type' => $this->appointment_type,
            'unique_key' => $uniqueKey,
            'patient_id' => $this->patient_id,
            'specialist_id' => $this->specialist_id,
        ]);
        
        $duplicate = Appointment::where("unique_appointment_key", $uniqueKey)
            ->where("id", "!=", $this->id ?? 0)
            ->where("status", "!=", "Cancelled")
            ->where("appointment_type", "!=", "manual_transaction") // Exclude manual transactions from duplicate check
            ->first();
        
        if ($duplicate) {
            \Log::warning('Duplicate appointment found', [
                'current_appointment_id' => $this->id,
                'duplicate_appointment_id' => $duplicate->id,
                'unique_key' => $uniqueKey,
            ]);
        }
            
        return $duplicate;
    }

    public function isDuplicate()
    {
        // Skip duplicate checking for manual transactions (they're not real appointments)
        if ($this->appointment_type === 'manual_transaction') {
            return false;
        }
        
        return $this->checkForDuplicates() !== null;
    }

    // Accessors
    public function getStatusColorAttribute()
    {
        return match($this->status) {
            'Pending' => 'yellow',
            'Confirmed' => 'green',
            'Completed' => 'blue',
            'Cancelled' => 'red',
            'No Show' => 'gray',
            default => 'gray'
        };
    }

    public function getFormattedPriceAttribute()
    {
        return '₱' . number_format($this->price ?? 0, 2);
    }

    public function getBillingStatusAttribute()
    {
        return $this->billing_status ?? 'pending';
    }

    /**
     * Boot the model with date validation and unique key generation
     */
    protected static function boot()
    {
        parent::boot();

        // Validate dates before saving
        static::saving(function ($appointment) {
            // Validate appointment_date
            if ($appointment->appointment_date) {
                $date = \Carbon\Carbon::parse($appointment->appointment_date);
                if (!$date || $date->year < 1900 || $date->year > 2100) {
                    throw new \InvalidArgumentException('Invalid appointment date. Date must be between 1900 and 2100.');
                }
            }

            // Validate appointment_time
            if ($appointment->appointment_time) {
                $time = \Carbon\Carbon::parse($appointment->appointment_time);
                if (!$time) {
                    throw new \InvalidArgumentException('Invalid appointment time format.');
                }
            }

            return true;
        });

        // Generate unique key and check for duplicates
        static::creating(function ($appointment) {
            \Log::info('Appointment creating event fired', [
                'appointment_type' => $appointment->appointment_type,
                'patient_id' => $appointment->patient_id,
                'specialist_id' => $appointment->specialist_id,
                'appointment_date' => $appointment->appointment_date,
                'appointment_time' => $appointment->appointment_time,
            ]);
            
            // CRITICAL: Skip ALL duplicate checking for manual transactions
            // Transactions should allow duplicates since a patient can visit multiple times
            if ($appointment->appointment_type === 'manual_transaction') {
                \Log::info('Skipping duplicate check for manual_transaction in creating event');
                // Generate unique key but skip duplicate check entirely
                if (empty($appointment->unique_appointment_key)) {
                    $appointment->unique_appointment_key = $appointment->generateUniqueKey();
                }
                \Log::info('Manual transaction unique key generated', [
                    'unique_key' => $appointment->unique_appointment_key,
                ]);
                return; // Early return - no duplicate check for manual transactions
            }
            
            // For regular appointments, generate key and check for duplicates
            if (empty($appointment->unique_appointment_key)) {
                $appointment->unique_appointment_key = $appointment->generateUniqueKey();
            }
            
            // Only check for duplicates for non-manual-transaction appointments
            if ($appointment->isDuplicate()) {
                \Log::error('Duplicate appointment detected in creating event', [
                    'appointment_type' => $appointment->appointment_type,
                    'patient_id' => $appointment->patient_id,
                    'unique_key' => $appointment->unique_appointment_key,
                ]);
                throw new \Exception("Duplicate appointment detected. An appointment already exists for this patient, specialist, date, and time.");
            }
        });

        static::updating(function ($appointment) {
            // CRITICAL: Skip ALL duplicate checking for manual transactions
            // Transactions should allow duplicates since a patient can visit multiple times
            // Check both original and new appointment_type to handle cases where it might be changed
            $originalType = $appointment->getOriginal('appointment_type');
            $newType = $appointment->appointment_type;
            
            \Log::info('Appointment updating event fired', [
                'appointment_id' => $appointment->id,
                'original_type' => $originalType,
                'new_type' => $newType,
                'dirty_fields' => $appointment->getDirty(),
            ]);
            
            if ($originalType === 'manual_transaction' || $newType === 'manual_transaction') {
                \Log::info('Skipping duplicate check for manual_transaction in updating event', [
                    'appointment_id' => $appointment->id,
                    'original_type' => $originalType,
                    'new_type' => $newType,
                ]);
                // For manual transactions, only update unique key if needed, but skip duplicate check entirely
                if ($appointment->isDirty(["patient_id", "specialist_id", "appointment_date", "appointment_time"])) {
                    $appointment->unique_appointment_key = $appointment->generateUniqueKey();
                    \Log::info('Updated unique key for manual transaction', [
                        'unique_key' => $appointment->unique_appointment_key,
                    ]);
                }
                return; // Early return - no duplicate check for manual transactions
            }
            
            // For regular appointments, check for duplicates only if key fields changed
            if ($appointment->isDirty(["patient_id", "specialist_id", "appointment_date", "appointment_time"])) {
                $appointment->unique_appointment_key = $appointment->generateUniqueKey();
                
                // Check for duplicates before updating
                if ($appointment->isDuplicate()) {
                    \Log::error('Duplicate appointment detected in updating event', [
                        'appointment_id' => $appointment->id,
                        'appointment_type' => $appointment->appointment_type,
                        'unique_key' => $appointment->unique_appointment_key,
                    ]);
                    throw new \Exception("Duplicate appointment detected. An appointment already exists for this patient, specialist, date, and time.");
                }
            }
        });
    }
}