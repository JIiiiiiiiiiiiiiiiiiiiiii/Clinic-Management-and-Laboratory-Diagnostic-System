<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $title }}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            color: #333;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 20px;
        }
        .header h1 {
            margin: 0;
            color: #1f2937;
            font-size: 24px;
        }
        .header p {
            margin: 5px 0 0 0;
            color: #6b7280;
            font-size: 14px;
        }
        .summary-stats {
            display: flex;
            justify-content: space-around;
            margin-bottom: 30px;
            flex-wrap: wrap;
        }
        .stat-card {
            background: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 15px;
            text-align: center;
            min-width: 120px;
            margin: 5px;
        }
        .stat-number {
            font-size: 24px;
            font-weight: bold;
            color: #1f2937;
        }
        .stat-label {
            font-size: 12px;
            color: #6b7280;
            margin-top: 5px;
        }
        .departments {
            display: flex;
            gap: 20px;
            margin-bottom: 30px;
        }
        .department-card {
            flex: 1;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 20px;
        }
        .department-title {
            font-size: 16px;
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 15px;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 10px;
        }
        .department-stats {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }
        .stat-row {
            display: flex;
            justify-content: space-between;
            font-size: 14px;
        }
        .stat-row .label {
            color: #6b7280;
        }
        .stat-row .value {
            font-weight: bold;
            color: #1f2937;
        }
        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }
        .items-table th,
        .items-table td {
            border: 1px solid #e5e7eb;
            padding: 8px 12px;
            text-align: left;
        }
        .items-table th {
            background-color: #f9fafb;
            font-weight: bold;
            color: #1f2937;
        }
        .items-table tr:nth-child(even) {
            background-color: #f9fafb;
        }
        .status-badge {
            padding: 2px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: bold;
        }
        .status-in-stock {
            background-color: #dcfce7;
            color: #166534;
        }
        .status-low-stock {
            background-color: #fef3c7;
            color: #92400e;
        }
        .status-out-of-stock {
            background-color: #fee2e2;
            color: #991b1b;
        }
        .footer {
            margin-top: 30px;
            text-align: center;
            color: #6b7280;
            font-size: 12px;
            border-top: 1px solid #e5e7eb;
            padding-top: 20px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>{{ $title }}</h1>
        <p>Generated on {{ date('F j, Y \a\t g:i A') }}</p>
    </div>

    <!-- Summary Statistics -->
    <div class="summary-stats">
        <div class="stat-card">
            <div class="stat-number">{{ $data['summary']['total_items'] }}</div>
            <div class="stat-label">Total Items</div>
        </div>
        <div class="stat-card">
            <div class="stat-number">{{ $data['summary']['total_departments'] }}</div>
            <div class="stat-label">Departments</div>
        </div>
        <div class="stat-card">
            <div class="stat-number">{{ $data['summary']['low_stock_items'] }}</div>
            <div class="stat-label">Low Stock</div>
        </div>
        <div class="stat-card">
            <div class="stat-number">{{ $data['summary']['out_of_stock_items'] }}</div>
            <div class="stat-label">Out of Stock</div>
        </div>
    </div>

    <!-- Department Statistics -->
    <div class="departments">
        <div class="department-card">
            <div class="department-title">Doctor & Nurse Department</div>
            <div class="department-stats">
                <div class="stat-row">
                    <span class="label">Total Items:</span>
                    <span class="value">{{ $data['department_stats']['doctor_nurse']['total_items'] }}</span>
                </div>
                <div class="stat-row">
                    <span class="label">Low Stock:</span>
                    <span class="value">{{ $data['department_stats']['doctor_nurse']['low_stock'] }}</span>
                </div>
                <div class="stat-row">
                    <span class="label">Out of Stock:</span>
                    <span class="value">{{ $data['department_stats']['doctor_nurse']['out_of_stock'] }}</span>
                </div>
            </div>
        </div>

        <div class="department-card">
            <div class="department-title">Med Tech Department</div>
            <div class="department-stats">
                <div class="stat-row">
                    <span class="label">Total Items:</span>
                    <span class="value">{{ $data['department_stats']['med_tech']['total_items'] }}</span>
                </div>
                <div class="stat-row">
                    <span class="label">Low Stock:</span>
                    <span class="value">{{ $data['department_stats']['med_tech']['low_stock'] }}</span>
                </div>
                <div class="stat-row">
                    <span class="label">Out of Stock:</span>
                    <span class="value">{{ $data['department_stats']['med_tech']['out_of_stock'] }}</span>
                </div>
            </div>
        </div>
    </div>

    <!-- All Supply Items Table -->
    <h3 style="margin-top: 30px; margin-bottom: 15px; color: #1f2937;">All Supply Items by Department</h3>
    <table class="items-table">
        <thead>
            <tr>
                <th>Item Name</th>
                <th>Category</th>
                <th>Department</th>
                <th>Current Stock</th>
                <th>Status</th>
            </tr>
        </thead>
        <tbody>
            @foreach($data['all_items'] as $item)
            <tr>
                <td>{{ $item['item_name'] }}</td>
                <td>{{ $item['category'] }}</td>
                <td>{{ $item['assigned_to'] }}</td>
                <td>{{ $item['stock'] }}</td>
                <td>
                    <span class="status-badge status-{{ strtolower(str_replace(' ', '-', $item['status'])) }}">
                        {{ $item['status'] }}
                    </span>
                </td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <div class="footer">
        <p>This report was generated automatically by the Clinic Management System</p>
    </div>
</body>
</html>
