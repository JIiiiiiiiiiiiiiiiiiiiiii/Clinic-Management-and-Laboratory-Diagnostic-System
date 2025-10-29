<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\LabResult;
use App\Models\LabTest;

class CleanOrphanedResults extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'lab:clean-orphaned-results';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Clean up orphaned LabResult records that reference deleted lab tests';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Cleaning Orphaned Lab Results');
        $this->info('=============================');
        $this->newLine();

        // Get all existing lab test IDs
        $existingTestIds = LabTest::pluck('id')->toArray();
        $this->info("Valid lab test IDs: " . implode(', ', $existingTestIds));
        $this->newLine();

        // Find orphaned LabResult records
        $orphanedResults = LabResult::whereNotIn('lab_test_id', $existingTestIds)->get();
        $this->info("Found {$orphanedResults->count()} orphaned LabResult records");
        $this->newLine();

        if ($orphanedResults->count() > 0) {
            $this->info("Orphaned results:");
            foreach ($orphanedResults as $result) {
                $this->info("- LabResult ID: {$result->id}, Lab Test ID: {$result->lab_test_id} (deleted)");
            }
            $this->newLine();

            if ($this->confirm('Do you want to delete these orphaned results?')) {
                $deletedCount = 0;
                foreach ($orphanedResults as $result) {
                    $result->delete();
                    $deletedCount++;
                }
                $this->info("Deleted {$deletedCount} orphaned LabResult records");
            } else {
                $this->info("Orphaned results kept (not deleted)");
            }
        } else {
            $this->info("No orphaned LabResult records found");
        }

        $this->newLine();
        $this->info("Cleanup completed");

        return Command::SUCCESS;
    }
}