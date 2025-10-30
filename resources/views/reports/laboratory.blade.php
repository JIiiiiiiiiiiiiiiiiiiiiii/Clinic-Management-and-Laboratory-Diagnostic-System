<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $title ?? 'Laboratory Report' }}</title>
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
        .orders-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }
        .orders-table th {
            background: #f3f4f6;
            color: #374151;
            padding: 12px 8px;
            text-align: left;
            font-weight: bold;
            border: 1px solid #d1d5db;
        }
        .orders-table td {
            padding: 10px 8px;
            border: 1px solid #d1d5db;
            vertical-align: top;
        }
        .orders-table tr:nth-child(even) {
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
            background: #dcfce7;
            color: #166534;
        }
        .status.processing {
            background: #dbeafe;
            color: #1e40af;
        }
        .status.ordered {
            background: #fef3c7;
            color: #92400e;
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
        <h1>Laboratory Report</h1>
        <h2>{{ $title ?? 'Laboratory Statistics and Details' }}</h2>
    </div>

    <div class="section">
        <div class="section-title">Laboratory Statistics</div>
        @if(isset($data) && is_array($data))
            <table class="summary-table">
                <thead>
                    <tr>
                        <th>Metric</th>
                        <th>Value</th>
                        <th>Percentage</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Total Orders</td>
                        <td>{{ $data['total_orders'] ?? 0 }}</td>
                        <td>100%</td>
                    </tr>
                    <tr>
                        <td>Pending Orders</td>
                        <td>{{ $data['pending_orders'] ?? 0 }}</td>
                        <td>{{ $data['total_orders'] > 0 ? round((($data['pending_orders'] ?? 0) / $data['total_orders']) * 100, 1) : 0 }}%</td>
                    </tr>
                    <tr>
                        <td>Completed Orders</td>
                        <td>{{ $data['completed_orders'] ?? 0 }}</td>
                        <td>{{ $data['total_orders'] > 0 ? round((($data['completed_orders'] ?? 0) / $data['total_orders']) * 100, 1) : 0 }}%</td>
                    </tr>
                    <tr>
                        <td>Completion Rate</td>
                        <td>{{ $data['completion_rate'] ?? 0 }}%</td>
                        <td>-</td>
                    </tr>
                </tbody>
            </table>
        @else
            <div class="no-data">No laboratory data available.</div>
        @endif
    </div>

    @if(isset($data['test_summary']) && is_array($data['test_summary']) && count($data['test_summary']) > 0)
    <div class="section">
        <div class="section-title">Test Summary</div>
        <table class="summary-table">
            <thead>
                <tr>
                    <th>Test Type</th>
                    <th>Count</th>
                    <th>Percentage</th>
                </tr>
            </thead>
            <tbody>
                @foreach($data['test_summary'] as $testType => $count)
                    <tr>
                        <td>{{ $testType }}</td>
                        <td>{{ $count }}</td>
                        <td>{{ $data['total_orders'] > 0 ? round(($count / $data['total_orders']) * 100, 1) : 0 }}%</td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    </div>
    @endif

    @if(isset($data['order_details']) && is_array($data['order_details']) && count($data['order_details']) > 0)
    <div class="section">
        <div class="section-title">Order Details</div>
        <table class="orders-table">
            <thead>
                <tr>
                    <th>Order #</th>
                    <th>Patient Name</th>
                    <th>Tests Ordered</th>
                    <th>Status</th>
                    <th>Ordered At</th>
                    <th>Ordered By</th>
                </tr>
            </thead>
            <tbody>
                @foreach($data['order_details'] as $order)
                    <tr>
                        <td>#{{ $order['order_id'] ?? 'N/A' }}</td>
                        <td>{{ $order['patient_name'] ?? 'N/A' }}</td>
                        <td>{{ $order['tests_ordered'] ?? 'N/A' }}</td>
                        <td>
                            <span class="status {{ strtolower($order['status'] ?? 'unknown') }}">
                                {{ ucfirst($order['status'] ?? 'N/A') }}
                            </span>
                        </td>
                        <td>{{ isset($order['ordered_at']) ? \Carbon\Carbon::parse($order['ordered_at'])->format('M d, Y H:i A') : 'N/A' }}</td>
                        <td>{{ $order['ordered_by'] ?? 'N/A' }}</td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    </div>
    @else
    <div class="section">
        <div class="section-title">Order Details</div>
        <div class="no-data">No order details found for the selected criteria.</div>
    </div>
    @endif

    <div class="footer">
        <p>This report was generated automatically by the Clinic Management System on {{ now()->format('M d, Y H:i A') }}</p>
        <p>Period: {{ $dateRange ?? 'N/A' }} | For questions or support, please contact the system administrator</p>
        <p><strong>CONFIDENTIAL</strong> - This document contains sensitive patient information and should be handled with care.</p>
    </div>
</body>
</html>
