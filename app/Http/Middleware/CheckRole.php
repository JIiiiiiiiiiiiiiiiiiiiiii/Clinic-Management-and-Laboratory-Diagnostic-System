<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string $role, ...$roles): Response
    {
        $user = $request->user();

        if (!$user) {
            return redirect()->route('login');
        }

        // Check if user has the required role
        if ($user->hasRole($role) || $user->hasAnyRole($roles)) {
            return $next($request);
        }

        // If user doesn't have the required role, redirect based on their actual role
        return redirect($user->getRedirectPath())
            ->with('error', 'You do not have permission to access this area.');
    }
}
