<?php

namespace App\Exports;

use App\Models\LabOrder;
use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithHeadings;

class LabOrderResultsExport implements FromArray, WithHeadings
{
    public function __construct(private LabOrder $order)
    {
    }

    public function array(): array
    {
        $this->order->loadMissing(['patient', 'results.test']);

        $rows = [];
        $patient = $this->order->patient;

        foreach ($this->order->results as $result) {
            $test = $result->test; // may be null if misconfigured
            $flatResults = $this->flattenResults($result->results ?? []);
            $rows[] = [
                'Order ID' => $this->order->id,
                'Patient No' => $patient?->id,
                'Patient Name' => $patient ? ($patient->last_name . ', ' . $patient->first_name) : 'N/A',
                'Test' => $test->name ?? 'Unknown Test',
                'Code' => $test->code ?? '',
                'Parameters' => $flatResults,
                'Verified By' => $result->verified_by ?? '',
                'Verified At' => optional($result->verified_at)->format('Y-m-d H:i:s'),
            ];
        }

        return $rows;
    }

    public function headings(): array
    {
        return ['Order ID', 'Patient No', 'Patient Name', 'Test', 'Code', 'Parameters', 'Verified By', 'Verified At'];
    }

    private function flattenResults(array $results): string
    {
        $parts = [];
        $iterator = function (array $arr, string $prefix = '') use (&$parts, &$iterator) {
            foreach ($arr as $key => $value) {
                $path = $prefix === '' ? (string) $key : $prefix . '.' . $key;
                if (is_array($value)) {
                    $iterator($value, $path);
                } else {
                    $parts[] = $path . '=' . (string) $value;
                }
            }
        };
        $iterator($results);
        return implode('; ', $parts);
    }
}


