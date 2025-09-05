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
        'fields_schema',
        'is_active',
        'version',
    ];

    protected $casts = [
        'fields_schema' => 'array',
        'is_active' => 'boolean',
    ];

    public function results()
    {
        return $this->hasMany(LabResult::class);
    }
}


