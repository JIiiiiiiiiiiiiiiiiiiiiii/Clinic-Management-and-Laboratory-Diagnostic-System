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