<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Financial Report</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 20px;
            color: #333;
        }
        
        .hospital-header {
            text-align: center;
            margin-bottom: 10px;
            padding: 5px 0;
            position: relative;
        }
        
        .hospital-logo {
            position: absolute;
            left: 0;
            top: 0;
        }
        
        .hospital-info {
            text-align: center;
            width: 100%;
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
        
        .report-meta {
            text-align: center;
            margin-bottom: 20px;
            font-size: 12px;
            color: #666;
        }
        
        .section {
            margin-bottom: 25px;
        }
        
        .section h2 {
            color: #374151;
            font-size: 18px;
            margin-bottom: 15px;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 5px;
        }
        
        .data-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        
        .data-table th,
        .data-table td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
        }
        
        .data-table th {
            background-color: #f8f9fa;
            font-weight: bold;
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
    <div class="hospital-header">
        <div class="hospital-logo">
            <img src="{{ public_path('st-james-logo.png') }}" alt="St. James Hospital Logo" style="width: 80px; height: 80px;">
        </div>
        <div class="hospital-info">
            <div class="hospital-name">St. James Hospital Clinic, Inc.</div>
            <div class="hospital-address">San Isidro City of Cabuyao Laguna</div>
            <div class="hospital-slogan">Santa Rosa's First in Quality Healthcare Service</div>
            <div class="hospital-motto">PASYENTE MUNA</div>
            <div class="hospital-contact">
                Tel. Nos. 02.85844533; 049.5341254; 049.5020058; Fax No.: local 307<br>
                email add: info@stjameshospital.com.ph
            </div>
        </div>
    </div>
    
    <div class="report-title">Financial Report</div>
    <div class="report-meta">
        Generated on: {{ now()->format('M d, Y H:i A') }} | 
        @if(isset($filters) && (isset($filters['date_from']) || isset($filters['date_to'])))
            Date Range: From {{ $filters['date_from'] ?? 'N/A' }} To {{ $filters['date_to'] ?? 'N/A' }}
        @elseif(isset($dateRange))
            Date Range: {{ $dateRange }}
        @else
            Date Range: All Time
        @endif
    </div>

    <div class="section">
        <h2>Financial Summary</h2>
        @if(isset($data) && is_array($data))
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Metric</th>
                        <th>Value</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($data as $key => $value)
                        @if(in_array($key, ['total_revenue', 'total_transactions']))
                            <tr>
                                <td>{{ ucfirst(str_replace('_', ' ', $key)) }}</td>
                                <td>
                                    @if($key === 'total_revenue')
                                        ₱{{ number_format($value, 2) }}
                                    @elseif($key === 'total_transactions')
                                        {{ $value }}
                                    @else
                                        {{ $value }}
                                    @endif
                                </td>
                            </tr>
                        @endif
                    @endforeach
                </tbody>
            </table>
        @else
            <p>No financial data available.</p>
        @endif
    </div>

    <div class="section">
        <h2>Financial Transactions</h2>
        @if(isset($transactions) && count($transactions) > 0)
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Transaction ID</th>
                        <th>Patient Name</th>
                        <th>Doctor Name</th>
                        <th>Amount</th>
                        <th>Payment Method</th>
                        <th>Date</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($transactions as $transaction)
                        <tr>
                            <td>{{ $transaction['id'] }}</td>
                            <td>{{ $transaction['patient_name'] }}</td>
                            <td>{{ $transaction['doctor_name'] }}</td>
                            <td>₱{{ number_format($transaction['total_amount'], 2) }}</td>
                            <td>{{ $transaction['payment_method'] }}</td>
                            <td>{{ \Carbon\Carbon::parse($transaction['transaction_date'])->format('M d, Y') }}</td>
                            <td>{{ $transaction['status'] }}</td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        @else
            <p>No transaction data available.</p>
        @endif
    </div>

    <div class="footer">
        <p>This report was generated automatically by the Clinic Management System</p>
        <p>For questions or support, please contact the system administrator</p>
    </div>
</body>
</html>
