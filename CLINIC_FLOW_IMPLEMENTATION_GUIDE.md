# Clinic Flow Implementation Guide
## Admin Pending → Approve → Visit & Billing Generated → Mark Paid → Daily Report

This guide provides a complete implementation for the clinic appointment flow from patient booking to daily reporting.

## Overview

The flow works as follows:
1. **Patient** books appointment online → Status: `Pending`
2. **Admin** reviews and approves → Creates `Visit` + `BillingTransaction` → Status: `Confirmed`
3. **Admin/Cashier** marks payment → Status: `Paid`
4. **System** syncs to daily reports automatically

## Database Schema

### Core Tables Structure

```sql
-- Patients table
CREATE TABLE patients (
    patient_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    patient_code VARCHAR(10) UNIQUE,
    last_name VARCHAR(100) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    middle_name VARCHAR(100),
    birthdate DATE,
    age INT,
    sex ENUM('Male','Female'),
    -- ... other patient fields
    status ENUM('Active','Inactive') DEFAULT 'Active',
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

-- Specialists table (Doctors, Nurses, MedTechs)
CREATE TABLE specialists (
    specialist_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    specialist_code VARCHAR(10) UNIQUE,
    name VARCHAR(255) NOT NULL,
    role ENUM('Doctor','Nurse','MedTech','Admin') NOT NULL,
    specialization VARCHAR(100),
    contact VARCHAR(20),
    email VARCHAR(150),
    status ENUM('Active','Inactive') DEFAULT 'Active',
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

-- Appointments table
CREATE TABLE appointments (
    appointment_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    appointment_code VARCHAR(10) UNIQUE,
    patient_id BIGINT NOT NULL,
    specialist_id BIGINT,
    nurse_id BIGINT,
    appointment_type VARCHAR(100) NOT NULL,
    specialist_type ENUM('doctor','medtech') NOT NULL,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    duration INT DEFAULT 30,
    price DECIMAL(10,2) DEFAULT 0.00,
    additional_info TEXT,
    source ENUM('Online','Walk-in') DEFAULT 'Online',
    status ENUM('Pending','Confirmed','Completed','Cancelled') DEFAULT 'Pending',
    admin_notes TEXT,
    created_by BIGINT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id),
    FOREIGN KEY (specialist_id) REFERENCES specialists(specialist_id),
    FOREIGN KEY (nurse_id) REFERENCES specialists(specialist_id)
);

-- Visits table
CREATE TABLE visits (
    visit_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    visit_code VARCHAR(10) UNIQUE,
    appointment_id BIGINT NOT NULL,
    patient_id BIGINT NOT NULL,
    doctor_id BIGINT,
    nurse_id BIGINT,
    medtech_id BIGINT,
    purpose VARCHAR(255) NOT NULL,
    status ENUM('Ongoing','Completed','Cancelled') DEFAULT 'Ongoing',
    visit_date DATETIME NOT NULL,
    notes TEXT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    
    FOREIGN KEY (appointment_id) REFERENCES appointments(appointment_id),
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id),
    FOREIGN KEY (doctor_id) REFERENCES specialists(specialist_id),
    FOREIGN KEY (nurse_id) REFERENCES specialists(specialist_id),
    FOREIGN KEY (medtech_id) REFERENCES specialists(specialist_id)
);

-- Billing Transactions table
CREATE TABLE billing_transactions (
    transaction_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    transaction_code VARCHAR(20) UNIQUE,
    appointment_id BIGINT NOT NULL,
    patient_id BIGINT NOT NULL,
    doctor_id BIGINT,
    medtech_id BIGINT,
    nurse_id BIGINT,
    amount DECIMAL(10,2) NOT NULL,
    payment_method ENUM('Cash','Card','HMO','Insurance') DEFAULT 'Cash',
    reference_no VARCHAR(100),
    notes TEXT,
    status ENUM('Pending','Paid','Cancelled') DEFAULT 'Pending',
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    
    FOREIGN KEY (appointment_id) REFERENCES appointments(appointment_id),
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id),
    FOREIGN KEY (doctor_id) REFERENCES specialists(specialist_id),
    FOREIGN KEY (medtech_id) REFERENCES specialists(specialist_id),
    FOREIGN KEY (nurse_id) REFERENCES specialists(specialist_id)
);

-- Daily Transactions table (for reporting)
CREATE TABLE daily_transactions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    transaction_date DATE NOT NULL,
    transaction_type ENUM('billing','doctor_payment','expense') NOT NULL,
    transaction_id VARCHAR(20) NOT NULL,
    patient_name VARCHAR(255),
    specialist_name VARCHAR(255),
    amount DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(50),
    status VARCHAR(50),
    description TEXT,
    items_count INT DEFAULT 0,
    appointments_count INT DEFAULT 0,
    original_transaction_id BIGINT,
    original_table VARCHAR(50),
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

-- Notifications table
CREATE TABLE notifications (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    data JSON,
    user_id BIGINT,
    appointment_id BIGINT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (appointment_id) REFERENCES appointments(appointment_id)
);
```

## Laravel Models

