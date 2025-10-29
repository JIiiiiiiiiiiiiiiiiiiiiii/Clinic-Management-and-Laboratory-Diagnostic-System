<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AppointmentBillingLink extends Model
{
    use HasFactory;

    protected $fillable = [
        "appointment_id",
        "billing_transaction_id",
        "appointment_type",
        "appointment_price",
        "status",
        "unique_link_key",
    ];

    protected $casts = [
        "appointment_price" => "decimal:2",
    ];

    // Relationships
    public function appointment()
    {
        return $this->belongsTo(Appointment::class);
    }

    public function billingTransaction()
    {
        return $this->belongsTo(BillingTransaction::class);
    }

    // Scopes
    public function scopePending($query)
    {
        return $query->where("status", "pending");
    }

    public function scopePaid($query)
    {
        return $query->where("status", "paid");
    }

    public function scopeCancelled($query)
    {
        return $query->where("status", "cancelled");
    }

    // Accessors
    public function getFormattedPriceAttribute()
    {
        return "₱" . number_format($this->appointment_price, 2);
    }

    // Methods
    public function markAsPaid()
    {
        $this->update(["status" => "paid"]);
    }

    public function markAsCancelled()
    {
        $this->update(["status" => "cancelled"]);
    }

    public function generateUniqueKey()
    {
        return "LINK-" . $this->appointment_id . "-" . $this->billing_transaction_id;
    }

    public function checkForDuplicates()
    {
        $uniqueKey = $this->generateUniqueKey();
        
        $duplicate = AppointmentBillingLink::where("unique_link_key", $uniqueKey)
            ->where("id", "!=", $this->id ?? 0)
            ->first();
            
        return $duplicate;
    }

    public function isDuplicate()
    {
        return $this->checkForDuplicates() !== null;
    }

    // Boot method to generate unique key
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($link) {
            if (empty($link->unique_link_key)) {
                $link->unique_link_key = $link->generateUniqueKey();
            }
            
            // Check for duplicates before creating
            if ($link->isDuplicate()) {
                throw new \Exception("Duplicate appointment billing link detected. A link already exists for this appointment and billing transaction.");
            }
        });
    }
}