<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Appointments Report</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 20px;
            color: #333;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #333;
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
        .summary-section {
            margin-bottom: 30px;
        }
        .summary-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin-bottom: 20px;
        }
        .summary-card {
            background: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 15px;
            text-align: center;
        }
        .summary-card h3 {
            margin: 0 0 5px 0;
            font-size: 18px;
            color: #1f2937;
        }
        .summary-card p {
            margin: 0;
            color: #6b7280;
            font-size: 12px;
        }
        .table-section {
            margin-top: 30px;
        }
        .table-section h2 {
            margin: 0 0 15px 0;
            color: #1f2937;
            font-size: 18px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
            table-layout: fixed;
        }
        th, td {
            border: 1px solid #d1d5db;
            padding: 6px 4px;
            text-align: left;
            font-size: 11px;
            word-wrap: break-word;
            overflow: hidden;
        }
        th {
            background-color: #f3f4f6;
            font-weight: bold;
            color: #374151;
        }
        .status-pending {
            background-color: #fef3c7;
            color: #92400e;
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 10px;
        }
        .status-confirmed {
            background-color: #dbeafe;
            color: #1e40af;
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 10px;
        }
        .status-completed {
            background-color: #d1fae5;
            color: #065f46;
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 10px;
        }
        .status-cancelled {
            background-color: #fee2e2;
            color: #991b1b;
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 10px;
        }
        .source-online {
            background-color: #d1fae5;
            color: #065f46;
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 10px;
        }
        .source-walk-in {
            background-color: #fed7aa;
            color: #9a3412;
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 10px;
        }
        .footer {
            margin-top: 30px;
            text-align: center;
            color: #6b7280;
            font-size: 12px;
            border-top: 1px solid #e5e7eb;
            padding-top: 15px;
        }
    </style>
</head>
<body>
    <div style="max-width: 100%; margin: 0 auto; padding: 0 10px;">
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
        <h1>Appointments Report</h1>
    </div>


    <div class="table-section">
        <h2>Appointments Details</h2>
        <table style="width: 100%; table-layout: fixed;">
            <thead>
                <tr>
                    <th style="width: 8%;">Code</th>
                    <th style="width: 18%;">Patient</th>
                    <th style="width: 12%;">Contact</th>
                    <th style="width: 15%;">Type</th>
                    <th style="width: 15%;">Specialist</th>
                    <th style="width: 10%;">Date</th>
                    <th style="width: 8%;">Time</th>
                    <th style="width: 8%;">Status</th>
                    <th style="width: 6%;">Source</th>
                    <th style="width: 10%;">Amount</th>
                </tr>
            </thead>
            <tbody>
                @forelse($appointments as $appointment)
                <tr>
                    <td>{{ $appointment['appointment_code'] ?? 'A' . str_pad($appointment['id'], 4, '0', STR_PAD_LEFT) }}</td>
                    <td>{{ $appointment['patient_name'] }}</td>
                    <td>{{ $appointment['contact_number'] }}</td>
                    <td>{{ $appointment['appointment_type'] }}</td>
                    <td>{{ $appointment['specialist_name'] }}</td>
                    <td>{{ \Carbon\Carbon::parse($appointment['appointment_date'])->format('M j, Y') }}</td>
                    <td>{{ \Carbon\Carbon::parse($appointment['appointment_time'])->format('g:i A') }}</td>
                    <td>
                        <span class="status-{{ strtolower($appointment['status']) }}">
                            {{ $appointment['status'] }}
                        </span>
                    </td>
                    <td>
                        <span class="source-{{ strtolower(str_replace('-', '_', $appointment['source'])) }}">
                            {{ $appointment['source'] }}
                        </span>
                    </td>
                    <td>PHP {{ number_format($appointment['price'], 2) }}</td>
                </tr>
                @empty
                <tr>
                    <td colspan="10" style="text-align: center; padding: 20px; color: #6b7280;">
                        No appointments found for the selected criteria.
                    </td>
                </tr>
                @endforelse
            </tbody>
        </table>
    </div>

    </div>
</body>
</html>