### 1. Patient Model (`app/Models/Patient.php`)

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Patient extends Model
{
    use HasFactory;
    
    protected $primaryKey = 'patient_id';

    protected $fillable = [
        'patient_code',
        'last_name',
        'first_name',
        'middle_name',
        'birthdate',
        'age',
        'sex',
        'nationality',
        'civil_status',
        'address',
        'telephone_no',
        'mobile_no',
        'email',
        'emergency_name',
        'emergency_relation',
        'insurance_company',
        'hmo_name',
        'hmo_id_no',
        'approval_code',
        'validity',
        'drug_allergies',
        'past_medical_history',
        'family_history',
        'social_history',
        'obgyn_history',
        'status',
    ];

    protected $casts = [
        'birthdate' => 'date',
        'validity' => 'date',
    ];

    // Relationships
    public function appointments()
    {
        return $this->hasMany(Appointment::class, 'patient_id', 'patient_id');
    }

    public function visits()
    {
        return $this->hasMany(Visit::class, 'patient_id', 'patient_id');
    }

    public function billingTransactions()
    {
        return $this->hasMany(BillingTransaction::class, 'patient_id', 'patient_id');
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('status', 'Active');
    }

    public function scopeBySex($query, $sex)
    {
        return $query->where('sex', $sex);
    }

    // Accessors
    public function getFullNameAttribute()
    {
        return $this->first_name . ' ' . $this->last_name;
    }

    public function getFormattedBirthdateAttribute()
    {
        return $this->birthdate ? $this->birthdate->format('M d, Y') : 'N/A';
    }
}
```

### 2. Specialist Model (`app/Models/Specialist.php`)

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Specialist extends Model
{
    use HasFactory;
    
    protected $primaryKey = 'specialist_id';

    protected $fillable = [
        'specialist_code',
        'name',
        'role',
        'specialization',
        'contact',
        'email',
        'status',
    ];

    // Relationships
    public function appointments()
    {
        return $this->hasMany(Appointment::class, 'specialist_id', 'specialist_id');
    }

    public function visits()
    {
        return $this->hasMany(Visit::class, 'doctor_id', 'specialist_id')
            ->orWhere('nurse_id', 'specialist_id')
            ->orWhere('medtech_id', 'specialist_id');
    }

    public function billingTransactions()
    {
        return $this->hasMany(BillingTransaction::class, 'doctor_id', 'specialist_id')
            ->orWhere('medtech_id', 'specialist_id')
            ->orWhere('nurse_id', 'specialist_id');
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('status', 'Active');
    }

    public function scopeByRole($query, $role)
    {
        return $query->where('role', $role);
    }

    public function scopeDoctors($query)
    {
        return $query->where('role', 'Doctor');
    }

    public function scopeNurses($query)
    {
        return $query->where('role', 'Nurse');
    }

    public function scopeMedtechs($query)
    {
        return $query->where('role', 'MedTech');
    }
}
```

### 3. Appointment Model (`app/Models/Appointment.php`)

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Appointment extends Model
{
    use HasFactory;
    
    protected $primaryKey = 'appointment_id';

    protected $fillable = [
        'appointment_code',
        'patient_id',
        'specialist_id',
        'nurse_id',
        'appointment_type',
        'specialist_type',
        'appointment_date',
        'appointment_time',
        'duration',
        'price',
        'additional_info',
        'source',
        'status',
        'admin_notes',
        'created_by',
    ];

    protected $casts = [
        'appointment_date' => 'date',
        'appointment_time' => 'datetime:H:i:s',
        'price' => 'decimal:2',
    ];

    // Relationships
    public function patient()
    {
        return $this->belongsTo(Patient::class, 'patient_id', 'patient_id');
    }

    public function specialist()
    {
        return $this->belongsTo(Specialist::class, 'specialist_id', 'specialist_id');
    }

    public function nurse()
    {
        return $this->belongsTo(Specialist::class, 'nurse_id', 'specialist_id');
    }

    public function visit()
    {
        return $this->hasOne(Visit::class, 'appointment_id', 'appointment_id');
    }

    public function billingTransaction()
    {
        return $this->hasOne(BillingTransaction::class, 'appointment_id', 'appointment_id');
    }

    // Scopes
    public function scopePending($query)
    {
        return $query->where('status', 'Pending');
    }

    public function scopeConfirmed($query)
    {
        return $query->where('status', 'Confirmed');
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', 'Completed');
    }

    public function scopeByDate($query, $date)
    {
        return $query->where('appointment_date', $date);
    }

    // Methods
    public function calculatePrice()
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

        return $prices[$this->appointment_type] ?? 300;
    }

    public function markAsPaid()
    {
        if ($this->billingTransaction) {
            $this->billingTransaction->update(['status' => 'Paid']);
        }
    }

    public function isBillingPending()
    {
        return $this->billingTransaction && $this->billingTransaction->status === 'Pending';
    }

    public function isBillingPaid()
    {
        return $this->billingTransaction && $this->billingTransaction->status === 'Paid';
    }

    // Boot method to generate appointment code
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($appointment) {
            if (empty($appointment->appointment_code)) {
                $nextId = static::max('appointment_id') + 1;
                $appointment->appointment_code = 'A' . str_pad($nextId, 4, '0', STR_PAD_LEFT);
            }
        });
    }
}
```

### 4. Visit Model (`app/Models/Visit.php`)

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Visit extends Model
{
    use HasFactory;
    
    protected $primaryKey = 'visit_id';

    protected $fillable = [
        'visit_code',
        'appointment_id',
        'patient_id',
        'doctor_id',
        'nurse_id',
        'medtech_id',
        'purpose',
        'status',
        'visit_date',
        'notes',
    ];

    protected $casts = [
        'visit_date' => 'datetime',
    ];

    // Relationships
    public function appointment()
    {
        return $this->belongsTo(Appointment::class, 'appointment_id', 'appointment_id');
    }

    public function patient()
    {
        return $this->belongsTo(Patient::class, 'patient_id', 'patient_id');
    }

    public function doctor()
    {
        return $this->belongsTo(Specialist::class, 'doctor_id', 'specialist_id');
    }

    public function nurse()
    {
        return $this->belongsTo(Specialist::class, 'nurse_id', 'specialist_id');
    }

    public function medtech()
    {
        return $this->belongsTo(Specialist::class, 'medtech_id', 'specialist_id');
    }

    public function billingTransaction()
    {
        return $this->hasOneThrough(
            BillingTransaction::class,
            Appointment::class,
            'appointment_id',
            'appointment_id',
            'appointment_id',
            'appointment_id'
        );
    }

    // Scopes
    public function scopeByDate($query, $date)
    {
        return $query->whereDate('visit_date', $date);
    }

    public function scopeByDoctor($query, $doctorId)
    {
        return $query->where('doctor_id', $doctorId);
    }

    // Methods
    public function markAsCompleted()
    {
        $this->update(['status' => 'Completed']);
        if ($this->appointment) {
            $this->appointment->update(['status' => 'Completed']);
        }
    }

    // Boot method to generate visit code
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($visit) {
            if (empty($visit->visit_code)) {
                $nextId = static::max('visit_id') + 1;
                $visit->visit_code = 'V' . str_pad($nextId, 4, '0', STR_PAD_LEFT);
            }
        });
    }
}
```

