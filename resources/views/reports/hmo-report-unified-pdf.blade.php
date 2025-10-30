<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>{{ $title ?? 'HMO Report' }}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            color: #333;
        }
        .container {
            max-width: 95%;
            margin: 0 auto;
            padding: 0 20px;
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
        
        .report-title {
            text-align: center;
            margin: 20px 0;
            font-size: 18px;
            font-weight: bold;
            color: #2d5a27;
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
        .table-wrapper {
            margin: 0 15px;
            overflow-x: auto;
        }
        .summary-table {
            width: 100%;
            max-width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
            table-layout: fixed;
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
        
        .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            text-align: center;
            color: #64748b;
            font-size: 12px;
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
        <h1>HMO Report</h1>
        <h2>{{ $title ?? 'HMO Transactions' }}</h2>
    </div>

    <div class="container">
        <div class="section">
            <div class="section-title">HMO Transaction Details</div>
            <div class="table-wrapper">
            <table class="summary-table">
                @if(count($hmoTransactions) > 0)
                    <thead>
                        <tr>
                            <th>Type</th>
                            <th>Transaction ID</th>
                            <th>Patient Name</th>
                            <th>Doctor Name</th>
                            <th>HMO Provider</th>
                            <th>Amount</th>
                            <th>Status</th>
                            <th>Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach($hmoTransactions as $transaction)
                        <tr>
                            <td>HMO Transaction</td>
                            <td>{{ $transaction['transaction_id'] ?? 'N/A' }}</td>
                            <td>{{ $transaction['patient_name'] ?? 'N/A' }}</td>
                            <td>{{ $transaction['doctor_name'] ?? 'N/A' }}</td>
                            <td>{{ $transaction['hmo_provider'] ?? 'N/A' }}</td>
                            <td>PHP {{ number_format($transaction['total_amount'] ?? 0, 2) }}</td>
                            <td>{{ ucfirst($transaction['status'] ?? 'N/A') }}</td>
                            <td>{{ isset($transaction['transaction_date']) ? \Carbon\Carbon::parse($transaction['transaction_date'])->format('Y-m-d H:i:s') : 'N/A' }}</td>
                        </tr>
                        @endforeach
                    </tbody>
                @else
                    <tr>
                        <td colspan="8" style="text-align: center; padding: 20px; color: #666; font-style: italic;">
                            No HMO transactions found for the selected period.
                        </td>
                    </tr>
                @endif
            </table>
            </div>
        </div>
    </div>

    <div class="footer">
        <p>This report was generated automatically by the Clinic Management System on {{ now()->format('M d, Y H:i A') }}</p>
        <p>For questions or support, please contact the system administrator</p>
        <p><strong>CONFIDENTIAL</strong> - This document contains sensitive information and should be handled with care.</p>
    </div>
</body>
</html>
