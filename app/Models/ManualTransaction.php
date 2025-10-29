<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ManualTransaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'transaction_id',
        'patient_id',
        'specialist_id',
        'transaction_type',
        'specialist_type',
        'amount',
        'payment_method',
        'payment_type',
        'hmo_provider',
        'hmo_reference_number',
        'payment_reference',
        'is_senior_citizen',
        'senior_discount_amount',
        'senior_discount_percentage',
        'discount_amount',
        'discount_percentage',
        'final_amount',
        'status',
        'description',
        'notes',
        'transaction_date',
        'transaction_time',
        'due_date',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'senior_discount_amount' => 'decimal:2',
        'senior_discount_percentage' => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'discount_percentage' => 'decimal:2',
        'final_amount' => 'decimal:2',
        'is_senior_citizen' => 'boolean',
        'transaction_date' => 'date',
        'transaction_time' => 'datetime:H:i:s',
        'due_date' => 'date',
    ];

    // Relationships
    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }

    public function specialist()
    {
        return $this->belongsTo(Specialist::class, 'specialist_id', 'specialist_id');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updater()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    // Scopes
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopePaid($query)
    {
        return $query->where('status', 'paid');
    }

    public function scopeByTransactionType($query, $type)
    {
        return $query->where('transaction_type', $type);
    }

    public function scopeBySpecialistType($query, $type)
    {
        return $query->where('specialist_type', $type);
    }

    // Boot method to generate transaction ID
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($transaction) {
            if (empty($transaction->transaction_id)) {
                $nextId = static::max('id') + 1;
                $transaction->transaction_id = 'MT-' . str_pad($nextId, 6, '0', STR_PAD_LEFT);
            }
        });
    }

    // Helper methods
    public function calculateSeniorDiscount()
    {
        if (!$this->is_senior_citizen || $this->payment_method === 'hmo') {
            return 0;
        }

        // Apply 20% senior citizen discount to consultation transactions only
        if ($this->transaction_type === 'consultation') {
            return $this->amount * ($this->senior_discount_percentage / 100);
        }

        return 0;
    }

    public function calculateFinalAmount()
    {
        $seniorDiscount = $this->calculateSeniorDiscount();
        $regularDiscount = $this->discount_amount;
        
        return $this->amount - $seniorDiscount - $regularDiscount;
    }
}
