<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Patient Summary - {{ $patient->full_name ?? 'Unknown Patient' }}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 20px;
            line-height: 1.6;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #333;
            padding-bottom: 20px;
        }
        .section {
            margin-bottom: 25px;
            page-break-inside: avoid;
        }
        .section-title {
            background-color: #1976D2;
            color: white;
            padding: 10px;
            margin: 0 0 15px 0;
            font-weight: bold;
            font-size: 16px;
        }
        .field-row {
            display: flex;
            margin-bottom: 8px;
            border-bottom: 1px solid #eee;
            padding: 5px 0;
        }
        .field-label {
            font-weight: bold;
            width: 200px;
            flex-shrink: 0;
        }
        .field-value {
            flex: 1;
        }
        .table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
        }
        .table th, .table td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
        }
        .table th {
            background-color: #f5f5f5;
            font-weight: bold;
        }
        .no-data {
            color: #666;
            font-style: italic;
        }
        @media print {
            body { margin: 0; }
            .section { page-break-inside: avoid; }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Patient Summary Report</h1>
        <h2>{{ $patient->full_name ?? 'Unknown Patient' }} ({{ $patient->patient_no ?? 'N/A' }})</h2>
        <p>Generated on: {{ now()->format('F d, Y \a\t g:i A') }}</p>
    </div>

    <div class="section">
        <div class="section-title">Patient Information</div>
        <div class="field-row">
            <div class="field-label">Patient Number:</div>
            <div class="field-value">{{ $patient->patient_no }}</div>
        </div>
        <div class="field-row">
            <div class="field-label">Full Name:</div>
            <div class="field-value">{{ $patient->full_name }}</div>
        </div>
        <div class="field-row">
            <div class="field-label">Birthdate:</div>
            <div class="field-value">{{ $patient->birthdate?->format('F d, Y') ?? 'N/A' }}</div>
        </div>
        <div class="field-row">
            <div class="field-label">Age:</div>
            <div class="field-value">{{ $patient->age }} years old</div>
        </div>
        <div class="field-row">
            <div class="field-label">Sex:</div>
            <div class="field-value">{{ ucfirst($patient->sex) }}</div>
        </div>
        <div class="field-row">
            <div class="field-label">Mobile Number:</div>
            <div class="field-value">{{ $patient->mobile_no }}</div>
        </div>
        <div class="field-row">
            <div class="field-label">Telephone Number:</div>
            <div class="field-value">{{ $patient->telephone_no ?? 'N/A' }}</div>
        </div>
        <div class="field-row">
            <div class="field-label">Address:</div>
            <div class="field-value">{{ $patient->present_address }}</div>
        </div>
        <div class="field-row">
            <div class="field-label">Occupation:</div>
            <div class="field-value">{{ $patient->occupation ?? 'N/A' }}</div>
        </div>
        <div class="field-row">
            <div class="field-label">Religion:</div>
            <div class="field-value">{{ $patient->religion ?? 'N/A' }}</div>
        </div>
        <div class="field-row">
            <div class="field-label">Civil Status:</div>
            <div class="field-value">{{ ucfirst($patient->civil_status) }}</div>
        </div>
        <div class="field-row">
            <div class="field-label">Nationality:</div>
            <div class="field-value">{{ $patient->nationality ?? 'N/A' }}</div>
        </div>
        <div class="field-row">
            <div class="field-label">Registration Date:</div>
            <div class="field-value">{{ $patient->created_at->format('F d, Y \a\t g:i A') }}</div>
        </div>
    </div>

    <div class="section">
        <div class="section-title">Emergency Contact</div>
        <div class="field-row">
            <div class="field-label">Contact Name:</div>
            <div class="field-value">{{ $patient->informant_name }}</div>
        </div>
        <div class="field-row">
            <div class="field-label">Relationship:</div>
            <div class="field-value">{{ $patient->relationship }}</div>
        </div>
    </div>

    <div class="section">
        <div class="section-title">Insurance Information</div>
        <div class="field-row">
            <div class="field-label">Company:</div>
            <div class="field-value">{{ $patient->company_name ?? 'N/A' }}</div>
        </div>
        <div class="field-row">
            <div class="field-label">HMO:</div>
            <div class="field-value">{{ $patient->hmo_name ?? 'N/A' }}</div>
        </div>
        <div class="field-row">
            <div class="field-label">HMO ID:</div>
            <div class="field-value">{{ $patient->hmo_company_id_no ?? 'N/A' }}</div>
        </div>
        <div class="field-row">
            <div class="field-label">Validation Code:</div>
            <div class="field-value">{{ $patient->validation_approval_code ?? 'N/A' }}</div>
        </div>
        <div class="field-row">
            <div class="field-label">Validity:</div>
            <div class="field-value">{{ $patient->validity ?? 'N/A' }}</div>
        </div>
    </div>

    <div class="section">
        <div class="section-title">Medical History</div>
        <div class="field-row">
            <div class="field-label">Drug Allergies:</div>
            <div class="field-value">{{ $patient->drug_allergies ?? 'None' }}</div>
        </div>
        <div class="field-row">
            <div class="field-label">Food Allergies:</div>
            <div class="field-value">{{ $patient->food_allergies ?? 'None' }}</div>
        </div>
        <div class="field-row">
            <div class="field-label">Past Medical History:</div>
            <div class="field-value">{{ $patient->past_medical_history ?? 'None' }}</div>
        </div>
        <div class="field-row">
            <div class="field-label">Family History:</div>
            <div class="field-value">{{ $patient->family_history ?? 'None' }}</div>
        </div>
        <div class="field-row">
            <div class="field-label">Social History:</div>
            <div class="field-value">{{ $patient->social_personal_history ?? 'None' }}</div>
        </div>
        <div class="field-row">
            <div class="field-label">Obstetrics History:</div>
            <div class="field-value">{{ $patient->obstetrics_gynecology_history ?? 'None' }}</div>
        </div>
    </div>

    <div class="section">
        <div class="section-title">Visit History ({{ $patient->visits->count() }} total visits)</div>
        @if($patient->visits->count() > 0)
            <table class="table">
                <thead>
                    <tr>
                        <th>Visit Date</th>
                        <th>Chief Complaint</th>
                        <th>Attending Physician</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($patient->visits as $visit)
                        <tr>
                            <td>{{ $visit->arrival_date?->format('M d, Y') ?? 'N/A' }}</td>
                            <td>{{ $visit->reason_for_consult ?? 'N/A' }}</td>
                            <td>{{ $visit->attending_physician ?? 'N/A' }}</td>
                            <td>{{ $visit->status ?? 'N/A' }}</td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        @else
            <p class="no-data">No visits recorded for this patient.</p>
        @endif
    </div>

    <div class="section">
        <div class="section-title">Laboratory Orders ({{ $patient->labOrders->count() }} total orders)</div>
        @if($patient->labOrders->count() > 0)
            <table class="table">
                <thead>
                    <tr>
                        <th>Order Date</th>
                        <th>Test Type</th>
                        <th>Status</th>
                        <th>Results Available</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($patient->labOrders as $order)
                        <tr>
                            <td>{{ $order->created_at->format('M d, Y') }}</td>
                            <td>{{ $order->labTests->pluck('name')->join(', ') ?: 'N/A' }}</td>
                            <td>{{ $order->status ?? 'N/A' }}</td>
                            <td>{{ $order->results->count() > 0 ? 'Yes' : 'No' }}</td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        @else
            <p class="no-data">No laboratory orders for this patient.</p>
        @endif
    </div>

    <script>
        // Auto-print when page loads
        window.onload = function() {
            window.print();
        };
    </script>
</body>
</html>
