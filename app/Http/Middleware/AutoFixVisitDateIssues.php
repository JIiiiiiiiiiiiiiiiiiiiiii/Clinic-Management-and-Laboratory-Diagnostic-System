<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Helpers\SystemWideVisitDateHelper;

class AutoFixVisitDateIssues
{
    /**
     * SYSTEM-WIDE: Auto-fix visit date issues on every request
     */
    public function handle(Request $request, Closure $next)
    {
        // Auto-fix any visit date issues before processing request
        SystemWideVisitDateHelper::validateVisitDates();
        
        return $next($request);
    }
}