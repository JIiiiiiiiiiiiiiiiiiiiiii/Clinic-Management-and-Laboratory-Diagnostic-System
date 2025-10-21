<?php

// Simple test to check if the issue is with the controller or something else
echo "Testing simple route...\n";

// Test if we can access the route directly
$url = 'http://127.0.0.1:8000/admin/laboratory/orders';
echo "URL: $url\n";

// Use file_get_contents to test the route
$context = stream_context_create([
    'http' => [
        'method' => 'GET',
        'header' => [
            'User-Agent: Test Script',
            'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        ]
    ]
]);

try {
    $response = file_get_contents($url, false, $context);
    if ($response === false) {
        echo "❌ Failed to get response\n";
    } else {
        echo "✅ Got response (length: " . strlen($response) . ")\n";
        if (strpos($response, '500') !== false) {
            echo "❌ 500 error detected\n";
        } else {
            echo "✅ No 500 error detected\n";
        }
    }
} catch (Exception $e) {
    echo "❌ Exception: " . $e->getMessage() . "\n";
}

