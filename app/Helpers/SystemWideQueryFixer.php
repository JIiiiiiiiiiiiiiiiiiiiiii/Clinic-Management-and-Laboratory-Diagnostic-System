<?php

namespace App\Helpers;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class SystemWideQueryFixer
{
    /**
     * SYSTEM-WIDE: Fix any query that uses visit_date
     * This automatically corrects column name issues
     */
    public static function fixVisitDateQuery($query)
    {
        if (is_string($query)) {
            // Replace visit_date with visit_date_time
            $fixedQuery = str_replace("visit_date", "visit_date_time", $query);
            
            if ($fixedQuery !== $query) {
                Log::info("SYSTEM-WIDE: Fixed query visit_date -> visit_date_time");
            }
            
            return $fixedQuery;
        }
        
        return $query;
    }
    
    /**
     * SYSTEM-WIDE: Execute query with automatic visit_date fixing
     */
    public static function executeWithVisitDateFix($query, $bindings = [])
    {
        $fixedQuery = self::fixVisitDateQuery($query);
        return DB::select($fixedQuery, $bindings);
    }
    
    /**
     * SYSTEM-WIDE: Fix Eloquent queries that use visit_date
     */
    public static function fixEloquentQuery($query)
    {
        // This would be used in model scopes or query builders
        return $query->orderBy("visit_date_time", "desc");
    }
}