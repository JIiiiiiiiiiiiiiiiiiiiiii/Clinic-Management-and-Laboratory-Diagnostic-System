<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class HospitalAccess
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        
        // Check if user is authenticated
        if (!$user) {
            return redirect()->route('login');
        }
        
        // Check if user has hospital access
        if (!$this->hasHospitalAccess($user)) {
            abort(403, 'Access denied. Hospital access required.');
        }
        
        return $next($request);
    }
    
    /**
     * Check if user has hospital access
     */
    private function hasHospitalAccess($user): bool
    {
        // Allow hospital_admin and hospital_staff roles
        $allowedRoles = ['hospital_admin', 'hospital_staff'];
        
        // Check if user has one of the allowed roles
        if (in_array($user->role, $allowedRoles)) {
            return true;
        }
        
        // For development/testing, allow admin users
        if ($user->role === 'admin') {
            return true;
        }
        
        return false;
    }
}