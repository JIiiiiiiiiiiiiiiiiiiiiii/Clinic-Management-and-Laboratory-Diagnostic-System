<?php

namespace App\Console\Commands;

use App\Models\Specialist;
use Illuminate\Console\Command;

class CheckSpecialistSchedule extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'schedule:check {specialist_id?}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Check specialist schedule data';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $specialistId = $this->argument('specialist_id');
        
        if ($specialistId) {
            $specialist = Specialist::where('specialist_id', $specialistId)->first();
            
            if (!$specialist) {
                $this->error("Specialist with ID {$specialistId} not found.");
                return 1;
            }
            
            $this->displaySpecialistSchedule($specialist);
        } else {
            $specialists = Specialist::all();
            
            if ($specialists->isEmpty()) {
                $this->info('No specialists found.');
                return 0;
            }
            
            $this->info('All Specialists and their Schedules:');
            $this->newLine();
            
            foreach ($specialists as $specialist) {
                $this->displaySpecialistSchedule($specialist);
                $this->newLine();
            }
        }
        
        return 0;
    }
    
    private function displaySpecialistSchedule(Specialist $specialist)
    {
        $this->info("Specialist: {$specialist->name} (ID: {$specialist->specialist_id})");
        $this->info("Role: {$specialist->role}");
        $this->info("Status: {$specialist->status}");
        
        if ($specialist->schedule_data) {
            $this->info("Schedule Data:");
            $this->line(json_encode($specialist->schedule_data, JSON_PRETTY_PRINT));
            
            // Display human-readable schedule
            $this->newLine();
            $this->info("Human-readable Schedule:");
            $days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
            
            foreach ($days as $day) {
                $times = $specialist->schedule_data[$day] ?? [];
                $dayName = ucfirst($day);
                
                if (empty($times)) {
                    $this->line("  {$dayName}: Off");
                } else {
                    $this->line("  {$dayName}: " . implode(', ', $times));
                }
            }
        } else {
            $this->warn("No schedule data found for this specialist.");
        }
    }
}