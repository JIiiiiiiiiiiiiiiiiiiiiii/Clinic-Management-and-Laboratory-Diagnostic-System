<?php

namespace App\Helpers;

use App\Models\Visit;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class SystemWideVisitDateHelper
{
    /**
     * SYSTEM-WIDE: Get visits with proper date ordering
     * This handles the visit_date vs visit_date_time column issue
     */
    public static function getVisitsOrderedByDate($patientId = null, $orderBy = "desc")
    {
        $query = Visit::query();
        
        if ($patientId) {
            $query->where("patient_id", $patientId);
        }
        
        // Use the correct column name (visit_date_time instead of visit_date)
        $query->orderBy("visit_date_time", $orderBy);
        
        $visits = $query->get();
        
        Log::info("SYSTEM-WIDE: Retrieved visits ordered by visit_date_time {$orderBy}");
        
        return $visits;
    }
    
    /**
     * SYSTEM-WIDE: Get visits with date filtering
     * This handles date filtering with the correct column
     */
    public static function getVisitsByDateRange($startDate, $endDate, $patientId = null)
    {
        $query = Visit::query();
        
        if ($patientId) {
            $query->where("patient_id", $patientId);
        }
        
        // Use the correct column name for date filtering
        $query->whereBetween("visit_date_time", [$startDate, $endDate]);
        $query->orderBy("visit_date_time", "desc");
        
        $visits = $query->get();
        
        Log::info("SYSTEM-WIDE: Retrieved visits by date range {$startDate} to {$endDate}");
        
        return $visits;
    }
    
    /**
     * SYSTEM-WIDE: Get visits with proper date formatting
     * This ensures consistent date formatting across the system
     */
    public static function getVisitsWithFormattedDates($patientId = null)
    {
        $visits = self::getVisitsOrderedByDate($patientId);
        
        // Add formatted date fields to each visit
        foreach($visits as $visit) {
            $visit->formatted_visit_date = $visit->visit_date_time ? $visit->visit_date_time->format("Y-m-d") : null;
            $visit->formatted_visit_time = $visit->visit_date_time ? $visit->visit_date_time->format("H:i:s") : null;
            $visit->formatted_visit_datetime = $visit->visit_date_time ? $visit->visit_date_time->format("Y-m-d H:i:s") : null;
        }
        
        return $visits;
    }
    
    /**
     * SYSTEM-WIDE: Fix any existing queries that use visit_date
     * This automatically corrects column name issues
     */
    public static function fixVisitDateQueries($query)
    {
        // Replace visit_date with visit_date_time in the query
        if (is_string($query)) {
            return str_replace("visit_date", "visit_date_time", $query);
        }
        
        return $query;
    }
    
    /**
     * SYSTEM-WIDE: Validate visit date data
     * This ensures all visits have proper date data
     */
    public static function validateVisitDates()
    {
        $invalidVisits = Visit::whereNull("visit_date_time")
            ->orWhere("visit_date_time", "")
            ->get();
        
        foreach($invalidVisits as $visit) {
            // Set a default date if missing
            $visit->update([
                "visit_date_time" => now()
            ]);
            Log::info("SYSTEM-WIDE: Fixed visit {$visit->id} with missing visit_date_time");
        }
        
        Log::info("SYSTEM-WIDE: Validated and fixed {$invalidVisits->count()} visits");
        return $invalidVisits->count();
    }
}