### 5. BillingTransaction Model (`app/Models/BillingTransaction.php`)

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BillingTransaction extends Model
{
    use HasFactory;
    
    protected $primaryKey = 'transaction_id';

    protected $fillable = [
        'transaction_code',
        'appointment_id',
        'patient_id',
        'doctor_id',
        'medtech_id',
        'nurse_id',
        'amount',
        'payment_method',
        'reference_no',
        'notes',
        'status',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
    ];

    // Relationships
    public function appointment()
    {
        return $this->belongsTo(Appointment::class, 'appointment_id', 'appointment_id');
    }

    public function patient()
    {
        return $this->belongsTo(Patient::class, 'patient_id', 'patient_id');
    }

    public function doctor()
    {
        return $this->belongsTo(Specialist::class, 'doctor_id', 'specialist_id');
    }

    public function medtech()
    {
        return $this->belongsTo(Specialist::class, 'medtech_id', 'specialist_id');
    }

    public function nurse()
    {
        return $this->belongsTo(Specialist::class, 'nurse_id', 'specialist_id');
    }

    // Scopes
    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    public function scopeByPaymentMethod($query, $method)
    {
        return $query->where('payment_method', $method);
    }

    public function scopeByDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('transaction_date', [$startDate, $endDate]);
    }

    // Methods
    public function markAsPaid($paymentMethod = 'Cash', $referenceNo = null)
    {
        $this->update([
            'status' => 'Paid',
            'payment_method' => $paymentMethod,
            'reference_no' => $referenceNo,
        ]);

        // Mark appointment and visit as completed
        if ($this->appointment) {
            $this->appointment->update(['status' => 'Completed']);
            if ($this->appointment->visit) {
                $this->appointment->visit->update(['status' => 'Completed']);
            }
        }
    }

    public function markAsCancelled()
    {
        $this->update(['status' => 'Cancelled']);
    }

    // Boot method to generate transaction code
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($transaction) {
            if (empty($transaction->transaction_code)) {
                $nextId = static::max('transaction_id') + 1;
                $transaction->transaction_code = 'TXN-' . str_pad($nextId, 6, '0', STR_PAD_LEFT);
            }
        });
    }
}
```

### 6. DailyTransaction Model (`app/Models/DailyTransaction.php`)

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DailyTransaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'transaction_date',
        'transaction_type',
        'transaction_id',
        'patient_name',
        'specialist_name',
        'amount',
        'payment_method',
        'status',
        'description',
        'items_count',
        'appointments_count',
        'original_transaction_id',
        'original_table',
    ];

    protected $casts = [
        'transaction_date' => 'date',
        'amount' => 'decimal:2',
    ];

    // Scopes
    public function scopeByDate($query, $date)
    {
        return $query->where('transaction_date', $date);
    }

    public function scopeByType($query, $type)
    {
        return $query->where('transaction_type', $type);
    }

    public function scopeBilling($query)
    {
        return $query->where('transaction_type', 'billing');
    }

    public function scopeDoctorPayments($query)
    {
        return $query->where('transaction_type', 'doctor_payment');
    }
}
```

## Services

### 1. AppointmentApprovalService (`app/Services/AppointmentApprovalService.php`)

