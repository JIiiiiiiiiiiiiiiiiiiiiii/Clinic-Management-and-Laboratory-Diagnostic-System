<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\LabTest;

class CleanLabTests extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'lab:clean-tests';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Keep only the 3 core lab tests (CBC, Urinalysis, Fecalysis) and remove all others';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Cleaning Lab Tests - Keeping Only 3 Core Tests');
        $this->info('==============================================');
        $this->newLine();

        // Define the 3 core tests to keep
        $coreTests = ['CBC001', 'UR001', 'FEC001'];
        
        // Get all lab tests
        $allTests = LabTest::all();
        $this->info("Total lab tests found: {$allTests->count()}");
        $this->newLine();

        $deletedCount = 0;
        $keptCount = 0;

        foreach ($allTests as $test) {
            if (in_array($test->code, $coreTests)) {
                // Keep the core tests and ensure they are active
                $test->update(['is_active' => true]);
                $this->info("✓ KEPT: {$test->name} ({$test->code}) - Set as active");
                $keptCount++;
            } else {
                // Delete non-core tests
                $this->info("✗ DELETING: {$test->name} ({$test->code})");
                $test->delete();
                $deletedCount++;
            }
        }

        $this->newLine();
        $this->info("Cleanup completed:");
        $this->info("- Kept {$keptCount} core tests");
        $this->info("- Deleted {$deletedCount} non-core tests");
        $this->newLine();

        // Verify the remaining tests
        $remainingTests = LabTest::all();
        $this->info("Remaining lab tests:");
        foreach ($remainingTests as $test) {
            $this->info("- {$test->name} ({$test->code}) - Active: " . ($test->is_active ? 'Yes' : 'No'));
        }

        return Command::SUCCESS;
    }
}