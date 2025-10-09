<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Session;
use Symfony\Component\HttpFoundation\Response;

class SimpleAuthMiddleware
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Check if user is authenticated using Laravel's standard authentication
        if (Auth::check()) {
            $user = Auth::user();
            \Log::info('SimpleAuthMiddleware: User authenticated via Laravel Auth: ' . $user->name);
            
            // Set user in request for easy access
            $request->setUserResolver(function () use ($user) {
                return $user;
            });
        } else {
            \Log::warning('SimpleAuthMiddleware: No user authenticated');
            // If no user authenticated, set resolver to return null
            $request->setUserResolver(function () {
                return null;
            });
        }

        return $next($request);
    }
}
