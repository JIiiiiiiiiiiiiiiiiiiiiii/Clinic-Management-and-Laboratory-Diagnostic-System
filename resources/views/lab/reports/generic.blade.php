<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Laboratory Report - Order #{{ $order->id }}</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            font-size: 12px;
            line-height: 1.4;
            margin: 0;
            padding: 20px;
            color: #333;
        }

        .hospital-header {
            text-align: center;
            margin-bottom: 10px;
            padding: 5px 0;
            position: relative;
        }
        
        .hospital-logo {
            position: absolute;
            left: 0;
            top: 0;
        }
        
        .hospital-info {
            text-align: center;
            width: 100%;
        }
        
        .hospital-name {
            font-size: 24px;
            font-weight: bold;
            color: #2d5a27;
            margin: 0 0 5px 0;
        }
        
        .hospital-address {
            font-size: 12px;
            color: #333;
            margin: 0 0 3px 0;
        }
        
        .hospital-slogan {
            font-size: 14px;
            font-style: italic;
            color: #1e40af;
            margin: 0 0 5px 0;
        }
        
        .hospital-motto {
            font-size: 16px;
            font-weight: bold;
            color: #2d5a27;
            margin: 0 0 5px 0;
        }
        
        .hospital-contact {
            font-size: 10px;
            color: #666;
            margin: 0;
        }

        .patient-info {
            display: flex;
            justify-content: space-between;
            margin-bottom: 20px;
            padding: 10px;
            background-color: #f5f5f5;
            border-radius: 5px;
        }

        .patient-details {
            flex: 1;
        }

        .order-details {
            flex: 1;
            text-align: right;
        }

        .section-title {
            font-size: 14px;
            font-weight: bold;
            background-color: #e9ecef;
            padding: 8px;
            margin: 15px 0 10px 0;
            border-left: 4px solid #007bff;
        }

        .test-section {
            margin-bottom: 20px;
            border: 1px solid #ddd;
            border-radius: 5px;
            overflow: hidden;
        }

        .test-header {
            background-color: #f8f9fa;
            padding: 10px;
            font-weight: bold;
            border-bottom: 1px solid #ddd;
        }

        .test-content {
            padding: 15px;
        }

        .result-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
        }

        .result-table th,
        .result-table td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
        }

        .result-table th {
            background-color: #f8f9fa;
            font-weight: bold;
        }

        .footer {
            margin-top: 30px;
            padding-top: 15px;
            border-top: 1px solid #ddd;
            display: flex;
            justify-content: space-between;
            font-size: 10px;
        }

        .signature-section {
            width: 200px;
        }

        .signature-line {
            border-bottom: 1px solid #333;
            height: 20px;
            margin-bottom: 5px;
        }

        .normal {
            color: #28a745;
        }

        .abnormal {
            color: #dc3545;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="hospital-header">
        <div class="hospital-logo">
            <img src="{{ public_path('st-james-logo.png') }}" alt="St. James Hospital Logo" style="width: 80px; height: 80px;">
        </div>
        <div class="hospital-info">
            <div class="hospital-name">St. James Hospital Clinic, Inc.</div>
            <div class="hospital-address">San Isidro City of Cabuyao Laguna</div>
            <div class="hospital-slogan">Santa Rosa's First in Quality Healthcare Service</div>
            <div class="hospital-motto">PASYENTE MUNA</div>
            <div class="hospital-contact">
                Tel. Nos. 02.85844533; 049.5341254; 049.5020058; Fax No.: local 307<br>
                email add: info@stjameshospital.com.ph
            </div>
        </div>
    </div>

    <div class="patient-info">
        <div class="patient-details">
            <strong>Patient Information:</strong><br>
            Name: {{ $patient->last_name ?? 'N/A' }}, {{ $patient->first_name ?? 'N/A' }} {{ $patient->middle_name ?? '' }}<br>
            Age: {{ $patient->age ?? 'N/A' }} years | Sex: {{ ucfirst($patient->sex ?? 'N/A') }}<br>
            Address: {{ $patient->present_address ?? 'N/A' }}
        </div>
        <div class="order-details">
            <strong>Order Information:</strong><br>
            Order #: {{ $order->id ?? 'N/A' }}<br>
            Date: {{ $order->created_at ? $order->created_at->format('M d, Y') : 'N/A' }}<br>
            Status: {{ ucfirst($order->status ?? 'N/A') }}
        </div>
    </div>

    <div class="section-title">LABORATORY RESULTS</div>

    @foreach($results as $testId => $testResults)
        @php
            $first = $testResults->first();
            $test = $first?->test;
            $result = $first;
        @endphp

        <div class="test-section">
            <div class="test-header">
                {{ $test->name ?? 'Unknown Test' }} @if(!empty($test?->code)) ({{ $test->code }}) @endif
            </div>
            <div class="test-content">
                @if($result && $result->values && count($result->values) > 0)
                    @php
                        // Decode fields_schema if needed
                        $schema = is_string($test->fields_schema ?? null) 
                            ? json_decode($test->fields_schema, true) 
                            : ($test->fields_schema ?? []);
                        $sections = $schema['sections'] ?? [];
                        
                        // Group values by section (parameter_key prefix)
                        $groupedValues = [];
                        foreach ($result->values as $value) {
                            $key = $value->parameter_key ? explode('.', $value->parameter_key)[0] : 'general';
                            if (!isset($groupedValues[$key])) {
                                $groupedValues[$key] = [];
                            }
                            $groupedValues[$key][] = $value;
                        }
                    @endphp

                    @foreach($groupedValues as $sectionKey => $values)
                        @php
                            $section = $sections[$sectionKey] ?? null;
                            $sectionTitle = $section['title'] ?? ucfirst(str_replace('_', ' ', $sectionKey));
                        @endphp
                        <div style="margin-bottom: 15px;">
                            <h4 style="margin: 0 0 10px 0; font-size: 13px; color: #495057;">
                                {{ $sectionTitle }}
                            </h4>

                            <table class="result-table">
                                <thead>
                                    <tr>
                                        <th>Parameter</th>
                                        <th>Result</th>
                                        <th>Unit</th>
                                        <th>Reference Range</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    @foreach($values as $value)
                                        @php
                                            $parameterLabel = $value->parameter_label ?? $value->parameter_key ?? 'N/A';
                                            $resultValue = $value->value ?? '';
                                            $unit = $value->unit ?? 'N/A';
                                            
                                            // Find field in schema
                                            $field = null;
                                            $fieldType = 'text';
                                            $referenceRange = 'N/A';
                                            $status = 'N/A';
                                            
                                            if ($schema && isset($schema['sections'])) {
                                                $parameterKey = $value->parameter_key ?? '';
                                                $parts = explode('.', $parameterKey);
                                                
                                                // Try to find field
                                                if (count($parts) >= 2 && isset($schema['sections'][$parts[0]]['fields'][$parts[1]])) {
                                                    $field = $schema['sections'][$parts[0]]['fields'][$parts[1]];
                                                } else {
                                                    // Search through all sections
                                                    foreach ($schema['sections'] as $sk => $section) {
                                                        if (isset($section['fields'])) {
                                                            foreach ($section['fields'] as $fk => $fieldData) {
                                                                $fieldLabel = $fieldData['label'] ?? '';
                                                                if ($fieldLabel === $parameterLabel || 
                                                                    $fk === $parameterLabel || 
                                                                    $fk === $parameterKey ||
                                                                    (strpos($parameterKey, $fk) !== false)) {
                                                                    $field = $fieldData;
                                                                    break 2;
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                                
                                                if ($field) {
                                                    $fieldType = $field['type'] ?? 'text';
                                                    
                                                    // Get reference range - prioritize dynamic ranges based on patient type
                                                    // For number/text fields: ONLY use dynamic ranges, never use value->reference_text
                                                    // For select/textarea fields: use static reference_range
                                                    if (($fieldType === 'number' || $fieldType === 'text') && isset($field['ranges']) && is_array($field['ranges']) && $patientType && isset($field['ranges'][$patientType])) {
                                                        // For number/text fields, use dynamic ranges from template
                                                        $range = $field['ranges'][$patientType];
                                                        $min = $range['min'] ?? '';
                                                        $max = $range['max'] ?? '';
                                                        // Only use if both min and max are provided and not empty
                                                        if ($min !== '' && $min !== null && $max !== '' && $max !== null) {
                                                            $referenceRange = trim($min . ' - ' . $max);
                                                        } else {
                                                            $referenceRange = 'N/A';
                                                        }
                                                    } elseif ($fieldType === 'select' || $fieldType === 'textarea') {
                                                        // For select/textarea fields, use static reference_range
                                                        if (isset($field['reference_range']) && !empty($field['reference_range'])) {
                                                        $referenceRange = $field['reference_range'];
                                                        } else {
                                                            $referenceRange = 'N/A';
                                                        }
                                                    } else {
                                                        // Fallback for other cases
                                                        $referenceRange = 'N/A';
                                                    }
                                                    
                                                    // Determine status - match frontend logic exactly
                                                    if ($fieldType === 'number' && is_numeric($resultValue)) {
                                                        $numValue = (float) $resultValue;
                                                        // First try patient-type-specific dynamic ranges
                                                        if (isset($field['ranges']) && is_array($field['ranges']) && $patientType && isset($field['ranges'][$patientType])) {
                                                            $range = $field['ranges'][$patientType];
                                                            $min = isset($range['min']) && $range['min'] !== '' ? (float) $range['min'] : null;
                                                            $max = isset($range['max']) && $range['max'] !== '' ? (float) $range['max'] : null;
                                                            if ($min !== null && $max !== null && !is_nan($min) && !is_nan($max)) {
                                                                if ($numValue < $min) {
                                                                    $status = 'Low';
                                                                } elseif ($numValue > $max) {
                                                                    $status = 'High';
                                                                } else {
                                                                    $status = 'Normal';
                                                                }
                                                            }
                                                        } elseif (isset($field['reference_range']) && !empty($field['reference_range'])) {
                                                            // Fallback to static reference_range if dynamic ranges not available
                                                            $refRange = trim($field['reference_range']);
                                                            // Parse range like "7.9 - 20" or "7.9-20" or "1, 2, 3"
                                                            if (preg_match('/^([\d.]+)\s*,\s*[\d.\s,]*,\s*([\d.]+)$/', $refRange, $matches)) {
                                                                // Handle comma-separated like "1, 2, 3"
                                                                $min = (float) $matches[1];
                                                                $max = (float) $matches[2];
                                                                if ($numValue < $min) {
                                                                    $status = 'Low';
                                                                } elseif ($numValue > $max) {
                                                                    $status = 'High';
                                                                } else {
                                                                    $status = 'Normal';
                                                                }
                                                            } elseif (preg_match('/(\d+\.?\d*)\s*-\s*(\d+\.?\d*)/', $refRange, $matches)) {
                                                                // Handle range format "7.9 - 20"
                                                                $min = (float) $matches[1];
                                                                $max = (float) $matches[2];
                                                                if ($numValue < $min) {
                                                                    $status = 'Low';
                                                                } elseif ($numValue > $max) {
                                                                    $status = 'High';
                                                                } else {
                                                                    $status = 'Normal';
                                                                }
                                                            } elseif (preg_match('/<\s*(\d+\.?\d*)/', $refRange, $matches)) {
                                                                // Handle "<5" format
                                                                $max = (float) $matches[1];
                                                                $status = ($numValue < $max) ? 'Normal' : 'High';
                                                            } elseif (preg_match('/>\s*(\d+\.?\d*)/', $refRange, $matches)) {
                                                                // Handle ">5" format
                                                                $min = (float) $matches[1];
                                                                $status = ($numValue > $min) ? 'Normal' : 'Low';
                                                            }
                                                        }
                                                    } elseif ($fieldType === 'text' && is_numeric($resultValue)) {
                                                        // For text fields with numeric values, check dynamic ranges first
                                                        $numValue = (float) $resultValue;
                                                        // First check dynamic ranges (patient-type-specific)
                                                        if (isset($field['ranges']) && is_array($field['ranges']) && $patientType && isset($field['ranges'][$patientType])) {
                                                            $range = $field['ranges'][$patientType];
                                                            $min = isset($range['min']) && $range['min'] !== '' ? (float) $range['min'] : null;
                                                            $max = isset($range['max']) && $range['max'] !== '' ? (float) $range['max'] : null;
                                                            if ($min !== null && $max !== null && !is_nan($min) && !is_nan($max)) {
                                                                if ($numValue < $min) {
                                                                    $status = 'Low';
                                                                } elseif ($numValue > $max) {
                                                                    $status = 'High';
                                                                } else {
                                                                    $status = 'Normal';
                                                                }
                                                            }
                                                        } elseif (isset($field['reference_range']) && !empty($field['reference_range'])) {
                                                            // Fallback to static reference_range
                                                            $refRange = trim($field['reference_range']);
                                                            // Parse range like "7.9 - 20" or "7.9-20" or "1, 2, 3"
                                                            if (preg_match('/^([\d.]+)\s*,\s*[\d.\s,]*,\s*([\d.]+)$/', $refRange, $matches)) {
                                                                // Handle comma-separated like "1, 2, 3"
                                                                $min = (float) $matches[1];
                                                                $max = (float) $matches[2];
                                                                if ($numValue < $min) {
                                                                    $status = 'Low';
                                                                } elseif ($numValue > $max) {
                                                                    $status = 'High';
                                                                } else {
                                                                    $status = 'Normal';
                                                                }
                                                            } elseif (preg_match('/(\d+\.?\d*)\s*-\s*(\d+\.?\d*)/', $refRange, $matches)) {
                                                                // Handle range format "7.9 - 20"
                                                                $min = (float) $matches[1];
                                                                $max = (float) $matches[2];
                                                                if ($numValue < $min) {
                                                                    $status = 'Low';
                                                                } elseif ($numValue > $max) {
                                                                    $status = 'High';
                                                                } else {
                                                                    $status = 'Normal';
                                                                }
                                                            } elseif (preg_match('/<\s*(\d+\.?\d*)/', $refRange, $matches)) {
                                                                // Handle "<5" format
                                                                $max = (float) $matches[1];
                                                                $status = ($numValue < $max) ? 'Normal' : 'High';
                                                            } elseif (preg_match('/>\s*(\d+\.?\d*)/', $refRange, $matches)) {
                                                                // Handle ">5" format
                                                                $min = (float) $matches[1];
                                                                $status = ($numValue > $min) ? 'Normal' : 'Low';
                                                            }
                                                        }
                                                    } elseif ($fieldType === 'select' && isset($field['options']) && is_array($field['options'])) {
                                                        // For dropdowns, check the status of the selected option
                                                        foreach ($field['options'] as $option) {
                                                            $optionValue = is_string($option) ? $option : ($option['value'] ?? '');
                                                            if ($optionValue === $resultValue) {
                                                                $optionStatus = is_string($option) ? 'normal' : ($option['status'] ?? 'normal');
                                                                // Capitalize first letter to show Normal, Abnormal, Positive, Negative, etc.
                                                                $status = ucfirst($optionStatus);
                                                                break;
                                                            }
                                                        }
                                                        // If select field has numeric value and reference range, treat as number
                                                        if ($status === 'N/A' && is_numeric($resultValue) && isset($field['reference_range']) && !empty($field['reference_range'])) {
                                                            $numValue = (float) $resultValue;
                                                            $refRange = trim($field['reference_range']);
                                                            if (preg_match('/(\d+\.?\d*)\s*-\s*(\d+\.?\d*)/', $refRange, $matches)) {
                                                                $min = (float) $matches[1];
                                                                $max = (float) $matches[2];
                                                                if ($numValue < $min) {
                                                                    $status = 'Low';
                                                                } elseif ($numValue > $max) {
                                                                    $status = 'High';
                                                                } else {
                                                                    $status = 'Normal';
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                            
                                            // Use unit from value or field
                                            if ($unit === 'N/A' && $field && isset($field['unit']) && !empty($field['unit'])) {
                                                $unit = $field['unit'];
                                            }
                                        @endphp
                                        <tr>
                                            <td>{{ $parameterLabel }}</td>
                                            <td>{{ $resultValue }}</td>
                                            <td>{{ $unit !== 'N/A' ? $unit : '' }}</td>
                                            <td>{{ $referenceRange ? $referenceRange : 'N/A' }}</td>
                                            <td class="{{ 
                                                strtolower($status) === 'normal' || strtolower($status) === 'negative' ? 'normal' : 
                                                (strtolower($status) === 'abnormal' || strtolower($status) === 'high' || strtolower($status) === 'low' || strtolower($status) === 'positive' ? 'abnormal' : '') 
                                            }}">
                                                {{ $status ? $status : 'N/A' }}
                                            </td>
                                        </tr>
                                    @endforeach
                                </tbody>
                            </table>
                        </div>
                    @endforeach
                @elseif(!empty($result?->results) && !empty($test?->fields_schema))
                    @php
                        // Fallback to old format for legacy data
                        $schema = is_string($test->fields_schema) 
                            ? json_decode($test->fields_schema, true) 
                            : ($test->fields_schema ?? []);
                        $sections = $schema['sections'] ?? [];
                    @endphp

                    @foreach($sections as $sectionKey => $section)
                        <div style="margin-bottom: 15px;">
                            <h4 style="margin: 0 0 10px 0; font-size: 13px; color: #495057;">
                                {{ $section['title'] ?? ucfirst(str_replace('_', ' ', $sectionKey)) }}
                            </h4>

                            @if(isset($section['fields']))
                                <table class="result-table">
                                    <thead>
                                        <tr>
                                            <th>Parameter</th>
                                            <th>Result</th>
                                            <th>Unit</th>
                                            <th>Reference Range</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        @foreach(($section['fields'] ?? []) as $fieldKey => $field)
                                            @php
                                                $fieldPath = $sectionKey . '.' . $fieldKey;
                                                $fieldValue = data_get($result->results ?? [], $fieldPath, '');
                                                $isNormal = true; // Legacy data - default to normal
                                            @endphp
                                            <tr>
                                                <td>{{ $field['label'] ?? ucfirst(str_replace('_', ' ', $fieldKey)) }}</td>
                                                <td>{{ $fieldValue }}</td>
                                                <td>{{ $field['unit'] ?? '' }}</td>
                                                <td>{{ $field['reference_range'] ?? 'N/A' }}</td>
                                                <td class="{{ $isNormal ? 'normal' : 'abnormal' }}">
                                                    {{ $isNormal ? 'Normal' : 'Abnormal' }}
                                                </td>
                                            </tr>
                                        @endforeach
                                    </tbody>
                                </table>
                            @endif
                        </div>
                    @endforeach
                @else
                    <p style="color: #6c757d; font-style: italic;">No results available</p>
                @endif
            </div>
        </div>
    @endforeach

    <div class="footer">
        <div>
            <strong>Report Generated:</strong> {{ $generated_at->format('M d, Y H:i:s') }}
        </div>
        <div class="signature-section">
            <div class="signature-line"></div>
            <div style="text-align: center;">Medical Technologist</div>
        </div>
    </div>
</body>
</html>
