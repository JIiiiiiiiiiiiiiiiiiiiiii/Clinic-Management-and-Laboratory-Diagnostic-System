<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PendingAppointment extends Model
{
    protected $fillable = [
        'patient_name',
        'patient_id',
        'contact_number',
        'appointment_type',
        'specialist_type',
        'specialist_name',
        'specialist_id',
        'appointment_date',
        'appointment_time',
        'duration',
        'status',
        'billing_status',
        'notes',
        'special_requirements',
        'booking_method',
        'price',
        'status_approval',
        'admin_notes',
        'approved_by',
        'approved_at',
        'source',
    ];

    protected $casts = [
        'appointment_date' => 'date',
        'appointment_time' => 'datetime:H:i:s',
        'approved_at' => 'datetime',
        'price' => 'decimal:2',
    ];

    /**
     * Get the admin user who approved this appointment
     */
    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    /**
     * Calculate the price for the appointment
     */
    public function calculatePrice(): float
    {
        $basePrice = match($this->appointment_type) {
            'consultation' => 300.00,
            'general_consultation' => 300.00,
            'checkup' => 300.00,
            'fecalysis' => 500.00,
            'fecalysis_test' => 500.00,
            'cbc' => 500.00,
            'urinalysis' => 500.00,
            'urinarysis_test' => 500.00,
            'x-ray' => 700.00,
            'ultrasound' => 800.00,
            default => 300.00,
        };

        return $basePrice;
    }

    /**
     * Get formatted price
     */
    public function getFormattedPriceAttribute(): string
    {
        return '₱' . number_format($this->price ?? $this->calculatePrice(), 2);
    }

    /**
     * Get status color for display
     */
    public function getStatusColorAttribute(): string
    {
        return match($this->status_approval) {
            'pending' => 'text-yellow-600',
            'approved' => 'text-green-600',
            'rejected' => 'text-red-600',
            default => 'text-gray-600',
        };
    }
}
