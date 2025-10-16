<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Patient;
use App\Models\Appointment;
use App\Services\SynchronizedIdService;

class ReorderSequenceNumbers extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'sequence:reorder';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Reorder sequence numbers for patients and appointments to eliminate gaps';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Reordering synchronized sequence numbers...');
        
        // Use the synchronized service to renumber everything
        SynchronizedIdService::renumberAll();
        
        $this->info('All sequence numbers have been reordered successfully!');
        $this->info('Patient IDs and Appointment IDs are now synchronized.');
    }
}
