<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SimpleAuth
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Check if user is logged in via session
        if ($request->session()->has('auth.user') && $request->session()->get('auth.login')) {
            // Set the user in the request for easy access
            $user = $request->session()->get('auth.user');
            $request->setUserResolver(function () use ($user) {
                return $user;
            });
            
            // Also set the user in the auth facade to prevent database queries
            \Illuminate\Support\Facades\Auth::setUser($user);
        }

        return $next($request);
    }
}
