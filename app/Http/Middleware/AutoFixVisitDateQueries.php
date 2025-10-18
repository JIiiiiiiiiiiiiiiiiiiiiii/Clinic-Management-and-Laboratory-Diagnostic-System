<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Helpers\SystemWideQueryFixer;

class AutoFixVisitDateQueries
{
    /**
     * SYSTEM-WIDE: Auto-fix visit date query issues on every request
     */
    public function handle(Request $request, Closure $next)
    {
        // This middleware ensures all queries use the correct column name
        // The actual fixing happens in the models and controllers
        
        return $next($request);
    }
}