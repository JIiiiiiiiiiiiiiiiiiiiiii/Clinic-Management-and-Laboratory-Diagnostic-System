<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class DoctorPayment extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'doctor_payments';

    protected $fillable = [
        'doctor_id',
        'basic_salary',
        'deductions',
        'holiday_pay',
        'incentives',
        'net_payment',
        'payment_date',
        'status',
        'paid_date',
        'notes',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'basic_salary' => 'decimal:2',
        'deductions' => 'decimal:2',
        'holiday_pay' => 'decimal:2',
        'incentives' => 'decimal:2',
        'net_payment' => 'decimal:2',
        'payment_date' => 'date',
        'paid_date' => 'date',
    ];

    // Relationships
    public function doctor()
    {
        return $this->belongsTo(User::class, 'doctor_id');
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updatedBy()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    public function billingLinks()
    {
        return $this->hasMany(DoctorPaymentBillingLink::class);
    }

    public function billingTransactions()
    {
        return $this->belongsToMany(
            BillingTransaction::class,
            'doctor_payment_billing_links',
            'doctor_payment_id',
            'billing_transaction_id'
        );
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
    public function getFormattedNetPaymentAttribute()
    {
        return '₱' . number_format($this->net_payment, 2);
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

    // Methods
    public function calculateNetPayment()
    {
        $this->net_payment = $this->basic_salary + $this->holiday_pay + $this->incentives - $this->deductions;
        return $this;
    }

    public function isOverdue()
    {
        return $this->status === 'pending' && $this->payment_date < now()->toDateString();
    }

    public function canBeEdited()
    {
        return in_array($this->status, ['pending']);
    }

    public function canBeCancelled()
    {
        return in_array($this->status, ['pending']);
    }

    public function canBePaid()
    {
        return $this->status === 'pending';
    }

    public function markAsPaid()
    {
        $this->update([
            'status' => 'paid',
            'paid_date' => now()->toDateString(),
        ]);

        // Create summary report entry
        DoctorSummaryReport::create([
            'doctor_id' => $this->doctor_id,
            'payment_id' => $this->id,
            'basic_salary' => $this->basic_salary,
            'deductions' => $this->deductions,
            'holiday_pay' => $this->holiday_pay,
            'incentives' => $this->incentives,
            'total_paid' => $this->net_payment,
            'payment_date' => $this->paid_date,
            'status' => 'paid',
            'created_by' => auth()->id(),
        ]);

        return $this;
    }
}