```php
<?php

namespace App\Services;

use App\Models\Appointment;
use App\Models\Visit;
use App\Models\BillingTransaction;
use App\Models\Notification;
use App\Models\Specialist;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class AppointmentApprovalService
{
    /**
     * Approve an appointment (admin function)
     * 
     * @param int $appointmentId
     * @param array $data
     * @return array
     */
    public function approveAppointment(int $appointmentId, array $data): array
    {
        return DB::transaction(function () use ($appointmentId, $data) {
            try {
                // Get appointment with lock
                $appointment = Appointment::where('appointment_id', $appointmentId)
                    ->where('status', 'Pending')
                    ->lockForUpdate()
                    ->first();

                if (!$appointment) {
                    throw new \Exception('Appointment not found or already processed');
                }

                $assignedSpecialistId = $data['assigned_specialist_id'];
                $assignedNurseId = $data['assigned_nurse_id'] ?? null;
                $adminNotes = $data['admin_notes'] ?? null;

                // Get specialist role to determine doctor/medtech assignment
                $specialist = Specialist::find($assignedSpecialistId);
                if (!$specialist) {
                    throw new \Exception('Assigned specialist not found');
                }

                // Update appointment
                $appointment->update([
                    'status' => 'Confirmed',
                    'admin_notes' => $adminNotes,
                    'specialist_id' => $assignedSpecialistId,
                    'nurse_id' => $assignedNurseId,
                ]);

                // Create visit
                $visit = Visit::create([
                    'appointment_id' => $appointment->appointment_id,
                    'patient_id' => $appointment->patient_id,
                    'doctor_id' => $specialist->role === 'Doctor' ? $assignedSpecialistId : null,
                    'nurse_id' => $assignedNurseId,
                    'medtech_id' => $specialist->role === 'MedTech' ? $assignedSpecialistId : null,
                    'purpose' => $appointment->appointment_type,
                    'visit_date' => now(),
                    'status' => 'Ongoing',
                ]);

                $visitId = $visit->visit_id;
                $visitCode = $visit->visit_code;

                // Create billing transaction
                $billingTransaction = BillingTransaction::create([
                    'appointment_id' => $appointment->appointment_id,
                    'patient_id' => $appointment->patient_id,
                    'doctor_id' => $specialist->role === 'Doctor' ? $assignedSpecialistId : null,
                    'medtech_id' => $specialist->role === 'MedTech' ? $assignedSpecialistId : null,
                    'nurse_id' => $assignedNurseId,
                    'amount' => $appointment->price,
                    'status' => 'Pending',
                ]);

                $transactionId = $billingTransaction->transaction_id;
                $transactionCode = $billingTransaction->transaction_code;

                // Create notification for patient
                Notification::create([
                    'type' => 'appointment_approved',
                    'title' => 'Appointment Approved',
                    'message' => "Your appointment for {$appointment->appointment_type} has been approved and scheduled.",
                    'data' => [
                        'appointment_id' => $appointment->appointment_id,
                        'visit_id' => $visitId,
                        'transaction_id' => $transactionId,
                    ],
                    'appointment_id' => $appointment->appointment_id,
                ]);

                Log::info('Appointment approved successfully', [
                    'appointment_id' => $appointment->appointment_id,
                    'visit_id' => $visitId,
                    'transaction_id' => $transactionId,
                    'specialist_id' => $assignedSpecialistId,
                ]);

                return [
                    'success' => true,
                    'appointment_id' => $appointment->appointment_id,
                    'appointment_code' => $appointment->appointment_code,
                    'visit_id' => $visitId,
                    'visit_code' => $visitCode,
                    'transaction_id' => $transactionId,
                    'transaction_code' => $transactionCode,
                    'status' => 'Confirmed'
                ];

            } catch (\Exception $e) {
                Log::error('Appointment approval failed', [
                    'appointment_id' => $appointmentId,
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString()
                ]);
                throw $e;
            }
        });
    }

    /**
     * Reject an appointment
     * 
     * @param int $appointmentId
     * @param string $reason
     * @return array
     */
    public function rejectAppointment(int $appointmentId, string $reason): array
    {
        return DB::transaction(function () use ($appointmentId, $reason) {
            try {
                $appointment = Appointment::where('appointment_id', $appointmentId)
                    ->where('status', 'Pending')
                    ->lockForUpdate()
                    ->first();

                if (!$appointment) {
                    throw new \Exception('Appointment not found or already processed');
                }

                // Update appointment status
                $appointment->update([
                    'status' => 'Cancelled',
                    'admin_notes' => $reason,
                ]);

                // Create notification for patient
                Notification::create([
                    'type' => 'appointment_rejected',
                    'title' => 'Appointment Rejected',
                    'message' => "Your appointment has been rejected. Reason: {$reason}",
                    'data' => [
                        'appointment_id' => $appointment->appointment_id,
                        'reason' => $reason,
                    ],
                    'appointment_id' => $appointment->appointment_id,
                ]);

                Log::info('Appointment rejected', [
                    'appointment_id' => $appointment->appointment_id,
                    'reason' => $reason
                ]);

                return [
                    'success' => true,
                    'appointment_id' => $appointment->appointment_id,
                    'status' => 'Cancelled'
                ];

            } catch (\Exception $e) {
                Log::error('Appointment rejection failed', [
                    'appointment_id' => $appointmentId,
                    'error' => $e->getMessage()
                ]);
                throw $e;
            }
        });
    }
}
```

