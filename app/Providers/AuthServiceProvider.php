<?php

namespace App\Providers;

use App\Models\Patient;
use App\Models\LabOrder;
use App\Models\LabResult;
use App\Policies\PatientPolicy;
use App\Policies\LabOrderPolicy;
use App\Policies\LabResultPolicy;
use App\Providers\CustomUserProvider;
use App\Http\Guards\SessionAuthGuard;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Auth;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * The policy mappings for the application.
     *
     * @var array<class-string, class-string>
     */
    protected $policies = [
        Patient::class => PatientPolicy::class,
        LabOrder::class => LabOrderPolicy::class,
        LabResult::class => LabResultPolicy::class,
    ];

    /**
     * Register any authentication / authorization services.
     */
    public function boot(): void
    {
        // Policies are auto-registered from the $policies array.
        
        // Register custom user provider
        Auth::provider('custom', function ($app, $config) {
            return new \App\Providers\CustomUserProvider();
        });
        
        // Register custom session guard
        Auth::extend('session', function ($app, $name, $config) {
            return new \App\Http\Guards\SessionAuthGuard(
                $app['auth']->createUserProvider($config['provider'] ?? 'custom'),
                $app['request']
            );
        });
    }
}


