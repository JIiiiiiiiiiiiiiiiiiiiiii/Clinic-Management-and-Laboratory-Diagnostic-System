<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Maatwebsite\Excel\Facades\Excel;
use Barryvdh\DomPDF\Facade\Pdf;
use App\Exports\ArrayExport;

class TestExport extends Command
{
    protected $signature = 'test:export';
    protected $description = 'Test export functionality';

    public function handle()
    {
        $this->info('Testing export functionality...');
        
        // Test data
        $testData = [
            [
                'Type' => 'Billing Transaction',
                'Transaction ID' => 'TXN-001',
                'Patient Name' => 'John Doe',
                'Specialist' => 'Dr. Smith',
                'Amount' => 500.00,
                'Payment Method' => 'Cash',
                'Status' => 'Paid',
                'Description' => 'Test transaction',
                'Time' => '2024-01-01 10:00:00',
                'Items Count' => 1,
                'Appointments Count' => 0,
            ]
        ];

        try {
            // Test Excel export
            $this->info('Testing Excel export...');
            $excelPath = storage_path('app/test-export.xlsx');
            Excel::store(new ArrayExport($testData, 'Test Export'), 'test-export.xlsx');
            $this->info('Excel export successful: ' . $excelPath);
            
            // Test PDF export
            $this->info('Testing PDF export...');
            $html = $this->buildHtmlTable('Test Export', $testData);
            $pdf = Pdf::loadHTML($html);
            $pdfPath = storage_path('app/test-export.pdf');
            $pdf->save($pdfPath);
            $this->info('PDF export successful: ' . $pdfPath);
            
            $this->info('All exports working correctly!');
            
        } catch (\Exception $e) {
            $this->error('Export failed: ' . $e->getMessage());
            $this->error('Stack trace: ' . $e->getTraceAsString());
        }
    }

    private function buildHtmlTable($title, $data)
    {
        $html = '<html><head><title>' . $title . '</title></head><body>';
        $html .= '<h1>' . $title . '</h1>';
        $html .= '<table border="1" cellpadding="5" cellspacing="0" style="width:100%; border-collapse: collapse;">';
        
        if (!empty($data)) {
            // Header
            $html .= '<tr style="background-color: #f5f5f5;">';
            foreach (array_keys($data[0]) as $header) {
                $html .= '<th>' . $header . '</th>';
            }
            $html .= '</tr>';
            
            // Data rows
            foreach ($data as $row) {
                $html .= '<tr>';
                foreach ($row as $cell) {
                    $html .= '<td>' . $cell . '</td>';
                }
                $html .= '</tr>';
            }
        }
        
        $html .= '</table></body></html>';
        return $html;
    }
}