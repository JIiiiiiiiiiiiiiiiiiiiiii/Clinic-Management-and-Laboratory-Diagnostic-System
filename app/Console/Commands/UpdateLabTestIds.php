<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\LabTest;
use App\Models\LabResult;
use App\Models\AppointmentLabTest;
use App\Models\BillingTransactionItem;
use Illuminate\Support\Facades\DB;

class UpdateLabTestIds extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'lab:update-ids';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Update lab test IDs from 6,7,8 to 1,2,3 and update all related records';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Updating Lab Test IDs');
        $this->info('====================');
        $this->newLine();

        // Define the ID mappings
        $idMappings = [
            6 => 1, // CBC
            7 => 2, // Urinalysis  
            8 => 3  // Fecalysis
        ];

        $this->info('ID Mappings:');
        foreach ($idMappings as $oldId => $newId) {
            $test = LabTest::find($oldId);
            $this->info("  {$oldId} -> {$newId} ({$test->name})");
        }
        $this->newLine();

        if (!$this->confirm('Do you want to proceed with updating the IDs?')) {
            $this->info('Operation cancelled');
            return Command::SUCCESS;
        }

        try {
            DB::beginTransaction();

            // Disable foreign key checks temporarily
            DB::statement('SET FOREIGN_KEY_CHECKS=0');

            // Update LabResult records
            $this->info('Updating LabResult records...');
            foreach ($idMappings as $oldId => $newId) {
                $count = LabResult::where('lab_test_id', $oldId)->update(['lab_test_id' => $newId]);
                $this->info("  Updated {$count} LabResult records for test ID {$oldId} -> {$newId}");
            }

            // Update AppointmentLabTest records
            $this->info('Updating AppointmentLabTest records...');
            foreach ($idMappings as $oldId => $newId) {
                $count = AppointmentLabTest::where('lab_test_id', $oldId)->update(['lab_test_id' => $newId]);
                $this->info("  Updated {$count} AppointmentLabTest records for test ID {$oldId} -> {$newId}");
            }

            // Update BillingTransactionItem records
            $this->info('Updating BillingTransactionItem records...');
            foreach ($idMappings as $oldId => $newId) {
                $count = BillingTransactionItem::where('lab_test_id', $oldId)->update(['lab_test_id' => $newId]);
                $this->info("  Updated {$count} BillingTransactionItem records for test ID {$oldId} -> {$newId}");
            }

            // Update the LabTest records themselves by directly updating the ID
            $this->info('Updating LabTest records...');
            foreach ($idMappings as $oldId => $newId) {
                $test = LabTest::find($oldId);
                if ($test) {
                    // Directly update the ID in the database
                    DB::statement("UPDATE lab_tests SET id = {$newId} WHERE id = {$oldId}");
                    $this->info("  Updated LabTest record {$oldId} -> {$newId} ({$test->name})");
                }
            }

            // Reset auto-increment for lab_tests table
            DB::statement('ALTER TABLE lab_tests AUTO_INCREMENT = 4');

            // Re-enable foreign key checks
            DB::statement('SET FOREIGN_KEY_CHECKS=1');

            DB::commit();
            $this->newLine();
            $this->info('✅ Successfully updated all lab test IDs!');
            $this->info('Lab tests now have IDs: 1, 2, 3');

        } catch (\Exception $e) {
            try {
                DB::rollBack();
            } catch (\Exception $rollbackException) {
                // Transaction might already be committed
            }
            $this->error('❌ Error updating IDs: ' . $e->getMessage());
            return Command::FAILURE;
        }

        return Command::SUCCESS;
    }
}