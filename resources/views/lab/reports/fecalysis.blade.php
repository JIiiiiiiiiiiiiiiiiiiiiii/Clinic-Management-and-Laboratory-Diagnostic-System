<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Fecalysis - Order #{{ $order->id }}</title>
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

        .fecalysis-title {
            text-align: center;
            font-size: 16px;
            font-weight: bold;
            margin: 20px 0;
            text-decoration: underline;
        }

        .section {
            margin-bottom: 20px;
        }

        .section-title {
            font-size: 14px;
            font-weight: bold;
            background-color: #e9ecef;
            padding: 8px;
            margin-bottom: 10px;
            border-left: 4px solid #007bff;
        }

        .result-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 15px;
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
            width: 30%;
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

    <div class="fecalysis-title">FECALYSIS</div>

    @if($result->results)
        @php
            $fecalysisResults = $result->results;
        @endphp

        <!-- Physical Examination -->
        <div class="section">
            <div class="section-title">PHYSICAL EXAMINATION</div>
            <table class="result-table">
                <tr>
                    <th>Color</th>
                    <td>{{ data_get($fecalysisResults, 'physical.color', '') }}</td>
                </tr>
                <tr>
                    <th>Consistency</th>
                    <td>{{ data_get($fecalysisResults, 'physical.consistency', '') }}</td>
                </tr>
                <tr>
                    <th>Mucus</th>
                    <td>{{ data_get($fecalysisResults, 'physical.mucus', '') }}</td>
                </tr>
                <tr>
                    <th>Blood</th>
                    <td>{{ data_get($fecalysisResults, 'physical.blood', '') }}</td>
                </tr>
                <tr>
                    <th>Parasites</th>
                    <td>{{ data_get($fecalysisResults, 'physical.parasites', '') }}</td>
                </tr>
            </table>
        </div>

        <!-- Chemical Examination -->
        <div class="section">
            <div class="section-title">CHEMICAL EXAMINATION</div>
            <table class="result-table">
                <tr>
                    <th>Occult Blood</th>
                    <td>{{ data_get($fecalysisResults, 'chemical.occult_blood', '') }}</td>
                </tr>
                <tr>
                    <th>pH</th>
                    <td>{{ data_get($fecalysisResults, 'chemical.ph', '') }}</td>
                </tr>
                <tr>
                    <th>Reducing Substances</th>
                    <td>{{ data_get($fecalysisResults, 'chemical.reducing_substances', '') }}</td>
                </tr>
            </table>
        </div>

        <!-- Microscopic Examination -->
        <div class="section">
            <div class="section-title">MICROSCOPIC EXAMINATION</div>
            <table class="result-table">
                <tr>
                    <th>White Blood Cells</th>
                    <td>{{ data_get($fecalysisResults, 'microscopic.wbc', '') }}</td>
                </tr>
                <tr>
                    <th>Red Blood Cells</th>
                    <td>{{ data_get($fecalysisResults, 'microscopic.rbc', '') }}</td>
                </tr>
                <tr>
                    <th>Epithelial Cells</th>
                    <td>{{ data_get($fecalysisResults, 'microscopic.epithelial_cells', '') }}</td>
                </tr>
                <tr>
                    <th>Bacteria</th>
                    <td>{{ data_get($fecalysisResults, 'microscopic.bacteria', '') }}</td>
                </tr>
                <tr>
                    <th>Yeast</th>
                    <td>{{ data_get($fecalysisResults, 'microscopic.yeast', '') }}</td>
                </tr>
                <tr>
                    <th>Parasites</th>
                    <td>{{ data_get($fecalysisResults, 'microscopic.parasites', '') }}</td>
                </tr>
                <tr>
                    <th>Ova</th>
                    <td>{{ data_get($fecalysisResults, 'microscopic.ova', '') }}</td>
                </tr>
                <tr>
                    <th>Cysts</th>
                    <td>{{ data_get($fecalysisResults, 'microscopic.cysts', '') }}</td>
                </tr>
            </table>
        </div>
    @else
        <p style="color: #6c757d; font-style: italic; text-align: center;">No fecalysis results available</p>
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
