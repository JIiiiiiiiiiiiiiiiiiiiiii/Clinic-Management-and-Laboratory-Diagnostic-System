<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\LabTest;

class FixLabTestSchemas extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'lab:fix-schemas';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Add fields_schema data to LabTest records';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Fixing LabTest Schemas');
        $this->info('=====================');
        $this->newLine();

        $schemas = [
            'CBC' => [
                'sections' => [
                    'hematology' => [
                        'title' => 'Hematology',
                        'fields' => [
                            'hemoglobin' => [
                                'label' => 'Hemoglobin (g/dL)',
                                'type' => 'number',
                                'unit' => 'g/dL',
                                'reference_range' => '12.0-16.0'
                            ],
                            'hematocrit' => [
                                'label' => 'Hematocrit (%)',
                                'type' => 'number',
                                'unit' => '%',
                                'reference_range' => '36.0-46.0'
                            ],
                            'wbc' => [
                                'label' => 'White Blood Cell Count (x10³/μL)',
                                'type' => 'number',
                                'unit' => 'x10³/μL',
                                'reference_range' => '4.5-11.0'
                            ],
                            'rbc' => [
                                'label' => 'Red Blood Cell Count (x10⁶/μL)',
                                'type' => 'number',
                                'unit' => 'x10⁶/μL',
                                'reference_range' => '4.0-5.2'
                            ],
                            'platelet' => [
                                'label' => 'Platelet Count (x10³/μL)',
                                'type' => 'number',
                                'unit' => 'x10³/μL',
                                'reference_range' => '150-450'
                            ]
                        ]
                    ]
                ]
            ],
            'Urinalysis' => [
                'sections' => [
                    'physical' => [
                        'title' => 'Physical Examination',
                        'fields' => [
                            'color' => [
                                'label' => 'Color',
                                'type' => 'text',
                                'options' => ['Yellow', 'Amber', 'Dark Yellow', 'Clear', 'Cloudy']
                            ],
                            'appearance' => [
                                'label' => 'Appearance',
                                'type' => 'text',
                                'options' => ['Clear', 'Slightly Cloudy', 'Cloudy', 'Turbid']
                            ],
                            'specific_gravity' => [
                                'label' => 'Specific Gravity',
                                'type' => 'number',
                                'reference_range' => '1.005-1.030'
                            ]
                        ]
                    ],
                    'chemical' => [
                        'title' => 'Chemical Examination',
                        'fields' => [
                            'ph' => [
                                'label' => 'pH',
                                'type' => 'number',
                                'reference_range' => '4.5-8.0'
                            ],
                            'protein' => [
                                'label' => 'Protein',
                                'type' => 'text',
                                'options' => ['Negative', 'Trace', '1+', '2+', '3+', '4+']
                            ],
                            'glucose' => [
                                'label' => 'Glucose',
                                'type' => 'text',
                                'options' => ['Negative', 'Trace', '1+', '2+', '3+', '4+']
                            ],
                            'ketones' => [
                                'label' => 'Ketones',
                                'type' => 'text',
                                'options' => ['Negative', 'Trace', '1+', '2+', '3+', '4+']
                            ]
                        ]
                    ],
                    'microscopic' => [
                        'title' => 'Microscopic Examination',
                        'fields' => [
                            'wbc' => [
                                'label' => 'White Blood Cells (per HPF)',
                                'type' => 'number',
                                'unit' => 'per HPF',
                                'reference_range' => '0-5'
                            ],
                            'rbc' => [
                                'label' => 'Red Blood Cells (per HPF)',
                                'type' => 'number',
                                'unit' => 'per HPF',
                                'reference_range' => '0-2'
                            ],
                            'epithelial_cells' => [
                                'label' => 'Epithelial Cells (per HPF)',
                                'type' => 'number',
                                'unit' => 'per HPF',
                                'reference_range' => '0-5'
                            ]
                        ]
                    ]
                ]
            ],
            'Fecalysis' => [
                'sections' => [
                    'physical' => [
                        'title' => 'Physical Examination',
                        'fields' => [
                            'consistency' => [
                                'label' => 'Consistency',
                                'type' => 'text',
                                'options' => ['Formed', 'Soft', 'Loose', 'Watery']
                            ],
                            'color' => [
                                'label' => 'Color',
                                'type' => 'text',
                                'options' => ['Brown', 'Yellow', 'Green', 'Black', 'Red']
                            ],
                            'mucus' => [
                                'label' => 'Mucus',
                                'type' => 'text',
                                'options' => ['Present', 'Absent']
                            ]
                        ]
                    ],
                    'microscopic' => [
                        'title' => 'Microscopic Examination',
                        'fields' => [
                            'wbc' => [
                                'label' => 'White Blood Cells (per HPF)',
                                'type' => 'number',
                                'unit' => 'per HPF',
                                'reference_range' => '0-2'
                            ],
                            'rbc' => [
                                'label' => 'Red Blood Cells (per HPF)',
                                'type' => 'number',
                                'unit' => 'per HPF',
                                'reference_range' => '0'
                            ],
                            'parasites' => [
                                'label' => 'Parasites',
                                'type' => 'text',
                                'options' => ['None', 'Present']
                            ],
                            'bacteria' => [
                                'label' => 'Bacteria',
                                'type' => 'text',
                                'options' => ['Normal', 'Abnormal']
                            ]
                        ]
                    ]
                ]
            ]
        ];

        $updatedCount = 0;

        foreach ($schemas as $testName => $schema) {
            $test = LabTest::where('name', $testName)->first();
            
            if ($test) {
                $test->update(['fields_schema' => $schema]);
                $this->info("Updated {$testName} with schema");
                $updatedCount++;
            } else {
                $this->warn("Test '{$testName}' not found");
            }
        }

        $this->newLine();
        $this->info("Updated {$updatedCount} lab tests with schemas");

        return Command::SUCCESS;
    }
}