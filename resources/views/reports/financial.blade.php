<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $title }} - St. James Clinic</title>
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
            border-bottom: 3px solid #2563eb;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }

        .clinic-name {
            font-size: 24px;
            font-weight: bold;
            color: #2563eb;
            margin-bottom: 5px;
        }

        .clinic-address {
            font-size: 14px;
            color: #666;
            margin-bottom: 10px;
        }

        .report-title {
            font-size: 20px;
            font-weight: bold;
            color: #1f2937;
            margin-top: 15px;
        }

        .report-info {
            display: flex;
            justify-content: space-between;
            margin: 20px 0;
            padding: 15px;
            background-color: #f8fafc;
            border: 1px solid #e2e8f0;
        }

        .info-item {
            flex: 1;
            text-align: center;
        }

        .info-label {
            font-weight: bold;
            color: #374151;
            margin-bottom: 5px;
        }

        .info-value {
            color: #6b7280;
        }

        .summary-section {
            margin: 30px 0;
            padding: 20px;
            background-color: #f0f9ff;
            border: 1px solid #0ea5e9;
            border-radius: 8px;
        }

        .summary-title {
            font-size: 18px;
            font-weight: bold;
            color: #0c4a6e;
            margin-bottom: 15px;
            text-align: center;
        }

        .summary-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
        }

        .summary-item {
            text-align: center;
            padding: 15px;
            background-color: white;
            border-radius: 6px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }

        .summary-value {
            font-size: 24px;
            font-weight: bold;
            color: #059669;
            margin-bottom: 5px;
        }

        .summary-label {
            font-size: 12px;
            color: #6b7280;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .table-section {
            margin: 30px 0;
        }

        .table-title {
            font-size: 16px;
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 15px;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
        }

        th, td {
            border: 1px solid #d1d5db;
            padding: 8px 12px;
            text-align: left;
        }

        th {
            background-color: #f3f4f6;
            font-weight: bold;
            color: #374151;
        }

        tr:nth-child(even) {
            background-color: #f9fafb;
        }

        .amount {
            text-align: right;
            font-weight: bold;
        }

        .footer {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            height: 200px;
            background-color: #f8fafc;
            border-top: 2px solid #2563eb;
            padding: 20px;
            margin-top: 50px;
        }

        .footer-content {
            display: flex;
            justify-content: space-between;
            height: 100%;
        }

        .footer-section {
            flex: 1;
            padding: 0 20px;
        }

        .footer-title {
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 10px;
            border-bottom: 1px solid #d1d5db;
            padding-bottom: 5px;
        }

        .signature-line {
            border-bottom: 1px solid #374151;
            margin: 20px 0 5px 0;
            height: 30px;
        }

        .signature-label {
            font-size: 10px;
            color: #6b7280;
            text-align: center;
        }

        .date-field {
            border-bottom: 1px solid #374151;
            margin: 10px 0 5px 0;
            height: 20px;
        }

        .page-break {
            page-break-before: always;
        }

        .no-data {
            text-align: center;
            color: #6b7280;
            font-style: italic;
            padding: 40px;
        }
    </style>
</head>
<body>
    <!-- Header -->
    <div class="header">
        <div class="clinic-name">ST. JAMES CLINIC</div>
        <div class="clinic-address">
            123 Medical Street, Health City, HC 12345<br>
            Tel: (555) 123-4567 | Email: info@stjamesclinic.com
        </div>
        <div class="report-title">{{ $title }}</div>
    </div>

    <!-- Report Information -->
    <div class="report-info">
        <div class="info-item">
            <div class="info-label">Report Period</div>
            <div class="info-value">{{ $dateRange }}</div>
        </div>
        <div class="info-item">
            <div class="info-label">Generated Date</div>
            <div class="info-value">{{ $metadata['generated_at'] }}</div>
        </div>
        <div class="info-item">
            <div class="info-label">Generated By</div>
            <div class="info-value">{{ $metadata['generated_by'] }} ({{ $metadata['generated_by_role'] }})</div>
        </div>
    </div>

    <!-- Summary Section -->
    <div class="summary-section">
        <div class="summary-title">Financial Summary</div>
        <div class="summary-grid">
            <div class="summary-item">
                <div class="summary-value">₱{{ number_format($data['summary']['total_revenue'], 2) }}</div>
                <div class="summary-label">Total Revenue</div>
            </div>
            <div class="summary-item">
                <div class="summary-value">{{ number_format($data['summary']['total_transactions']) }}</div>
                <div class="summary-label">Total Transactions</div>
            </div>
            <div class="summary-item">
                <div class="summary-value">₱{{ number_format($data['summary']['average_transaction'], 2) }}</div>
                <div class="summary-label">Average Transaction</div>
            </div>
        </div>
    </div>

    <!-- Transactions Table -->
    <div class="table-section">
        <div class="table-title">Transaction Details</div>
        @if($data['transactions']->count() > 0)
            <table>
                <thead>
                    <tr>
                        <th>Transaction ID</th>
                        <th>Patient Name</th>
                        <th>Doctor</th>
                        <th>Amount</th>
                        <th>Payment Method</th>
                        <th>Date</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($data['transactions'] as $transaction)
                        <tr>
                            <td>#{{ $transaction->id }}</td>
                            <td>{{ $transaction->patient->full_name ?? 'N/A' }}</td>
                            <td>{{ $transaction->orderedBy->name ?? 'N/A' }}</td>
                            <td class="amount">₱{{ number_format($transaction->total_amount, 2) }}</td>
                            <td>{{ $transaction->payment_method }}</td>
                            <td>{{ \Carbon\Carbon::parse($transaction->transaction_date)->format('M d, Y') }}</td>
                            <td>{{ ucfirst($transaction->status) }}</td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        @else
            <div class="no-data">No transactions found for the selected period.</div>
        @endif
    </div>

    <!-- Footer for Manual Completion -->
    <div class="footer">
        <div class="footer-content">
            <!-- Prepared By Section -->
            <div class="footer-section">
                <div class="footer-title">PREPARED BY</div>
                <div class="signature-line"></div>
                <div class="signature-label">Signature</div>
                <div class="signature-line"></div>
                <div class="signature-label">Printed Name</div>
                <div class="date-field"></div>
                <div class="signature-label">Date</div>
            </div>

            <!-- Reviewed By Section -->
            <div class="footer-section">
                <div class="footer-title">REVIEWED BY</div>
                <div class="signature-line"></div>
                <div class="signature-label">Signature</div>
                <div class="signature-line"></div>
                <div class="signature-label">Printed Name</div>
                <div class="date-field"></div>
                <div class="signature-label">Date</div>
            </div>

            <!-- Approved By Section -->
            <div class="footer-section">
                <div class="footer-title">APPROVED BY</div>
                <div class="signature-line"></div>
                <div class="signature-label">Signature</div>
                <div class="signature-line"></div>
                <div class="signature-label">Printed Name</div>
                <div class="date-field"></div>
                <div class="signature-label">Date</div>
            </div>
        </div>
    </div>
</body>
</html>
