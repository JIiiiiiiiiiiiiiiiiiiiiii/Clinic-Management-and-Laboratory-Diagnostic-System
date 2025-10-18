<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\SystemWideDataIntegrityService;
use Illuminate\Support\Facades\Artisan;

class FixSystemIssues extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'system:fix 
                            {--component= : Fix specific component (patients, appointments, visits, billing, daily_transactions, pending_appointments, relationships)}
                            {--migrate : Run pending migrations first}
                            {--force : Force fix without confirmation}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Fix all system data integrity issues and database problems';

    protected $dataIntegrityService;

    /**
     * Create a new command instance.
     */
    public function __construct(SystemWideDataIntegrityService $dataIntegrityService)
    {
        parent::__construct();
        $this->dataIntegrityService = $dataIntegrityService;
    }

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('🚀 Starting Comprehensive System Fix...');
        $this->newLine();

        // Check if migrations should be run first
        if ($this->option('migrate')) {
            $this->info('📦 Running pending migrations...');
            try {
                Artisan::call('migrate', ['--force' => true]);
                $this->info('✅ Migrations completed successfully');
            } catch (\Exception $e) {
                $this->error('❌ Migration failed: ' . $e->getMessage());
                return 1;
            }
            $this->newLine();
        }

        // Check if specific component should be fixed
        $component = $this->option('component');
        if ($component) {
            return $this->fixSpecificComponent($component);
        }

        // Fix all issues
        return $this->fixAllIssues();
    }

    /**
     * Fix all system issues
     */
    private function fixAllIssues()
    {
        if (!$this->option('force')) {
            if (!$this->confirm('This will fix all system data integrity issues. Continue?')) {
                $this->info('Operation cancelled.');
                return 0;
            }
        }

        $this->info('🔧 Fixing all system data integrity issues...');
        
        try {
            $result = $this->dataIntegrityService->fixAllDataIntegrityIssues();
            
            if ($result['success']) {
                $this->info('✅ All system issues have been fixed successfully!');
                $this->newLine();
                
                $this->info('📊 Fixed Issues:');
                foreach ($result['fixed_issues'] as $component => $status) {
                    $this->line("  • {$component}: {$status}");
                }
                
                $this->newLine();
                $this->info('🎉 System is now healthy and ready for use!');
                
                return 0;
            } else {
                $this->error('❌ Failed to fix system issues: ' . $result['message']);
                return 1;
            }
            
        } catch (\Exception $e) {
            $this->error('❌ System fix failed: ' . $e->getMessage());
            $this->error('Stack trace: ' . $e->getTraceAsString());
            return 1;
        }
    }

    /**
     * Fix specific component
     */
    private function fixSpecificComponent($component)
    {
        $validComponents = [
            'patients', 'appointments', 'visits', 'billing', 
            'daily_transactions', 'pending_appointments', 'relationships'
        ];

        if (!in_array($component, $validComponents)) {
            $this->error("❌ Invalid component: {$component}");
            $this->info("Valid components: " . implode(', ', $validComponents));
            return 1;
        }

        if (!$this->option('force')) {
            if (!$this->confirm("Fix component '{$component}'?")) {
                $this->info('Operation cancelled.');
                return 0;
            }
        }

        $this->info("🔧 Fixing component: {$component}");

        try {
            $result = $this->dataIntegrityService->{"fix" . ucfirst($component) . "DataIntegrity"}();
            
            if ($result) {
                $this->info("✅ Component '{$component}' fixed successfully!");
                return 0;
            } else {
                $this->error("❌ Failed to fix component '{$component}'");
                return 1;
            }
            
        } catch (\Exception $e) {
            $this->error("❌ Failed to fix component '{$component}': " . $e->getMessage());
            return 1;
        }
    }
}