### 2. BillingService (`app/Services/BillingService.php`)

```php
<?php

namespace App\Services;

use App\Models\BillingTransaction;
use App\Models\DailyTransaction;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class BillingService
{
    /**
     * Mark billing transaction as paid
     * 
     * @param int $transactionId
     * @param array $paymentData
     * @return array
     */
    public function markAsPaid(int $transactionId, array $paymentData): array
    {
        return DB::transaction(function () use ($transactionId, $paymentData) {
            try {
                $transaction = BillingTransaction::where('transaction_id', $transactionId)
                    ->where('status', 'Pending')
                    ->lockForUpdate()
                    ->first();

                if (!$transaction) {
                    throw new \Exception('Transaction not found or already processed');
                }

                // Update transaction
                $transaction->markAsPaid(
                    $paymentData['payment_method'] ?? 'Cash',
                    $paymentData['reference_no'] ?? null
                );

                // Sync to daily transactions
                $this->syncToDailyTransactions($transaction);

                Log::info('Billing transaction marked as paid', [
                    'transaction_id' => $transaction->transaction_id,
                    'amount' => $transaction->amount,
                    'payment_method' => $transaction->payment_method
                ]);

                return [
                    'success' => true,
                    'transaction_id' => $transaction->transaction_id,
                    'status' => 'Paid'
                ];

            } catch (\Exception $e) {
                Log::error('Failed to mark transaction as paid', [
                    'transaction_id' => $transactionId,
                    'error' => $e->getMessage()
                ]);
                throw $e;
            }
        });
    }

    /**
     * Sync billing transaction to daily transactions
     * 
     * @param BillingTransaction $transaction
     * @return void
     */
    private function syncToDailyTransactions(BillingTransaction $transaction): void
    {
        // Check if already synced
        $existing = DailyTransaction::where('original_transaction_id', $transaction->transaction_id)
            ->where('original_table', 'billing_transactions')
            ->first();

        if ($existing) {
            // Update existing record
            $existing->update([
                'status' => $transaction->status,
                'payment_method' => $transaction->payment_method,
                'amount' => $transaction->amount,
            ]);
        } else {
            // Create new record
            DailyTransaction::create([
                'transaction_date' => $transaction->transaction_date->format('Y-m-d'),
                'transaction_type' => 'billing',
                'transaction_id' => $transaction->transaction_code,
                'patient_name' => $transaction->patient->full_name ?? 'Unknown',
                'specialist_name' => $this->getSpecialistName($transaction),
                'amount' => $transaction->amount,
                'payment_method' => $transaction->payment_method,
                'status' => $transaction->status,
                'description' => "Payment for {$transaction->appointment->appointment_type}",
                'items_count' => 1,
                'appointments_count' => 1,
                'original_transaction_id' => $transaction->transaction_id,
                'original_table' => 'billing_transactions',
            ]);
        }
    }

    /**
     * Get specialist name for daily transaction
     * 
     * @param BillingTransaction $transaction
     * @return string
     */
    private function getSpecialistName(BillingTransaction $transaction): string
    {
        if ($transaction->doctor) {
            return $transaction->doctor->name;
        } elseif ($transaction->medtech) {
            return $transaction->medtech->name;
        } elseif ($transaction->nurse) {
            return $transaction->nurse->name;
        }
        return 'Unknown';
    }
}
```

## API Controllers

### 1. OnlineAppointmentController (`app/Http/Controllers/Api/OnlineAppointmentController.php`)

```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Patient;
use App\Models\Appointment;
use App\Models\Specialist;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class OnlineAppointmentController extends Controller
{
    /**
     * Create online appointment
     */
    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'patient_data' => 'required|array',
                'patient_data.first_name' => 'required|string|max:100',
                'patient_data.last_name' => 'required|string|max:100',
                'patient_data.mobile_no' => 'required|string|max:20',
                'patient_data.email' => 'nullable|email|max:150',
                'appointment_data' => 'required|array',
                'appointment_data.appointment_type' => 'required|string',
                'appointment_data.specialist_type' => 'required|in:doctor,medtech',
                'appointment_data.appointment_date' => 'required|date|after:today',
                'appointment_data.appointment_time' => 'required|date_format:H:i',
                'appointment_data.additional_info' => 'nullable|string|max:1000',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $result = DB::transaction(function () use ($request) {
                // Create or find patient
                $patient = $this->createOrFindPatient($request->patient_data);

                // Create appointment
                $appointmentData = $request->appointment_data;
                $appointmentData['patient_id'] = $patient->patient_id;
                $appointmentData['source'] = 'Online';
                $appointmentData['status'] = 'Pending';
                $appointmentData['price'] = $this->calculatePrice($appointmentData['appointment_type']);

                $appointment = Appointment::create($appointmentData);

                Log::info('Online appointment created', [
                    'appointment_id' => $appointment->appointment_id,
                    'patient_id' => $patient->patient_id,
                    'appointment_type' => $appointment->appointment_type
                ]);

                return [
                    'success' => true,
                    'appointment_id' => $appointment->appointment_id,
                    'appointment_code' => $appointment->appointment_code,
                    'patient_id' => $patient->patient_id,
                    'patient_code' => $patient->patient_code,
                    'status' => 'Pending',
                    'message' => 'Appointment created successfully. Please wait for admin approval.'
                ];
            });

            return response()->json($result);

        } catch (\Exception $e) {
            Log::error('Failed to create online appointment', [
                'error' => $e->getMessage(),
                'request_data' => $request->all()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to create appointment: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Create or find patient
     */
    private function createOrFindPatient(array $patientData)
    {
        // Check if patient exists by email or mobile
        $patient = Patient::where('email', $patientData['email'])
            ->orWhere('mobile_no', $patientData['mobile_no'])
            ->first();

        if ($patient) {
            return $patient;
        }

        // Generate patient code
        $nextId = Patient::max('patient_id') + 1;
        $patientData['patient_code'] = 'P' . str_pad($nextId, 4, '0', STR_PAD_LEFT);

        return Patient::create($patientData);
    }

    /**
     * Calculate appointment price
     */
    private function calculatePrice(string $appointmentType): float
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
```

