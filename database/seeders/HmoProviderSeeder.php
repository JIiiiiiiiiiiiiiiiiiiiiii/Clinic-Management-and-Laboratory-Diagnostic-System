<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\HmoProvider;

class HmoProviderSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $hmoProviders = [
            [
                'name' => 'Maxicare Healthcare Corporation',
                'code' => 'MAXI',
                'description' => 'Leading HMO provider in the Philippines',
                'contact_number' => '+63-2-8888-8888',
                'email' => 'claims@maxicare.com.ph',
                'address' => 'Maxicare Building, Ortigas Center, Pasig City',
                'is_active' => true,
            ],
            [
                'name' => 'PhilHealth',
                'code' => 'PHIL',
                'description' => 'Philippine Health Insurance Corporation',
                'contact_number' => '+63-2-8441-7442',
                'email' => 'claims@philhealth.gov.ph',
                'address' => 'PhilHealth Building, East Avenue, Quezon City',
                'is_active' => true,
            ],
            [
                'name' => 'Intellicare',
                'code' => 'INTEL',
                'description' => 'Intellicare Health Care Inc.',
                'contact_number' => '+63-2-8888-9999',
                'email' => 'claims@intellicare.com.ph',
                'address' => 'Intellicare Building, Makati City',
                'is_active' => true,
            ],
            [
                'name' => 'MediCard Philippines',
                'code' => 'MEDI',
                'description' => 'MediCard Philippines Inc.',
                'contact_number' => '+63-2-8888-7777',
                'email' => 'claims@medicard.com.ph',
                'address' => 'MediCard Building, Taguig City',
                'is_active' => true,
            ],
            [
                'name' => 'Avega Healthcare',
                'code' => 'AVEGA',
                'description' => 'Avega Healthcare Corporation',
                'contact_number' => '+63-2-8888-6666',
                'email' => 'claims@avega.com.ph',
                'address' => 'Avega Building, Mandaluyong City',
                'is_active' => true,
            ],
            [
                'name' => 'Cocolife',
                'code' => 'COCO',
                'description' => 'Cocolife Healthcare',
                'contact_number' => '+63-2-8888-5555',
                'email' => 'claims@cocolife.com.ph',
                'address' => 'Cocolife Building, Quezon City',
                'is_active' => false,
            ]
        ];

        foreach ($hmoProviders as $provider) {
            HmoProvider::create($provider);
        }
    }
}
