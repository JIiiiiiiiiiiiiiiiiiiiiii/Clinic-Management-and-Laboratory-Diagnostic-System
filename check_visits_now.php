<?php

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;

echo "Checking visits in database...\n\n";

$totalVisits = DB::table('visits')->count();
echo "Total visits: {$totalVisits}\n\n";

if ($totalVisits > 0) {
    $visits = DB::select("SELECT * FROM visits ORDER BY id DESC LIMIT 10");
    foreach ($visits as $v) {
        echo "Visit ID: {$v->id}\n";
        echo "  Patient ID: {$v->patient_id}\n";
        echo "  Appointment ID: " . ($v->appointment_id ?? 'NULL') . "\n";
        echo "  Visit Date: {$v->visit_date}\n";
        echo "  Status: {$v->status}\n";
        echo "  Created: {$v->created_at}\n\n";
    }
} else {
    echo "No visits found in database.\n";
}

