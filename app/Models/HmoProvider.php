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
        'contact_number',
        'email',
        'address',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    // Accessor for status field (maps is_active to status)
    public function getStatusAttribute()
    {
        return $this->is_active ? 'active' : 'inactive';
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

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeInactive($query)
    {
        return $query->where('is_active', false);
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
