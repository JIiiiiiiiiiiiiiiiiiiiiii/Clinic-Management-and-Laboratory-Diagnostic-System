<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>{{ $title ?? ($report->report_name ?? 'Inventory Report') }}</title>
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
            margin: 0;
            color: #333;
        }
        .header p {
            margin: 5px 0 0 0;
            color: #666;
        }
        .summary {
            margin-bottom: 30px;
            padding: 15px;
            background-color: #f9f9f9;
            border-left: 4px solid #333;
        }
        .summary h3 {
            margin-top: 0;
        }
        .summary-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin-top: 15px;
        }
        .summary-item {
            background: white;
            padding: 10px;
            border-radius: 4px;
            border: 1px solid #ddd;
        }
        .summary-item h4 {
            margin: 0 0 5px 0;
            color: #333;
        }
        .summary-item p {
            margin: 0;
            font-size: 18px;
            font-weight: bold;
            color: #666;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }
        th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
        }
        th {
            background-color: #f5f5f5;
            font-weight: bold;
        }
        .no-data {
            text-align: center;
            padding: 40px;
            color: #666;
        }
        .page-break {
            page-break-before: always;
        }
        .section-break {
            page-break-inside: avoid;
            margin-bottom: 20px;
        }
        .table-break {
            page-break-inside: avoid;
        }
        h3 {
            page-break-after: avoid;
            margin-top: 30px;
            margin-bottom: 15px;
            color: #333;
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 5px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>{{ $title ?? ($report->report_name ?? 'Inventory Report') }}</h1>
        <p>Generated on {{ isset($report) ? $report->created_at->format('Y-m-d H:i:s') : date('Y-m-d H:i:s') }}</p>
    </div>

    <div class="summary">
        <h3>Report Information</h3>
        <p><strong>Report Type:</strong> 
            @if(isset($report))
                @switch($report->report_type)
                    @case('used_rejected')
                        Used/Rejected Supplies
                        @break
                    @case('in_out_supplies')
                        In/Out Supplies
                        @break
                    @case('stock_levels')
                        Stock Levels
                        @break
                    @case('daily_consumption')
                        Daily Consumption
                        @break
                    @case('usage_by_location')
                        Usage by Location
                        @break
                    @default
                        Unknown
                @endswitch
            @else
                {{ $title ?? 'Inventory Report' }}
            @endif
        </p>
        @if(isset($report))
            <p><strong>Period:</strong> {{ ucfirst($report->period) }}</p>
            @if($report->start_date)
                <p><strong>Start Date:</strong> {{ $report->start_date->format('Y-m-d') }}</p>
            @endif
            @if($report->end_date)
                <p><strong>End Date:</strong> {{ $report->end_date->format('Y-m-d') }}</p>
            @endif
            <p><strong>Created By:</strong> {{ $report->creator->name ?? 'Unknown' }}</p>
        @else
            <p><strong>Generated:</strong> {{ date('Y-m-d H:i:s') }}</p>
        @endif
    </div>

    @if(isset($data['summary']))
        <div class="summary">
            <h3>Report Summary</h3>
            <table style="width: 100%; margin-top: 15px;">
                <thead>
                    <tr style="background-color: #f5f5f5;">
                        <th style="padding: 8px; border: 1px solid #ddd;">Metric</th>
                        <th style="padding: 8px; border: 1px solid #ddd;">Value</th>
                        <th style="padding: 8px; border: 1px solid #ddd;">Percentage</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td style="padding: 8px; border: 1px solid #ddd;"><strong>Total Products</strong></td>
                        <td style="padding: 8px; border: 1px solid #ddd;">{{ $data['summary']['total_items'] ?? 0 }}</td>
                        <td style="padding: 8px; border: 1px solid #ddd;">100%</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; border: 1px solid #ddd;"><strong>Used Items</strong></td>
                        <td style="padding: 8px; border: 1px solid #ddd;">{{ number_format($data['summary']['total_consumed'] ?? 0) }}</td>
                        <td style="padding: 8px; border: 1px solid #ddd;">
                            {{ (($data['summary']['total_consumed'] ?? 0) + ($data['summary']['total_rejected'] ?? 0)) > 0 ? 
                                number_format((($data['summary']['total_consumed'] ?? 0) / (($data['summary']['total_consumed'] ?? 0) + ($data['summary']['total_rejected'] ?? 0))) * 100, 1) : 0 }}%
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; border: 1px solid #ddd;"><strong>Rejected Items</strong></td>
                        <td style="padding: 8px; border: 1px solid #ddd;">{{ number_format($data['summary']['total_rejected'] ?? 0) }}</td>
                        <td style="padding: 8px; border: 1px solid #ddd;">
                            {{ (($data['summary']['total_consumed'] ?? 0) + ($data['summary']['total_rejected'] ?? 0)) > 0 ? 
                                number_format((($data['summary']['total_rejected'] ?? 0) / (($data['summary']['total_consumed'] ?? 0) + ($data['summary']['total_rejected'] ?? 0))) * 100, 1) : 0 }}%
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; border: 1px solid #ddd;"><strong>Low Stock Items</strong></td>
                        <td style="padding: 8px; border: 1px solid #ddd;">{{ $data['summary']['low_stock_items'] ?? 0 }}</td>
                        <td style="padding: 8px; border: 1px solid #ddd;">
                            {{ ($data['summary']['total_items'] ?? 0) > 0 ? 
                                number_format((($data['summary']['low_stock_items'] ?? 0) / ($data['summary']['total_items'] ?? 1)) * 100, 1) : 0 }}%
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; border: 1px solid #ddd;"><strong>Out of Stock Items</strong></td>
                        <td style="padding: 8px; border: 1px solid #ddd;">{{ $data['summary']['out_of_stock_items'] ?? 0 }}</td>
                        <td style="padding: 8px; border: 1px solid #ddd;">
                            {{ ($data['summary']['total_items'] ?? 0) > 0 ? 
                                number_format((($data['summary']['out_of_stock_items'] ?? 0) / ($data['summary']['total_items'] ?? 1)) * 100, 1) : 0 }}%
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    @endif

    @if(isset($data['category_summary']) && count($data['category_summary']) > 0)
        <div class="summary">
            <h3>Category Summary</h3>
            <table style="width: 100%; margin-top: 15px;">
                <thead>
                    <tr style="background-color: #f5f5f5;">
                        <th style="padding: 8px; border: 1px solid #ddd;">Category</th>
                        <th style="padding: 8px; border: 1px solid #ddd;">Count</th>
                        <th style="padding: 8px; border: 1px solid #ddd;">Used Quantity</th>
                        <th style="padding: 8px; border: 1px solid #ddd;">Rejected Quantity</th>
                        <th style="padding: 8px; border: 1px solid #ddd;">Total Quantity</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($data['category_summary'] as $category => $stats)
                    <tr>
                        <td style="padding: 8px; border: 1px solid #ddd;"><strong>{{ ucwords(str_replace('_', ' ', $category)) }}</strong></td>
                        <td style="padding: 8px; border: 1px solid #ddd;">{{ $stats['count'] ?? 0 }}</td>
                        <td style="padding: 8px; border: 1px solid #ddd;">{{ number_format($stats['used_quantity'] ?? 0) }}</td>
                        <td style="padding: 8px; border: 1px solid #ddd;">{{ number_format($stats['rejected_quantity'] ?? 0) }}</td>
                        <td style="padding: 8px; border: 1px solid #ddd;">{{ number_format(($stats['used_quantity'] ?? 0) + ($stats['rejected_quantity'] ?? 0)) }}</td>
                    </tr>
                    @endforeach
                </tbody>
            </table>
        </div>
    @endif

    @if(isset($data['department_stats']))
        <div class="summary">
            <h3>Department Summary</h3>
            <table style="width: 100%; margin-top: 15px;">
                <thead>
                    <tr style="background-color: #f5f5f5;">
                        <th style="padding: 8px; border: 1px solid #ddd;">Department</th>
                        <th style="padding: 8px; border: 1px solid #ddd;">Total Items</th>
                        <th style="padding: 8px; border: 1px solid #ddd;">Used Quantity</th>
                        <th style="padding: 8px; border: 1px solid #ddd;">Rejected Quantity</th>
                        <th style="padding: 8px; border: 1px solid #ddd;">Low Stock Items</th>
                    </tr>
                </thead>
                <tbody>
                    @if(isset($data['department_stats']['doctor_nurse']))
                    <tr>
                        <td style="padding: 8px; border: 1px solid #ddd;"><strong>Doctor & Nurse</strong></td>
                        <td style="padding: 8px; border: 1px solid #ddd;">{{ $data['department_stats']['doctor_nurse']['total_items'] ?? 0 }}</td>
                        <td style="padding: 8px; border: 1px solid #ddd;">{{ number_format($data['department_stats']['doctor_nurse']['total_consumed'] ?? 0) }}</td>
                        <td style="padding: 8px; border: 1px solid #ddd;">{{ number_format($data['department_stats']['doctor_nurse']['total_rejected'] ?? 0) }}</td>
                        <td style="padding: 8px; border: 1px solid #ddd;">{{ $data['department_stats']['doctor_nurse']['low_stock'] ?? 0 }}</td>
                    </tr>
                    @endif
                    @if(isset($data['department_stats']['med_tech']))
                    <tr>
                        <td style="padding: 8px; border: 1px solid #ddd;"><strong>Med Tech</strong></td>
                        <td style="padding: 8px; border: 1px solid #ddd;">{{ $data['department_stats']['med_tech']['total_items'] ?? 0 }}</td>
                        <td style="padding: 8px; border: 1px solid #ddd;">{{ number_format($data['department_stats']['med_tech']['total_consumed'] ?? 0) }}</td>
                        <td style="padding: 8px; border: 1px solid #ddd;">{{ number_format($data['department_stats']['med_tech']['total_rejected'] ?? 0) }}</td>
                        <td style="padding: 8px; border: 1px solid #ddd;">{{ $data['department_stats']['med_tech']['low_stock'] ?? 0 }}</td>
                    </tr>
                    @endif
                </tbody>
            </table>
        </div>
    @endif

    @if(isset($data['top_consumed_items']) && count($data['top_consumed_items']) > 0)
        <h3>Top Consumed Items</h3>
        <table class="table-break">
            <thead>
                <tr>
                    <th>Rank</th>
                    <th>Product Name</th>
                    <th>Code</th>
                    <th>Category</th>
                    <th>Department</th>
                    <th>Quantity Consumed</th>
                    <th>Unit</th>
                </tr>
            </thead>
            <tbody>
                @foreach($data['top_consumed_items'] as $index => $item)
                <tr>
                    <td>{{ $index + 1 }}</td>
                    <td>{{ $item['item_name'] ?? 'N/A' }}</td>
                    <td>{{ $item['item_code'] ?? 'N/A' }}</td>
                    <td>{{ $item['category'] ?? 'N/A' }}</td>
                    <td>{{ $item['department'] ?? 'N/A' }}</td>
                    <td>{{ number_format($item['quantity_consumed'] ?? 0) }}</td>
                    <td>{{ $item['unit'] ?? 'N/A' }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>
    @endif

    @if(isset($data['top_rejected_items']) && count($data['top_rejected_items']) > 0)
        <h3>Top Rejected Items</h3>
        <table class="table-break">
            <thead>
                <tr>
                    <th>Rank</th>
                    <th>Product Name</th>
                    <th>Code</th>
                    <th>Category</th>
                    <th>Department</th>
                    <th>Quantity Rejected</th>
                    <th>Unit</th>
                    <th>Reason</th>
                </tr>
            </thead>
            <tbody>
                @foreach($data['top_rejected_items'] as $index => $item)
                <tr>
                    <td>{{ $index + 1 }}</td>
                    <td>{{ $item['item_name'] ?? 'N/A' }}</td>
                    <td>{{ $item['item_code'] ?? 'N/A' }}</td>
                    <td>{{ $item['category'] ?? 'N/A' }}</td>
                    <td>{{ $item['department'] ?? 'N/A' }}</td>
                    <td>{{ number_format($item['quantity_rejected'] ?? 0) }}</td>
                    <td>{{ $item['unit'] ?? 'N/A' }}</td>
                    <td>{{ $item['reason'] ?? 'N/A' }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>
    @endif

    @if(isset($data['supply_details']) && count($data['supply_details']) > 0)
        <h3>Detailed Supply Records</h3>
        <table class="table-break">
            <thead>
                <tr>
                    <th>Product Name</th>
                    <th>Code</th>
                    <th>Category</th>
                    <th>Type</th>
                    <th>Quantity</th>
                    <th>Location</th>
                    <th>Used By</th>
                    <th>Date</th>
                    <th>Reason/Remarks</th>
                </tr>
            </thead>
            <tbody>
                @foreach($data['supply_details'] as $supply)
                <tr>
                    <td>{{ $supply['name'] ?? 'N/A' }}</td>
                    <td>{{ $supply['code'] ?? 'N/A' }}</td>
                    <td>{{ $supply['category'] ?? 'N/A' }}</td>
                    <td>{{ ucfirst($supply['type'] ?? 'N/A') }}</td>
                    <td>{{ number_format($supply['quantity'] ?? 0) }}</td>
                    <td>{{ $supply['location'] ?? 'N/A' }}</td>
                    <td>{{ $supply['used_by'] ?? 'N/A' }}</td>
                    <td>{{ $supply['date_used_rejected'] ?? 'N/A' }}</td>
                    <td>{{ $supply['reason'] ?? $supply['remarks'] ?? 'N/A' }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>
    @endif

    @if(isset($data['movements']) && count($data['movements']) > 0)
        <h3>Recent Movements</h3>
        <table>
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Item Name</th>
                    <th>Movement Type</th>
                    <th>Quantity</th>
                    <th>Handled By</th>
                    <th>Remarks</th>
                </tr>
            </thead>
            <tbody>
                @foreach($data['movements'] as $movement)
                <tr>
                    <td>{{ $movement['created_at'] ?? 'N/A' }}</td>
                    <td>{{ $movement['inventory_item']['item_name'] ?? 'N/A' }}</td>
                    <td>{{ $movement['movement_type'] ?? 'N/A' }}</td>
                    <td>{{ $movement['quantity'] ?? 0 }}</td>
                    <td>{{ $movement['created_by'] ?? 'N/A' }}</td>
                    <td>{{ $movement['remarks'] ?? 'N/A' }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>
    @endif

    @if(!isset($data['summary']) && !isset($data['top_consumed_items']) && !isset($data['movements']))
        <div class="no-data">
            <h3>No Data Available</h3>
            <p>This report does not contain any data to display.</p>
        </div>
    @endif
</body>
</html>
