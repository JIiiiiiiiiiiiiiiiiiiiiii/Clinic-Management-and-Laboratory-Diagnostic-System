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
        "patient_name",
        "patient_id",
        "contact_number",
        "appointment_type",
        "price",
        "total_lab_amount",
        "final_total_amount",
        "specialist_type",
        "specialist_name",
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
        "notes",
        "special_requirements",
        "source",
        "patient_id_fk",
        "unique_appointment_key",
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
        $basePrice = 500; // Base consultation price
        
        switch ($this->appointment_type) {
            case "consultation":
                return $basePrice;
            case "follow-up":
                return $basePrice * 0.8; // 20% discount for follow-up
            case "check-up":
                return $basePrice * 1.2; // 20% premium for check-up
            case "emergency":
                return $basePrice * 1.5; // 50% premium for emergency
            default:
                return $basePrice;
        }
    }

    public function generateUniqueKey()
    {
        return "APT-" . $this->patient_id . "-" . $this->specialist_id . "-" . $this->appointment_date->format("Y-m-d") . "-" . $this->appointment_time->format("H-i-s");
    }

    public function checkForDuplicates()
    {
        $uniqueKey = $this->generateUniqueKey();
        
        $duplicate = Appointment::where("unique_appointment_key", $uniqueKey)
            ->where("id", "!=", $this->id ?? 0)
            ->where("status", "!=", "Cancelled")
            ->first();
            
        return $duplicate;
    }

    public function isDuplicate()
    {
        return $this->checkForDuplicates() !== null;
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
            if (empty($appointment->unique_appointment_key)) {
                $appointment->unique_appointment_key = $appointment->generateUniqueKey();
            }
            
            // Check for duplicates before creating
            if ($appointment->isDuplicate()) {
                throw new \Exception("Duplicate appointment detected. An appointment already exists for this patient, specialist, date, and time.");
            }
        });

        static::updating(function ($appointment) {
            if ($appointment->isDirty(["patient_id", "specialist_id", "appointment_date", "appointment_time"])) {
                $appointment->unique_appointment_key = $appointment->generateUniqueKey();
                
                // Check for duplicates before updating
                if ($appointment->isDuplicate()) {
                    throw new \Exception("Duplicate appointment detected. An appointment already exists for this patient, specialist, date, and time.");
                }
            }
        });
    }
}