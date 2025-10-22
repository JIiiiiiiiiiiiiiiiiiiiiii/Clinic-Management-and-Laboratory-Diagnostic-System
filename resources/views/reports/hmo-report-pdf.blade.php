<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>HMO Report - {{ $dateFrom }} to {{ $dateTo }}</title>
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
            border-bottom: 2px solid #2d5a27;
            padding-bottom: 20px;
        }
        
        .hospital-name {
            font-size: 24px;
            font-weight: bold;
            color: #2d5a27;
            margin-bottom: 5px;
        }
        
        .hospital-tagline {
            font-size: 14px;
            color: #1e40af;
            font-style: italic;
            margin-bottom: 5px;
        }
        
        .hospital-motto {
            font-size: 16px;
            font-weight: bold;
            color: #2d5a27;
            margin-bottom: 10px;
        }
        
        .hospital-contact {
            font-size: 10px;
            color: #666;
        }
        
        .report-title {
            font-size: 20px;
            font-weight: bold;
            color: #2d5a27;
            margin: 20px 0 10px 0;
            text-align: center;
        }
        
        .report-period {
            text-align: center;
            font-size: 14px;
            color: #666;
            margin-bottom: 30px;
        }
        
        .summary-section {
            margin-bottom: 30px;
        }
        
        .section-title {
            font-size: 16px;
            font-weight: bold;
            color: #2d5a27;
            margin-bottom: 15px;
            border-bottom: 1px solid #ddd;
            padding-bottom: 5px;
        }
        
        .summary-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 20px;
        }
        
        .summary-item {
            background: #f8f9fa;
            padding: 15px;
            border: 1px solid #ddd;
            border-radius: 5px;
        }
        
        .summary-label {
            font-weight: bold;
            color: #2d5a27;
            margin-bottom: 5px;
        }
        
        .summary-value {
            font-size: 18px;
            color: #333;
        }
        
        .data-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
        }
        
        .data-table th {
            background: #2d5a27;
            color: white;
            padding: 10px;
            text-align: left;
            font-weight: bold;
        }
        
        .data-table td {
            padding: 8px 10px;
            border: 1px solid #ddd;
        }
        
        .data-table tr:nth-child(even) {
            background: #f8f9fa;
        }
        
        .data-table tr:hover {
            background: #e8f5e8;
        }
        
        .amount {
            text-align: right;
            font-weight: bold;
        }
        
        .status-active {
            color: #28a745;
            font-weight: bold;
        }
        
        .status-inactive {
            color: #dc3545;
            font-weight: bold;
        }
        
        .status-pending {
            color: #ffc107;
            font-weight: bold;
        }
        
        .status-paid {
            color: #28a745;
            font-weight: bold;
        }
        
        .footer {
            margin-top: 50px;
            text-align: center;
            font-size: 10px;
            color: #666;
            border-top: 1px solid #ddd;
            padding-top: 10px;
        }
        
        .page-break {
            page-break-before: always;
        }
        
        .no-data {
            text-align: center;
            color: #666;
            font-style: italic;
            padding: 20px;
        }
    </style>
