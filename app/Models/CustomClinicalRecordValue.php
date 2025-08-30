<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CustomClinicalRecordValue extends Model
{
    use HasFactory;

    /**
     * The primary key for the model.
     *
     * @var string
     */
    protected $primaryKey = 'value_id';

    protected $fillable = [
        'custom_clinical_record_id',
        'patient_id',
        'consultation_id',
        'field_values',
        'recorded_by_user_id',
    ];

    protected $casts = [
        'field_values' => 'array',
    ];

    /**
     * Get the custom clinical record type.
     */
    public function customClinicalRecord(): BelongsTo
    {
        return $this->belongsTo(CustomClinicalRecord::class, 'custom_clinical_record_id');
    }

    /**
     * Get the patient for this record.
     */
    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class, 'patient_id');
    }

    /**
     * Get the consultation for this record.
     */
    public function consultation(): BelongsTo
    {
        return $this->belongsTo(Consultation::class, 'consultation_id');
    }

    /**
     * Get the user who recorded this value.
     */
    public function recordedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'recorded_by_user_id');
    }

    /**
     * Get a specific field value.
     */
    public function getFieldValue(string $fieldName)
    {
        if (is_array($this->field_values)) {
            return $this->field_values[$fieldName] ?? null;
        }
        return null;
    }

    /**
     * Set a specific field value.
     */
    public function setFieldValue(string $fieldName, $value): void
    {
        $fieldValues = $this->field_values ?? [];
        $fieldValues[$fieldName] = $value;
        $this->field_values = $fieldValues;
    }

    /**
     * Scope for values by patient.
     */
    public function scopeByPatient($query, $patientId)
    {
        return $query->where('patient_id', $patientId);
    }

    /**
     * Scope for values by consultation.
     */
    public function scopeByConsultation($query, $consultationId)
    {
        return $query->where('consultation_id', $consultationId);
    }

    /**
     * Scope for values by record type.
     */
    public function scopeByRecordType($query, $recordTypeId)
    {
        return $query->where('custom_clinical_record_id', $recordTypeId);
    }
}
