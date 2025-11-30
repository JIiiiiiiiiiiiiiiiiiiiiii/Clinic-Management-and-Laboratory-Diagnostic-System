<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LabTest extends Model
{
    use HasFactory;

    public $incrementing = false; // Set to false to allow manual ID assignment
    protected $keyType = 'int';

    /**
     * Retrieve the model for route model binding.
     * 
     * @param  mixed  $value
     * @param  string|null  $field
     * @return \Illuminate\Database\Eloquent\Model|null
     */
    public function resolveRouteBinding($value, $field = null)
    {
        $field = $field ?: $this->getRouteKeyName();
        return $this->where($field, $value)->first();
    }

    protected $fillable = [
        'id',
        'name',
        'code',
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


