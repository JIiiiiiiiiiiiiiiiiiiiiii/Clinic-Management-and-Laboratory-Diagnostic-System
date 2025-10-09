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
        'quantity' => 'integer',
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
        return $this->belongsTo(LabTest::class);
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

    // Methods
    public function calculateTotal()
    {
        $this->total_price = $this->quantity * $this->unit_price;
        return $this;
    }
}



