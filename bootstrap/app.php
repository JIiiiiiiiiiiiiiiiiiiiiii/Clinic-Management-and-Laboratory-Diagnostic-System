<?php

use App\Http\Middleware\HandleAppearance;
use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Middleware\CheckRole;
use App\Http\Middleware\RedirectBasedOnRole;
use App\Http\Middleware\SimpleAuthMiddleware;
use App\Http\Middleware\HospitalAccess;
use App\Http\Middleware\RoleBasedAccess;
use App\Http\Middleware\ModuleAccess;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->encryptCookies(except: ['appearance', 'sidebar_state']);

        $middleware->web(append: [
            HandleAppearance::class,
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
            SimpleAuthMiddleware::class, // Custom session-based authentication
            RedirectBasedOnRole::class, // Re-enabled after fixing authentication
        ]);

        // Exempt API routes from CSRF verification
        $middleware->validateCsrfTokens(except: [
            'api/*'
        ]);

        // Register role middleware aliases
        $middleware->alias([
            'role' => CheckRole::class,
            'simple.auth' => SimpleAuthMiddleware::class,
            'hospital.access' => HospitalAccess::class,
            'role.access' => RoleBasedAccess::class,
            'module.access' => ModuleAccess::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();
