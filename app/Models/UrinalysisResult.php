<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UrinalysisResult extends Model
{
    use HasFactory;

    /**
     * The primary key for the model.
     *
     * @var string
     */
    protected $primaryKey = 'urinalysis_result_id';

    protected $fillable = [
        'laboratory_request_id',
        'color',
        'transparency',
        'specific_gravity',
        'ph',
        'albumin',
        'glucose',
        'ketone',
        'bile',
        'urobilinogen',
        'blood',
        'white_blood_cell',
        'red_blood_cell',
        'casts',
        'crystals',
        'epithelial_cells',
        'bacteria',
        'mucus_threads',
        'others',
    ];

    protected $casts = [
        'specific_gravity' => 'decimal:3',
        'ph' => 'decimal:1',
        'white_blood_cell' => 'integer',
        'red_blood_cell' => 'integer',
    ];

    /**
     * Get the laboratory request for this urinalysis result.
     */
    public function laboratoryRequest(): BelongsTo
    {
        return $this->belongsTo(LaboratoryRequest::class, 'laboratory_request_id');
    }
}
