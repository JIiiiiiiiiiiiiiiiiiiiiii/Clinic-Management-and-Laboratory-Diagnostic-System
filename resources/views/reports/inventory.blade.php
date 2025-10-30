<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $title ?? 'Inventory Report' }}</title>
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
        .inventory-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }
        .inventory-table th {
            background: #f3f4f6;
            color: #374151;
            padding: 12px 8px;
            text-align: left;
            font-weight: bold;
            border: 1px solid #d1d5db;
        }
        .inventory-table td {
            padding: 10px 8px;
            border: 1px solid #d1d5db;
            vertical-align: top;
        }
        .inventory-table tr:nth-child(even) {
            background: #f9fafb;
        }
        .status {
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 11px;
            font-weight: bold;
            text-transform: uppercase;
        }
        .status.normal {
            background: #d1fae5;
            color: #065f46;
        }
        .status.low {
            background: #fef3c7;
            color: #92400e;
        }
        .status.out {
            background: #fee2e2;
            color: #991b1b;
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
        <h1>Inventory Report</h1>
        <h2>{{ $title ?? 'Inventory Statistics and Details' }}</h2>
        @if(isset($filters['report_type']))
            <h3 style="color: #666; margin: 10px 0 0 0; font-size: 14px; font-weight: normal;">
                Report Type: {{ ucwords(str_replace('_', ' ', $filters['report_type'])) }}
            </h3>
        @endif
        @if(isset($data['period']))
            <h3 style="color: #666; margin: 5px 0 0 0; font-size: 14px; font-weight: normal;">
                Period: {{ $data['period'] }}
            </h3>
        @endif
    </div>

    @if(!isset($filters['report_type']) || $filters['report_type'] !== 'in_out')
    <div class="summary-section">
        <h2 class="section-title">Inventory Statistics</h2>
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
                        <td><strong>Total Products</strong></td>
                        <td>{{ isset($filters['report_type']) && $filters['report_type'] === 'used_rejected' ? ($data['summary']['total_items'] ?? 0) : ($data['total_products'] ?? 0) }}</td>
                        <td>100%</td>
                    </tr>
                    @if(isset($filters['report_type']) && $filters['report_type'] === 'all')
                        <tr>
                            <td><strong>Low Stock Items</strong></td>
                            <td>{{ $data['low_stock_items'] ?? 0 }}</td>
                            <td>{{ ($data['total_products'] ?? 0) > 0 ? number_format((($data['low_stock_items'] ?? 0) / ($data['total_products'] ?? 1)) * 100, 1) : 0 }}%</td>
                        </tr>
                        <tr>
                            <td><strong>Out of Stock</strong></td>
                            <td>{{ $data['out_of_stock'] ?? 0 }}</td>
                            <td>{{ ($data['total_products'] ?? 0) > 0 ? number_format((($data['out_of_stock'] ?? 0) / ($data['total_products'] ?? 1)) * 100, 1) : 0 }}%</td>
                        </tr>
                    @endif
                    @if(isset($filters['report_type']) && $filters['report_type'] === 'used_rejected')
                        <tr>
                            <td><strong>Used Items</strong></td>
                            <td>{{ number_format($data['summary']['total_consumed'] ?? 0) }}</td>
                            <td>{{ (($data['summary']['total_consumed'] ?? 0) + ($data['summary']['total_rejected'] ?? 0)) > 0 ? number_format((($data['summary']['total_consumed'] ?? 0) / (($data['summary']['total_consumed'] ?? 0) + ($data['summary']['total_rejected'] ?? 0))) * 100, 1) : 0 }}%</td>
                        </tr>
                        <tr>
                            <td><strong>Rejected Items</strong></td>
                            <td>{{ number_format($data['summary']['total_rejected'] ?? 0) }}</td>
                            <td>{{ (($data['summary']['total_consumed'] ?? 0) + ($data['summary']['total_rejected'] ?? 0)) > 0 ? number_format((($data['summary']['total_rejected'] ?? 0) / (($data['summary']['total_consumed'] ?? 0) + ($data['summary']['total_rejected'] ?? 0))) * 100, 1) : 0 }}%</td>
                        </tr>
                    @endif
                </tbody>
            </table>
        @else
            <div class="no-data">
                No inventory data available.
            </div>
        @endif
    </div>
    @endif

    @if(isset($data['category_summary']) && count($data['category_summary']) > 0 && (!isset($filters['report_type']) || $filters['report_type'] !== 'in_out'))
    <div class="summary-section">
        <h2 class="section-title">Category Summary</h2>
        <table class="summary-table">
            <thead>
                <tr>
                    <th>Category</th>
                    <th>Count</th>
                    @if(isset($filters['report_type']) && $filters['report_type'] === 'all')
                        <th>Low Stock</th>
                        <th>Out of Stock</th>
                    @endif
                    @if((isset($filters['report_type']) && $filters['report_type'] === 'used_rejected') || isset($data['used_count']) || isset($data['used_quantity']))
                    <th>Used Quantity</th>
                    @endif
                    @if((isset($filters['report_type']) && $filters['report_type'] === 'used_rejected') || isset($data['rejected_count']) || isset($data['rejected_quantity']))
                    <th>Rejected Quantity</th>
                    @endif
                </tr>
            </thead>
            <tbody>
                @foreach($data['category_summary'] as $category => $stats)
                <tr>
                    <td><strong>{{ ucwords(str_replace('_', ' ', $category)) }}</strong></td>
                    <td>{{ $stats['count'] ?? 0 }}</td>
                    @if(isset($filters['report_type']) && $filters['report_type'] === 'all')
                        <td>{{ $stats['low_stock'] ?? 0 }}</td>
                        <td>{{ $stats['out_of_stock'] ?? 0 }}</td>
                    @endif
                    @if((isset($filters['report_type']) && $filters['report_type'] === 'used_rejected') || isset($data['used_count']) || isset($data['used_quantity']))
                    <td>{{ $stats['used_quantity'] ?? 0 }}</td>
                    @endif
                    @if((isset($filters['report_type']) && $filters['report_type'] === 'used_rejected') || isset($data['rejected_count']) || isset($data['rejected_quantity']))
                    <td>{{ $stats['rejected_quantity'] ?? 0 }}</td>
                    @endif
                </tr>
                @endforeach
            </tbody>
        </table>
    </div>
    @endif

    <div class="summary-section">
        <h2 class="section-title">Inventory Details</h2>
        @if(isset($data['supply_details']) && is_array($data['supply_details']) && count($data['supply_details']) > 0)
            <table class="inventory-table">
                <thead>
                    <tr>
                        <th>Product ID</th>
                        <th>Name</th>
                        <th>Code</th>
                        <th>Category</th>
                        @if(!isset($filters['report_type']) || $filters['report_type'] !== 'in_out')
                            <th>Unit of Measure</th>
                        @endif
                        @if(isset($filters['report_type']) && $filters['report_type'] === 'all')
                            <th>Current Stock</th>
                            <th>Minimum Level</th>
                            <th>Maximum Level</th>
                            <th>Status</th>
                            <th>Active</th>
                        @endif
                        @if(isset($filters['report_type']) && $filters['report_type'] === 'used_rejected')
                            <th>Used Quantity</th>
                            <th>Rejected Quantity</th>
                        @elseif(isset($data['incoming_count']))
                            <th>Movement Type</th>
                            <th>Quantity</th>
                            <th>Created By</th>
                            <th>Date</th>
                            <th>Remarks</th>
                        @endif
                    </tr>
                </thead>
                <tbody>
                    @foreach($data['supply_details'] as $supply)
                        <tr>
                            <td>{{ $supply['id'] ?? 'N/A' }}</td>
                            <td>{{ $supply['name'] ?? 'N/A' }}</td>
                            <td>{{ $supply['code'] ?? 'N/A' }}</td>
                            <td>{{ $supply['category'] ?? 'N/A' }}</td>
                            @if(!isset($filters['report_type']) || $filters['report_type'] !== 'in_out')
                                <td>{{ $supply['unit_of_measure'] ?? 'N/A' }}</td>
                            @endif
                            @if(isset($filters['report_type']) && $filters['report_type'] === 'all')
                                <td>{{ $supply['current_stock'] ?? 0 }}</td>
                                <td>{{ $supply['minimum_stock_level'] ?? 0 }}</td>
                                <td>{{ $supply['maximum_stock_level'] ?? 0 }}</td>
                                <td>
                                    @if(isset($supply['is_out_of_stock']) && $supply['is_out_of_stock'])
                                        <span class="status out">Out of Stock</span>
                                    @elseif(isset($supply['is_low_stock']) && $supply['is_low_stock'])
                                        <span class="status low">Low Stock</span>
                                    @else
                                        <span class="status normal">Normal</span>
                                    @endif
                                </td>
                                <td>{{ isset($supply['is_active']) && $supply['is_active'] ? 'Yes' : 'No' }}</td>
                            @endif
                            @if(isset($filters['report_type']) && $filters['report_type'] === 'used_rejected')
                                <td>{{ $supply['used_quantity'] ?? ($supply['type'] === 'used' ? $supply['quantity'] : 0) }}</td>
                                <td>{{ $supply['rejected_quantity'] ?? ($supply['type'] === 'rejected' ? $supply['quantity'] : 0) }}</td>
                            @elseif(isset($data['incoming_count']))
                                <td>
                                    @if(isset($supply['movement_type']))
                                        <span style="background: {{ $supply['movement_type'] === 'IN' ? '#d1fae5' : '#fee2e2' }}; color: {{ $supply['movement_type'] === 'IN' ? '#065f46' : '#991b1b' }}; padding: 2px 8px; border-radius: 4px; font-size: 12px;">
                                            {{ $supply['movement_type'] === 'IN' ? 'Incoming' : 'Outgoing' }}
                                        </span>
                                    @else
                                        N/A
                                    @endif
                                </td>
                                <td>{{ $supply['quantity'] ?? 0 }}</td>
                                <td>{{ $supply['created_by'] ?: 'System' }}</td>
                                <td>{{ $supply['created_at'] ?? 'N/A' }}</td>
                                <td>{{ $supply['remarks'] ?? 'No remarks' }}</td>
                            @endif
                        </tr>
                    @endforeach
                </tbody>
            </table>
        @else
            <div class="no-data">
                No inventory details found for the selected criteria.
            </div>
        @endif
    </div>

    <div class="footer">
        <p>Generated on {{ now()->format('F d, Y \a\t H:i:s') }} | St. James Medical Center</p>
        <p>This report contains confidential inventory information and should be handled securely.</p>
    </div>
</body>
</html>
