<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Complete Blood Count (CBC) - Order #{{ $order->id }}</title>
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

        .cbc-title {
            text-align: center;
            font-size: 16px;
            font-weight: bold;
            margin: 20px 0;
            text-decoration: underline;
        }

        .cbc-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }

        .cbc-table th,
        .cbc-table td {
            border: 1px solid #333;
            padding: 8px;
            text-align: center;
        }

        .cbc-table th {
            background-color: #f8f9fa;
            font-weight: bold;
        }

        .cbc-table .parameter {
            text-align: left;
            font-weight: bold;
        }

        .normal {
            color: #28a745;
        }

        .abnormal {
            color: #dc3545;
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

    <div class="cbc-title">COMPLETE BLOOD COUNT (CBC)</div>

    @if($result->results)
        <table class="cbc-table">
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
                @php
                    $cbcResults = $result->results;
                    $cbcParams = [
                        'wbc' => ['label' => 'White Blood Cell Count', 'unit' => 'x10³/μL', 'normal' => '4.5-11.0'],
                        'rbc' => ['label' => 'Red Blood Cell Count', 'unit' => 'x10⁶/μL', 'normal' => '4.0-5.5'],
                        'hemoglobin' => ['label' => 'Hemoglobin', 'unit' => 'g/dL', 'normal' => '12.0-16.0'],
                        'hematocrit' => ['label' => 'Hematocrit', 'unit' => '%', 'normal' => '36-46'],
                        'mcv' => ['label' => 'Mean Corpuscular Volume', 'unit' => 'fL', 'normal' => '80-100'],
                        'mch' => ['label' => 'Mean Corpuscular Hemoglobin', 'unit' => 'pg', 'normal' => '27-32'],
                        'mchc' => ['label' => 'Mean Corpuscular Hemoglobin Concentration', 'unit' => 'g/dL', 'normal' => '32-36'],
                        'platelet_count' => ['label' => 'Platelet Count', 'unit' => 'x10³/μL', 'normal' => '150-450'],
                        'neutrophils' => ['label' => 'Neutrophils', 'unit' => '%', 'normal' => '40-70'],
                        'lymphocytes' => ['label' => 'Lymphocytes', 'unit' => '%', 'normal' => '20-45'],
                        'monocytes' => ['label' => 'Monocytes', 'unit' => '%', 'normal' => '2-10'],
                        'eosinophils' => ['label' => 'Eosinophils', 'unit' => '%', 'normal' => '1-4'],
                        'basophils' => ['label' => 'Basophils', 'unit' => '%', 'normal' => '0-2'],
                    ];
                @endphp

                @foreach($cbcParams as $param => $info)
                    @php
                        $value = data_get($cbcResults, "hematology.{$param}", '');
                        $isNormal = true; // This could be enhanced with actual range checking
                    @endphp
                    <tr>
                        <td class="parameter">{{ $info['label'] }}</td>
                        <td>{{ $value }}</td>
                        <td>{{ $info['unit'] }}</td>
                        <td>{{ $info['normal'] }}</td>
                        <td class="{{ $isNormal ? 'normal' : 'abnormal' }}">
                            {{ $isNormal ? 'Normal' : 'Abnormal' }}
                        </td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    @else
        <p style="color: #6c757d; font-style: italic; text-align: center;">No CBC results available</p>
    @endif

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
