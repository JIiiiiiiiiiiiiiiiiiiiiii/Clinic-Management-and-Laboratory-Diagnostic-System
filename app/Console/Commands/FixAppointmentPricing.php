<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Appointment;
use Illuminate\Support\Facades\DB;

class FixAppointmentPricing extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'appointments:fix-pricing';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Fix appointment pricing for existing appointments with ₱0.00 amounts';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting to fix appointment pricing...');

        // Get all appointments with 0.00 price
        $appointments = Appointment::where('price', 0.00)
            ->orWhereNull('price')
            ->get();

        $this->info("Found {$appointments->count()} appointments with incorrect pricing");

        $updatedCount = 0;

        foreach ($appointments as $appointment) {
            $oldPrice = $appointment->price;
            $newPrice = $appointment->calculatePrice();
            
            if ($newPrice > 0) {
                $appointment->update(['price' => $newPrice]);
                $updatedCount++;
                
                $this->line("Updated appointment ID {$appointment->id} ({$appointment->appointment_type}): ₱{$oldPrice} → ₱{$newPrice}");
            }
        }

        $this->info("Successfully updated {$updatedCount} appointments with correct pricing");

        // Show summary by appointment type
        $this->info("\nSummary by appointment type:");
        $summary = DB::table('appointments')
            ->select('appointment_type', DB::raw('COUNT(*) as count'), DB::raw('AVG(price) as avg_price'))
            ->where('price', '>', 0)
            ->groupBy('appointment_type')
            ->get();

        foreach ($summary as $item) {
            $this->line("- {$item->appointment_type}: {$item->count} appointments, avg price: ₱" . number_format($item->avg_price, 2));
        }

        return Command::SUCCESS;
    }
}
