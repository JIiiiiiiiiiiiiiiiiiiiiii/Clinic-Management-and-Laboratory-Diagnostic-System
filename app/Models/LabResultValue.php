<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LabResultValue extends Model
{
    use HasFactory;

    protected $primaryKey = 'id';
    public $incrementing = true;

    protected $fillable = [
        'lab_result_id',
        'parameter_key',
        'parameter_label',
        'value',
        'unit',
        'reference_text',
        'reference_min',
        'reference_max',
    ];

    public function result()
    {
        return $this->belongsTo(LabResult::class, 'lab_result_id');
    }
}


