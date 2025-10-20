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
                <th>Patient ID</th>
                <th>Name</th>
                <th>Date of Birth</th>
                <th>Age</th>
                <th>Sex</th>
                <th>Mobile</th>
                <th>Address</th>
                <th>Registration Date</th>
            </tr>
        </thead>
        <tbody>
            @foreach($data as $patient)
            <tr>
                <td>{{ $patient->patient_code }}</td>
                <td>{{ $patient->first_name }} {{ $patient->last_name }}</td>
                <td>{{ $patient->date_of_birth ? $patient->date_of_birth->format('M d, Y') : 'N/A' }}</td>
                <td>{{ $patient->date_of_birth ? $patient->date_of_birth->age : 'N/A' }}</td>
                <td>{{ $patient->sex }}</td>
                <td>{{ $patient->mobile_no }}</td>
                <td>{{ $patient->address }}</td>
                <td>{{ $patient->created_at->format('M d, Y H:i') }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <div class="summary">
        <h3>Summary</h3>
        <p><strong>Total Patients:</strong> {{ $data->count() }}</p>
        <p><strong>Male Patients:</strong> {{ $data->where('sex', 'Male')->count() }}</p>
        <p><strong>Female Patients:</strong> {{ $data->where('sex', 'Female')->count() }}</p>
        <p><strong>Average Age:</strong> {{ $data->whereNotNull('date_of_birth')->avg(function($p) { return $p->date_of_birth->age; }) ? number_format($data->whereNotNull('date_of_birth')->avg(function($p) { return $p->date_of_birth->age; }), 1) : 'N/A' }} years</p>
    </div>

    <div class="footer">
        Generated on {{ now()->format('M d, Y H:i:s') }} | Saint James Hospital Management System
    </div>
</body>
</html>
