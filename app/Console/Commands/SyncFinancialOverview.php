<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\FinancialOverviewService;

class SyncFinancialOverview extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'financial:sync {--recalculate : Recalculate all data from scratch}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Sync financial overview data with transactions';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting financial overview sync...');

        if ($this->option('recalculate')) {
            $this->info('Recalculating all financial overview data...');
            FinancialOverviewService::recalculateAll();
            $this->info('✅ All financial overview data recalculated successfully!');
        } else {
            $this->info('Syncing financial overview data...');
            FinancialOverviewService::syncAll();
            $this->info('✅ Financial overview data synced successfully!');
        }

        $this->info('Financial overview sync completed!');
    }
}