<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RedirectBasedOnRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user) {
            // Redirect based on user role
            $redirectPath = $user->getRedirectPath();

            if ($request->is('/') || $request->is('/dashboard')) {
                return redirect($redirectPath);
            }
        }

        return $next($request);
    }
}
