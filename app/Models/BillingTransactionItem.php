<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BillingTransactionItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'billing_transaction_id',
        'item_type',
        'item_name',
        'item_description',
        'quantity',
        'unit_price',
        'total_price',
        'lab_test_id',
        'service_id',
        'medicine_id',
    ];

    protected $casts = [
        'unit_price' => 'decimal:2',
        'total_price' => 'decimal:2',
    ];

    // Relationships
    public function billingTransaction()
    {
        return $this->belongsTo(BillingTransaction::class);
    }

    public function labTest()
    {
        return $this->belongsTo(LabTest::class, 'lab_test_id');
    }

    public function service()
    {
        return $this->belongsTo(Service::class, 'service_id');
    }

    public function medicine()
    {
        return $this->belongsTo(Medicine::class, 'medicine_id');
    }

    // Scopes
    public function scopeAppointments($query)
    {
        return $query->where('item_type', 'consultation');
    }

    public function scopeLabTests($query)
    {
        return $query->where('item_type', 'laboratory');
    }

    public function scopeServices($query)
    {
        return $query->where('item_type', 'service');
    }

    // Accessors
    public function getFormattedUnitPriceAttribute()
    {
        return '₱' . number_format($this->unit_price, 2);
    }

    public function getFormattedTotalPriceAttribute()
    {
        return '₱' . number_format($this->total_price, 2);
    }

    public function getItemTypeColorAttribute()
    {
        return match($this->item_type) {
            'consultation' => 'blue',
            'laboratory' => 'green',
            'medicine' => 'purple',
            'procedure' => 'orange',
            'other' => 'gray',
            default => 'gray'
        };
    }
}