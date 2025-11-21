<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $title ?? 'Patient Report' }}</title>
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
        .header .date-range {
            color: #666;
            margin: 10px 0 0 0;
            font-size: 14px;
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
        .patients-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }
        .patients-table th {
            background: #f3f4f6;
            color: #374151;
            padding: 12px 8px;
            text-align: left;
            font-weight: bold;
            border: 1px solid #d1d5db;
        }
        .patients-table td {
            padding: 10px 8px;
            border: 1px solid #d1d5db;
            vertical-align: top;
        }
        .patients-table tr:nth-child(even) {
            background: #f9fafb;
        }
        .gender {
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 11px;
            font-weight: bold;
            text-transform: uppercase;
        }
        .gender.male {
            background: #dbeafe;
            color: #1e40af;
        }
        .gender.female {
            background: #fce7f3;
            color: #be185d;
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
        <h1>Patient Report</h1>
        <h2>{{ $title ?? 'Patient Statistics and Details' }}</h2>
        <div class="date-range">
            @if(isset($filters) && (isset($filters['date_from']) || isset($filters['date_to'])))
                Date Range: From {{ $filters['date_from'] ?? 'N/A' }} To {{ $filters['date_to'] ?? 'N/A' }}
            @elseif(isset($dateRange))
                Date Range: {{ $dateRange }}
            @else
                Date Range: All Time
            @endif
        </div>
    </div>

    <div class="summary-section">
        <h2 class="section-title">Patient Statistics</h2>
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
                        <td><strong>Total Patients</strong></td>
                        <td>{{ $data['total_patients'] ?? 0 }}</td>
                        <td>100%</td>
                    </tr>
                    <tr>
                        <td><strong>New Patients</strong></td>
                        <td>{{ $data['new_patients'] ?? 0 }}</td>
                        <td>{{ $data['total_patients'] > 0 ? number_format((($data['new_patients'] ?? 0) / $data['total_patients']) * 100, 1) : 0 }}%</td>
                    </tr>
                    <tr>
                        <td><strong>Male Patients</strong></td>
                        <td>{{ $data['male_patients'] ?? 0 }}</td>
                        <td>{{ $data['total_patients'] > 0 ? number_format((($data['male_patients'] ?? 0) / $data['total_patients']) * 100, 1) : 0 }}%</td>
                    </tr>
                    <tr>
                        <td><strong>Female Patients</strong></td>
                        <td>{{ $data['female_patients'] ?? 0 }}</td>
                        <td>{{ $data['total_patients'] > 0 ? number_format((($data['female_patients'] ?? 0) / $data['total_patients']) * 100, 1) : 0 }}%</td>
                    </tr>
                </tbody>
            </table>
        @else
            <div class="no-data">
                No patient data available.
            </div>
        @endif
    </div>

    @if(isset($data['age_groups']) && is_array($data['age_groups']) && count($data['age_groups']) > 0)
    <div class="summary-section">
        <h2 class="section-title">Age Group Summary</h2>
        <table class="summary-table">
            <thead>
                <tr>
                    <th>Age Group</th>
                    <th>Count</th>
                    <th>Percentage</th>
                </tr>
            </thead>
            <tbody>
                @foreach($data['age_groups'] as $ageGroup => $count)
                    <tr>
                        <td><strong>{{ $ageGroup }}</strong></td>
                        <td>{{ $count }}</td>
                        <td>{{ $data['total_patients'] > 0 ? number_format(($count / $data['total_patients']) * 100, 1) : 0 }}%</td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    </div>
    @endif

    <div class="summary-section">
        <h2 class="section-title">Patient Details</h2>
        @if(isset($data['patient_details']) && is_array($data['patient_details']) && count($data['patient_details']) > 0)
            <table class="patients-table">
                <thead>
                    <tr>
                        <th>Patient No</th>
                        <th>Full Name</th>
                        <th>Age</th>
                        <th>Gender</th>
                        <th>Mobile No</th>
                        <th>Address</th>
                        <th>Appointments</th>
                        <th>Lab Orders</th>
                        <th>Registration Date</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($data['patient_details'] as $patient)
                        <tr>
                            <td>{{ $patient['patient_no'] ?? 'N/A' }}</td>
                            <td>{{ $patient['full_name'] ?? 'N/A' }}</td>
                            <td>{{ $patient['age'] ?? 'N/A' }}</td>
                            <td>
                                @if(isset($patient['sex']) && $patient['sex'])
                                    <span class="gender {{ strtolower($patient['sex']) }}">
                                        {{ ucfirst($patient['sex']) }}
                                    </span>
                                @else
                                    N/A
                                @endif
                            </td>
                            <td>{{ $patient['mobile_no'] ?? 'N/A' }}</td>
                            <td>{{ $patient['present_address'] ?? 'N/A' }}</td>
                            <td>{{ $patient['appointments_count'] ?? 0 }}</td>
                            <td>{{ $patient['lab_orders_count'] ?? 0 }}</td>
                            <td>{{ isset($patient['created_at']) ? \Carbon\Carbon::parse($patient['created_at'])->format('M d, Y') : 'N/A' }}</td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        @else
            <div class="no-data">
                No patient details found for the selected criteria.
            </div>
        @endif
    </div>

    <div class="footer">
        <p>Generated on {{ now()->format('F d, Y \a\t H:i:s') }} | St. James Medical Center</p>
        <p>This report contains confidential patient information and should be handled securely.</p>
    </div>
</body>
</html>
