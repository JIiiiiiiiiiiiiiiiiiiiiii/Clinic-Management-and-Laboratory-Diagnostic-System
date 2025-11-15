<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HmoProvider extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'code',
        'description',
        'contact_person',
        'contact_email',
        'contact_phone',
        'address',
        'commission_rate',
        'status', // Actual database column (enum: 'active', 'inactive', 'suspended')
        'coverage_details',
        'payment_terms',
        'contract_start_date',
        'contract_end_date',
    ];

    protected $casts = [
        'commission_rate' => 'decimal:2',
        'contract_start_date' => 'date',
        'contract_end_date' => 'date',
    ];

    // Accessor: Convert 'status' enum to 'is_active' boolean for backward compatibility
    // This allows code using $hmoProvider->is_active to work even though DB has 'status' column
    public function getIsActiveAttribute()
    {
        return isset($this->attributes['status']) && $this->attributes['status'] === 'active';
    }

    // Mutator: Convert 'is_active' boolean to 'status' enum when setting
    // This allows code using $hmoProvider->is_active = true to work
    public function setIsActiveAttribute($value)
    {
        $this->attributes['status'] = $value ? 'active' : 'inactive';
    }

    // Relationships
    public function patientCoverages()
    {
        return $this->hasMany(HmoPatientCoverage::class);
    }

    public function claims()
    {
        return $this->hasMany(HmoClaim::class);
    }

    public function billingTransactions()
    {
        return $this->hasMany(BillingTransaction::class, 'hmo_provider', 'name');
    }

    // Scopes - use 'status' column which exists in database
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeInactive($query)
    {
        return $query->where('status', 'inactive');
    }

    // Helper methods
    public function getTotalClaimsAmount()
    {
        return $this->claims()->sum('claim_amount');
    }

    public function getApprovedClaimsAmount()
    {
        return $this->claims()->where('status', 'approved')->sum('approved_amount');
    }

    public function getApprovalRate()
    {
        $totalClaims = $this->claims()->count();
        if ($totalClaims === 0) return 0;
        
        $approvedClaims = $this->claims()->where('status', 'approved')->count();
        return ($approvedClaims / $totalClaims) * 100;
    }

    public function getAverageClaimAmount()
    {
        $totalAmount = $this->getTotalClaimsAmount();
        $totalClaims = $this->claims()->count();
        
        return $totalClaims > 0 ? $totalAmount / $totalClaims : 0;
    }

    public function getActivePatientsCount()
    {
        return $this->patientCoverages()->where('status', 'active')->count();
    }

    public function isContractActive()
    {
        if (!$this->contract_start_date || !$this->contract_end_date) {
            return false;
        }
        
        $now = now();
        return $now->between($this->contract_start_date, $this->contract_end_date);
    }
}
