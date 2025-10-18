<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Helpers\SystemWideSpecialistBillingHelper;

class AutoFixSpecialistBilling
{
    /**
     * SYSTEM-WIDE: Auto-fix specialist billing issues on every request
     */
    public function handle(Request $request, Closure $next)
    {
        // Auto-fix any specialist billing issues before processing request
        SystemWideSpecialistBillingHelper::validateAllAppointments();
        SystemWideSpecialistBillingHelper::fixAllBillingTransactions();
        
        return $next($request);
    }
}