### 2. AdminAppointmentController (`app/Http/Controllers/Api/AdminAppointmentController.php`)

```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\AppointmentApprovalService;
use App\Models\Appointment;
use App\Models\Specialist;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class AdminAppointmentController extends Controller
{
    protected $appointmentApprovalService;

    public function __construct(AppointmentApprovalService $appointmentApprovalService)
    {
        $this->appointmentApprovalService = $appointmentApprovalService;
    }

    /**
     * Get pending appointments
     */
    public function pending()
    {
        try {
            $appointments = Appointment::where('status', 'Pending')
                ->with(['patient', 'specialist'])
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $appointments
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to retrieve pending appointments', [
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve pending appointments: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Approve an appointment
     */
    public function approve(Request $request, $appointmentId)
    {
        try {
            $request->validate([
                'assigned_specialist_id' => 'required|integer|exists:specialists,specialist_id',
                'assigned_nurse_id' => 'nullable|integer|exists:specialists,specialist_id',
                'admin_notes' => 'nullable|string|max:1000',
            ]);

            $result = $this->appointmentApprovalService->approveAppointment($appointmentId, [
                'assigned_specialist_id' => $request->input('assigned_specialist_id'),
                'assigned_nurse_id' => $request->input('assigned_nurse_id'),
                'admin_notes' => $request->input('admin_notes'),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Appointment approved successfully',
                'data' => $result
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to approve appointment', [
                'appointment_id' => $appointmentId,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to approve appointment: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Reject an appointment
     */
    public function reject(Request $request, $appointmentId)
    {
        try {
            $request->validate([
                'reason' => 'required|string|max:1000',
            ]);

            $result = $this->appointmentApprovalService->rejectAppointment(
                $appointmentId,
                $request->input('reason')
            );

            return response()->json([
                'success' => true,
                'message' => 'Appointment rejected successfully',
                'data' => $result
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to reject appointment', [
                'appointment_id' => $appointmentId,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to reject appointment: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get specialists for assignment
     */
    public function specialists()
    {
        try {
            $specialists = Specialist::where('status', 'Active')
                ->orderBy('role')
                ->orderBy('name')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $specialists
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve specialists: ' . $e->getMessage()
            ], 500);
        }
    }
}
```

### 3. BillingController (`app/Http/Controllers/Api/BillingController.php`)

```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\BillingService;
use App\Models\BillingTransaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class BillingController extends Controller
{
    protected $billingService;

    public function __construct(BillingService $billingService)
    {
        $this->billingService = $billingService;
    }

    /**
     * Get pending billing transactions
     */
    public function pending()
    {
        try {
            $transactions = BillingTransaction::where('status', 'Pending')
                ->with(['appointment.patient', 'doctor', 'medtech', 'nurse'])
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $transactions
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to retrieve pending transactions', [
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve pending transactions: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mark transaction as paid
     */
    public function markPaid(Request $request, $transactionId)
    {
        try {
            $request->validate([
                'payment_method' => 'required|in:Cash,Card,HMO,Insurance',
                'reference_no' => 'nullable|string|max:100',
            ]);

            $result = $this->billingService->markAsPaid($transactionId, [
                'payment_method' => $request->input('payment_method'),
                'reference_no' => $request->input('reference_no'),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Transaction marked as paid successfully',
                'data' => $result
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to mark transaction as paid', [
                'transaction_id' => $transactionId,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to mark transaction as paid: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get daily transactions for reporting
     */
    public function dailyTransactions(Request $request)
    {
        try {
            $date = $request->get('date', now()->format('Y-m-d'));

            $transactions = \App\Models\DailyTransaction::where('transaction_date', $date)
                ->orderBy('created_at', 'asc')
                ->get();

            $summary = [
                'total_revenue' => $transactions->where('transaction_type', 'billing')->sum('amount'),
                'total_transactions' => $transactions->where('transaction_type', 'billing')->count(),
                'pending_transactions' => $transactions->where('status', 'Pending')->count(),
                'paid_transactions' => $transactions->where('status', 'Paid')->count(),
            ];

            return response()->json([
                'success' => true,
                'data' => $transactions,
                'summary' => $summary
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to retrieve daily transactions', [
                'date' => $request->get('date'),
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve daily transactions: ' . $e->getMessage()
            ], 500);
        }
    }
}
```

