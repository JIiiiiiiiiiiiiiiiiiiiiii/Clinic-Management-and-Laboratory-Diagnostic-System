<?php

namespace App\Observers;

use App\Models\BillingTransaction;
use App\Services\FinancialOverviewService;

class BillingTransactionObserver
{
    /**
     * Handle the BillingTransaction "created" event.
     */
    public function created(BillingTransaction $billingTransaction): void
    {
        FinancialOverviewService::updateForTransaction($billingTransaction, 'created');
    }

    /**
     * Handle the BillingTransaction "updated" event.
     */
    public function updated(BillingTransaction $billingTransaction): void
    {
        FinancialOverviewService::updateForTransaction($billingTransaction, 'updated');
    }

    /**
     * Handle the BillingTransaction "deleted" event.
     */
    public function deleted(BillingTransaction $billingTransaction): void
    {
        FinancialOverviewService::updateForTransaction($billingTransaction, 'deleted');
    }

    /**
     * Handle the BillingTransaction "restored" event.
     */
    public function restored(BillingTransaction $billingTransaction): void
    {
        FinancialOverviewService::updateForTransaction($billingTransaction, 'restored');
    }

    /**
     * Handle the BillingTransaction "force deleted" event.
     */
    public function forceDeleted(BillingTransaction $billingTransaction): void
    {
        FinancialOverviewService::updateForTransaction($billingTransaction, 'force_deleted');
    }
}