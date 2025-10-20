<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>{{ $title }} - Saint James Hospital</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            font-size: 12px;
            line-height: 1.4;
            color: #333;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #2563eb;
            padding-bottom: 20px;
        }
        .hospital-name {
            font-size: 24px;
            font-weight: bold;
            color: #2563eb;
            margin-bottom: 5px;
        }
        .report-title {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 10px;
        }
        .date-range {
            font-size: 14px;
            color: #666;
        }
        .table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }
        .table th,
        .table td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
        }
        .table th {
            background-color: #f8fafc;
            font-weight: bold;
            color: #374151;
        }
        .table tr:nth-child(even) {
            background-color: #f9fafb;
        }
        .summary {
            margin-top: 30px;
            padding: 15px;
            background-color: #f0f9ff;
            border-left: 4px solid #2563eb;
        }
        .summary h3 {
            margin: 0 0 10px 0;
            color: #2563eb;
        }
        .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 10px;
            color: #666;
            border-top: 1px solid #ddd;
            padding-top: 10px;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="hospital-name">Saint James Hospital</div>
        <div class="report-title">{{ $title }}</div>
        <div class="date-range">
            Period: {{ $dateRange['start']->format('M d, Y') }} - {{ $dateRange['end']->format('M d, Y') }}
        </div>
    </div>

    <table class="table">
        <thead>
            <tr>
                <th>Appointment ID</th>
                <th>Patient Name</th>
                <th>Doctor</th>
                <th>Date</th>
                <th>Time</th>
                <th>Status</th>
                <th>Specialist Type</th>
            </tr>
        </thead>
        <tbody>
            @foreach($data as $appointment)
            <tr>
                <td>{{ $appointment->id }}</td>
                <td>{{ $appointment->patient ? $appointment->patient->first_name . ' ' . $appointment->patient->last_name : 'N/A' }}</td>
                <td>{{ $appointment->doctor ? $appointment->doctor->first_name . ' ' . $appointment->doctor->last_name : 'N/A' }}</td>
                <td>{{ $appointment->appointment_date ? $appointment->appointment_date->format('M d, Y') : 'N/A' }}</td>
                <td>{{ $appointment->appointment_time }}</td>
                <td>{{ $appointment->status }}</td>
                <td>{{ $appointment->specialist_type }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <div class="summary">
        <h3>Summary</h3>
        <p><strong>Total Appointments:</strong> {{ $data->count() }}</p>
        <p><strong>Completed:</strong> {{ $data->where('status', 'completed')->count() }}</p>
        <p><strong>Pending:</strong> {{ $data->where('status', 'pending')->count() }}</p>
        <p><strong>Cancelled:</strong> {{ $data->where('status', 'cancelled')->count() }}</p>
    </div>

    <div class="footer">
        Generated on {{ now()->format('M d, Y H:i:s') }} | Saint James Hospital Management System
    </div>
</body>
</html>