## API Routes

### API Routes (`routes/api.php`)

```php
<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\OnlineAppointmentController;
use App\Http\Controllers\Api\AdminAppointmentController;
use App\Http\Controllers\Api\BillingController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// Online Appointment API
Route::post('/appointments/online', [OnlineAppointmentController::class, 'store']);

// Admin Appointment Management API
Route::middleware('auth:sanctum')->prefix('admin/appointments')->group(function () {
    Route::get('/pending', [AdminAppointmentController::class, 'pending']);
    Route::post('/{appointment}/approve', [AdminAppointmentController::class, 'approve']);
    Route::post('/{appointment}/reject', [AdminAppointmentController::class, 'reject']);
    Route::get('/specialists', [AdminAppointmentController::class, 'specialists']);
});

// Billing API
Route::middleware('auth:sanctum')->prefix('billing')->group(function () {
    Route::get('/pending', [BillingController::class, 'pending']);
    Route::post('/{transaction}/mark-paid', [BillingController::class, 'markPaid']);
    Route::get('/daily-transactions', [BillingController::class, 'dailyTransactions']);
});

// Specialists API
Route::get('/specialists', function () {
    return App\Models\Specialist::where('status', 'Active')->get();
});
```

## Seeders

### 1. SpecialistsSeeder (`database/seeders/SpecialistsSeeder.php`)

```php
<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Specialist;

class SpecialistsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $specialists = [
            // Doctors
            [
                'specialist_code' => 'DOC001',
                'name' => 'Dr. Maria Santos',
                'role' => 'Doctor',
                'specialization' => 'General Medicine',
                'contact' => '+63 912 345 6789',
                'email' => 'maria.santos@clinic.com',
                'status' => 'Active',
            ],
            [
                'specialist_code' => 'DOC002',
                'name' => 'Dr. Juan Dela Cruz',
                'role' => 'Doctor',
                'specialization' => 'Internal Medicine',
                'contact' => '+63 912 345 6790',
                'email' => 'juan.delacruz@clinic.com',
                'status' => 'Active',
            ],
            [
                'specialist_code' => 'DOC003',
                'name' => 'Dr. Ana Rodriguez',
                'role' => 'Doctor',
                'specialization' => 'Pediatrics',
                'contact' => '+63 912 345 6791',
                'email' => 'ana.rodriguez@clinic.com',
                'status' => 'Active',
            ],

            // Nurses
            [
                'specialist_code' => 'NUR001',
                'name' => 'Nurse Sarah Johnson',
                'role' => 'Nurse',
                'specialization' => 'General Nursing',
                'contact' => '+63 912 345 6792',
                'email' => 'sarah.johnson@clinic.com',
                'status' => 'Active',
            ],
            [
                'specialist_code' => 'NUR002',
                'name' => 'Nurse Michael Brown',
                'role' => 'Nurse',
                'specialization' => 'Emergency Nursing',
                'contact' => '+63 912 345 6793',
                'email' => 'michael.brown@clinic.com',
                'status' => 'Active',
            ],

            // MedTechs
            [
                'specialist_code' => 'MT001',
                'name' => 'MedTech Lisa Garcia',
                'role' => 'MedTech',
                'specialization' => 'Laboratory Technology',
                'contact' => '+63 912 345 6794',
                'email' => 'lisa.garcia@clinic.com',
                'status' => 'Active',
            ],
            [
                'specialist_code' => 'MT002',
                'name' => 'MedTech Robert Wilson',
                'role' => 'MedTech',
                'specialization' => 'Radiology Technology',
                'contact' => '+63 912 345 6795',
                'email' => 'robert.wilson@clinic.com',
                'status' => 'Active',
            ],
        ];

        foreach ($specialists as $specialist) {
            Specialist::create($specialist);
        }
    }
}
```

### 2. Updated DatabaseSeeder (`database/seeders/DatabaseSeeder.php`)

```php
<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            SpecialistsSeeder::class,
            // Add other seeders as needed
        ]);
    }
}
```

## Frontend Integration

### 1. Patient Side - Online Appointment Form

```typescript
// Patient appointment booking form
const createOnlineAppointment = async (formData: any) => {
  try {
    const response = await fetch('/api/appointments/online', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
      },
      body: JSON.stringify({
        patient_data: {
          first_name: formData.firstName,
          last_name: formData.lastName,
          mobile_no: formData.mobile,
          email: formData.email,
          birthdate: formData.birthdate,
          sex: formData.sex,
        },
        appointment_data: {
          appointment_type: formData.appointmentType,
          specialist_type: formData.specialistType,
          appointment_date: formData.appointmentDate,
          appointment_time: formData.appointmentTime,
          additional_info: formData.additionalInfo,
        }
      })
    });

    const result = await response.json();
    
    if (result.success) {
      // Show success message with appointment code
      alert(`Appointment created successfully! Your appointment code is: ${result.appointment_code}`);
    } else {
      throw new Error(result.message);
    }
  } catch (error) {
    console.error('Failed to create appointment:', error);
    alert('Failed to create appointment. Please try again.');
  }
};
```

### 2. Admin Side - Appointment Approval

