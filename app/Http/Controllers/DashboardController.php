<?php

namespace App\Http\Controllers;

use App\Models\Patient;
use App\Models\Appointment;
use App\Models\LabOrder;
use App\Models\LabResult;
use App\Models\Supply\Supply as Item;
use App\Models\Supply\SupplyTransaction as Transaction;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        
        // If no user from request, try to get from standard Laravel auth
        if (!$user) {
            $user = Auth::user();
        }

        if ($user && $user->role === 'patient') {
            $patient = Patient::where('user_id', $user->id)->first();

            $orders = LabOrder::with(['labTests', 'results'])
                ->when($patient, function ($q) use ($patient) {
                    $q->where('patient_id', $patient->id);
                })
                ->orderByDesc('created_at')
                ->limit(10)
                ->get(['id','patient_id','created_at']);

            return Inertia::render('patient/dashboard', [
                'dashboard' => [
                    'orders' => $orders,
                ],
            ]);
        }

        $totals = [
            'doctors' => User::where('role', 'doctor')->where('is_active', true)->count(),
            'patients' => Patient::count(),
            'newPatientsThisMonth' => Patient::whereYear('created_at', now()->year)
                ->whereMonth('created_at', now()->month)
                ->count(),
            'todayAppointments' => Appointment::whereDate('appointment_date', now()->toDateString())->count(),
            'pendingLabTests' => LabResult::whereNull('verified_at')->count(),
            'lowStockSupplies' => \App\Models\InventoryItem::where('status', 'Low Stock')->count(),
            'unpaidBills' => 0, // Default to 0 if no transactions
            'items' => Item::count(),
            'labOrders' => LabOrder::count(),
            'todayRevenue' => 0, // Default to 0 if no transactions
        ];

        $recent = [
            'patients' => Patient::orderByDesc('created_at')->limit(5)->get(['id','first_name','last_name','created_at']),
            'items' => Item::orderByDesc('created_at')->limit(5)->get(['id','name','code']),
            'labOrders' => LabOrder::with(['patient','labTests'])
                ->orderByDesc('created_at')->limit(5)->get(['id','patient_id','created_at']),
        ];

        // Get user info
        $user = [
            'name' => $user->name ?? 'Admin User',
            'email' => $user->email ?? 'admin@stjames.com',
            'role' => $user->role ?? 'admin'
        ];

        // Get stats for the new dashboard
        $stats = [
            'total_appointments' => Appointment::count(),
            'pending_appointments' => Appointment::where('status', 'pending')->count(),
            'confirmed_appointments' => Appointment::where('status', 'confirmed')->count(),
            'completed_appointments' => Appointment::where('status', 'completed')->count(),
            'total_patients' => Patient::count(),
            'total_doctors' => User::where('role', 'doctor')->where('is_active', true)->count(),
            'today_appointments' => Appointment::whereDate('appointment_date', now()->toDateString())->count(),
            'online_bookings' => 0, // Set to 0 since booking_method column doesn't exist
        ];

        // Get recent appointments
        $recent_appointments = Appointment::with(['patient'])
            ->orderByDesc('created_at')
            ->limit(10)
            ->get()
            ->map(function ($appointment) {
                return [
                    'id' => $appointment->id,
                    'patient_name' => $appointment->patient ? $appointment->patient->first_name . ' ' . $appointment->patient->last_name : $appointment->patient_name ?? 'Unknown Patient',
                    'specialist_name' => $appointment->specialist_name ?? 'Unknown Doctor',
                    'appointment_type' => $appointment->appointment_type ?? 'General Consultation',
                    'appointment_date' => $appointment->appointment_date,
                    'appointment_time' => $appointment->appointment_time,
                    'status' => $appointment->status,
                    'booking_method' => 'Manual', // Default since booking_method column doesn't exist
                ];
            });

        // Get today's appointments
        $today_appointments = Appointment::with(['patient'])
            ->whereDate('appointment_date', now()->toDateString())
            ->orderBy('appointment_time')
            ->get()
            ->map(function ($appointment) {
                return [
                    'id' => $appointment->id,
                    'patient_name' => $appointment->patient ? $appointment->patient->first_name . ' ' . $appointment->patient->last_name : $appointment->patient_name ?? 'Unknown Patient',
                    'specialist_name' => $appointment->specialist_name ?? 'Unknown Doctor',
                    'appointment_type' => $appointment->appointment_type ?? 'General Consultation',
                    'appointment_time' => $appointment->appointment_time,
                    'status' => $appointment->status,
                ];
            });

        // Get notifications (mock data for now)
        $notifications = [
            [
                'id' => 1,
                'type' => 'appointment',
                'title' => 'New Appointment Request',
                'message' => 'A new appointment has been requested',
                'read' => false,
                'created_at' => now()->toISOString(),
            ],
            [
                'id' => 2,
                'type' => 'system',
                'title' => 'System Update',
                'message' => 'System has been updated successfully',
                'read' => true,
                'created_at' => now()->subHours(2)->toISOString(),
            ],
        ];

        return Inertia::render('admin/dashboard', [
            'dashboard' => [
                'user' => $user,
                'stats' => $stats,
                'recent_appointments' => $recent_appointments,
                'today_appointments' => $today_appointments,
                'notifications' => $notifications,
                'totals' => $totals,
                'recent' => $recent,
            ],
            'auth' => [
                'user' => $user,
            ],
            'user' => $user,
            'stats' => $stats,
            'recent_appointments' => $recent_appointments,
            'today_appointments' => $today_appointments,
            'notifications' => $notifications,
        ]);
    }
}


