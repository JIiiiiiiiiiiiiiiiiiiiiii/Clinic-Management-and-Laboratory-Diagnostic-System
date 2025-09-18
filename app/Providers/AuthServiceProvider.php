<?php

namespace App\Providers;

use App\Models\Patient;
use App\Models\LabOrder;
use App\Models\LabResult;
use App\Policies\PatientPolicy;
use App\Policies\LabOrderPolicy;
use App\Policies\LabResultPolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;

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
    }
}


