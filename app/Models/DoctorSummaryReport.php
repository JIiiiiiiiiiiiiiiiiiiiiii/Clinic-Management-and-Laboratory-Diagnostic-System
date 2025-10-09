<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DoctorSummaryReport extends Model
{
    use HasFactory;

    protected $fillable = [
        'doctor_id',
        'payment_id',
        'basic_salary',
        'deductions',
        'holiday_pay',
        'incentives',
        'total_paid',
        'payment_date',
        'status',
        'notes',
        'created_by',
    ];

    protected $casts = [
        'basic_salary' => 'decimal:2',
        'deductions' => 'decimal:2',
        'holiday_pay' => 'decimal:2',
        'incentives' => 'decimal:2',
        'total_paid' => 'decimal:2',
        'payment_date' => 'date',
    ];

    // Relationships
    public function doctor()
    {
        return $this->belongsTo(User::class, 'doctor_id');
    }

    public function payment()
    {
        return $this->belongsTo(DoctorPayment::class, 'payment_id');
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    // Scopes
    public function scopeByDoctor($query, $doctorId)
    {
        return $query->where('doctor_id', $doctorId);
    }

    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    public function scopeByDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('payment_date', [$startDate, $endDate]);
    }

    // Accessors
    public function getFormattedTotalPaidAttribute()
    {
        return '₱' . number_format($this->total_paid, 2);
    }

    public function getFormattedBasicSalaryAttribute()
    {
        return '₱' . number_format($this->basic_salary, 2);
    }

    public function getFormattedDeductionsAttribute()
    {
        return '₱' . number_format($this->deductions, 2);
    }

    public function getFormattedHolidayPayAttribute()
    {
        return '₱' . number_format($this->holiday_pay, 2);
    }

    public function getFormattedIncentivesAttribute()
    {
        return '₱' . number_format($this->incentives, 2);
    }
}