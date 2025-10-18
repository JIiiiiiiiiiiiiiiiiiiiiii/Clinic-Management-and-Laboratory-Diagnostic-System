<?php

namespace App\Console\Commands;

use App\Models\Patient;
use Illuminate\Console\Command;

class CheckPatientNumbers extends Command
{
    protected $signature = 'patients:check-numbers';
    protected $description = 'Check current patient numbers and display them';

    public function handle()
    {
        $patients = Patient::orderByRaw('CAST(patient_no AS UNSIGNED)')->get(['patient_id', 'patient_no', 'first_name', 'last_name', 'created_at']);
        
        $this->info('Current patient numbers:');
        $this->table(
            ['ID', 'Patient No', 'Name', 'Created At'],
            $patients->map(function ($patient) {
                return [
                    $patient->id,
                    $patient->patient_no,
                    $patient->first_name . ' ' . $patient->last_name,
                    $patient->created_at->format('Y-m-d H:i:s')
                ];
            })->toArray()
        );
        
        // Check if numbers are sequential
        $numbers = $patients->pluck('patient_no')->map(function ($no) {
            return (int) $no;
        })->sort()->values()->toArray();
        
        $expected = 1;
        $gaps = [];
        
        foreach ($numbers as $number) {
            if ($number !== $expected) {
                $gaps[] = "Missing: $expected, Found: $number";
            }
            $expected = $number + 1;
        }
        
        if (empty($gaps)) {
            $this->info('✅ Patient numbers are sequential!');
        } else {
            $this->warn('❌ Patient numbers have gaps:');
            foreach ($gaps as $gap) {
                $this->warn("  - $gap");
            }
        }
    }
}
