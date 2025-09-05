<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Laboratory Report - Order #{{ $order->id }}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            font-size: 12px;
            line-height: 1.4;
            margin: 0;
            padding: 20px;
            color: #333;
        }

        .header {
            text-align: center;
            border-bottom: 2px solid #333;
            padding-bottom: 15px;
            margin-bottom: 20px;
        }

        .clinic-name {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 5px;
        }

        .clinic-details {
            font-size: 10px;
            color: #666;
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
    <div class="header">
        <div class="clinic-name">{{ $clinic_name }}</div>
        <div class="clinic-details">
            {{ $clinic_address }}<br>
            Tel: {{ $clinic_phone }}
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
            $test = $testResults->first()->labTest;
            $result = $testResults->first();
        @endphp

        <div class="test-section">
            <div class="test-header">
                {{ $test->name }} ({{ $test->code }})
            </div>
            <div class="test-content">
                @if($result->results)
                    @php
                        $schema = $test->fields_schema;
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
                                        @foreach($section['fields'] as $fieldKey => $field)
                                            @php
                                                $fieldPath = $sectionKey . '.' . $fieldKey;
                                                $fieldValue = data_get($result->results, $fieldPath, '');
                                                $isNormal = true; // This could be enhanced with actual reference range checking
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
