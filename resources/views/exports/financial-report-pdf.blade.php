<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $title }}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            font-size: 12px;
            line-height: 1.4;
            color: #333;
            margin: 0;
            padding: 20px;
        }
        .container {
            max-width: 95%;
            margin: 0 auto;
            padding: 0 15px;
        }
        .table-wrapper {
            margin: 0 20px;
            overflow-x: auto;
        }
        .summary-table, .transactions-table {
            width: 95%;
            max-width: 95%;
            margin: 0 auto;
            table-layout: fixed;
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
        .summary-section {
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
        .transactions-table {
            border-collapse: collapse;
            margin-top: 20px;
        }
        .transactions-table th {
            background: #f3f4f6;
            color: #374151;
            padding: 12px 8px;
            text-align: left;
            font-weight: bold;
            border: 1px solid #d1d5db;
        }
        .transactions-table td {
            padding: 10px 8px;
            border: 1px solid #d1d5db;
            vertical-align: top;
        }
        .transactions-table tr:nth-child(even) {
            background: #f9fafb;
        }
        .status {
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 11px;
            font-weight: bold;
            text-transform: uppercase;
        }
        .status.completed {
            background: #d1fae5;
            color: #065f46;
        }
        .status.pending {
            background: #fef3c7;
            color: #92400e;
        }
        .payment-method {
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 11px;
            font-weight: bold;
            text-transform: uppercase;
        }
        .payment-method.cash {
            background: #dbeafe;
            color: #1e40af;
        }
        .payment-method.hmo {
            background: #e0e7ff;
            color: #3730a3;
        }
        .footer {
            margin-top: 40px;
            text-align: center;
            color: #6b7280;
            font-size: 10px;
            border-top: 1px solid #e5e7eb;
            padding-top: 20px;
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
    <div class="header">
        <div style="text-align: center; margin-bottom: 20px; padding: 10px 0; position: relative;">
            <div style="position: absolute; left: 0; top: 0;">
                <img src="{{ $logoBase64 }}" alt="St. James Hospital Logo" style="width: 80px; height: 80px;">
            </div>
            <div style="text-align: center; width: 100%;">
                <div style="font-size: 24px; font-weight: bold; color: #2d5a27; margin: 0 0 5px 0;">St. James Hospital Clinic, Inc.</div>
                <div style="font-size: 12px; color: #333; margin: 0 0 3px 0;">San Isidro City of Cabuyao Laguna</div>
                <div style="font-size: 14px; font-style: italic; color: #1e40af; margin: 0 0 5px 0;">Santa Rosa's First in Quality Healthcare Service</div>
                <div style="font-size: 16px; font-weight: bold; color: #2d5a27; margin: 0 0 5px 0;">PASYENTE MUNA</div>
                <div style="font-size: 10px; color: #666; margin: 0;">Tel. Nos. 02.85844533; 049.5341254; 049.5020058; Fax No.: local 307<br>email add: info@stjameshospital.com.ph</div>
            </div>
        </div>
        <h1>Financial Report</h1>
        <h2>{{ $title }}</h2>
    </div>

    <div class="container">
        <div class="summary-section">
        <h2 class="section-title">Financial Summary</h2>
        <div class="table-wrapper">
        <table class="summary-table">
            <thead>
                <tr>
                    <th>Metric</th>
                    <th>Value</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><strong>Total Revenue</strong></td>
                    <td>₱{{ number_format($data['summary']['total_revenue'] ?? 0, 2) }}</td>
                </tr>
                <tr>
                    <td><strong>Total Transactions</strong></td>
                    <td>{{ $data['summary']['total_transactions'] ?? 0 }}</td>
                </tr>
                <tr>
                    <td><strong>Cash Total</strong></td>
                    <td>₱{{ number_format($data['summary']['cash_total'] ?? 0, 2) }}</td>
                </tr>
                <tr>
                    <td><strong>HMO Total</strong></td>
                    <td>₱{{ number_format($data['summary']['hmo_total'] ?? 0, 2) }}</td>
                </tr>
                <tr>
                    <td><strong>Pending Amount</strong></td>
                    <td>₱{{ number_format($data['summary']['pending_amount'] ?? 0, 2) }}</td>
                </tr>
            </tbody>
        </table>
        </div>
    </div>

    <div class="transactions-section">
        <h2 class="section-title">Transaction Details</h2>
        @if($transactions && $transactions->count() > 0)
            <div class="table-wrapper">
            <table class="transactions-table">
                <thead>
                    <tr>
                        <th>Transaction ID</th>
                        <th>Patient Name</th>
                        <th>Specialist Name</th>
                        <th>Final Amount</th>
                        <th>Original Amount</th>
                        <th>Discount</th>
                        <th>Senior Discount</th>
                        <th>Payment Method</th>
                        <th>Status</th>
                        <th>Date</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($transactions as $transaction)
                        <tr>
                            <td>{{ $transaction->transaction_id }}</td>
                            <td>
                                {{ optional(method_exists($transaction, 'getPatientInfo') ? $transaction->getPatientInfo() : $transaction->patient)->full_name ?? 'N/A' }}
                            </td>
                            <td>{{ $transaction->doctor->name ?? ($transaction->appointment->specialist->name ?? 'N/A') }}</td>
                            <td>₱{{ number_format($transaction->total_amount, 2) }}</td>
                            <td>₱{{ number_format($transaction->original_amount ?? $transaction->total_amount, 2) }}</td>
                            <td>₱{{ number_format($transaction->discount_amount ?? 0, 2) }}</td>
                            <td>₱{{ number_format($transaction->senior_discount_amount ?? 0, 2) }}</td>
                            <td>
                                <span class="payment-method {{ strtolower($transaction->payment_method) }}">
                                    {{ ucfirst($transaction->payment_method) }}
                                </span>
                            </td>
                            <td>
                                <span class="status {{ strtolower($transaction->status) }}">
                                    {{ ucfirst($transaction->status) }}
                                </span>
                            </td>
                            <td>{{ \Carbon\Carbon::parse($transaction->transaction_date)->format('M d, Y') }}</td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
            </div>
        @else
            <div class="no-data">
                No transactions found for the selected criteria.
            </div>
        @endif
        </div>
    </div>

    <div class="footer">
        <p>Generated on {{ now()->format('F d, Y \a\t H:i:s') }} | St. James Medical Center</p>
        <p>This report contains confidential financial information and should be handled securely.</p>
    </div>
</body>
</html>
