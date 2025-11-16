<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

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
        "appointment_source",
        "booking_method",
        "billing_status",
        "billing_reference",
        "confirmation_sent",
        "admin_notes",
        "additional_info",
        "source",
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
        return $this->belongsTo(Patient::class, "patient_id", "id");
    }

    public function specialist()
    {
        return $this->belongsTo(Specialist::class, "specialist_id", "specialist_id");
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