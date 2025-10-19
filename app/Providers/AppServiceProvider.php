<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Models\BillingTransaction;
use App\Observers\BillingTransactionObserver;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Register observers
        BillingTransaction::observe(BillingTransactionObserver::class);
    }
}
