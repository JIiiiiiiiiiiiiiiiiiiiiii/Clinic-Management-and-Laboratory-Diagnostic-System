<?php

namespace App\Http\Controllers\Hospital;

use App\Http\Controllers\Controller;
use App\Models\Patient;
use App\Models\Appointment;
use App\Models\BillingTransaction;
use App\Models\LabOrder;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\DB;

class HospitalDashboardController extends Controller
{
    public function index(): Response
    {
        // Get basic statistics
        $stats = [
            'total_patients' => \App\Models\Patient::count(),
            'recent_transfers' => 0,
            'pending_transfers' => 0,
            'clinic_appointments' => \App\Models\Appointment::count(),
        ];

        $recentTransfers = [];
        $clinicOperations = [
            'total_appointments' => \App\Models\Appointment::count(),
            'completed_appointments' => \App\Models\Appointment::where('status', 'Completed')->count(),
            'pending_appointments' => \App\Models\Appointment::where('status', 'Pending')->count(),
            'total_billing' => \App\Models\BillingTransaction::sum('total_amount') ?? 0,
            'lab_orders' => 0,
        ];

        return Inertia::render('Hospital/Dashboard', [
            'stats' => $stats,
            'recentTransfers' => $recentTransfers,
            'clinicOperations' => $clinicOperations,
        ]);
    }
}
