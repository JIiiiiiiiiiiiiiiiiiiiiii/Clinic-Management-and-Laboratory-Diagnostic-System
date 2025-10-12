<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>{{ $title ?? 'Hospital Report' }}</title>
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
    
    @if(isset($reportTitle))
        <div class="report-title">{{ $reportTitle }}</div>
    @endif
    
    @if(isset($reportMeta))
        <div class="report-meta">{{ $reportMeta }}</div>
    @endif
