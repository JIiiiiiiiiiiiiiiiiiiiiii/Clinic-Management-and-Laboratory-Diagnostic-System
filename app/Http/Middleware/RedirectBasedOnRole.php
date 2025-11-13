<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RedirectBasedOnRole
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Allow public routes to pass through without any role-based redirects
        $publicRoutes = ['/', '/about', '/services', '/testimonials', '/contact'];
        if (in_array($request->path(), $publicRoutes)) {
            return $next($request);
        }

        $user = $request->user();

        if ($user && method_exists($user, 'getMappedRole')) {
            // Get the mapped role from the user
            $mappedRole = $user->getMappedRole();

            // If user is a patient
            if ($mappedRole === 'patient') {
                // If they're trying to access admin routes, redirect to home
                if ($request->is('admin*')) {
                    return redirect()->route('home');
                }

                // If they're on the generic dashboard, redirect to home
                if ($request->is('/dashboard')) {
                    return redirect()->route('home');
                }
                
                // Don't redirect if they're already on the home route to prevent loops
            }
            // If user is hospital staff - use admin routes with role-based restrictions
            else if (in_array($mappedRole, ['hospital_admin', 'hospital_staff'])) {
                // If they're trying to access patient routes, redirect to admin dashboard
                if ($request->is('patient*')) {
                    return redirect()->route('admin.dashboard');
                }

                // Hospital users now use admin routes directly
                // If they're on the root or generic dashboard, redirect to admin dashboard
                if ($request->is('/') || $request->is('/dashboard')) {
                    return redirect()->route('admin.dashboard');
                }
                
                // Don't redirect if they're already on admin routes to prevent loops
            }
            // If user is staff (admin, doctor, lab tech, medtech, cashier)
            else if (in_array($mappedRole, ['admin', 'doctor', 'laboratory_technologist', 'medtech', 'cashier'])) {
                // If they're trying to access patient routes, redirect to admin dashboard
                if ($request->is('patient*')) {
                    return redirect()->route('admin.dashboard');
                }

                // If they're trying to access hospital routes, redirect to admin dashboard
                if ($request->is('hospital*')) {
                    return redirect()->route('admin.dashboard');
                }

                // If they're on the root or generic dashboard, redirect to admin dashboard
                if ($request->is('/') || $request->is('/dashboard')) {
                    return redirect()->route('admin.dashboard');
                }
                
                // Don't redirect if they're already on admin routes to prevent loops
            }
            // If role is unknown, default to admin dashboard (safer default)
            else {
                if ($request->is('patient*')) {
                    return redirect()->route('admin.dashboard');
                }

                if ($request->is('/') || $request->is('/dashboard')) {
                    return redirect()->route('admin.dashboard');
                }
                
                // Don't redirect if they're already on admin routes to prevent loops
            }
        }

        return $next($request);
    }
}
