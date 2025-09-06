<?php

namespace App\Models\Inventory;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Supplier extends Model
{
    use HasFactory;

    protected $table = 'inventory_suppliers';

    protected $fillable = [
        'name',
        'contact_person',
        'email',
        'phone',
        'address',
        'tax_id',
        'notes',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    // Relationships
    public function transactions()
    {
        return $this->hasMany(Transaction::class);
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    // Accessors
    public function getTotalTransactionsAttribute()
    {
        return $this->transactions()->count();
    }

    public function getTotalValueAttribute()
    {
        return $this->transactions()->where('type', 'in')->sum('total_cost');
    }

    // Methods
    public function getRecentTransactions($limit = 10)
    {
        return $this->transactions()
            ->with('product')
            ->orderBy('transaction_date', 'desc')
            ->limit($limit)
            ->get();
    }
}
