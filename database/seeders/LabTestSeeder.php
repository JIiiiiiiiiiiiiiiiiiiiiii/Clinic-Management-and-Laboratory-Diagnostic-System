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

                'fields_schema' => [
                    'sections' => [
                        'physical_examination' => [
                            'title' => 'Physical Examination',
                            'fields' => [
                                'color' => [
                                    'label' => 'Color',
                                    'type' => 'select',
                                    'options' => ['Yellow', 'Amber', 'Dark Yellow', 'Red', 'Brown', 'Clear'],
                                    'required' => true
                                ],
                                'clarity' => [
                                    'label' => 'Clarity',
                                    'type' => 'select',
                                    'options' => ['Clear', 'Slightly Hazy', 'Hazy', 'Cloudy', 'Turbid'],
                                    'required' => true
                                ],
                                'specific_gravity' => [
                                    'label' => 'Specific Gravity',
                                    'type' => 'number',
                                    'unit' => '',
                                    'range' => [1.003, 1.030],
                                    'required' => true
                                ]
                            ]
                        ],
                        'chemical_examination' => [
                            'title' => 'Chemical Examination',
                            'fields' => [
                                'ph' => [
                                    'label' => 'pH',
                                    'type' => 'number',
                                    'unit' => '',
                                    'range' => [4.5, 8.0],
                                    'required' => true
                                ],
                                'protein' => [
                                    'label' => 'Protein',
                                    'type' => 'select',
                                    'options' => ['Negative', 'Trace', '1+', '2+', '3+', '4+'],
                                    'required' => true
                                ],
                                'glucose' => [
                                    'label' => 'Glucose',
                                    'type' => 'select',
                                    'options' => ['Negative', 'Trace', '1+', '2+', '3+', '4+'],
                                    'required' => true
                                ],
                                'ketones' => [
                                    'label' => 'Ketones',
                                    'type' => 'select',
                                    'options' => ['Negative', 'Trace', '1+', '2+', '3+', '4+'],
                                    'required' => true
                                ],
                                'blood' => [
                                    'label' => 'Blood',
                                    'type' => 'select',
                                    'options' => ['Negative', 'Trace', '1+', '2+', '3+', '4+'],
                                    'required' => true
                                ],
                                'bilirubin' => [
                                    'label' => 'Bilirubin',
                                    'type' => 'select',
                                    'options' => ['Negative', 'Trace', '1+', '2+', '3+', '4+'],
                                    'required' => true
                                ],
                                'urobilinogen' => [
                                    'label' => 'Urobilinogen',
                                    'type' => 'select',
                                    'options' => ['Negative', 'Trace', '1+', '2+', '3+', '4+'],
                                    'required' => true
                                ],
                                'nitrite' => [
                                    'label' => 'Nitrite',
                                    'type' => 'select',
                                    'options' => ['Negative', 'Positive'],
                                    'required' => true
                                ],
                                'leukocyte_esterase' => [
                                    'label' => 'Leukocyte Esterase',
                                    'type' => 'select',
                                    'options' => ['Negative', 'Trace', '1+', '2+', '3+', '4+'],
                                    'required' => true
                                ]
                            ]
                        ],
                        'microscopic_examination' => [
                            'title' => 'Microscopic Examination',
                            'fields' => [
                                'rbc' => [
                                    'label' => 'Red Blood Cells',
                                    'type' => 'number',
                                    'unit' => '/hpf',
                                    'range' => [0, 3],
                                    'required' => true
                                ],
                                'wbc' => [
                                    'label' => 'White Blood Cells',
                                    'type' => 'number',
                                    'unit' => '/hpf',
                                    'range' => [0, 5],
                                    'required' => true
                                ],
                                'epithelial_cells' => [
                                    'label' => 'Epithelial Cells',
                                    'type' => 'select',
                                    'options' => ['None', 'Few', 'Moderate', 'Many'],
                                    'required' => true
                                ],
                                'bacteria' => [
                                    'label' => 'Bacteria',
                                    'type' => 'select',
                                    'options' => ['None', 'Few', 'Moderate', 'Many'],
                                    'required' => true
                                ],
                                'casts' => [
                                    'label' => 'Casts',
                                    'type' => 'select',
                                    'options' => ['None', 'Hyaline', 'Granular', 'Waxy', 'RBC', 'WBC'],
                                    'required' => true
                                ],
                                'crystals' => [
                                    'label' => 'Crystals',
                                    'type' => 'select',
                                    'options' => ['None', 'Calcium Oxalate', 'Uric Acid', 'Triple Phosphate', 'Amorphous'],
                                    'required' => true
                                ]
                            ]
                        ]
                    ]
                ],
            ],
            [
                'name' => 'Complete Blood Count',
                'code' => 'CBC',
                'fields_schema' => [
                    'sections' => [
                        'red_blood_cells' => [
                            'title' => 'Red Blood Cells',
                            'fields' => [
                                'hemoglobin' => [
                                    'label' => 'Hemoglobin',
                                    'type' => 'number',
                                    'unit' => 'g/dL',
                                    'range' => [12.0, 16.0],
                                    'required' => true
                                ],
                                'hematocrit' => [
                                    'label' => 'Hematocrit',
                                    'type' => 'number',
                                    'unit' => '%',
                                    'range' => [36.0, 46.0],
                                    'required' => true
                                ],
                                'rbc_count' => [
                                    'label' => 'RBC Count',
                                    'type' => 'number',
                                    'unit' => 'x10^12/L',
                                    'range' => [4.0, 5.2],
                                    'required' => true
                                ],
                                'mcv' => [
                                    'label' => 'MCV',
                                    'type' => 'number',
                                    'unit' => 'fL',
                                    'range' => [80.0, 100.0],
                                    'required' => true
                                ],
                                'mch' => [
                                    'label' => 'MCH',
                                    'type' => 'number',
                                    'unit' => 'pg',
                                    'range' => [27.0, 32.0],
                                    'required' => true
                                ],
                                'mchc' => [
                                    'label' => 'MCHC',
                                    'type' => 'number',
                                    'unit' => 'g/dL',
                                    'range' => [32.0, 36.0],
                                    'required' => true
                                ]
                            ]
                        ],
                        'white_blood_cells' => [
                            'title' => 'White Blood Cells',
                            'fields' => [
                                'wbc_count' => [
                                    'label' => 'WBC Count',
                                    'type' => 'number',
                                    'unit' => 'x10^9/L',
                                    'range' => [4.0, 11.0],
                                    'required' => true
                                ],
                                'neutrophils' => [
                                    'label' => 'Neutrophils',
                                    'type' => 'number',
                                    'unit' => '%',
                                    'range' => [40.0, 74.0],
                                    'required' => true
                                ],
                                'lymphocytes' => [
                                    'label' => 'Lymphocytes',
                                    'type' => 'number',
                                    'unit' => '%',
                                    'range' => [19.0, 48.0],
                                    'required' => true
                                ],
                                'monocytes' => [
                                    'label' => 'Monocytes',
                                    'type' => 'number',
                                    'unit' => '%',
                                    'range' => [3.4, 9.0],
                                    'required' => true
                                ],
                                'eosinophils' => [
                                    'label' => 'Eosinophils',
                                    'type' => 'number',
                                    'unit' => '%',
                                    'range' => [0.0, 7.0],
                                    'required' => true
                                ],
                                'basophils' => [
                                    'label' => 'Basophils',
                                    'type' => 'number',
                                    'unit' => '%',
                                    'range' => [0.0, 1.5],
                                    'required' => true
                                ]
                            ]
                        ],
                        'platelets' => [
                            'title' => 'Platelets',
                            'fields' => [
                                'platelet_count' => [
                                    'label' => 'Platelet Count',
                                    'type' => 'number',
                                    'unit' => 'x10^9/L',
                                    'range' => [150.0, 450.0],
                                    'required' => true
                                ],
                                'mpv' => [
                                    'label' => 'MPV',
                                    'type' => 'number',
                                    'unit' => 'fL',
                                    'range' => [7.0, 12.0],
                                    'required' => true
                                ]
                            ]
                        ]
                    ]
                ],
            ],
            [
                'name' => 'Fecalysis',
                'code' => 'FECALYSIS',
                'fields_schema' => [
                    'sections' => [
                        'physical_examination' => [
                            'title' => 'Physical Examination',
                            'fields' => [
                                'consistency' => [
                                    'label' => 'Consistency',
                                    'type' => 'select',
                                    'options' => ['Formed', 'Soft', 'Loose', 'Watery', 'Hard'],
                                    'required' => true
                                ],
                                'color' => [
                                    'label' => 'Color',
                                    'type' => 'select',
                                    'options' => ['Brown', 'Yellow', 'Green', 'Black', 'Red', 'Clay-colored'],
                                    'required' => true
                                ],
                                'odor' => [
                                    'label' => 'Odor',
                                    'type' => 'select',
                                    'options' => ['Normal', 'Foul', 'Pungent', 'Sweet'],
                                    'required' => true
                                ],
                                'amount' => [
                                    'label' => 'Amount',
                                    'type' => 'select',
                                    'options' => ['Small', 'Moderate', 'Large'],
                                    'required' => true
                                ]
                            ]
                        ],
                        'chemical_examination' => [
                            'title' => 'Chemical Examination',
                            'fields' => [
                                'occult_blood' => [
                                    'label' => 'Occult Blood',
                                    'type' => 'select',
                                    'options' => ['Negative', 'Positive'],
                                    'required' => true
                                ],
                                'ph' => [
                                    'label' => 'pH',
                                    'type' => 'number',
                                    'unit' => '',
                                    'range' => [6.0, 8.0],
                                    'required' => true
                                ],
                                'fat' => [
                                    'label' => 'Fat',
                                    'type' => 'select',
                                    'options' => ['Negative', 'Trace', '1+', '2+', '3+'],
                                    'required' => true
                                ],
                                'reducing_substances' => [
                                    'label' => 'Reducing Substances',
                                    'type' => 'select',
                                    'options' => ['Negative', 'Trace', '1+', '2+', '3+'],
                                    'required' => true
                                ]
                            ]
                        ],
                        'microscopic_examination' => [
                            'title' => 'Microscopic Examination',
                            'fields' => [
                                'parasites' => [
                                    'label' => 'Parasites',
                                    'type' => 'select',
                                    'options' => ['None', 'Ascaris lumbricoides', 'Trichuris trichiura', 'Hookworm', 'Entamoeba histolytica', 'Giardia lamblia'],
                                    'required' => true
                                ],
                                'ova' => [
                                    'label' => 'Ova',
                                    'type' => 'select',
                                    'options' => ['None', 'Few', 'Moderate', 'Many'],
                                    'required' => true
                                ],
                                'cysts' => [
                                    'label' => 'Cysts',
                                    'type' => 'select',
                                    'options' => ['None', 'Few', 'Moderate', 'Many'],
                                    'required' => true
                                ],
                                'bacteria' => [
                                    'label' => 'Bacteria',
                                    'type' => 'select',
                                    'options' => ['Normal', 'Increased', 'Decreased'],
                                    'required' => true
                                ],
                                'yeast' => [
                                    'label' => 'Yeast',
                                    'type' => 'select',
                                    'options' => ['None', 'Few', 'Moderate', 'Many'],
                                    'required' => true
                                ],
                                'undigested_food' => [
                                    'label' => 'Undigested Food',
                                    'type' => 'select',
                                    'options' => ['None', 'Few', 'Moderate', 'Many'],
                                    'required' => true
                                ]
                            ]
                        ]
                    ]
                ],
            ],
        ];

        foreach ($tests as $t) {
            LabTest::updateOrCreate(['code' => $t['code']], [
                'name' => $t['name'],
                'fields_schema' => $t['fields_schema'],
                'is_active' => true,
            ]);
        }
    }
}


