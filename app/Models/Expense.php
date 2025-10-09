<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Expense extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'expense_category',
        'expense_name',
        'description',
        'amount',
        'expense_date',
        'payment_method',
        'payment_reference',
        'vendor_name',
        'vendor_contact',
        'receipt_number',
        'status',
        'notes',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'expense_date' => 'date',
    ];

    // Relationships
    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updatedBy()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    // Category accessor
    public function getCategoryAttribute()
    {
        return (object) [
            'name' => $this->expense_category,
            'id' => $this->expense_category
        ];
    }

    // Scopes
    public function scopeByCategory($query, $category)
    {
        return $query->where('expense_category', $category);
    }

    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    public function scopeByPaymentMethod($query, $method)
    {
        return $query->where('payment_method', $method);
    }

    public function scopeByDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('expense_date', [$startDate, $endDate]);
    }

    public function scopeByVendor($query, $vendor)
    {
        return $query->where('vendor_name', 'like', "%{$vendor}%");
    }

    // Accessors
    public function getFormattedAmountAttribute()
    {
        return '₱' . number_format($this->amount, 2);
    }

    // Methods
    public function canBeEdited()
    {
        return in_array($this->status, ['pending', 'draft']);
    }

    public function canBeCancelled()
    {
        return in_array($this->status, ['pending', 'draft']);
    }
}

