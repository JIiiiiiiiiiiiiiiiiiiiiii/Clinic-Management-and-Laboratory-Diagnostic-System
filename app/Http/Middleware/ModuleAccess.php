<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class ModuleAccess
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string $module): Response
    {
        $user = Auth::user();

        if (!$user) {
            return redirect()->route('login')->with('error', 'Please log in to access this resource.');
        }

        // Check if user can access the module
        if (!$user->canAccessModule($module)) {
            $message = "You don't have access to the {$module} module.";
            
            if ($request->expectsJson()) {
                return response()->json([
                    'error' => 'Unauthorized',
                    'message' => $message
                ], 403);
            }

            // Redirect to appropriate dashboard with error message
            $redirectRoute = $this->getRedirectRoute($user);
            
            return redirect()->route($redirectRoute)
                ->with('error', $message);
        }

        return $next($request);
    }

    /**
     * Get the appropriate redirect route based on user role
     */
    private function getRedirectRoute($user): string
    {
        $role = $user->getMappedRole();

        switch ($role) {
            case 'patient':
                return 'patient.dashboard';
            case 'hospital_admin':
            case 'hospital_staff':
                return 'hospital.dashboard';
            default:
                return 'admin.dashboard';
        }
    }
}