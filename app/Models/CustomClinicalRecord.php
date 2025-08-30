<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CustomClinicalRecord extends Model
{
    use HasFactory;

    /**
     * The primary key for the model.
     *
     * @var string
     */
    protected $primaryKey = 'record_id';

    protected $fillable = [
        'record_name',
        'description',
        'fields',
        'created_by_user_id',
        'is_active',
    ];

    protected $casts = [
        'fields' => 'array',
        'is_active' => 'boolean',
    ];

    /**
     * Get the user who created this record type.
     */
    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by_user_id');
    }

    /**
     * Get the values for this record type.
     */
    public function values(): HasMany
    {
        return $this->hasMany(CustomClinicalRecordValue::class, 'custom_clinical_record_id');
    }

    /**
     * Scope for active record types.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope for searching record types.
     */
    public function scopeSearch($query, $search)
    {
        return $query->where(function ($q) use ($search) {
            $q->where('record_name', 'like', "%{$search}%")
              ->orWhere('description', 'like', "%{$search}%");
        });
    }

    /**
     * Get the field names as an array.
     */
    public function getFieldNamesAttribute(): array
    {
        if (is_array($this->fields)) {
            return array_column($this->fields, 'name');
        }
        return [];
    }

    /**
     * Check if this record type has a specific field.
     */
    public function hasField(string $fieldName): bool
    {
        return in_array($fieldName, $this->field_names);
    }
}