```typescript
// Admin appointment approval
const approveAppointment = async (appointmentId: number, specialistId: number, nurseId?: number, adminNotes?: string) => {
  try {
    const response = await fetch(`/api/admin/appointments/${appointmentId}/approve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
      },
      body: JSON.stringify({
        assigned_specialist_id: specialistId,
        assigned_nurse_id: nurseId,
        admin_notes: adminNotes,
      })
    });

    const result = await response.json();
    
    if (result.success) {
      // Show success message with visit and transaction codes
      alert(`Appointment approved successfully! Visit Code: ${result.data.visit_code}, Transaction Code: ${result.data.transaction_code}`);
      // Refresh the appointments list
      loadPendingAppointments();
    } else {
      throw new Error(result.message);
    }
  } catch (error) {
    console.error('Failed to approve appointment:', error);
    alert('Failed to approve appointment. Please try again.');
  }
};
```

### 3. Billing - Mark as Paid

```typescript
// Mark billing transaction as paid
const markTransactionAsPaid = async (transactionId: number, paymentMethod: string, referenceNo?: string) => {
  try {
    const response = await fetch(`/api/billing/${transactionId}/mark-paid`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
      },
      body: JSON.stringify({
        payment_method: paymentMethod,
        reference_no: referenceNo,
      })
    });

    const result = await response.json();
    
    if (result.success) {
      alert('Transaction marked as paid successfully!');
      // Refresh the billing list
      loadPendingTransactions();
    } else {
      throw new Error(result.message);
    }
  } catch (error) {
    console.error('Failed to mark transaction as paid:', error);
    alert('Failed to mark transaction as paid. Please try again.');
  }
};
```

### 4. Daily Reports

```typescript
// Load daily transactions for reporting
const loadDailyTransactions = async (date: string) => {
  try {
    const response = await fetch(`/api/billing/daily-transactions?date=${date}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
      }
    });

    const result = await response.json();
    
    if (result.success) {
      // Display transactions and summary
      displayDailyTransactions(result.data, result.summary);
    } else {
      throw new Error(result.message);
    }
  } catch (error) {
    console.error('Failed to load daily transactions:', error);
    alert('Failed to load daily transactions. Please try again.');
  }
};
```

## Implementation Steps

### 1. Database Setup

```bash
# Backup current database
mysqldump -u username -p database_name > backup_$(date +%Y%m%d_%H%M%S).sql

# Run migrations
php artisan migrate:fresh --seed
```

### 2. File Placement

1. **Models**: Place in `app/Models/`
2. **Services**: Place in `app/Services/`
3. **Controllers**: Place in `app/Http/Controllers/Api/`
4. **Seeders**: Place in `database/seeders/`
5. **Routes**: Add to `routes/api.php`

### 3. Dependencies

```bash
# Install required packages
composer install
npm install

# Generate autoload files
composer dump-autoload
```

### 4. Environment Configuration

Add to `.env`:
```
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=clinic_database
DB_USERNAME=your_username
DB_PASSWORD=your_password
```

### 5. Testing the Flow

1. **Create Online Appointment**:
   ```bash
   curl -X POST http://localhost:8000/api/appointments/online \
     -H "Content-Type: application/json" \
     -d '{
       "patient_data": {
         "first_name": "John",
         "last_name": "Doe",
         "mobile_no": "+639123456789",
         "email": "john.doe@example.com"
       },
       "appointment_data": {
         "appointment_type": "consultation",
         "specialist_type": "doctor",
         "appointment_date": "2024-01-15",
         "appointment_time": "09:00"
       }
     }'
   ```

2. **Approve Appointment**:
   ```bash
   curl -X POST http://localhost:8000/api/admin/appointments/1/approve \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer your_token" \
     -d '{
       "assigned_specialist_id": 1,
       "admin_notes": "Approved for consultation"
     }'
   ```

3. **Mark as Paid**:
   ```bash
   curl -X POST http://localhost:8000/api/billing/1/mark-paid \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer your_token" \
     -d '{
       "payment_method": "Cash",
       "reference_no": "REF001"
     }'
   ```

4. **View Daily Report**:
   ```bash
   curl -X GET "http://localhost:8000/api/billing/daily-transactions?date=2024-01-15" \
     -H "Authorization: Bearer your_token"
   ```

## Troubleshooting

### Common Issues

1. **Foreign Key Constraints**: Ensure all foreign key relationships are properly set up
2. **Transaction Rollbacks**: Check database logs for failed transactions
3. **Authentication**: Verify API tokens and middleware configuration
4. **Data Validation**: Ensure all required fields are provided

### Logs

Check Laravel logs in `storage/logs/laravel.log` for detailed error information.

### Database Queries

Use Laravel's query logging to debug database issues:
```php
DB::enableQueryLog();
// Your code here
dd(DB::getQueryLog());
```

## Conclusion

This implementation provides a complete, transactional flow for clinic appointments from patient booking to daily reporting. The system ensures data consistency through database transactions and provides comprehensive logging for troubleshooting.

The flow is designed to be:
- **Atomic**: All operations are wrapped in database transactions
- **Traceable**: Comprehensive logging at each step
- **Scalable**: Proper indexing and relationship management
- **Maintainable**: Clean separation of concerns with services and controllers
