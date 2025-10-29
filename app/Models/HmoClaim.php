<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HmoClaim extends Model
{
    use HasFactory;

    protected $table = 'hmo_claims';

    protected $fillable = [
        'claim_number',
        'billing_transaction_id',
        'hmo_provider_id',
        'patient_id',
        'member_id',
        'claim_amount',
        'approved_amount',
        'rejected_amount',
        'status',
        'submission_date',
        'review_date',
        'approval_date',
        'payment_date',
        'rejection_reason',
        'notes',
        'supporting_documents',
        'hmo_reference_number',
        'submitted_by',
        'reviewed_by',
    ];

    protected $casts = [
        'claim_amount' => 'decimal:2',
        'approved_amount' => 'decimal:2',
        'rejected_amount' => 'decimal:2',
        'submission_date' => 'date',
        'review_date' => 'date',
        'approval_date' => 'date',
        'payment_date' => 'date',
        'supporting_documents' => 'array',
    ];

    // Relationships
    public function billingTransaction()
    {
        return $this->belongsTo(BillingTransaction::class);
    }

    public function hmoProvider()
    {
        return $this->belongsTo(HmoProvider::class);
    }

    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }

    public function submittedBy()
    {
        return $this->belongsTo(User::class, 'submitted_by');
    }

    public function reviewedBy()
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    public function patientCoverage()
    {
        return $this->belongsTo(HmoPatientCoverage::class, 'patient_id', 'patient_id')
                    ->where('hmo_provider_id', $this->hmo_provider_id);
    }

    // Scopes
    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    public function scopeByProvider($query, $providerId)
    {
        return $query->where('hmo_provider_id', $providerId);
    }

    public function scopeByDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('submission_date', [$startDate, $endDate]);
    }

    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    public function scopeRejected($query)
    {
        return $query->where('status', 'rejected');
    }

    public function scopePending($query)
    {
        return $query->whereIn('status', ['submitted', 'under_review']);
    }

    // Helper methods
    public function canBeApproved()
    {
        return in_array($this->status, ['submitted', 'under_review']);
    }

    public function canBeRejected()
    {
        return in_array($this->status, ['submitted', 'under_review']);
    }

    public function canBePaid()
    {
        return $this->status === 'approved';
    }

    public function approve($approvedAmount, $reviewedBy = null)
    {
        $this->update([
            'status' => 'approved',
            'approved_amount' => $approvedAmount,
            'rejected_amount' => $this->claim_amount - $approvedAmount,
            'approval_date' => now(),
            'reviewed_by' => $reviewedBy,
        ]);

        // Update patient coverage used amount
        $this->updatePatientCoverageUsedAmount();
    }

    public function reject($rejectionReason, $reviewedBy = null)
    {
        $this->update([
            'status' => 'rejected',
            'approved_amount' => 0,
            'rejected_amount' => $this->claim_amount,
            'rejection_reason' => $rejectionReason,
            'review_date' => now(),
            'reviewed_by' => $reviewedBy,
        ]);
    }

    public function markAsPaid($paymentDate = null)
    {
        $this->update([
            'status' => 'paid',
            'payment_date' => $paymentDate ?? now(),
        ]);
    }

    private function updatePatientCoverageUsedAmount()
    {
        $coverage = $this->patientCoverage;
        if ($coverage) {
            $coverage->updateUsedAmount();
        }
    }

    public function getProcessingDays()
    {
        if (!$this->approval_date) {
            return null;
        }

        return $this->submission_date->diffInDays($this->approval_date);
    }

    public function getApprovalRate()
    {
        if ($this->claim_amount == 0) return 0;
        return ($this->approved_amount / $this->claim_amount) * 100;
    }

    // Boot method to generate claim number
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($claim) {
            if (empty($claim->claim_number)) {
                $nextId = static::max('id') + 1;
                $claim->claim_number = 'CLM-' . str_pad($nextId, 6, '0', STR_PAD_LEFT);
            }
        });
    }
}
