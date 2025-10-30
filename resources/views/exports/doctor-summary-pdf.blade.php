<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Doctor Summary Report</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            font-size: 12px;
            line-height: 1.4;
            color: #333;
            margin: 0;
            padding: 20px;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
        }
        .header h1 {
            color: #2563eb;
            margin: 0;
            font-size: 24px;
        }
        .header h2 {
            color: #666;
            margin: 5px 0 0 0;
            font-size: 16px;
            font-weight: normal;
        }
        .report-info {
            margin-bottom: 20px;
            background: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
        }
        .report-info h3 {
            margin: 0 0 10px 0;
            color: #16a34a;
            font-size: 14px;
        }
        .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
        }
        .info-item {
            display: flex;
            justify-content: space-between;
        }
        .info-label {
            font-weight: bold;
            color: #666;
        }
        .info-value {
            color: #333;
        }
        .summary-cards {
            display: grid;
            grid-template-columns: repeat(5, 1fr);
            gap: 15px;
            margin-bottom: 30px;
        }
        .summary-card {
            background: #f8f9fa;
            border: 1px solid #e9ecef;
            border-radius: 8px;
            padding: 15px;
            text-align: center;
        }
        .summary-card h4 {
            margin: 0 0 8px 0;
            color: #666;
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .summary-card .value {
            font-size: 18px;
            font-weight: bold;
            color: #16a34a;
        }
        .section {
            margin-bottom: 30px;
        }
        .section-title {
            background: #16a34a;
            color: white;
            padding: 10px 15px;
            margin: 0 0 15px 0;
            font-size: 16px;
            font-weight: bold;
        }
        .summary-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }
        .summary-table th {
            background: #f3f4f6;
            color: #374151;
            padding: 12px 8px;
            text-align: left;
            font-weight: bold;
            border: 1px solid #d1d5db;
        }
        .summary-table td {
            padding: 10px 8px;
            border: 1px solid #d1d5db;
            vertical-align: top;
        }
        .summary-table tr:nth-child(even) {
            background: #f9fafb;
        }
        .text-right {
            text-align: right;
        }
        .text-center {
            text-align: center;
        }
        .no-data {
            text-align: center;
            padding: 40px;
            color: #666;
            font-style: italic;
        }
        .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 10px;
            color: #666;
            border-top: 1px solid #eee;
            padding-top: 10px;
        }
    </style>
</head>
<body>
    <div class="header">
        <div style="text-align: center; margin-bottom: 20px; padding: 10px 0; position: relative;">
            <div style="position: absolute; left: 0; top: 0;">
                <img src="{{ $logoBase64 ?? public_path('st-james-logo.png') }}" alt="St. James Hospital Logo" style="width: 80px; height: 80px;">
            </div>
            <div style="text-align: center; width: 100%;">
                <div style="font-size: 24px; font-weight: bold; color: #2d5a27; margin: 0 0 5px 0;">St. James Hospital Clinic, Inc.</div>
                <div style="font-size: 12px; color: #333; margin: 0 0 3px 0;">San Isidro City of Cabuyao Laguna</div>
                <div style="font-size: 14px; font-style: italic; color: #1e40af; margin: 0 0 5px 0;">Santa Rosa's First in Quality Healthcare Service</div>
                <div style="font-size: 16px; font-weight: bold; color: #2d5a27; margin: 0 0 5px 0;">PASYENTE MUNA</div>
                <div style="font-size: 10px; color: #666; margin: 0;">Tel. Nos. 02.85844533; 049.5341254; 049.5020058; Fax No.: local 307<br>email add: info@stjameshospital.com.ph</div>
            </div>
        </div>
        <h1>Doctor Summary Report</h1>
        <h2>{{ $filters['report_type'] === 'daily' ? 'Daily Report' : ($filters['report_type'] === 'monthly' ? 'Monthly Report' : 'Yearly Report') }}</h2>
    </div>

    <div class="section">
        <div class="section-title">Doctor Payment Details</div>
        @if(count($reportData) > 0)
            <table class="summary-table">
                <thead>
                    <tr>
                        <th>{{ $filters['report_type'] === 'daily' ? 'Date' : ($filters['report_type'] === 'monthly' ? 'Month' : 'Year') }}</th>
                        <th>Doctor</th>
                        <th>Specialization</th>
                        <th class="text-right">Status</th>
                        <th class="text-right">Incentives</th>
                        <th class="text-right">Net Payment</th>
                        <th class="text-right">Payment Date</th>
                        <th class="text-right">Paid Date</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($reportData as $item)
                        <tr>
                            <td>
                                @if($filters['report_type'] === 'daily')
                                    {{ \Carbon\Carbon::parse($item['date'])->format('M d, Y') }}
                                @elseif($filters['report_type'] === 'monthly')
                                    {{ $item['month_name'] }}
                                @else
                                    {{ $item['year'] }}
                                @endif
                            </td>
                            <td>{{ $item['doctor_name'] }}</td>
                            <td>{{ $item['doctor_specialization'] }}</td>
                            <td class="text-right">{{ ucfirst($item['status']) }}</td>
                            <td class="text-right">PHP {{ number_format($item['incentives'], 2) }}</td>
                            <td class="text-right">PHP {{ number_format($item['net_payment'], 2) }}</td>
                            <td class="text-right">{{ \Carbon\Carbon::parse($item['payment_date'])->format('M d, Y') }}</td>
                            <td class="text-right">{{ $item['paid_date'] ? \Carbon\Carbon::parse($item['paid_date'])->format('M d, Y') : 'N/A' }}</td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        @else
            <div class="no-data">
                No doctor payment data found for the selected filters.
            </div>
        @endif
    </div>

    <div class="footer">
        <p>This report was generated automatically by the Clinic Management System on {{ now()->format('M d, Y H:i A') }}</p>
        <p>Period: {{ $filters['date_from'] }} to {{ $filters['date_to'] }} | For questions or support, please contact the system administrator</p>
        <p><strong>CONFIDENTIAL</strong> - This document contains sensitive information and should be handled with care.</p>
    </div>
</body>
</html>
