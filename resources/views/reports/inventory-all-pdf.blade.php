<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>All Inventory Reports</title>
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
        .summary {
            margin-bottom: 30px;
            padding: 15px;
            background-color: #f9f9f9;
            border-left: 4px solid #333;
        }
        .no-reports {
            text-align: center;
            padding: 40px;
            color: #666;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>All Inventory Reports</h1>
        <p>Generated on {{ date('Y-m-d H:i:s') }}</p>
    </div>

    @if($reports->count() > 0)
        <div class="summary">
            <h3>Summary</h3>
            <p><strong>Total Reports:</strong> {{ $reports->count() }}</p>
            <p><strong>Active Reports:</strong> {{ $reports->where('status', 'active')->count() }}</p>
            <p><strong>Exported Reports:</strong> {{ $reports->whereNotNull('exported_at')->count() }}</p>
        </div>

        <table>
            <thead>
                <tr>
                    <th>Report Name</th>
                    <th>Type</th>
                    <th>Period</th>
                    <th>Created By</th>
                    <th>Created At</th>
                    <th>Status</th>
                    <th>Exported At</th>
                </tr>
            </thead>
            <tbody>
                @foreach($reports as $report)
                <tr>
                    <td>{{ $report->report_name }}</td>
                    <td>
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
                    </td>
                    <td>{{ ucfirst($report->period) }}</td>
                    <td>{{ $report->creator->name ?? 'Unknown' }}</td>
                    <td>{{ $report->created_at->format('Y-m-d H:i:s') }}</td>
                    <td>{{ ucfirst($report->status) }}</td>
                    <td>{{ $report->exported_at ? $report->exported_at->format('Y-m-d H:i:s') : 'Never' }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>
    @else
        <div class="no-reports">
            <h3>No Reports Found</h3>
            <p>No inventory reports have been generated yet.</p>
        </div>
    @endif
</body>
</html>
