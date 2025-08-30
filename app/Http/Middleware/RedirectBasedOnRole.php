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
        $user = $request->user();

        if ($user) {
            // Get the mapped role from the user
            $mappedRole = $user->getMappedRole();

            // Debug logging
            \Log::info('RedirectBasedOnRole middleware', [
                'user_id' => $user->id,
                'email' => $user->email,
                'raw_role' => $user->role,
                'mapped_role' => $mappedRole,
                'request_path' => $request->path(),
                'is_admin_route' => $request->is('admin*'),
                'is_root' => $request->is('/') || $request->is('/dashboard')
            ]);

            // If user is a patient
            if ($mappedRole === 'patient') {
                // If they're trying to access admin routes, redirect to patient dashboard
                if ($request->is('admin*')) {
                    \Log::info('Patient trying to access admin route, redirecting to patient dashboard');
                    return redirect()->route('patient.dashboard');
                }

                // If they're on the root or generic dashboard, redirect to patient dashboard
                if ($request->is('/') || $request->is('/dashboard')) {
                    \Log::info('Patient on root route, redirecting to patient dashboard');
                    return redirect()->route('patient.dashboard');
                }
            }
            // If user is staff (admin, doctor, lab tech, medtech, cashier)
            else if (in_array($mappedRole, ['admin', 'doctor', 'laboratory_technologist', 'medtech', 'cashier'])) {
                // If they're trying to access patient routes, redirect to admin dashboard
                if ($request->is('patient*')) {
                    \Log::info('Staff trying to access patient route, redirecting to admin dashboard');
                    return redirect()->route('admin.dashboard');
                }

                // If they're on the root or generic dashboard, redirect to admin dashboard
                if ($request->is('/') || $request->is('/dashboard')) {
                    \Log::info('Staff on root route, redirecting to admin dashboard');
                    return redirect()->route('admin.dashboard');
                }
            }
            // If role is unknown, default to admin dashboard (safer default)
            else {
                \Log::warning('Unknown role detected, defaulting to admin dashboard', [
                    'user_id' => $user->id,
                    'role' => $mappedRole
                ]);

                if ($request->is('patient*')) {
                    return redirect()->route('admin.dashboard');
                }

                if ($request->is('/') || $request->is('/dashboard')) {
                    return redirect()->route('admin.dashboard');
                }
            }
        }

        return $next($request);
    }
}
