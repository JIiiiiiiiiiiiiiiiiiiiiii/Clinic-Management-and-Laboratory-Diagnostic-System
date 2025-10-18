<?php

namespace App\Helpers;

use App\Models\Visit;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class VisitHelper
{
    /**
     * Safely create a visit for an appointment, preventing duplicates
     * 
     * @param int $appointmentId
     * @param int $patientId
     * @param array $visitData
     * @return Visit
     */
    public static function createVisitSafely($appointmentId, $patientId, $visitData)
    {
        // Check if visit already exists for this appointment
        $existingVisit = Visit::where('appointment_id', $appointmentId)->first();
        
        if ($existingVisit) {
            Log::info("Visit already exists for appointment {$appointmentId}, skipping creation");
            return $existingVisit;
        }
        
        // Create visit only if it doesn't exist
        $visitData['appointment_id'] = $appointmentId;
        $visitData['patient_id'] = $patientId;
        
        $visit = Visit::create($visitData);
        
        Log::info("Visit created successfully for appointment {$appointmentId} with visit_code: {$visit->visit_code}");
        
        return $visit;
    }
    
    /**
     * Check if a visit exists for an appointment
     * 
     * @param int $appointmentId
     * @return bool
     */
    public static function visitExists($appointmentId)
    {
        return Visit::where('appointment_id', $appointmentId)->exists();
    }
    
    /**
     * Get existing visit for an appointment
     * 
     * @param int $appointmentId
     * @return Visit|null
     */
    public static function getExistingVisit($appointmentId)
    {
        return Visit::where('appointment_id', $appointmentId)->first();
    }
}