</head>
<body>
    <!-- Header -->
    <div class="header">
        <div class="hospital-name">St. James Hospital Clinic, Inc.</div>
        <div class="hospital-tagline">San Isidro City of Cabuyao Laguna</div>
        <div class="hospital-motto">Santa Rosa's First in Quality Healthcare Service</div>
        <div class="hospital-motto">PASYENTE MUNA</div>
        <div class="hospital-contact">
            Tel. Nos. 02.85844533; 049.5341254; 049.5020058; Fax No.: local 307<br>
            Email: info@stjameshospital.com.ph
        </div>
    </div>

    <!-- Report Title -->
    <div class="report-title">HMO Report</div>
    <div class="report-period">Period: {{ \Carbon\Carbon::parse($dateFrom)->format('M d, Y') }} to {{ \Carbon\Carbon::parse($dateTo)->format('M d, Y') }}</div>
    <div class="report-period">Generated on: {{ now()->format('M d, Y H:i:s') }}</div>

    <!-- Summary Section -->
    <div class="summary-section">
        <div class="section-title">Summary Statistics</div>
        <div class="summary-grid">
            <div class="summary-item">
                <div class="summary-label">Total HMO Revenue</div>
                <div class="summary-value">₱{{ number_format($summary['total_hmo_revenue'] ?? 0, 2) }}</div>
            </div>
            <div class="summary-item">
                <div class="summary-label">Total HMO Transactions</div>
                <div class="summary-value">{{ number_format($summary['total_hmo_transactions'] ?? 0) }}</div>
            </div>
            <div class="summary-item">
                <div class="summary-label">Total Claims Amount</div>
                <div class="summary-value">₱{{ number_format($summary['total_claims_amount'] ?? 0, 2) }}</div>
            </div>
            <div class="summary-item">
                <div class="summary-label">Total Approved Amount</div>
                <div class="summary-value">₱{{ number_format($summary['total_approved_amount'] ?? 0, 2) }}</div>
            </div>
            <div class="summary-item">
                <div class="summary-label">Total Rejected Amount</div>
                <div class="summary-value">₱{{ number_format($summary['total_rejected_amount'] ?? 0, 2) }}</div>
            </div>
            <div class="summary-item">
                <div class="summary-label">Approval Rate</div>
                <div class="summary-value">{{ number_format($summary['approval_rate'] ?? 0, 2) }}%</div>
            </div>
            <div class="summary-item">
                <div class="summary-label">HMO Providers Count</div>
                <div class="summary-value">{{ number_format($summary['hmo_providers_count'] ?? 0) }}</div>
            </div>
            <div class="summary-item">
                <div class="summary-label">Active Patient Coverages</div>
                <div class="summary-value">{{ number_format($summary['active_patient_coverages'] ?? 0) }}</div>
            </div>
        </div>
    </div>

    <!-- HMO Transactions Section -->
    <div class="section-title">HMO Transactions</div>
    @if(count($hmoTransactions) > 0)
        <table class="data-table">
            <thead>
                <tr>
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
                    <td>{{ $transaction['transaction_id'] ?? 'N/A' }}</td>
                    <td>{{ $transaction['patient_name'] ?? 'N/A' }}</td>
                    <td>{{ $transaction['doctor_name'] ?? 'N/A' }}</td>
                    <td>{{ $transaction['hmo_provider'] ?? 'N/A' }}</td>
                    <td class="amount">₱{{ number_format($transaction['total_amount'] ?? 0, 2) }}</td>
                    <td class="status-{{ $transaction['status'] ?? 'pending' }}">{{ ucfirst($transaction['status'] ?? 'N/A') }}</td>
                    <td>{{ isset($transaction['transaction_date']) ? \Carbon\Carbon::parse($transaction['transaction_date'])->format('M d, Y') : 'N/A' }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>
    @else
        <div class="no-data">No HMO transactions found for the selected period.</div>
    @endif

    <!-- Page Break -->
    <div class="page-break"></div>

    <!-- HMO Providers Section -->
    <div class="section-title">HMO Providers</div>
    @if(count($hmoProviders) > 0)
        <table class="data-table">
            <thead>
                <tr>
                    <th>Provider Name</th>
                    <th>Code</th>
                    <th>Status</th>
                    <th>Contact Person</th>
                    <th>Contact Email</th>
                    <th>Contact Phone</th>
                </tr>
            </thead>
            <tbody>
                @foreach($hmoProviders as $provider)
                <tr>
                    <td>{{ $provider['name'] ?? 'N/A' }}</td>
                    <td>{{ $provider['code'] ?? 'N/A' }}</td>
                    <td class="status-{{ $provider['status'] ?? 'inactive' }}">{{ ucfirst($provider['status'] ?? 'N/A') }}</td>
                    <td>{{ $provider['contact_person'] ?? 'N/A' }}</td>
                    <td>{{ $provider['contact_email'] ?? 'N/A' }}</td>
                    <td>{{ $provider['contact_phone'] ?? 'N/A' }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>
    @else
        <div class="no-data">No HMO providers found.</div>
    @endif

    <!-- Footer -->
    <div class="footer">
        <p>This report was generated automatically by the St. James Hospital Clinic Management System.</p>
        <p>For questions or concerns, please contact the IT Department.</p>
    </div>
</body>
</html>
