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
            'recent_transfers' => \App\Models\PatientTransfer::where('from_hospital', true)->count(),
            'pending_transfers' => \App\Models\PatientTransfer::where('status', 'pending')->count(),
            'clinic_appointments' => \App\Models\Appointment::count(),
        ];

        $recentTransfers = \App\Models\PatientTransfer::with(['patient', 'transferredBy'])
            ->where('from_hospital', true)
            ->latest()
            ->limit(5)
            ->get()
            ->map(function($transfer) {
                return [
                    'id' => $transfer->id,
                    'patient_name' => $transfer->patient->first_name . ' ' . $transfer->patient->last_name,
                    'transfer_reason' => $transfer->transfer_reason,
                    'priority' => $transfer->priority,
                    'status' => $transfer->status,
                    'created_at' => $transfer->created_at,
                ];
            });

        $clinicOperations = [
            'total_appointments' => \App\Models\Appointment::count(),
            'completed_appointments' => \App\Models\Appointment::where('status', 'Completed')->count(),
            'pending_appointments' => \App\Models\Appointment::where('status', 'Pending')->count(),
            'total_billing' => \App\Models\BillingTransaction::sum('total_amount') ?? 0,
            'lab_orders' => \App\Models\LabOrder::count(),
        ];

        return Inertia::render('Hospital/Dashboard', [
            'stats' => $stats,
            'recentTransfers' => $recentTransfers,
            'clinicOperations' => $clinicOperations,
        ]);
    }
}
