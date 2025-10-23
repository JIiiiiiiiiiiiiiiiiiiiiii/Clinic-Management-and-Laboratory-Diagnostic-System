<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Appointments Report - {{ ucfirst($reportType) }}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px 30px;
            color: #333;
            width: 100%;
            box-sizing: border-box;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 20px;
        }
        .header h1 {
            margin: 0;
            color: #1f2937;
            font-size: 24px;
        }
        .header p {
            margin: 5px 0 0 0;
            color: #6b7280;
            font-size: 14px;
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
        <h1>Appointments Report - {{ ucfirst($reportType) }}</h1>
        <p>Generated on {{ now()->format('F j, Y \a\t g:i A') }}</p>
        <p>Date Range: {{ \Carbon\Carbon::parse($dateFrom)->format('M j, Y') }} - {{ \Carbon\Carbon::parse($dateTo)->format('M j, Y') }}</p>
    </div>

    <div class="summary-section">
        <h2>Summary Statistics</h2>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <thead>
                <tr style="background-color: #f3f4f6;">
                    <th style="border: 1px solid #d1d5db; padding: 12px; text-align: left; font-weight: bold; color: #374151;">Metric</th>
                    <th style="border: 1px solid #d1d5db; padding: 12px; text-align: left; font-weight: bold; color: #374151;">Value</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td style="border: 1px solid #d1d5db; padding: 8px; font-weight: bold;">Total Appointments</td>
                    <td style="border: 1px solid #d1d5db; padding: 8px;">{{ $summary['total_appointments'] }}</td>
                </tr>
                <tr style="background-color: #f9fafb;">
                    <td style="border: 1px solid #d1d5db; padding: 8px; font-weight: bold;">Completed Appointments</td>
                    <td style="border: 1px solid #d1d5db; padding: 8px;">{{ $summary['completed_appointments'] }}</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #d1d5db; padding: 8px; font-weight: bold;">Pending Appointments</td>
                    <td style="border: 1px solid #d1d5db; padding: 8px;">{{ $summary['pending_appointments'] }}</td>
                </tr>
                <tr style="background-color: #f9fafb;">
                    <td style="border: 1px solid #d1d5db; padding: 8px; font-weight: bold;">Confirmed Appointments</td>
                    <td style="border: 1px solid #d1d5db; padding: 8px;">{{ $summary['confirmed_appointments'] }}</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #d1d5db; padding: 8px; font-weight: bold;">Cancelled Appointments</td>
                    <td style="border: 1px solid #d1d5db; padding: 8px;">{{ $summary['cancelled_appointments'] }}</td>
                </tr>
                <tr style="background-color: #f9fafb;">
                    <td style="border: 1px solid #d1d5db; padding: 8px; font-weight: bold;">Total Revenue</td>
                    <td style="border: 1px solid #d1d5db; padding: 8px; color: #059669; font-weight: bold;">PHP {{ number_format($summary['total_revenue'], 2) }}</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #d1d5db; padding: 8px; font-weight: bold;">Online Appointments</td>
                    <td style="border: 1px solid #d1d5db; padding: 8px;">{{ $summary['online_appointments'] }}</td>
                </tr>
                <tr style="background-color: #f9fafb;">
                    <td style="border: 1px solid #d1d5db; padding: 8px; font-weight: bold;">Walk-in Appointments</td>
                    <td style="border: 1px solid #d1d5db; padding: 8px;">{{ $summary['walk_in_appointments'] }}</td>
                </tr>
            </tbody>
        </table>
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

    <div class="footer">
        <p>This report was generated by the Clinic Management System</p>
        <p>For questions or support, please contact the system administrator</p>
    </div>
    </div>
</body>
</html>
