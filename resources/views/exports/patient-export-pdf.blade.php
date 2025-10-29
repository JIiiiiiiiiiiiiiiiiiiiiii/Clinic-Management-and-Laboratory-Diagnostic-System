<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Patient Details Report</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            font-size: 12px;
            line-height: 1.6;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
            color: #333;
        }
        .hospital-header {
            text-align: center;
            margin-bottom: 20px;
            padding: 10px 0;
            position: relative;
            background-color: white;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .hospital-logo {
            position: absolute;
            left: 20px;
            top: 20px;
        }
        
        .hospital-info {
            text-align: center;
            width: 100%;
            padding: 20px;
        }
        
        .hospital-name {
            font-size: 24px;
            font-weight: bold;
            color: #2d5a27;
            margin: 0 0 5px 0;
        }
        
        .hospital-address {
            font-size: 12px;
            color: #333;
            margin: 0 0 3px 0;
        }
        
        .hospital-slogan {
            font-size: 14px;
            font-style: italic;
            color: #1e40af;
            margin: 0 0 5px 0;
        }
        
        .hospital-motto {
            font-size: 16px;
            font-weight: bold;
            color: #2d5a27;
            margin: 0 0 5px 0;
        }
        
        .hospital-contact {
            font-size: 10px;
            color: #666;
            margin: 0;
        }
        
        .report-title {
            text-align: center;
            margin: 30px 0;
            font-size: 18px;
            font-weight: bold;
            color: #2d5a27;
        }
        
        .report-meta {
            text-align: center;
            margin-bottom: 30px;
            font-size: 12px;
            color: #666;
        }
        
        .cards-container {
            display: flex;
            flex-wrap: wrap;
            gap: 20px;
            margin: 20px 0;
        }
        
        .card {
            background-color: white;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            overflow: hidden;
            flex: 1;
            min-width: 300px;
        }
        
        .card-header {
            background-color: #f8f9fa;
            padding: 12px 16px;
            border-bottom: 1px solid #e9ecef;
        }
        
        .card-title {
            font-weight: bold;
            font-size: 14px;
            color: #495057;
            margin: 0;
        }
        
        .card-content {
            padding: 16px;
        }
        
        .field-row {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 12px;
            padding-bottom: 8px;
            border-bottom: 1px solid #f1f3f4;
        }
        
        .field-row:last-child {
            margin-bottom: 0;
            padding-bottom: 0;
            border-bottom: none;
        }
        
        .field-label {
            font-weight: 600;
            color: #495057;
            flex: 1;
            margin-right: 16px;
        }
        
        .field-value {
            color: #212529;
            flex: 1;
            text-align: right;
            word-break: break-word;
        }
        
        .full-width-card {
            width: 100%;
        }
        
        .footer {
            margin-top: 40px;
            text-align: center;
            font-size: 10px;
            color: #666;
            background-color: white;
            padding: 15px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
    </style>
</head>
<body>
    <div class="hospital-header">
        <div class="hospital-logo">
            <img src="{{ public_path('st-james-logo.png') }}" alt="St. James Hospital Logo" style="width: 80px; height: 80px;">
        </div>
        <div class="hospital-info">
            <div class="hospital-name">St. James Hospital Clinic, Inc.</div>
            <div class="hospital-address">San Isidro City of Cabuyao Laguna</div>
            <div class="hospital-slogan">Santa Rosa's First in Quality Healthcare Service</div>
            <div class="hospital-motto">PASYENTE MUNA</div>
            <div class="hospital-contact">
                Tel. Nos. 02.85844533; 049.5341254; 049.5020058; Fax No.: local 307<br>
                email add: info@stjameshospital.com.ph
            </div>
        </div>
    </div>

    <div class="report-title">Patient Details Report</div>
    <div class="report-meta">Generated on: {{ date('Y-m-d H:i:s') }}</div>

    @if(!empty($data))
        <div class="cards-container">
            @php
                $patientInfo = [];
                $contactInfo = [];
                $demographics = [];
                $emergencyContact = [];
                $medicalHistory = [];
                
                foreach($data as $row) {
                    if(isset($row[0]) && isset($row[1])) {
                        $field = $row[0];
                        $value = $row[1] ?: 'N/A';
                        
                        if(strpos($field, 'INFORMATION') !== false) {
                            // Skip section headers
                        } elseif(in_array($field, ['Patient No', 'Full Name', 'Birthdate', 'Age', 'Sex', 'Civil Status', 'Nationality', 'Registration Date'])) {
                            $patientInfo[] = ['label' => $field, 'value' => $value];
                        } elseif(in_array($field, ['Mobile No', 'Telephone No', 'Address'])) {
                            $contactInfo[] = ['label' => $field, 'value' => $value];
                        } elseif(in_array($field, ['Occupation', 'Religion'])) {
                            $demographics[] = ['label' => $field, 'value' => $value];
                        } elseif(in_array($field, ['Contact Name', 'Relationship'])) {
                            $emergencyContact[] = ['label' => $field, 'value' => $value];
                        } elseif(in_array($field, ['Drug Allergies', 'Food Allergies', 'Past Medical History', 'Family History', 'Social History', 'Obstetrics History'])) {
                            $medicalHistory[] = ['label' => $field, 'value' => $value];
                        }
                    }
                }
            @endphp

            <!-- Patient Identification Card -->
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Patient Identification</h3>
                </div>
                <div class="card-content">
                    @foreach($patientInfo as $field)
                        <div class="field-row">
                            <span class="field-label">{{ $field['label'] }}</span>
                            <span class="field-value">{{ $field['value'] }}</span>
                        </div>
                    @endforeach
                </div>
            </div>

            <!-- Contact Information Card -->
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Contact Information</h3>
                </div>
                <div class="card-content">
                    @foreach($contactInfo as $field)
                        <div class="field-row">
                            <span class="field-label">{{ $field['label'] }}</span>
                            <span class="field-value">{{ $field['value'] }}</span>
                        </div>
                    @endforeach
                </div>
            </div>

            <!-- Demographics Card -->
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Demographics</h3>
                </div>
                <div class="card-content">
                    @foreach($demographics as $field)
                        <div class="field-row">
                            <span class="field-label">{{ $field['label'] }}</span>
                            <span class="field-value">{{ $field['value'] }}</span>
                        </div>
                    @endforeach
                </div>
            </div>

            <!-- Emergency Contact Card -->
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Emergency Contact</h3>
                </div>
                <div class="card-content">
                    @foreach($emergencyContact as $field)
                        <div class="field-row">
                            <span class="field-label">{{ $field['label'] }}</span>
                            <span class="field-value">{{ $field['value'] }}</span>
                        </div>
                    @endforeach
                </div>
            </div>

            <!-- Medical History & Allergies Card (Full Width) -->
            <div class="card full-width-card">
                <div class="card-header">
                    <h3 class="card-title">Medical History & Allergies</h3>
                </div>
                <div class="card-content">
                    @foreach($medicalHistory as $field)
                        <div class="field-row">
                            <span class="field-label">{{ $field['label'] }}</span>
                            <span class="field-value">{{ $field['value'] }}</span>
                        </div>
                    @endforeach
                </div>
            </div>
        </div>
    @else
        <div class="cards-container">
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">No Data Available</h3>
                </div>
                <div class="card-content">
                    <div class="field-row">
                        <span class="field-label">Status</span>
                        <span class="field-value">No data available for export</span>
                    </div>
                </div>
            </div>
        </div>
    @endif

    <div class="footer">
        <p>This report was generated automatically by the Clinic Management System.</p>
    </div>
</body>
</html>