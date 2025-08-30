<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FecalysisResult extends Model
{
    use HasFactory;

    /**
     * The primary key for the model.
     *
     * @var string
     */
    protected $primaryKey = 'fecalysis_result_id';

    protected $fillable = [
        'laboratory_request_id',
        'color',
        'consistency',
        'parasites',
        'ova',
    ];

    /**
     * Get the laboratory request for this fecalysis result.
     */
    public function laboratoryRequest(): BelongsTo
    {
        return $this->belongsTo(LaboratoryRequest::class, 'laboratory_request_id');
    }
}
