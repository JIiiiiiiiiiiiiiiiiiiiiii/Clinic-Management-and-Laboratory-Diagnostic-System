<?php

namespace App\Console\Commands;

use App\Models\Patient;
use Illuminate\Console\Command;

class FixPatientNumbers extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'patients:fix-numbers {--dry-run : Show what would be changed without making changes}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Fix patient numbers to be sequential starting from 1';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $isDryRun = $this->option('dry-run');
        
        if ($isDryRun) {
            $this->info('DRY RUN MODE - No changes will be made');
        }

        // Get all patients ordered by creation date to maintain chronological order
        $patients = Patient::withTrashed()->orderBy('created_at')->get();
        
        if ($patients->isEmpty()) {
            $this->info('No patients found to renumber.');
            return;
        }

        $this->info("Found {$patients->count()} patients to renumber.");
        
        $changes = [];
        $newNumber = 1;
        
        foreach ($patients as $patient) {
            $oldNumber = $patient->patient_no;
            $newNumberStr = (string) $newNumber;
            
            if ($oldNumber !== $newNumberStr) {
                $changes[] = [
                    'id' => $patient->id,
                    'name' => $patient->first_name . ' ' . $patient->last_name,
                    'old_number' => $oldNumber,
                    'new_number' => $newNumberStr,
                    'created_at' => $patient->created_at->format('Y-m-d H:i:s')
                ];
            }
            
            if (!$isDryRun) {
                $patient->update(['patient_no' => $newNumberStr]);
            }
            
            $newNumber++;
        }
        
        if (empty($changes)) {
            $this->info('All patient numbers are already sequential!');
            return;
        }
        
        $this->info("Changes to be made:");
        $this->table(
            ['ID', 'Patient Name', 'Old Number', 'New Number', 'Created At'],
            $changes
        );
        
        if ($isDryRun) {
            $this->info('Run without --dry-run to apply these changes.');
        } else {
            $this->info('Patient numbers have been fixed successfully!');
        }
    }
}