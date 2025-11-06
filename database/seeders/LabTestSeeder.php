<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\LabTest;

class LabTestSeeder extends Seeder
{
    /**
     * Seed common laboratory tests
     */
    public function run(): void
    {
        $labTests = [
            [
                'name' => 'Complete Blood Count (CBC)',
                'code' => 'CBC',
                'description' => 'Measures different components of blood including red blood cells, white blood cells, and platelets',
                'price' => 500.00,
                'is_active' => true,
            ],
            [
                'name' => 'Urinalysis',
                'code' => 'URINALYSIS',
                'description' => 'Examines urine for various cells and chemicals',
                'price' => 500.00,
                'is_active' => true,
            ],
            [
                'name' => 'Fecalysis',
                'code' => 'FECALYSIS',
                'description' => 'Stool examination for parasites, bacteria, and blood',
                'price' => 500.00,
                'is_active' => true,
            ],
            [
                'name' => 'Blood Chemistry',
                'code' => 'BLOOD_CHEM',
                'description' => 'Tests for glucose, cholesterol, and other blood chemicals',
                'price' => 800.00,
                'is_active' => true,
            ],
            [
                'name' => 'Lipid Profile',
                'code' => 'LIPID_PROFILE',
                'description' => 'Measures cholesterol and triglycerides',
                'price' => 600.00,
                'is_active' => true,
            ],
            [
                'name' => 'Liver Function Test (LFT)',
                'code' => 'LFT',
                'description' => 'Tests liver enzyme levels',
                'price' => 700.00,
                'is_active' => true,
            ],
            [
                'name' => 'Kidney Function Test (KFT)',
                'code' => 'KFT',
                'description' => 'Tests kidney function including creatinine and BUN',
                'price' => 700.00,
                'is_active' => true,
            ],
            [
                'name' => 'Blood Typing',
                'code' => 'BLOOD_TYPE',
                'description' => 'Determines ABO and Rh blood type',
                'price' => 300.00,
                'is_active' => true,
            ],
            [
                'name' => 'Hemoglobin A1c',
                'code' => 'HBA1C',
                'description' => 'Measures average blood sugar levels over 3 months',
                'price' => 800.00,
                'is_active' => true,
            ],
            [
                'name' => 'Thyroid Function Test',
                'code' => 'THYROID',
                'description' => 'Tests thyroid hormone levels (TSH, T3, T4)',
                'price' => 1200.00,
                'is_active' => true,
            ],
            [
                'name' => 'Pregnancy Test (HCG)',
                'code' => 'PREGNANCY',
                'description' => 'Detects pregnancy hormone',
                'price' => 200.00,
                'is_active' => true,
            ],
            [
                'name' => 'HIV Screening',
                'code' => 'HIV',
                'description' => 'Tests for HIV antibodies',
                'price' => 1000.00,
                'is_active' => true,
            ],
            [
                'name' => 'Hepatitis Panel',
                'code' => 'HEPATITIS',
                'description' => 'Tests for Hepatitis A, B, and C',
                'price' => 1500.00,
                'is_active' => true,
            ],
            [
                'name' => 'Drug Test',
                'code' => 'DRUG_TEST',
                'description' => 'Screens for drugs of abuse',
                'price' => 800.00,
                'is_active' => true,
            ],
            [
                'name' => 'X-Ray',
                'code' => 'XRAY',
                'description' => 'Radiographic imaging',
                'price' => 700.00,
                'is_active' => true,
            ],
            [
                'name' => 'Ultrasound',
                'code' => 'ULTRASOUND',
                'description' => 'Ultrasound imaging',
                'price' => 800.00,
                'is_active' => true,
            ],
            [
                'name' => 'ECG/EKG',
                'code' => 'ECG',
                'description' => 'Electrocardiogram - heart rhythm test',
                'price' => 500.00,
                'is_active' => true,
            ],
        ];

        foreach ($labTests as $test) {
            LabTest::create($test);
        }

        $this->command->info('Lab tests seeded successfully!');
        $this->command->info('Total lab tests created: ' . LabTest::count());
    }
}
