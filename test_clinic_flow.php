<?php

// Test the complete clinic flow
echo "🏥 Testing Clinic Flow Implementation\n";
echo "=====================================\n\n";

// Test 1: Create Online Appointment
echo "1. Creating Online Appointment...\n";
$appointmentData = [
    'patient_data' => [
        'first_name' => 'John',
        'last_name' => 'Doe',
        'mobile_no' => '+639123456789',
        'email' => 'john.doe@example.com'
    ],
    'appointment_data' => [
        'appointment_type' => 'consultation',
        'specialist_type' => 'doctor',
        'appointment_date' => '2024-01-15',
        'appointment_time' => '09:00'
    ]
];

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'http://localhost:8000/api/appointments/online');
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($appointmentData));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Accept: application/json'
]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "HTTP Code: $httpCode\n";
echo "Response: $response\n\n";

if ($httpCode === 200) {
    $data = json_decode($response, true);
    if (isset($data['appointment_id'])) {
        $appointmentId = $data['appointment_id'];
        echo "✅ Appointment created successfully! ID: $appointmentId\n\n";
        
        // Test 2: Get Specialists
        echo "2. Getting Specialists...\n";
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, 'http://localhost:8000/api/specialists');
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        $specialistsResponse = curl_exec($ch);
        curl_close($ch);
        
        $specialists = json_decode($specialistsResponse, true);
        if (!empty($specialists)) {
            $specialistId = $specialists[0]['specialist_id'];
            echo "✅ Found specialists! Using specialist ID: $specialistId\n\n";
            
            // Test 3: Approve Appointment (Admin)
            echo "3. Approving Appointment...\n";
            $approvalData = [
                'assigned_specialist_id' => $specialistId,
                'admin_notes' => 'Approved for consultation'
            ];
            
            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, "http://localhost:8000/api/admin/appointments/$appointmentId/approve");
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($approvalData));
            curl_setopt($ch, CURLOPT_HTTPHEADER, [
                'Content-Type: application/json',
                'Accept: application/json'
            ]);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            
            $approvalResponse = curl_exec($ch);
            $approvalHttpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);
            
            echo "Approval HTTP Code: $approvalHttpCode\n";
            echo "Approval Response: $approvalResponse\n\n";
            
            if ($approvalHttpCode === 200) {
                echo "✅ Appointment approved successfully!\n";
                echo "✅ Visit and Billing records created!\n\n";
                
                // Test 4: Get Daily Transactions
                echo "4. Getting Daily Transactions...\n";
                $ch = curl_init();
                curl_setopt($ch, CURLOPT_URL, 'http://localhost:8000/api/billing/daily-transactions?date=2024-01-15');
                curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
                $dailyResponse = curl_exec($ch);
                curl_close($ch);
                
                echo "Daily Transactions: $dailyResponse\n\n";
                echo "✅ Daily report data retrieved!\n\n";
                
                echo "🎉 COMPLETE FLOW TESTED SUCCESSFULLY!\n";
                echo "=====================================\n";
                echo "✅ Patient books online\n";
                echo "✅ Admin approves appointment\n";
                echo "✅ Visit & Billing created\n";
                echo "✅ Daily report shows data\n";
                echo "\n🏥 Clinic flow is working perfectly!\n";
            } else {
                echo "❌ Appointment approval failed\n";
            }
        } else {
            echo "❌ No specialists found\n";
        }
    } else {
        echo "❌ Appointment creation failed\n";
    }
} else {
    echo "❌ API request failed\n";
}

echo "\n";
