<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LabTest extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'code',
        'description',
        'price',
        'fields_schema',
        'is_active',
        'version',
    ];

    protected $casts = [
        'fields_schema' => 'array',
        'is_active' => 'boolean',
        'price' => 'decimal:2',
    ];

    public function results()
    {
        return $this->hasMany(LabResult::class);
    }

    public function billingItems()
    {
        return $this->hasMany(BillingTransactionItem::class);
    }

    // Accessors
    public function getFormattedPriceAttribute()
    {
        return '₱' . number_format($this->price, 2);
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeByPriceRange($query, $minPrice, $maxPrice)
    {
        return $query->whereBetween('price', [$minPrice, $maxPrice]);
    }
}


