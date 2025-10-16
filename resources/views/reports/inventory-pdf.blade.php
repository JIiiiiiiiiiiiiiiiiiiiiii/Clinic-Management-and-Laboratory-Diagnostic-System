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
            <h3>Summary Statistics</h3>
            <div class="summary-grid">
                @foreach($data['summary'] as $key => $value)
                    <div class="summary-item">
                        <h4>{{ ucwords(str_replace('_', ' ', $key)) }}</h4>
                        <p>{{ $value }}</p>
                    </div>
                @endforeach
            </div>
        </div>
    @endif

    @if(isset($data['department_stats']))
        <div class="summary">
            <h3>Department Statistics</h3>
            <div class="summary-grid">
                @foreach($data['department_stats'] as $department => $stats)
                    <div class="summary-item">
                        <h4>{{ ucwords(str_replace('_', ' ', $department)) }}</h4>
                        @foreach($stats as $stat => $value)
                            <p><strong>{{ ucwords(str_replace('_', ' ', $stat)) }}:</strong> {{ $value }}</p>
                        @endforeach
                    </div>
                @endforeach
            </div>
        </div>
    @endif

    @if(isset($data['top_consumed_items']) && count($data['top_consumed_items']) > 0)
        <h3>Top Consumed Items</h3>
        <table>
            <thead>
                <tr>
                    <th>Item Name</th>
                    <th>Category</th>
                    <th>Department</th>
                    <th>Current Stock</th>
                    <th>Consumed</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                @foreach($data['top_consumed_items'] as $item)
                <tr>
                    <td>{{ $item['item_name'] ?? 'N/A' }}</td>
                    <td>{{ $item['category'] ?? 'N/A' }}</td>
                    <td>{{ $item['assigned_to'] ?? 'N/A' }}</td>
                    <td>{{ $item['stock'] ?? 0 }}</td>
                    <td>{{ $item['consumed'] ?? 0 }}</td>
                    <td>{{ $item['status'] ?? 'N/A' }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>
    @endif

    @if(isset($data['top_rejected_items']) && count($data['top_rejected_items']) > 0)
        <h3>Top Rejected Items</h3>
        <table>
            <thead>
                <tr>
                    <th>Item Name</th>
                    <th>Category</th>
                    <th>Department</th>
                    <th>Current Stock</th>
                    <th>Rejected</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                @foreach($data['top_rejected_items'] as $item)
                <tr>
                    <td>{{ $item['item_name'] ?? 'N/A' }}</td>
                    <td>{{ $item['category'] ?? 'N/A' }}</td>
                    <td>{{ $item['assigned_to'] ?? 'N/A' }}</td>
                    <td>{{ $item['stock'] ?? 0 }}</td>
                    <td>{{ $item['rejected'] ?? 0 }}</td>
                    <td>{{ $item['status'] ?? 'N/A' }}</td>
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
