<?php

namespace App\Exports;

use App\Models\LabOrder;
use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Illuminate\Support\Collection;

class LabOrderResultsExport extends BaseExport implements FromArray, WithHeadings
{
    public function __construct(private LabOrder $order)
    {
        parent::__construct('Lab Order Results');
    }

    public function array(): array
    {
        $this->order->loadMissing(['patient', 'visit', 'results.test', 'results.values']);

        $rows = [];
        $patient = $this->order->patient;

        foreach ($this->order->results as $result) {
            $test = $result->test; // may be null if misconfigured
            $flatResults = $result->values && count($result->values) > 0
                ? $this->joinValues($result->values)
                : $this->flattenResults($result->results ?? []);
            $reference = $result->values && count($result->values) > 0
                ? $this->joinReferences($result->values)
                : $this->referenceRangesFor($test, $result->results ?? []);
            $rows[] = [
                'Order ID' => $this->order->id,
                'Patient No' => $patient?->id,
                'Patient Name' => $patient ? ($patient->last_name . ', ' . $patient->first_name) : 'N/A',
                'Visit ID' => $this->order->visit?->id,
                'Visit Date' => optional($this->order->visit?->arrival_date)->format('Y-m-d'),
                'Test' => $test->name ?? 'Unknown Test',
                'Code' => $test->code ?? '',
                'Parameters' => $flatResults,
                'Reference Ranges' => $reference,
                'Verified By' => $result->verified_by ?? '',
                'Verified At' => optional($result->verified_at)->format('Y-m-d H:i:s'),
            ];
        }

        return $rows;
    }

    public function headings(): array
    {
        return [
            'Order ID',
            'Patient No',
            'Patient Name',
            'Visit ID',
            'Visit Date',
            'Test',
            'Code',
            'Parameters',
            'Reference Ranges',
            'Verified By',
            'Verified At',
        ];
    }


    public function collection(): Collection
    {
        $this->order->loadMissing(['patient', 'visit', 'results.test', 'results.values']);

        $rows = [];
        $patient = $this->order->patient;

        foreach ($this->order->results as $result) {
            $test = $result->test; // may be null if misconfigured
            $flatResults = $result->values && count($result->values) > 0
                ? $this->joinValues($result->values)
                : $this->flattenResults($result->results ?? []);
            $reference = $result->values && count($result->values) > 0
                ? $this->joinReferences($result->values)
                : $this->referenceRangesFor($test, $result->results ?? []);
            
            $rows[] = (object) [
                'Order ID' => $this->order->id,
                'Patient No' => $patient?->id,
                'Patient Name' => $patient ? ($patient->last_name . ', ' . $patient->first_name) : 'N/A',
                'Visit ID' => $this->order->visit?->id,
                'Visit Date' => optional($this->order->visit?->arrival_date)->format('Y-m-d'),
                'Test' => $test->name ?? 'Unknown Test',
                'Code' => $test->code ?? '',
                'Parameters' => $flatResults,
                'Reference Ranges' => $reference,
                'Verified By' => $result->verified_by ?? '',
                'Verified At' => optional($result->verified_at)->format('Y-m-d H:i:s'),
            ];
        }

        return collect($rows);
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

    private function joinValues($values): string
    {
        $parts = [];
        foreach ($values as $v) {
            $label = $v->parameter_label ?: $v->parameter_key;
            $val = trim(($v->value ?? '') . ' ' . ($v->unit ?? ''));
            $parts[] = $label . '=' . $val;
        }
        return implode('; ', $parts);
    }

    private function joinReferences($values): string
    {
        $parts = [];
        foreach ($values as $v) {
            $label = $v->parameter_label ?: $v->parameter_key;
            $range = $v->reference_text ?: trim(($v->reference_min ?? '') . '-' . ($v->reference_max ?? ''));
            if ($range !== '') {
                $parts[] = $label . ':' . $range;
            }
        }
        return implode('; ', $parts);
    }

    private function referenceRangesFor(?\App\Models\LabTest $test, array $results): string
    {
        if (!$test || empty($test->fields_schema) || empty($results)) {
            return '';
        }
        $schema = $test->fields_schema;
        $ranges = [];

        $walker = function (array $arr, string $prefix = '') use (&$ranges, &$schema, &$walker) {
            foreach ($arr as $key => $value) {
                $path = $prefix === '' ? (string) $key : $prefix . '.' . $key;
                if (is_array($value)) {
                    $walker($value, $path);
                } else {
                    // path like section.field -> look up in schema
                    $parts = explode('.', $path);
                    if (count($parts) >= 2 && isset($schema['sections'][$parts[0]]['fields'][$parts[1]])) {
                        $field = $schema['sections'][$parts[0]]['fields'][$parts[1]];
                        $min = $field['min'] ?? null;
                        $max = $field['max'] ?? null;
                        $unit = $field['unit'] ?? null;
                        if ($min !== null || $max !== null) {
                            $ranges[] = $path . ':' . ($min !== null ? $min : '') . '-' . ($max !== null ? $max : '') . ($unit ? ' ' . $unit : '');
                        } elseif (!empty($field['range'])) {
                            $ranges[] = $path . ':' . (string) $field['range'];
                        }
                    }
                }
            }
        };
        $walker($results);
        return implode('; ', $ranges);
    }
}


