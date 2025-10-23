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
            margin: 0;
            padding: 20px;
            color: #333;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #16a34a;
            padding-bottom: 20px;
        }
        .header h1 {
            color: #16a34a;
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
        .table-container {
            margin-top: 20px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
        }
        th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
        }
        th {
            background-color: #16a34a;
            color: white;
            font-weight: bold;
            font-size: 11px;
        }
        td {
            font-size: 11px;
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
        <h1>St. James Clinic</h1>
        <h2>Doctor Summary Report</h2>
    </div>

    <div class="report-info">
        <h3>Report Information</h3>
        <div class="info-grid">
            <div class="info-item">
                <span class="info-label">Report Type:</span>
                <span class="info-value">{{ ucfirst($filters['report_type']) }}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Date Range:</span>
                <span class="info-value">{{ $filters['date_from'] }} to {{ $filters['date_to'] }}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Doctor:</span>
                <span class="info-value">{{ $filters['doctor_id'] === 'all' ? 'All Doctors' : 'Specific Doctor' }}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Status:</span>
                <span class="info-value">{{ $filters['status'] === 'all' ? 'All Status' : ucfirst($filters['status']) }}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Generated:</span>
                <span class="info-value">{{ now()->format('Y-m-d H:i:s') }}</span>
            </div>
        </div>
    </div>

    <div class="summary-cards">
        <div class="summary-card">
            <h4>Total Payments</h4>
            <div class="value">{{ number_format($summary['total_payments']) }}</div>
        </div>
        <div class="summary-card">
            <h4>Total Amount</h4>
            <div class="value">₱{{ number_format($summary['total_amount'], 2) }}</div>
        </div>
        <div class="summary-card">
            <h4>Paid Amount</h4>
            <div class="value">₱{{ number_format($summary['paid_amount'], 2) }}</div>
        </div>
        <div class="summary-card">
            <h4>Pending Amount</h4>
            <div class="value">₱{{ number_format($summary['pending_amount'], 2) }}</div>
        </div>
        <div class="summary-card">
            <h4>Average Payment</h4>
            <div class="value">₱{{ number_format($summary['average_payment'], 2) }}</div>
        </div>
    </div>

    <div class="table-container">
        <h3>Doctor Payment Details</h3>
        @if(count($reportData) > 0)
            <table>
                <thead>
                    <tr>
                        <th>{{ $filters['report_type'] === 'daily' ? 'Date' : ($filters['report_type'] === 'monthly' ? 'Month' : 'Year') }}</th>
                        <th>Doctor</th>
                        <th>Specialization</th>
                        <th class="text-right">Payments</th>
                        <th class="text-right">Basic Salary</th>
                        <th class="text-right">Deductions</th>
                        <th class="text-right">Holiday Pay</th>
                        <th class="text-right">Incentives</th>
                        <th class="text-right">Net Payment</th>
                        <th class="text-right">Average</th>
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
                            <td class="text-right">{{ number_format($item['payment_count']) }}</td>
                            <td class="text-right">₱{{ number_format($item['total_basic_salary'], 2) }}</td>
                            <td class="text-right">₱{{ number_format($item['total_deductions'], 2) }}</td>
                            <td class="text-right">₱{{ number_format($item['total_holiday_pay'], 2) }}</td>
                            <td class="text-right">₱{{ number_format($item['total_incentives'], 2) }}</td>
                            <td class="text-right">₱{{ number_format($item['total_net_payment'], 2) }}</td>
                            <td class="text-right">₱{{ number_format($item['average_payment'], 2) }}</td>
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
        <p>Generated on {{ now()->format('F d, Y \a\t H:i:s') }} | St. James Clinic Management System</p>
    </div>
</body>
</html>
