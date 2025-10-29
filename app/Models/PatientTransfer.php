<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class PatientTransfer extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'patient_id',
        'from_hospital',
        'to_clinic',
        'transfer_reason',
        'priority',
        'notes',
        'status',
        'transferred_by',
        'accepted_by',
        'transfer_date',
        'completion_date',
        // New fields for registration system
        'patient_data',
        'registration_type',
        'approval_status',
        'requested_by',
        'approved_by',
        'approval_date',
        'approval_notes',
    ];

    protected $casts = [
        'from_hospital' => 'boolean',
        'to_clinic' => 'boolean',
        'transfer_date' => 'datetime',
        'completion_date' => 'datetime',
        'patient_data' => 'array',
        'approval_date' => 'datetime',
    ];

    // Relationships
    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }

    public function transferredBy()
    {
        return $this->belongsTo(User::class, 'transferred_by');
    }

    public function acceptedBy()
    {
        return $this->belongsTo(User::class, 'accepted_by');
    }

    public function requestedBy()
    {
        return $this->belongsTo(User::class, 'requested_by');
    }

    public function approvedBy()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function transferHistory()
    {
        return $this->hasMany(PatientTransferHistory::class, 'transfer_id');
    }

    // Scopes
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    public function scopeCancelled($query)
    {
        return $query->where('status', 'cancelled');
    }

    public function scopeByPriority($query, $priority)
    {
        return $query->where('priority', $priority);
    }

    public function scopeByDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('transfer_date', [$startDate, $endDate]);
    }

    // New scopes for registration system
    public function scopeByRegistrationType($query, $type)
    {
        return $query->where('registration_type', $type);
    }

    public function scopeByApprovalStatus($query, $status)
    {
        return $query->where('approval_status', $status);
    }

    public function scopePendingApproval($query)
    {
        return $query->where('approval_status', 'pending');
    }

    public function scopeApproved($query)
    {
        return $query->where('approval_status', 'approved');
    }

    public function scopeRejected($query)
    {
        return $query->where('approval_status', 'rejected');
    }

    // Accessors
    public function getPriorityColorAttribute()
    {
        return match($this->priority) {
            'low' => 'green',
            'medium' => 'yellow',
            'high' => 'orange',
            'urgent' => 'red',
            default => 'gray'
        };
    }

    public function getStatusColorAttribute()
    {
        return match($this->status) {
            'pending' => 'yellow',
            'completed' => 'green',
            'cancelled' => 'red',
            default => 'gray'
        };
    }

    // Methods
    public function markAsCompleted($acceptedBy = null)
    {
        $this->update([
            'status' => 'completed',
            'accepted_by' => $acceptedBy,
            'completion_date' => now(),
        ]);
    }

    public function markAsCancelled()
    {
        $this->update(['status' => 'cancelled']);
    }

    public function isPending()
    {
        return $this->status === 'pending';
    }

    public function isCompleted()
    {
        return $this->status === 'completed';
    }

    public function isCancelled()
    {
        return $this->status === 'cancelled';
    }

    // New methods for registration system
    public function isPendingApproval()
    {
        return $this->approval_status === 'pending';
    }

    public function isApproved()
    {
        return $this->approval_status === 'approved';
    }

    public function isRejected()
    {
        return $this->approval_status === 'rejected';
    }

    public function approve($approvedBy, $notes = null)
    {
        $this->update([
            'approval_status' => 'approved',
            'approved_by' => $approvedBy,
            'approval_date' => now(),
            'approval_notes' => $notes,
        ]);

        // Create history record
        $this->createHistoryRecord('accepted', $approvedBy, $notes);
    }

    public function reject($rejectedBy, $notes = null)
    {
        $this->update([
            'approval_status' => 'rejected',
            'approved_by' => $rejectedBy,
            'approval_date' => now(),
            'approval_notes' => $notes,
        ]);

        // Create history record
        $this->createHistoryRecord('rejected', $rejectedBy, $notes);
    }

    public function createHistoryRecord($action, $userId, $notes = null)
    {
        $user = User::find($userId);
        
        PatientTransferHistory::create([
            'patient_id' => $this->patient_id,
            'transfer_id' => $this->id,
            'action' => $action,
            'action_by_role' => $user->role ?? 'unknown',
            'action_by_user' => $userId,
            'notes' => $notes,
            'transfer_data' => $this->toArray(),
            'action_date' => now(),
        ]);
    }

    public function convertToPatient()
    {
        if (!$this->patient_data) {
            throw new \Exception('No patient data available for conversion');
        }

        $patientData = $this->patient_data;
        $patientData['user_id'] = $this->requested_by;
        
        // Generate proper patient number using the same logic as PatientService
        $patientData['patient_no'] = $this->getNextAvailablePatientNo();
        
        // Map field names from transfer data to patient model fields
        if (isset($patientData['date_of_birth'])) {
            $patientData['birthdate'] = $patientData['date_of_birth'];
            unset($patientData['date_of_birth']);
        }
        if (isset($patientData['gender'])) {
            $patientData['sex'] = $patientData['gender'];
            unset($patientData['gender']);
        }
        if (isset($patientData['contact_number'])) {
            $patientData['mobile_no'] = $patientData['contact_number'];
            unset($patientData['contact_number']);
        }
        if (isset($patientData['emergency_contact_name'])) {
            $patientData['emergency_name'] = $patientData['emergency_contact_name'];
            unset($patientData['emergency_contact_name']);
        }
        if (isset($patientData['emergency_contact_number'])) {
            $patientData['emergency_relation'] = $patientData['emergency_contact_number'];
            unset($patientData['emergency_contact_number']);
        }
        
        // Calculate age from birthdate
        if (isset($patientData['birthdate'])) {
            $patientData['age'] = \Carbon\Carbon::parse($patientData['birthdate'])->age;
        }
        
        // Add required fields for patient creation
        $patientData['arrival_date'] = $patientData['arrival_date'] ?? now()->toDateString();
        $patientData['arrival_time'] = $patientData['arrival_time'] ?? now()->format('H:i:s');
        $patientData['attending_physician'] = $patientData['attending_physician'] ?? 'To be assigned';
        $patientData['time_seen'] = $patientData['time_seen'] ?? now()->format('H:i:s');
        $patientData['present_address'] = $patientData['present_address'] ?? 'Not specified';
        $patientData['address'] = $patientData['address'] ?? $patientData['present_address'] ?? 'Not specified';
        $patientData['emergency_name'] = $patientData['emergency_name'] ?? 'Not specified';
        $patientData['emergency_relation'] = $patientData['emergency_relation'] ?? 'Not specified';
        
        $patient = Patient::create($patientData);
        
        // Update the transfer record
        $this->update([
            'patient_id' => $patient->id,
            'status' => 'completed',
            'completion_date' => now(),
        ]);

        // Create history record
        $this->createHistoryRecord('completed', $this->requested_by, 'Patient record created from transfer');

        return $patient;
    }

    /**
     * Get the next available patient number following the main system sequence
     * Extracts the numeric part from existing patient numbers and increments
     * Always uses 4-digit format (P0017, P0018, etc.) to match admin sequence
     */
    private function getNextAvailablePatientNo()
    {
        // Get all existing patient numbers
        $existingNumbers = Patient::withTrashed()
            ->pluck('patient_no')
            ->map(function($patientNo) {
                // Extract numeric part from patient numbers like P001, P025, P0017
                if (preg_match('/P(\d+)/', $patientNo, $matches)) {
                    return (int) $matches[1];
                }
                return 0;
            })
            ->filter()
            ->sort()
            ->values();

        if ($existingNumbers->isEmpty()) {
            // No patients exist, start with 1
            return 'P0001';
        }

        // Find the highest number and increment
        $maxNumber = $existingNumbers->max();
        $nextNumber = $maxNumber + 1;

        // Always use 4-digit format (P0017, P0018, etc.) to match the admin sequence
        return 'P' . str_pad($nextNumber, 4, '0', STR_PAD_LEFT);
    }
}
