<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\HmoProvider;
use App\Models\HmoPatientCoverage;
use App\Models\HmoClaim;
use App\Models\BillingTransaction;
use App\Models\Patient;
use App\Models\User;
use Carbon\Carbon;

class HmoSampleDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get existing HMO providers
        $maxicare = HmoProvider::where('name', 'like', '%Maxicare%')->first();
        $philhealth = HmoProvider::where('name', 'like', '%PhilHealth%')->first();
        $intellicare = HmoProvider::where('name', 'like', '%Intellicare%')->first();

        if (!$maxicare || !$philhealth || !$intellicare) {
            $this->command->error('HMO providers not found. Please run HmoProviderSeeder first.');
            return;
        }

        // Get some patients
        $patients = Patient::limit(5)->get();
        if ($patients->isEmpty()) {
            $this->command->error('No patients found. Please create some patients first.');
            return;
        }

        // Create HMO patient coverage records
        $coverages = [];
        foreach ($patients as $index => $patient) {
            $providers = [$maxicare, $philhealth, $intellicare];
            $provider = $providers[$index % count($providers)];
            
            $coverage = HmoPatientCoverage::create([
                'patient_id' => $patient->id,
                'hmo_provider_id' => $provider->id,
                'member_id' => 'M' . str_pad($patient->id + 1000, 6, '0', STR_PAD_LEFT),
                'policy_number' => 'POL-' . str_pad($patient->id, 8, '0', STR_PAD_LEFT),
                'group_number' => 'GRP-' . str_pad($provider->id, 4, '0', STR_PAD_LEFT),
                'coverage_start_date' => now()->subMonths(6),
                'coverage_end_date' => now()->addMonths(6),
                'annual_limit' => 50000.00,
                'used_amount' => rand(5000, 15000),
                'remaining_amount' => 50000.00 - rand(5000, 15000),
                'status' => 'active',
                'notes' => 'Active coverage for patient',
            ]);
            
            $coverages[] = $coverage;
        }

        // Create some HMO billing transactions
        $hmoTransactions = [];
        foreach ($patients as $index => $patient) {
            $provider = $coverages[$index % count($coverages)];
            
            $transaction = BillingTransaction::create([
                'transaction_id' => 'TXN-HMO-' . str_pad($index + 1000, 6, '0', STR_PAD_LEFT),
                'patient_id' => $patient->id,
                'doctor_id' => 1, // Assuming doctor with ID 1 exists
                'payment_type' => 'cash',
                'total_amount' => rand(1000, 5000),
                'amount' => rand(1000, 5000),
                'discount_amount' => 0,
                'payment_method' => 'hmo',
                'payment_reference' => 'HMO-REF-' . str_pad($index + 1, 6, '0', STR_PAD_LEFT),
                'status' => 'paid',
                'description' => 'HMO payment for medical services',
                'notes' => 'HMO transaction',
                'transaction_date' => now()->subDays(rand(1, 30)),
                'transaction_date_only' => now()->subDays(rand(1, 30))->toDateString(),
                'transaction_time_only' => now()->subDays(rand(1, 30))->toTimeString(),
                'hmo_provider' => $provider->hmoProvider->name,
                'hmo_reference_number' => 'HMO-' . str_pad($index + 1000, 6, '0', STR_PAD_LEFT),
                'created_by' => 1,
            ]);
            
            $hmoTransactions[] = $transaction;
        }

        // Create HMO claims
        foreach ($hmoTransactions as $index => $transaction) {
            $coverage = $coverages[$index % count($coverages)];
            
            $claim = HmoClaim::create([
                'claim_number' => 'CLM-' . str_pad($index + 1000, 6, '0', STR_PAD_LEFT),
                'billing_transaction_id' => $transaction->id,
                'hmo_provider_id' => $coverage->hmo_provider_id,
                'patient_id' => $transaction->patient_id,
                'member_id' => $coverage->member_id,
                'claim_amount' => $transaction->total_amount,
                'approved_amount' => $transaction->total_amount * 0.8, // 80% approval
                'rejected_amount' => $transaction->total_amount * 0.2, // 20% rejection
                'status' => rand(0, 1) ? 'approved' : 'submitted',
                'submission_date' => $transaction->transaction_date,
                'review_date' => $transaction->transaction_date->addDays(rand(1, 5)),
                'approval_date' => $transaction->transaction_date->addDays(rand(3, 10)),
                'payment_date' => $transaction->transaction_date->addDays(rand(5, 15)),
                'rejection_reason' => rand(0, 1) ? 'Insufficient documentation' : null,
                'notes' => 'HMO claim for medical services',
                'hmo_reference_number' => $transaction->hmo_reference_number,
                'submitted_by' => 1,
                'reviewed_by' => 1,
            ]);
        }

        $this->command->info('HMO sample data created successfully!');
        $this->command->info('Created:');
        $this->command->info('- ' . count($coverages) . ' patient coverage records');
        $this->command->info('- ' . count($hmoTransactions) . ' HMO billing transactions');
        $this->command->info('- ' . count($hmoTransactions) . ' HMO claims');
    }
}
