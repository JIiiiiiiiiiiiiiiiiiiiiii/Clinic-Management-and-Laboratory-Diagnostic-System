<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $title }}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            font-size: 12px;
            line-height: 1.4;
            color: #333;
            margin: 0;
            padding: 20px;
        }
        .container {
            max-width: 95%;
            margin: 0 auto;
            padding: 0 15px;
        }
        .table-wrapper {
            margin: 0 20px;
            overflow-x: auto;
        }
        .summary-table, .transactions-table {
            width: 95%;
            max-width: 95%;
            margin: 0 auto;
            table-layout: fixed;
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
        .transactions-table {
            border-collapse: collapse;
            margin-top: 20px;
        }
        .transactions-table th {
            background: #f3f4f6;
            color: #374151;
            padding: 12px 8px;
            text-align: left;
            font-weight: bold;
            border: 1px solid #d1d5db;
        }
        .transactions-table td {
            padding: 10px 8px;
            border: 1px solid #d1d5db;
            vertical-align: top;
        }
        .transactions-table tr:nth-child(even) {
            background: #f9fafb;
        }
        .status {
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 11px;
            font-weight: bold;
            text-transform: uppercase;
        }
        .status.completed {
            background: #d1fae5;
            color: #065f46;
        }
        .status.pending {
            background: #fef3c7;
            color: #92400e;
        }
        .payment-method {
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 11px;
            font-weight: bold;
            text-transform: uppercase;
        }
        .payment-method.cash {
            background: #dbeafe;
            color: #1e40af;
        }
        .payment-method.hmo {
            background: #e0e7ff;
            color: #3730a3;
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
                <img src="{{ $logoBase64 }}" alt="St. James Hospital Logo" style="width: 80px; height: 80px;">
            </div>
            <div style="text-align: center; width: 100%;">
                <div style="font-size: 24px; font-weight: bold; color: #2d5a27; margin: 0 0 5px 0;">St. James Hospital Clinic, Inc.</div>
                <div style="font-size: 12px; color: #333; margin: 0 0 3px 0;">San Isidro City of Cabuyao Laguna</div>
                <div style="font-size: 14px; font-style: italic; color: #1e40af; margin: 0 0 5px 0;">Santa Rosa's First in Quality Healthcare Service</div>
                <div style="font-size: 16px; font-weight: bold; color: #2d5a27; margin: 0 0 5px 0;">PASYENTE MUNA</div>
                <div style="font-size: 10px; color: #666; margin: 0;">Tel. Nos. 02.85844533; 049.5341254; 049.5020058; Fax No.: local 307<br>email add: info@stjameshospital.com.ph</div>
            </div>
        </div>
        <h1>Financial Report</h1>
        <h2>{{ $title }}</h2>
    </div>

    <div class="container">
        <div class="summary-section">
        <h2 class="section-title">Financial Summary</h2>
        <div class="table-wrapper">
        <table class="summary-table">
            <thead>
                <tr>
                    <th>Metric</th>
                    <th>Value</th>
                </tr>
            </thead>
            <tbody>
                @php
                    // Calculate summary from transactions collection to ensure accuracy
                    $totalRevenue = $transactions->sum('amount') ?? 0; // Final amount after discounts
                    $totalTransactions = $transactions->count();
                    $cashTotal = $transactions->where('payment_method', 'cash')->sum('amount') ?? 0;
                    $hmoTotal = $transactions->where('payment_method', 'hmo')->sum('amount') ?? 0;
                    $pendingAmount = $transactions->where('status', 'pending')->sum('amount') ?? 0;
                @endphp
                <tr>
                    <td><strong>Total Revenue</strong></td>
                    <td>PHP {{ number_format($totalRevenue, 2) }}</td>
                </tr>
                <tr>
                    <td><strong>Total Transactions</strong></td>
                    <td>{{ $totalTransactions }}</td>
                </tr>
                <tr>
                    <td><strong>Cash Total</strong></td>
                    <td>PHP {{ number_format($cashTotal, 2) }}</td>
                </tr>
                <tr>
                    <td><strong>HMO Total</strong></td>
                    <td>PHP {{ number_format($hmoTotal, 2) }}</td>
                </tr>
                <tr>
                    <td><strong>Pending Amount</strong></td>
                    <td>PHP {{ number_format($pendingAmount, 2) }}</td>
                </tr>
            </tbody>
        </table>
        </div>
    </div>

    <div class="transactions-section">
        <h2 class="section-title">Transaction Details</h2>
        @if($transactions && $transactions->count() > 0)
            <div class="table-wrapper">
            <table class="transactions-table">
                <thead>
                    <tr>
                        <th>Transaction ID</th>
                        <th>Patient Name</th>
                        <th>Specialist Name</th>
                        <th>Final Amount</th>
                        <th>Original Amount</th>
                        <th>Discount</th>
                        <th>Senior Discount</th>
                        <th>Payment Method</th>
                        <th>Status</th>
                        <th>Date</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($transactions as $transaction)
                        @php
                            // Calculate original amount: final amount + all discounts
                            $finalAmount = $transaction->amount ?? 0; // Final amount after discounts
                            $discountAmount = $transaction->discount_amount ?? 0;
                            $seniorDiscountAmount = $transaction->senior_discount_amount ?? 0;
                            $originalAmount = $finalAmount + $discountAmount + $seniorDiscountAmount; // Original amount before discounts
                            
                            // Get patient name
                            $patientName = 'N/A';
                            if ($transaction->patient) {
                                $firstName = $transaction->patient->first_name ?? '';
                                $middleName = $transaction->patient->middle_name ?? '';
                                $lastName = $transaction->patient->last_name ?? '';
                                $patientName = trim(implode(' ', array_filter([$firstName, $middleName, $lastName]))) ?: 'N/A';
                            }
                            
                            // Get specialist name - use same logic as billing transactions
                            // Default to 'Paul Henry N. Parrotina, MD.' to match billing transactions behavior
                            $specialistName = 'Paul Henry N. Parrotina, MD.';
                            
                            // Try from transaction's doctor relationship
                            if ($transaction->doctor) {
                                $specialistName = $transaction->doctor->name ?? 'Paul Henry N. Parrotina, MD.';
                            }
                            
                            // Try from appointment relationship
                            if (($specialistName === 'Paul Henry N. Parrotina, MD.' || empty($specialistName)) && $transaction->appointment && $transaction->appointment->specialist) {
                                $specialistName = $transaction->appointment->specialist->name ?? 'Paul Henry N. Parrotina, MD.';
                            }
                            
                            // Try from appointment links if still not found
                            // Always query appointment links directly to ensure we check even if relationship is empty
                            if (($specialistName === 'Paul Henry N. Parrotina, MD.' || empty($specialistName))) {
                                $appointmentLinks = \App\Models\AppointmentBillingLink::where('billing_transaction_id', $transaction->id)->get();
                                if ($appointmentLinks->isNotEmpty()) {
                                    foreach ($appointmentLinks as $link) {
                                        if ($link->appointment_id) {
                                            $appointment = \App\Models\Appointment::find($link->appointment_id);
                                            if ($appointment && $appointment->specialist_id) {
                                                $appointmentSpecialist = \App\Models\Specialist::where('specialist_id', $appointment->specialist_id)->first();
                                                if ($appointmentSpecialist && $appointmentSpecialist->name) {
                                                    $specialistName = $appointmentSpecialist->name;
                                                    break;
                                                }
                                            }
                                            
                                            // Try visit relationships
                                            if (($specialistName === 'Paul Henry N. Parrotina, MD.' || empty($specialistName))) {
                                                $visit = \App\Models\Visit::where('appointment_id', $link->appointment_id)->first();
                                                if ($visit) {
                                                    // Try doctor_id, then attending_staff_id, then nurse_id, then medtech_id
                                                    $visitSpecialistId = $visit->doctor_id ?? $visit->attending_staff_id ?? $visit->nurse_id ?? $visit->medtech_id ?? null;
                                                    if ($visitSpecialistId) {
                                                        $visitSpecialist = \App\Models\Specialist::where('specialist_id', $visitSpecialistId)->first();
                                                        if ($visitSpecialist && $visitSpecialist->name) {
                                                            $specialistName = $visitSpecialist->name;
                                                            break;
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                            
                            // Try from specialist_id if still not found
                            if (($specialistName === 'Paul Henry N. Parrotina, MD.' || empty($specialistName)) && $transaction->specialist_id) {
                                $specialist = \App\Models\Specialist::where('specialist_id', $transaction->specialist_id)->first();
                                if ($specialist && $specialist->name) {
                                    $specialistName = $specialist->name;
                                }
                            }
                            
                            // Ensure we have a default value
                            if (empty($specialistName)) {
                                $specialistName = 'Paul Henry N. Parrotina, MD.';
                            }
                        @endphp
                        <tr>
                            <td>{{ $transaction->transaction_id }}</td>
                            <td>{{ $patientName }}</td>
                            <td>{{ $specialistName }}</td>
                            <td>PHP {{ number_format($finalAmount, 2) }}</td>
                            <td>PHP {{ number_format($originalAmount, 2) }}</td>
                            <td>PHP {{ number_format($discountAmount, 2) }}</td>
                            <td>PHP {{ number_format($seniorDiscountAmount, 2) }}</td>
                            <td>
                                <span class="payment-method {{ strtolower($transaction->payment_method ?? 'cash') }}">
                                    {{ ucfirst($transaction->payment_method ?? 'cash') }}
                                </span>
                            </td>
                            <td>
                                <span class="status {{ strtolower($transaction->status ?? 'pending') }}">
                                    {{ ucfirst($transaction->status ?? 'pending') }}
                                </span>
                            </td>
                            <td>{{ $transaction->transaction_date ? \Carbon\Carbon::parse($transaction->transaction_date)->format('M d, Y') : 'N/A' }}</td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
            </div>
        @else
            <div class="no-data">
                No transactions found for the selected criteria.
            </div>
        @endif
        </div>
    </div>

    <div class="footer">
        <p>Generated on {{ now()->format('F d, Y \a\t H:i:s') }} | St. James Medical Center</p>
        <p>This report contains confidential financial information and should be handled securely.</p>
    </div>
</body>
</html>
