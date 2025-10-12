<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Inventory Report</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 20px;
            color: #333;
        }
        
        .hospital-header {
            text-align: center;
            margin-bottom: 10px;
            padding: 5px 0;
            position: relative;
        }
        
        .hospital-logo {
            position: absolute;
            left: 0;
            top: 0;
        }
        
        .hospital-info {
            text-align: center;
            width: 100%;
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
            margin: 20px 0;
            font-size: 18px;
            font-weight: bold;
            color: #2d5a27;
        }
        
        .report-meta {
            text-align: center;
            margin-bottom: 20px;
            font-size: 12px;
            color: #666;
        }
        .section {
            margin-bottom: 25px;
        }
        .section h2 {
            color: #374151;
            font-size: 18px;
            margin-bottom: 15px;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 5px;
        }
        .summary-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 15px;
            margin-bottom: 20px;
        }
        .summary-card {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 15px;
            text-align: center;
        }
        .summary-card .number {
            font-size: 24px;
            font-weight: bold;
            color: #1e40af;
        }
        .summary-card .label {
            font-size: 12px;
            color: #64748b;
            margin-top: 5px;
        }
        .department-section {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 20px;
        }
        .department-card {
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 15px;
        }
        .department-card h3 {
            margin: 0 0 15px 0;
            color: #374151;
            font-size: 16px;
        }
        .stat-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
            padding: 5px 0;
        }
        .stat-row:not(:last-child) {
            border-bottom: 1px solid #f1f5f9;
        }
        .stat-label {
            color: #64748b;
            font-size: 14px;
        }
        .stat-value {
            font-weight: bold;
            color: #374151;
        }
        .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            text-align: center;
            color: #64748b;
            font-size: 12px;
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
    
    <div class="report-title">Inventory Report</div>
    <div class="report-meta">
        Generated on: {{ now()->format('M d, Y H:i A') }} | 
        Report Type: {{ $report->report_name }} | 
        Period: {{ ucfirst($report->period) }} ({{ $report->start_date }} to {{ $report->end_date }})
    </div>

    <div class="section">
        <h2>Inventory Summary</h2>
        <div class="summary-grid">
            <div class="summary-card">
                <div class="number">{{ $data['summary']['totalItems'] }}</div>
                <div class="label">
                    @if($report->filters['report_type'] === 'incoming-outgoing')
                        Total Movements
                    @else
                        Total Items
                    @endif
                </div>
            </div>
            <div class="summary-card">
                <div class="number" style="color: #059669;">{{ $data['summary']['totalConsumed'] }}</div>
                <div class="label">
                    @if($report->filters['report_type'] === 'incoming-outgoing')
                        Incoming Movements
                    @else
                        Items Consumed
                    @endif
                </div>
            </div>
            <div class="summary-card">
                <div class="number" style="color: #dc2626;">{{ $data['summary']['totalRejected'] }}</div>
                <div class="label">
                    @if($report->filters['report_type'] === 'incoming-outgoing')
                        Outgoing Movements
                    @else
                        Items Rejected
                    @endif
                </div>
            </div>
            <div class="summary-card">
                <div class="number" style="color: #d97706;">{{ $data['summary']['lowStockItems'] }}</div>
                <div class="label">
                    @if($report->filters['report_type'] === 'incoming-outgoing')
                        Outgoing Count
                    @else
                        Low Stock
                    @endif
                </div>
            </div>
        </div>
    </div>

    <div class="section">
        <h2>Department Breakdown</h2>
        <div class="department-section">
            <div class="department-card">
                <h3>Doctor & Nurse Supplies</h3>
                <div class="stat-row">
                    <span class="stat-label">
                        @if($report->filters['report_type'] === 'incoming-outgoing')
                            Total Movements:
                        @else
                            Total Items:
                        @endif
                    </span>
                    <span class="stat-value">{{ $data['departmentStats']['doctorNurse']['totalItems'] }}</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">
                        @if($report->filters['report_type'] === 'incoming-outgoing')
                            Incoming:
                        @else
                            Consumed:
                        @endif
                    </span>
                    <span class="stat-value" style="color: #059669;">{{ $data['departmentStats']['doctorNurse']['totalConsumed'] }}</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">
                        @if($report->filters['report_type'] === 'incoming-outgoing')
                            Outgoing:
                        @else
                            Rejected:
                        @endif
                    </span>
                    <span class="stat-value" style="color: #dc2626;">{{ $data['departmentStats']['doctorNurse']['totalRejected'] }}</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">
                        @if($report->filters['report_type'] === 'incoming-outgoing')
                            Outgoing Count:
                        @else
                            Low Stock:
                        @endif
                    </span>
                    <span class="stat-value" style="color: #d97706;">{{ $data['departmentStats']['doctorNurse']['lowStock'] }}</span>
                </div>
            </div>

            <div class="department-card">
                <h3>Med Tech Supplies</h3>
                <div class="stat-row">
                    <span class="stat-label">
                        @if($report->filters['report_type'] === 'incoming-outgoing')
                            Total Movements:
                        @else
                            Total Items:
                        @endif
                    </span>
                    <span class="stat-value">{{ $data['departmentStats']['medTech']['totalItems'] }}</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">
                        @if($report->filters['report_type'] === 'incoming-outgoing')
                            Incoming:
                        @else
                            Consumed:
                        @endif
                    </span>
                    <span class="stat-value" style="color: #059669;">{{ $data['departmentStats']['medTech']['totalConsumed'] }}</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">
                        @if($report->filters['report_type'] === 'incoming-outgoing')
                            Outgoing:
                        @else
                            Rejected:
                        @endif
                    </span>
                    <span class="stat-value" style="color: #dc2626;">{{ $data['departmentStats']['medTech']['totalRejected'] }}</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">
                        @if($report->filters['report_type'] === 'incoming-outgoing')
                            Outgoing Count:
                        @else
                            Low Stock:
                        @endif
                    </span>
                    <span class="stat-value" style="color: #d97706;">{{ $data['departmentStats']['medTech']['lowStock'] }}</span>
                </div>
            </div>
        </div>
    </div>

    <div class="footer">
        <p>This report was generated automatically by the Clinic Management System</p>
        <p>For questions or support, please contact the system administrator</p>
    </div>
</body>
</html>
