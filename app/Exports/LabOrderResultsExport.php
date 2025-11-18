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
            
            // Get patient type for range determination
            $patientType = $this->getPatientType($patient);
            
            if ($result->values && count($result->values) > 0) {
                // Use structured values - create one row per parameter
                foreach ($result->values as $value) {
                    $parameter = $value->parameter_label ?: $value->parameter_key;
                    $resultValue = $value->value ?? '';
                    $unit = $value->unit ?? 'N/A';
                    $referenceRange = $this->getReferenceRangeForValue($value, $test, $patientType);
                    $status = $this->determineStatus($value, $test, $patientType);
                    
                    $rows[] = [
                        'Order ID' => $this->order->id,
                        'Patient No' => $patient?->id,
                        'Patient Name' => $patient ? ($patient->last_name . ', ' . $patient->first_name) : 'N/A',
                        'Visit ID' => $this->order->visit?->id,
                        'Visit Date' => optional($this->order->visit?->visit_date_time)->format('Y-m-d'),
                        'Test' => $test->name ?? 'Unknown Test',
                        'Code' => $test->code ?? '',
                        'Parameter' => $parameter,
                        'Result' => $resultValue,
                        'Unit' => $unit,
                        'Reference Range' => $referenceRange,
                        'Status' => $status,
                        'Verified By' => $result->verified_by ?? '',
                        'Verified At' => optional($result->verified_at)->format('Y-m-d H:i:s'),
                    ];
                }
            } else {
                // Fallback to flattened format for legacy data
                $flatResults = $this->flattenResults($result->results ?? []);
                $reference = $this->referenceRangesFor($test, $result->results ?? []);
                $rows[] = [
                    'Order ID' => $this->order->id,
                    'Patient No' => $patient?->id,
                    'Patient Name' => $patient ? ($patient->last_name . ', ' . $patient->first_name) : 'N/A',
                    'Visit ID' => $this->order->visit?->id,
                    'Visit Date' => optional($this->order->visit?->visit_date_time)->format('Y-m-d'),
                    'Test' => $test->name ?? 'Unknown Test',
                    'Code' => $test->code ?? '',
                    'Parameter' => 'All Parameters',
                    'Result' => $flatResults,
                    'Unit' => 'N/A',
                    'Reference Range' => $reference,
                    'Status' => 'N/A',
                    'Verified By' => $result->verified_by ?? '',
                    'Verified At' => optional($result->verified_at)->format('Y-m-d H:i:s'),
                ];
            }
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
            'Parameter',
            'Result',
            'Unit',
            'Reference Range',
            'Status',
            'Verified By',
            'Verified At',
        ];
    }


    public function collection(): Collection
    {
        $this->order->loadMissing(['patient', 'visit', 'results.test', 'results.values']);

        $rows = [];
        $patient = $this->order->patient;
        $patientType = $this->getPatientType($patient);

        foreach ($this->order->results as $result) {
            $test = $result->test; // may be null if misconfigured
            
            if ($result->values && count($result->values) > 0) {
                // Use structured values - create one row per parameter
                foreach ($result->values as $value) {
                    $parameter = $value->parameter_label ?: $value->parameter_key;
                    $resultValue = $value->value ?? '';
                    $unit = $value->unit ?? 'N/A';
                    $referenceRange = $this->getReferenceRangeForValue($value, $test, $patientType);
                    $status = $this->determineStatus($value, $test, $patientType);
                    
                    $rows[] = (object) [
                        'Order ID' => $this->order->id,
                        'Patient No' => $patient?->id,
                        'Patient Name' => $patient ? ($patient->last_name . ', ' . $patient->first_name) : 'N/A',
                        'Visit ID' => $this->order->visit?->id,
                        'Visit Date' => optional($this->order->visit?->visit_date_time)->format('Y-m-d'),
                        'Test' => $test->name ?? 'Unknown Test',
                        'Code' => $test->code ?? '',
                        'Parameter' => $parameter,
                        'Result' => $resultValue,
                        'Unit' => $unit,
                        'Reference Range' => $referenceRange,
                        'Status' => $status,
                        'Verified By' => $result->verified_by ?? '',
                        'Verified At' => optional($result->verified_at)->format('Y-m-d H:i:s'),
                    ];
                }
            } else {
                // Fallback to flattened format for legacy data
                $flatResults = $this->flattenResults($result->results ?? []);
                $reference = $this->referenceRangesFor($test, $result->results ?? []);
                $rows[] = (object) [
                    'Order ID' => $this->order->id,
                    'Patient No' => $patient?->id,
                    'Patient Name' => $patient ? ($patient->last_name . ', ' . $patient->first_name) : 'N/A',
                    'Visit ID' => $this->order->visit?->id,
                    'Visit Date' => optional($this->order->visit?->visit_date_time)->format('Y-m-d'),
                    'Test' => $test->name ?? 'Unknown Test',
                    'Code' => $test->code ?? '',
                    'Parameter' => 'All Parameters',
                    'Result' => $flatResults,
                    'Unit' => 'N/A',
                    'Reference Range' => $reference,
                    'Status' => 'N/A',
                    'Verified By' => $result->verified_by ?? '',
                    'Verified At' => optional($result->verified_at)->format('Y-m-d H:i:s'),
                ];
            }
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

    /**
     * Get patient type based on age and gender
     */
    private function getPatientType($patient): ?string
    {
        if (!$patient || !$patient->birthdate) {
            return null;
        }
        
        $age = \Carbon\Carbon::parse($patient->birthdate)->age;
        $gender = $patient->sex ?? $patient->gender ?? null;
        
        if ($age < 18) {
            return 'child';
        }
        if ($age >= 60) {
            return 'senior';
        }
        if ($gender && (strtolower($gender) === 'male' || strtolower($gender) === 'm')) {
            return 'male';
        }
        return 'female';
    }

    /**
     * Get reference range for a specific value
     */
    private function getReferenceRangeForValue($value, $test, $patientType): string
    {
        // If reference_text is set, use it (for dropdowns)
        if (!empty($value->reference_text)) {
            return $value->reference_text;
        }
        
        // If reference_min and reference_max are set, format them
        if (!empty($value->reference_min) || !empty($value->reference_max)) {
            $min = $value->reference_min ?? '';
            $max = $value->reference_max ?? '';
            return trim($min . '-' . $max);
        }
        
        // Try to get from test schema
        if ($test && !empty($test->fields_schema)) {
            $schema = $test->fields_schema;
            $parameterKey = $value->parameter_key ?? '';
            $parts = explode('.', $parameterKey);
            
            if (count($parts) >= 2 && isset($schema['sections'][$parts[0]]['fields'][$parts[1]])) {
                $field = $schema['sections'][$parts[0]]['fields'][$parts[1]];
                
                // Check for reference_range (for dropdowns)
                if (isset($field['reference_range']) && is_string($field['reference_range'])) {
                    return $field['reference_range'];
                }
                
                // Check for patient-type-specific ranges (for numbers)
                if (isset($field['ranges']) && is_array($field['ranges']) && $patientType) {
                    if (isset($field['ranges'][$patientType])) {
                        $range = $field['ranges'][$patientType];
                        $min = $range['min'] ?? '';
                        $max = $range['max'] ?? '';
                        if ($min !== '' || $max !== '') {
                            return trim($min . '-' . $max);
                        }
                    }
                }
                
                // Fallback to generic min/max
                $min = $field['min'] ?? '';
                $max = $field['max'] ?? '';
                if ($min !== '' || $max !== '') {
                    return trim($min . '-' . $max);
                }
            }
        }
        
        return 'N/A';
    }

    /**
     * Determine status (Normal/Abnormal) based on value and reference range
     */
    private function determineStatus($value, $test, $patientType): string
    {
        $resultValue = $value->value ?? '';
        if (empty($resultValue)) {
            return 'N/A';
        }
        
        // For dropdowns, if reference_range is set, we might need to check if value is in expected options
        // For now, default to Normal for dropdowns unless we have specific logic
        if ($test && !empty($test->fields_schema)) {
            $schema = $test->fields_schema;
            $parameterKey = $value->parameter_key ?? '';
            $parts = explode('.', $parameterKey);
            
            if (count($parts) >= 2 && isset($schema['sections'][$parts[0]]['fields'][$parts[1]])) {
                $field = $schema['sections'][$parts[0]]['fields'][$parts[1]];
                $fieldType = $field['type'] ?? 'text';
                
                // For number fields, check if value is within range
                if ($fieldType === 'number') {
                    $numValue = is_numeric($resultValue) ? (float) $resultValue : null;
                    if ($numValue === null) {
                        return 'N/A';
                    }
                    
                    // Check patient-type-specific ranges
                    if (isset($field['ranges']) && is_array($field['ranges']) && $patientType) {
                        if (isset($field['ranges'][$patientType])) {
                            $range = $field['ranges'][$patientType];
                            $min = isset($range['min']) && $range['min'] !== '' ? (float) $range['min'] : null;
                            $max = isset($range['max']) && $range['max'] !== '' ? (float) $range['max'] : null;
                            
                            if ($min !== null && $max !== null) {
                                return ($numValue >= $min && $numValue <= $max) ? 'Normal' : 'Abnormal';
                            }
                        }
                    }
                    
                    // Fallback to generic min/max
                    $min = isset($field['min']) && $field['min'] !== '' ? (float) $field['min'] : null;
                    $max = isset($field['max']) && $field['max'] !== '' ? (float) $field['max'] : null;
                    
                    if ($min !== null && $max !== null) {
                        return ($numValue >= $min && $numValue <= $max) ? 'Normal' : 'Abnormal';
                    }
                }
                
                // For dropdowns and other types, default to Normal
                return 'Normal';
            }
        }
        
        return 'N/A';
    }
}


