<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class LaboratoryRequest extends Model
{
    use HasFactory;

    /**
     * The primary key for the model.
     *
     * @var string
     */
    protected $primaryKey = 'laboratory_request_id';

    protected $fillable = [
        'consultation_id',
        'test_id',
        'requested_by_user_id',
        'request_date',
        'sample_collected_date',
        'result_date',
        'status',
    ];

    protected $casts = [
        'request_date' => 'date',
        'sample_collected_date' => 'date',
        'result_date' => 'date',
    ];

    /**
     * Get the consultation for this laboratory request.
     */
    public function consultation(): BelongsTo
    {
        return $this->belongsTo(Consultation::class, 'consultation_id');
    }

    /**
     * Get the test for this laboratory request.
     */
    public function test(): BelongsTo
    {
        return $this->belongsTo(LaboratoryTest::class, 'test_id');
    }

    /**
     * Get the user who requested this test.
     */
    public function requestedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'requested_by_user_id');
    }

    /**
     * Get the CBC results for this request.
     */
    public function cbcResults(): HasOne
    {
        return $this->hasOne(CbcResult::class, 'laboratory_request_id');
    }

    /**
     * Get the urinalysis results for this request.
     */
    public function urinalysisResults(): HasOne
    {
        return $this->hasOne(UrinalysisResult::class, 'laboratory_request_id');
    }

    /**
     * Get the fecalysis results for this request.
     */
    public function fecalysisResults(): HasOne
    {
        return $this->hasOne(FecalysisResult::class, 'laboratory_request_id');
    }

    /**
     * Get the billing items for this request.
     */
    public function billingItems(): HasOne
    {
        return $this->hasOne(BillingItem::class, 'laboratory_request_id');
    }

    /**
     * Scope for requests by status.
     */
    public function scopeByStatus($query, string $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope for requests by date range.
     */
    public function scopeByDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('request_date', [$startDate, $endDate]);
    }

    /**
     * Scope for pending requests.
     */
    public function scopePending($query)
    {
        return $query->whereIn('status', ['Requested', 'Sample Collected', 'Processing']);
    }

    /**
     * Scope for completed requests.
     */
    public function scopeCompleted($query)
    {
        return $query->whereIn('status', ['Completed', 'Released']);
    }
}
