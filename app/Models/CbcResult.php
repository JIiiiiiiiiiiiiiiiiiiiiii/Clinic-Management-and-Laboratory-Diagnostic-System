<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CbcResult extends Model
{
    use HasFactory;

    /**
     * The primary key for the model.
     *
     * @var string
     */
    protected $primaryKey = 'cbc_result_id';

    protected $fillable = [
        'laboratory_request_id',
        'hemoglobin',
        'hematocrit',
        'white_blood_cell',
        'red_blood_cell',
        'platelet_count',
        'segmenters',
        'lymphocytes',
        'mixed',
        'mcv',
        'mch',
        'mchc',
    ];

    protected $casts = [
        'hemoglobin' => 'decimal:2',
        'hematocrit' => 'decimal:2',
        'white_blood_cell' => 'decimal:2',
        'red_blood_cell' => 'decimal:2',
        'segmenters' => 'decimal:2',
        'lymphocytes' => 'decimal:2',
        'mixed' => 'decimal:2',
        'mcv' => 'decimal:2',
        'mch' => 'decimal:2',
        'mchc' => 'decimal:2',
    ];

    /**
     * Get the laboratory request for this CBC result.
     */
    public function laboratoryRequest(): BelongsTo
    {
        return $this->belongsTo(LaboratoryRequest::class, 'laboratory_request_id');
    }
}
