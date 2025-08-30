<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Consultation extends Model
{
    use HasFactory;

    /**
     * The primary key for the model.
     *
     * @var string
     */
    protected $primaryKey = 'consultation_id';

    protected $fillable = [
        'appointment_id',
        'doctor_id',
        'consultation_date_time',
        'diagnosis',
        'prescription',
        'notes',
    ];

    protected $casts = [
        'consultation_date_time' => 'datetime',
    ];

    /**
     * Get the appointment for this consultation.
     */
    public function appointment(): BelongsTo
    {
        return $this->belongsTo(Appointment::class, 'appointment_id');
    }

    /**
     * Get the doctor for this consultation.
     */
    public function doctor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'doctor_id');
    }

    /**
     * Get the laboratory requests for this consultation.
     */
    public function laboratoryRequests(): HasMany
    {
        return $this->hasMany(LaboratoryRequest::class, 'consultation_id');
    }

    /**
     * Get the billing items for this consultation.
     */
    public function billingItems(): HasMany
    {
        return $this->hasMany(BillingItem::class, 'consultation_id');
    }

    /**
     * Get the custom clinical record values for this consultation.
     */
    public function customClinicalRecordValues(): HasMany
    {
        return $this->hasMany(CustomClinicalRecordValue::class, 'consultation_id');
    }

    /**
     * Scope for consultations by doctor.
     */
    public function scopeByDoctor($query, $doctorId)
    {
        return $query->where('doctor_id', $doctorId);
    }

    /**
     * Scope for consultations by date range.
     */
    public function scopeByDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('consultation_date_time', [$startDate, $endDate]);
    }

    /**
     * Scope for today's consultations.
     */
    public function scopeToday($query)
    {
        return $query->whereDate('consultation_date_time', today());
    }
}
