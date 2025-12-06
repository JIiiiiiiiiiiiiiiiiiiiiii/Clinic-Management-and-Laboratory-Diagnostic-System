<?php

namespace App\Http\Controllers;

use App\Models\Patient;
use App\Models\Appointment;
use App\Models\LabOrder;
use App\Models\LabResult;
use App\Models\Specialist;
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

        // Role-based data fetching
        $role = $user->role ?? 'admin';
        
                // Base statistics for all roles - using real database data
                $baseStats = [
                    'total_patients' => Patient::count(),
                    'total_appointments' => Appointment::count(),
                    'today_appointments' => Appointment::whereDate('appointment_date', now()->toDateString())->count(),
                    'pending_appointments' => Appointment::where('status', 'pending')->count(),
                    'confirmed_appointments' => Appointment::where('status', 'confirmed')->count(),
                    'completed_appointments' => Appointment::where('status', 'completed')->count(),
                    'surgery_count' => Appointment::where('appointment_type', 'like', '%surgery%')->count(),
                    'bedroom_usage' => 68, // Placeholder for bedroom usage
                    'consultation_total' => Appointment::where('appointment_type', 'like', '%consultation%')->count(),
                    // New meaningful statistics
                    'new_patients_today' => Patient::whereDate('created_at', now()->startOfDay())->count(),
                    'pending_lab_results' => \App\Models\LabResult::whereNull('verified_at')->count(),
                    'completed_lab_results' => \App\Models\LabResult::whereNotNull('verified_at')->count(),
                    'total_lab_orders' => \App\Models\LabOrder::count(),
                    'pending_lab_orders' => \App\Models\LabOrder::where('status', 'pending')->count(),
                    'total_billing_transactions' => \App\Models\BillingTransaction::count(),
                    'pending_billing' => \App\Models\BillingTransaction::where('status', 'pending')->count(),
                    'paid_transactions' => \App\Models\BillingTransaction::where('status', 'paid')->count(),
                    // CRITICAL: Use exact same recalculation logic as billing transactions page for consistency
                    // This ensures dashboard matches the billing transactions page (items total - discounts)
                    'total_revenue' => (function() {
                        $allPaidTransactions = \App\Models\BillingTransaction::where('status', 'paid')
                            ->with('items')
                            ->get();
                        
                        return (float) $allPaidTransactions->sum(function ($transaction) {
                            $itemsTotal = $transaction->items->sum('total_price');
                            $discountAmount = (float) $transaction->discount_amount; // Accessor parses from notes
                            $seniorDiscountAmount = (float) $transaction->senior_discount_amount; // Accessor parses from notes
                            $calculatedFinalAmount = $itemsTotal - $discountAmount - $seniorDiscountAmount;
                            return max(0, $calculatedFinalAmount); // Ensure non-negative
                        }) ?? 0.0;
                    })(),
                    'today_revenue' => $this->sumBillingAmount(
                        \App\Models\BillingTransaction::where('status', 'paid')
                            ->where(function($query) {
                                $today = now()->toDateString();
                                // Check transaction_date_only first (date field), then transaction_date (datetime), then created_at as fallback
                                $query->whereDate('transaction_date_only', $today)
                                      ->orWhere(function($q) use ($today) {
                                          $q->whereNull('transaction_date_only')
                                            ->whereDate('transaction_date', $today);
                                      })
                                      ->orWhere(function($q) use ($today) {
                                          $q->whereNull('transaction_date_only')
                                            ->whereNull('transaction_date')
                                            ->whereDate('created_at', $today);
                                      });
                            })
                    ),
                    'senior_citizens' => Patient::where('is_senior_citizen', true)->count(),
                    'low_stock_items' => \App\Models\InventoryItem::lowStock()->count(),
                    'out_of_stock_items' => \App\Models\InventoryItem::where('stock', 0)->count(),
                    // Additional meaningful statistics
                    'total_doctors' => User::where('role', 'doctor')->where('is_active', true)->count(),
                    'total_nurses' => User::where('role', 'nurse')->where('is_active', true)->count(),
                    'total_medtech' => User::where('role', 'medtech')->where('is_active', true)->count(),
                    'total_cashiers' => User::where('role', 'cashier')->where('is_active', true)->count(),
                    'male_patients' => Patient::where('sex', 'Male')->count(),
                    'female_patients' => Patient::where('sex', 'Female')->count(),
                    'patients_this_month' => Patient::whereMonth('created_at', now()->month)->count(),
                    'patients_last_month' => Patient::whereMonth('created_at', now()->subMonth()->month)->count(),
                    'appointments_this_week' => Appointment::whereBetween('appointment_date', [now()->startOfWeek(), now()->endOfWeek()])->count(),
                    'appointments_last_week' => Appointment::whereBetween('appointment_date', [now()->subWeek()->startOfWeek(), now()->subWeek()->endOfWeek()])->count(),
                    'pending_payments' => $this->sumBillingAmount(\App\Models\BillingTransaction::where('status', 'pending')),
                    'total_inventory_value' => \App\Models\InventoryItem::sum(DB::raw('stock * unit_cost')),
                    'expiring_items' => \App\Models\InventoryItem::where('expiry_date', '<=', now()->addDays(30))->count(),
                    'expired_items' => \App\Models\InventoryItem::where('expiry_date', '<', now())->count(),
                ];

        // Get diagnosis data for charts
        $diagnosisData = $this->getDiagnosisData();
        $consultationData = $this->getConsultationData();
        $patientDemographics = $this->getPatientDemographics();
        $appointmentTrends = $this->getAppointmentTrends();
        
        // Get enhanced dashboard data
        $analyticsData = $this->getAnalyticsData();
        $miniTables = $this->getMiniTables();

        // Role-specific statistics
        $roleSpecificStats = $this->getRoleSpecificStats($role, $user);
        $stats = array_merge($baseStats, $roleSpecificStats);

        // Get today's appointments (filtered by role)
        $todayAppointments = $this->getTodayAppointments($role, $user);
        
        // Get recent appointments (filtered by role)
        $recentAppointments = $this->getRecentAppointments($role, $user);

        // Get role-specific notifications
        $notifications = $this->getRoleSpecificNotifications($role, $user);

        // Get additional totals for legacy support
        $totals = [
            'doctors' => User::where('role', 'doctor')->where('is_active', true)->count(),
            'patients' => Patient::count(),
            'newPatientsThisMonth' => Patient::whereYear('created_at', now()->year)
                ->whereMonth('created_at', now()->month)
                ->count(),
            'todayAppointments' => Appointment::whereDate('appointment_date', now()->toDateString())->count(),
            'pendingLabTests' => LabResult::whereNull('verified_at')->count(),
            'lowStockSupplies' => \App\Models\InventoryItem::lowStock()->count(),
            'unpaidBills' => 0,
            'items' => Item::count(),
            'labOrders' => LabOrder::count(),
            'todayRevenue' => 0,
        ];

        $recent = [
            'patients' => Patient::orderByDesc('created_at')->limit(5)->get(['id','first_name','last_name','created_at']),
            'items' => Item::orderByDesc('created_at')->limit(5)->get(['id','name','code']),
            'labOrders' => LabOrder::with(['patient','labTests'])
                ->orderByDesc('created_at')->limit(5)->get(['id','patient_id','created_at']),
        ];

        // Get user info
        $userInfo = [
            'name' => $user->name ?? 'Admin User',
            'email' => $user->email ?? 'admin@stjames.com',
            'role' => $user->role ?? 'admin'
        ];

        return Inertia::render('admin/dashboard', [
            'dashboard' => [
                'user' => $userInfo,
                'stats' => $stats,
                'recent_appointments' => $recentAppointments,
                'today_appointments' => $todayAppointments,
                'notifications' => $notifications,
                'totals' => $totals,
                'recent' => $recent,
                'diagnosisData' => $diagnosisData,
                'consultationData' => $consultationData,
                'patientDemographics' => $patientDemographics,
                'appointmentTrends' => $appointmentTrends,
                'analyticsData' => $analyticsData,
                'miniTables' => $miniTables,
            ],
            'auth' => [
                'user' => $userInfo,
            ],
            'user' => $userInfo,
            'stats' => $stats,
            'recent_appointments' => $recentAppointments,
            'today_appointments' => $todayAppointments,
            'notifications' => $notifications,
            'diagnosisData' => $diagnosisData,
            'consultationData' => $consultationData,
            'patientDemographics' => $patientDemographics,
            'appointmentTrends' => $appointmentTrends,
            'analyticsData' => $analyticsData,
            'miniTables' => $miniTables,
        ]);
    }

    private function getRoleSpecificStats($role, $user)
    {
        $stats = [];

        switch ($role) {
            case 'doctor':
                // Get specialist_id for the user
                $specialist = \App\Models\Specialist::where('name', $user->name)->first();
                $specialistId = $specialist ? $specialist->specialist_id : null;
                
                $stats = [
                    'my_patients' => Patient::whereHas('appointments', function($q) use ($specialistId, $user) {
                        // Filter by specialist_id if available, otherwise try to match via join
                        if ($specialistId) {
                            // In whereHas callback, query is already scoped to appointments table
                            $q->where('specialist_id', $specialistId);
                        } else {
                            // Fallback: join with specialists table to match by name
                            $q->join('specialists', 'appointments.specialist_id', '=', 'specialists.specialist_id')
                              ->where('specialists.name', $user->name);
                        }
                    })->count(),
                    'pending_consultations' => Appointment::when($specialistId, function($q) use ($specialistId) {
                        // Query is already on appointments table, so use specialist_id directly
                        $q->where('specialist_id', $specialistId);
                    }, function($q) use ($user) {
                        // Fallback: join with specialists table - need to qualify columns
                        $q->join('specialists', 'appointments.specialist_id', '=', 'specialists.specialist_id')
                          ->where('specialists.name', $user->name);
                    })
                    ->where('appointments.status', 'pending')->count(),
                    'lab_results_pending' => LabResult::whereNull('verified_at')->count(),
                ];
                break;

            case 'nurse':
                $stats = [
                    'patient_care_tasks' => Appointment::where('status', 'confirmed')->count(),
                    'vital_signs_today' => 0, // Placeholder for vital signs
                    'medication_reminders' => 0, // Placeholder for medication reminders
                ];
                break;

            case 'medtech':
                $stats = [
                    'pending_lab_orders' => LabOrder::where('status', 'pending')->count(),
                    'completed_tests' => LabResult::whereNotNull('verified_at')->count(),
                    'pending_results' => LabResult::whereNull('verified_at')->count(),
                ];
                break;

            case 'cashier':
                $stats = [
                    'pending_bills' => 0, // Placeholder for billing
                    'today_transactions' => 0, // Placeholder for transactions
                    'unpaid_amount' => 0, // Placeholder for unpaid amount
                ];
                break;

            case 'hospital_admin':
            case 'hospital_staff':
        $stats = [
                    'system_health' => 100, // Placeholder for system health
                    'active_users' => User::where('is_active', true)->count(),
                    'system_alerts' => 0, // Placeholder for system alerts
                ];
                break;

            default: // admin
                $stats = [
                    'total_doctors' => User::where('role', 'doctor')->where('is_active', true)->count(),
                    // low_stock_items is already calculated in baseStats correctly
                ];
                break;
        }

        return $stats;
    }

    private function getTodayAppointments($role, $user)
    {
        // Use LEFT JOIN to get patient and specialist data directly from database
        // Check all possible specialist sources (appointments.specialist_id, visits.doctor_id, visits.nurse_id, visits.medtech_id, visits.attending_staff_id)
        $query = Appointment::query()
            ->leftJoin('visits', 'appointments.id', '=', 'visits.appointment_id')
            ->leftJoin('patients as appointment_patients', 'appointments.patient_id', '=', 'appointment_patients.id')
            ->leftJoin('patients as visit_patients', 'visits.patient_id', '=', 'visit_patients.id')
            ->leftJoin('specialists', 'appointments.specialist_id', '=', 'specialists.specialist_id')
            ->leftJoin('specialists as visit_doctor_specialists', 'visits.doctor_id', '=', 'visit_doctor_specialists.specialist_id')
            ->leftJoin('specialists as visit_nurse_specialists', 'visits.nurse_id', '=', 'visit_nurse_specialists.specialist_id')
            ->leftJoin('specialists as visit_medtech_specialists', 'visits.medtech_id', '=', 'visit_medtech_specialists.specialist_id')
            ->leftJoin('specialists as visit_attending_specialists', 'visits.attending_staff_id', '=', 'visit_attending_specialists.specialist_id')
            ->select(
                'appointments.*',
                DB::raw('COALESCE(appointment_patients.first_name, visit_patients.first_name) as patient_first_name'),
                DB::raw('COALESCE(appointment_patients.last_name, visit_patients.last_name) as patient_last_name'),
                DB::raw('COALESCE(appointment_patients.middle_name, visit_patients.middle_name) as patient_middle_name'),
                DB::raw('COALESCE(
                    specialists.name, 
                    visit_doctor_specialists.name, 
                    visit_nurse_specialists.name, 
                    visit_medtech_specialists.name, 
                    visit_attending_specialists.name
                ) as specialist_name_from_table')
            )
            ->whereDate('appointments.appointment_date', now()->toDateString())
            ->orderBy('appointments.appointment_time');

        // Filter by role
        if ($role === 'doctor') {
            $query->where(function($q) use ($user) {
                $q->where('specialists.name', $user->name)
                  ->orWhere('visit_doctor_specialists.name', $user->name)
                  ->orWhere('visit_attending_specialists.name', $user->name);
            });
        }

        return $query->get()->map(function ($appointment) {
            // Access joined columns from attributes
            $attributes = $appointment->getAttributes();
            
            // Get patient name from joined data
            $patientName = 'Unknown Patient';
            $patientFirstName = $attributes['patient_first_name'] ?? $appointment->patient_first_name ?? null;
            $patientMiddleName = $attributes['patient_middle_name'] ?? $appointment->patient_middle_name ?? null;
            $patientLastName = $attributes['patient_last_name'] ?? $appointment->patient_last_name ?? null;
            
            if ($patientFirstName || $patientLastName) {
                $firstName = $patientFirstName ?? '';
                $middleName = $patientMiddleName ?? '';
                $lastName = $patientLastName ?? '';
                $patientName = trim(implode(' ', array_filter([$firstName, $middleName, $lastName])));
            }
            
            // If still empty, try to load patient relationship as fallback
            if (empty(trim($patientName)) && $appointment->patient_id) {
                if (!$appointment->relationLoaded('patient')) {
                    $appointment->load('patient');
                }
                if ($appointment->patient) {
                    $firstName = $appointment->patient->first_name ?? '';
                    $middleName = $appointment->patient->middle_name ?? '';
                    $lastName = $appointment->patient->last_name ?? '';
                    $patientName = trim(implode(' ', array_filter([$firstName, $middleName, $lastName])));
                }
            }
            
            if (empty(trim($patientName))) {
                $patientName = 'Unknown Patient';
            }
            
            // Get specialist name from joined data
            $specialistName = $attributes['specialist_name_from_table'] ?? $appointment->specialist_name_from_table ?? null;
            
            // If still null, try to get from relationships as fallback
            if (empty($specialistName) || $specialistName === 'NULL') {
                // Try appointment specialist relationship
                if ($appointment->specialist_id) {
                    if (!$appointment->relationLoaded('specialist')) {
                        $appointment->load('specialist');
                    }
                    if ($appointment->specialist) {
                        $specialistName = $appointment->specialist->name;
                    }
                }
                
                // Try visit relationships
                if (empty($specialistName) && $appointment->relationLoaded('visit') && $appointment->visit) {
                    $visit = $appointment->visit;
                    if ($visit->doctor_id) {
                        $visitDoctor = \App\Models\Specialist::find($visit->doctor_id);
                        if ($visitDoctor) {
                            $specialistName = $visitDoctor->name;
                        }
                    }
                }
            }
            
            // Final fallback
            if (empty($specialistName) || $specialistName === 'NULL') {
                $specialistName = 'Unknown Specialist';
            }
            
            return [
                'id' => $appointment->id,
                'patient_name' => $patientName,
                'specialist_name' => $specialistName,
                'appointment_type' => $appointment->appointment_type ?? 'General Consultation',
                'appointment_time' => $appointment->appointment_time,
                'status' => $appointment->status,
            ];
        });
    }

    private function getRecentAppointments($role, $user)
    {
        // Use LEFT JOIN to get patient and specialist data directly from database
        // Check all possible specialist sources (appointments.specialist_id, visits.doctor_id, visits.nurse_id, visits.medtech_id, visits.attending_staff_id)
        $query = Appointment::query()
            ->leftJoin('visits', 'appointments.id', '=', 'visits.appointment_id')
            ->leftJoin('patients as appointment_patients', 'appointments.patient_id', '=', 'appointment_patients.id')
            ->leftJoin('patients as visit_patients', 'visits.patient_id', '=', 'visit_patients.id')
            ->leftJoin('specialists', 'appointments.specialist_id', '=', 'specialists.specialist_id')
            ->leftJoin('specialists as visit_doctor_specialists', 'visits.doctor_id', '=', 'visit_doctor_specialists.specialist_id')
            ->leftJoin('specialists as visit_nurse_specialists', 'visits.nurse_id', '=', 'visit_nurse_specialists.specialist_id')
            ->leftJoin('specialists as visit_medtech_specialists', 'visits.medtech_id', '=', 'visit_medtech_specialists.specialist_id')
            ->leftJoin('specialists as visit_attending_specialists', 'visits.attending_staff_id', '=', 'visit_attending_specialists.specialist_id')
            ->select(
                'appointments.*',
                DB::raw('COALESCE(appointment_patients.first_name, visit_patients.first_name) as patient_first_name'),
                DB::raw('COALESCE(appointment_patients.last_name, visit_patients.last_name) as patient_last_name'),
                DB::raw('COALESCE(appointment_patients.middle_name, visit_patients.middle_name) as patient_middle_name'),
                DB::raw('COALESCE(
                    specialists.name, 
                    visit_doctor_specialists.name, 
                    visit_nurse_specialists.name, 
                    visit_medtech_specialists.name, 
                    visit_attending_specialists.name
                ) as specialist_name_from_table')
            )
            ->orderByDesc('appointments.created_at')
            ->limit(10);

        // Filter by role
        if ($role === 'doctor') {
            $query->where(function($q) use ($user) {
                $q->where('specialists.name', $user->name)
                  ->orWhere('visit_doctor_specialists.name', $user->name)
                  ->orWhere('visit_attending_specialists.name', $user->name);
            });
        }

        return $query->get()->map(function ($appointment) {
            // Access joined columns from attributes
            $attributes = $appointment->getAttributes();
            
            // Get patient name from joined data
            $patientName = 'Unknown Patient';
            $patientFirstName = $attributes['patient_first_name'] ?? $appointment->patient_first_name ?? null;
            $patientMiddleName = $attributes['patient_middle_name'] ?? $appointment->patient_middle_name ?? null;
            $patientLastName = $attributes['patient_last_name'] ?? $appointment->patient_last_name ?? null;
            
            if ($patientFirstName || $patientLastName) {
                $firstName = $patientFirstName ?? '';
                $middleName = $patientMiddleName ?? '';
                $lastName = $patientLastName ?? '';
                $patientName = trim(implode(' ', array_filter([$firstName, $middleName, $lastName])));
            }
            
            // If still empty, try to load patient relationship as fallback
            if (empty(trim($patientName)) && $appointment->patient_id) {
                if (!$appointment->relationLoaded('patient')) {
                    $appointment->load('patient');
                }
                if ($appointment->patient) {
                    $firstName = $appointment->patient->first_name ?? '';
                    $middleName = $appointment->patient->middle_name ?? '';
                    $lastName = $appointment->patient->last_name ?? '';
                    $patientName = trim(implode(' ', array_filter([$firstName, $middleName, $lastName])));
                }
            }
            
            if (empty(trim($patientName))) {
                $patientName = 'Unknown Patient';
            }
            
            // Get specialist name from joined data
            $specialistName = $attributes['specialist_name_from_table'] ?? $appointment->specialist_name_from_table ?? null;
            
            // If still null, try to get from relationships as fallback
            if (empty($specialistName) || $specialistName === 'NULL') {
                // Try appointment specialist relationship
                if ($appointment->specialist_id) {
                    if (!$appointment->relationLoaded('specialist')) {
                        $appointment->load('specialist');
                    }
                    if ($appointment->specialist) {
                        $specialistName = $appointment->specialist->name;
                    }
                }
                
                // Try visit relationships
                if (empty($specialistName) && $appointment->relationLoaded('visit') && $appointment->visit) {
                    $visit = $appointment->visit;
                    if ($visit->doctor_id) {
                        $visitDoctor = \App\Models\Specialist::find($visit->doctor_id);
                        if ($visitDoctor) {
                            $specialistName = $visitDoctor->name;
                        }
                    }
                }
            }
            
            // Final fallback
            if (empty($specialistName) || $specialistName === 'NULL') {
                $specialistName = 'Unknown Specialist';
            }
            
            return [
                'id' => $appointment->id,
                'patient_name' => $patientName,
                'specialist_name' => $specialistName,
                'appointment_type' => $appointment->appointment_type ?? 'General Consultation',
                'appointment_date' => $appointment->appointment_date,
                'appointment_time' => $appointment->appointment_time,
                'status' => $appointment->status,
                'booking_method' => 'Manual',
            ];
        });
    }

    private function getRoleSpecificNotifications($role, $user)
    {
        $notifications = [];

        switch ($role) {
            case 'doctor':
        $notifications = [
            [
                'id' => 1,
                'type' => 'appointment',
                        'title' => 'New Patient Consultation',
                        'message' => 'You have a new patient consultation scheduled',
                'read' => false,
                'created_at' => now()->toISOString(),
            ],
            [
                'id' => 2,
                        'type' => 'lab_result',
                        'title' => 'Lab Results Available',
                        'message' => 'Lab results for your patient are ready for review',
                        'read' => true,
                        'created_at' => now()->subHours(1)->toISOString(),
                    ],
                ];
                break;

            case 'nurse':
                $notifications = [
                    [
                        'id' => 1,
                        'type' => 'patient_care',
                        'title' => 'Patient Care Reminder',
                        'message' => 'Time to check vital signs for scheduled patients',
                        'read' => false,
                        'created_at' => now()->toISOString(),
                    ],
                ];
                break;

            case 'medtech':
                $notifications = [
                    [
                        'id' => 1,
                        'type' => 'lab_order',
                        'title' => 'New Lab Order',
                        'message' => 'A new lab order has been assigned to you',
                        'read' => false,
                        'created_at' => now()->toISOString(),
                    ],
                ];
                break;

            case 'cashier':
                $notifications = [
                    [
                        'id' => 1,
                        'type' => 'billing',
                        'title' => 'Payment Received',
                        'message' => 'A new payment has been processed',
                        'read' => false,
                        'created_at' => now()->toISOString(),
                    ],
                ];
                break;

            default: // admin, hospital_admin, hospital_staff
                $notifications = [
                    [
                        'id' => 1,
                'type' => 'system',
                'title' => 'System Update',
                'message' => 'System has been updated successfully',
                        'read' => false,
                        'created_at' => now()->toISOString(),
                    ],
                    [
                        'id' => 2,
                        'type' => 'appointment',
                        'title' => 'New Appointment Request',
                        'message' => 'A new appointment has been requested',
                'read' => true,
                'created_at' => now()->subHours(2)->toISOString(),
            ],
        ];
                break;
        }

        return $notifications;
    }

        private function getDiagnosisData()
        {
            try {
                // Get actual diagnosis data from multiple sources
                $months = [];
                $currentDate = now();
                
                for ($i = 5; $i >= 0; $i--) {
                    $month = $currentDate->copy()->subMonths($i);
                    $months[] = $month->format('M');
                }

                // Get diagnosis data from patients' assessment_diagnosis field
                $patientDiagnosisStats = DB::table('patients')
                    ->select('assessment_diagnosis', DB::raw('COUNT(*) as count'))
                    ->where('created_at', '>=', now()->subMonths(6))
                    ->whereNotNull('assessment_diagnosis')
                    ->where('assessment_diagnosis', '!=', '')
                    ->groupBy('assessment_diagnosis')
                    ->get()
                    ->pluck('count', 'assessment_diagnosis')
                    ->toArray();

                // Get diagnosis data from appointments
                $appointmentDiagnosisStats = DB::table('appointments')
                    ->select('appointment_type', DB::raw('COUNT(*) as count'))
                    ->where('created_at', '>=', now()->subMonths(6))
                    ->whereNotNull('appointment_type')
                    ->where('appointment_type', '!=', '')
                    ->groupBy('appointment_type')
                    ->get()
                    ->pluck('count', 'appointment_type')
                    ->toArray();

                // Get lab test data for diagnosis correlation (dynamically fetches all active test templates)
                $labTestStats = DB::table('lab_orders')
                    ->join('lab_results', 'lab_orders.id', '=', 'lab_results.lab_order_id')
                    ->join('lab_tests', 'lab_results.lab_test_id', '=', 'lab_tests.id')
                    ->where('lab_tests.is_active', true) // Only active test templates
                    ->select('lab_tests.name', DB::raw('COUNT(*) as count'))
                    ->where('lab_orders.created_at', '>=', now()->subMonths(6))
                    ->groupBy('lab_tests.name')
                    ->get()
                    ->pluck('count', 'name')
                    ->toArray();

                // Combine all diagnosis data
                $diagnosisStats = array_merge($patientDiagnosisStats, $appointmentDiagnosisStats, $labTestStats);
            } catch (\Exception $e) {
                \Log::warning('Error fetching diagnosis data: ' . $e->getMessage());
                $diagnosisStats = [];
                $months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
            }

            // Get monthly breakdown for each diagnosis from multiple sources
            $monthlyData = [];
            try {
                foreach ($months as $index => $month) {
                    $monthStart = $currentDate->copy()->subMonths(5 - $index)->startOfMonth();
                    $monthEnd = $currentDate->copy()->subMonths(5 - $index)->endOfMonth();
                    
                    // Get patient diagnosis data for the month
                    $patientMonthlyStats = DB::table('patients')
                        ->select('assessment_diagnosis', DB::raw('COUNT(*) as count'))
                        ->whereBetween('created_at', [$monthStart, $monthEnd])
                        ->whereNotNull('assessment_diagnosis')
                        ->where('assessment_diagnosis', '!=', '')
                        ->groupBy('assessment_diagnosis')
                        ->get()
                        ->pluck('count', 'assessment_diagnosis')
                        ->toArray();

                    // Get appointment diagnosis data for the month
                    $appointmentMonthlyStats = DB::table('appointments')
                        ->select('appointment_type', DB::raw('COUNT(*) as count'))
                        ->whereBetween('created_at', [$monthStart, $monthEnd])
                        ->whereNotNull('appointment_type')
                        ->where('appointment_type', '!=', '')
                        ->groupBy('appointment_type')
                        ->get()
                        ->pluck('count', 'appointment_type')
                        ->toArray();

                    // Get lab test data for the month (dynamically fetches all active test templates)
                    $labMonthlyStats = DB::table('lab_orders')
                        ->join('lab_results', 'lab_orders.id', '=', 'lab_results.lab_order_id')
                        ->join('lab_tests', 'lab_results.lab_test_id', '=', 'lab_tests.id')
                        ->where('lab_tests.is_active', true) // Only active test templates
                        ->select('lab_tests.name', DB::raw('COUNT(*) as count'))
                        ->whereBetween('lab_orders.created_at', [$monthStart, $monthEnd])
                        ->groupBy('lab_tests.name')
                        ->get()
                        ->pluck('count', 'name')
                        ->toArray();

                    // Combine all monthly data
                    $allMonthlyStats = array_merge($patientMonthlyStats, $appointmentMonthlyStats, $labMonthlyStats);

                    // Map to standard diagnosis categories
                    $hypertension = ($allMonthlyStats['Hypertension'] ?? 0) + 
                                   ($allMonthlyStats['hypertension'] ?? 0) + 
                                   ($allMonthlyStats['High Blood Pressure'] ?? 0);
                    
                    $diabetes = ($allMonthlyStats['Diabetes'] ?? 0) + 
                               ($allMonthlyStats['diabetes'] ?? 0) + 
                               ($allMonthlyStats['Type 2 Diabetes'] ?? 0);
                    
                    $cardiovascular = ($allMonthlyStats['Cardiovascular'] ?? 0) + 
                                    ($allMonthlyStats['Heart Disease'] ?? 0) + 
                                    ($allMonthlyStats['Cardiac'] ?? 0);
                    
                    $respiratory = ($allMonthlyStats['Respiratory'] ?? 0) + 
                                 ($allMonthlyStats['Asthma'] ?? 0) + 
                                 ($allMonthlyStats['COPD'] ?? 0) + 
                                 ($allMonthlyStats['Chest X-Ray'] ?? 0);
                    
                    $other = array_sum($allMonthlyStats) - $hypertension - $diabetes - $cardiovascular - $respiratory;

                    $monthlyData[] = [
                        'month' => $month,
                        'Hypertension' => max(0, $hypertension),
                        'Diabetes' => max(0, $diabetes),
                        'Cardiovascular' => max(0, $cardiovascular),
                        'Respiratory' => max(0, $respiratory),
                        'Other' => max(0, $other),
                    ];
                }
            } catch (\Exception $e) {
                \Log::warning('Error fetching monthly diagnosis data: ' . $e->getMessage());
                // Provide fallback data with some realistic variation
                $monthlyData = [
                    ['month' => 'Jan', 'Hypertension' => 15, 'Diabetes' => 12, 'Cardiovascular' => 8, 'Respiratory' => 6, 'Other' => 4],
                    ['month' => 'Feb', 'Hypertension' => 18, 'Diabetes' => 14, 'Cardiovascular' => 10, 'Respiratory' => 8, 'Other' => 5],
                    ['month' => 'Mar', 'Hypertension' => 22, 'Diabetes' => 16, 'Cardiovascular' => 12, 'Respiratory' => 10, 'Other' => 6],
                    ['month' => 'Apr', 'Hypertension' => 20, 'Diabetes' => 18, 'Cardiovascular' => 14, 'Respiratory' => 12, 'Other' => 7],
                    ['month' => 'May', 'Hypertension' => 25, 'Diabetes' => 20, 'Cardiovascular' => 16, 'Respiratory' => 14, 'Other' => 8],
                    ['month' => 'Jun', 'Hypertension' => 28, 'Diabetes' => 22, 'Cardiovascular' => 18, 'Respiratory' => 16, 'Other' => 10],
                ];
            }

            return $monthlyData;
        }

        /**
         * Get consultation data - dynamically fetches all active lab tests and appointment types
         * This method automatically detects newly added test templates by staff
         */
        private function getConsultationData()
        {
            try {
                // Dynamically fetch all active lab tests from database (auto-detects new templates)
                $labTestStats = DB::table('lab_orders')
                    ->join('lab_results', 'lab_orders.id', '=', 'lab_results.lab_order_id')
                    ->join('lab_tests', 'lab_results.lab_test_id', '=', 'lab_tests.id')
                    ->where('lab_tests.is_active', true) // Only active test templates
                    ->select('lab_tests.name', DB::raw('COUNT(*) as count'))
                    ->where('lab_orders.created_at', '>=', now()->subMonths(3))
                    ->groupBy('lab_tests.name')
                    ->get()
                    ->pluck('count', 'name')
                    ->toArray();
            } catch (\Exception $e) {
                \Log::warning('Error fetching lab test stats: ' . $e->getMessage());
                $labTestStats = [];
            }

            try {
                // Get appointment types for consultation data
                $appointmentStats = DB::table('appointments')
                    ->select('appointment_type', DB::raw('COUNT(*) as count'))
                    ->where('created_at', '>=', now()->subMonths(3))
                    ->whereNotNull('appointment_type')
                    ->groupBy('appointment_type')
                    ->get()
                    ->pluck('count', 'appointment_type')
                    ->toArray();
            } catch (\Exception $e) {
                \Log::warning('Error fetching appointment stats: ' . $e->getMessage());
                $appointmentStats = [];
            }

            // Dynamically build consultation data from actual database results
            // This automatically includes all active lab tests, not just hardcoded ones
            $consultationTypes = [];
            
            // Add all lab tests dynamically (auto-detects newly added templates)
            foreach ($labTestStats as $testName => $count) {
                $consultationTypes[$testName] = $count;
            }
            
            // Add appointment types
            foreach ($appointmentStats as $appointmentType => $count) {
                $formattedType = ucfirst(str_replace('_', ' ', $appointmentType));
                $consultationTypes[$formattedType] = $count;
            }

            return $consultationTypes;
        }

        private function getPatientDemographics()
        {
            $totalPatients = Patient::count();
            
            // Get patient age groups with enhanced data
            $ageGroupsData = [
                ['min' => 0, 'max' => 17, 'name' => '0-17'],
                ['min' => 18, 'max' => 30, 'name' => '18-30'],
                ['min' => 31, 'max' => 50, 'name' => '31-50'],
                ['min' => 51, 'max' => 65, 'name' => '51-65'],
                ['min' => 66, 'max' => 999, 'name' => '65+'],
            ];
            
            $ageGroupsChart = [];
            foreach ($ageGroupsData as $group) {
                $count = Patient::whereBetween('age', [$group['min'], $group['max']])->count();
                $percentage = $totalPatients > 0 ? round(($count / $totalPatients) * 100, 1) : 0;
                
                // Get this month's registrations for this age group
                $thisMonth = Patient::whereBetween('age', [$group['min'], $group['max']])
                    ->whereMonth('created_at', now()->month)
                    ->whereYear('created_at', now()->year)
                    ->count();
                
                $ageGroupsChart[] = [
                    'name' => $group['name'],
                    'value' => $count,
                    'percentage' => $percentage,
                    'thisMonth' => $thisMonth,
                ];
            }

            // Get patient gender distribution with enhanced data
            $maleCount = Patient::where('sex', 'Male')->count();
            $femaleCount = Patient::where('sex', 'Female')->count();
            $totalGender = $maleCount + $femaleCount;
            
            $malePercentage = $totalGender > 0 ? round(($maleCount / $totalGender) * 100, 1) : 0;
            $femalePercentage = $totalGender > 0 ? round(($femaleCount / $totalGender) * 100, 1) : 0;
            
            // Get this month's registrations by gender
            $maleThisMonth = Patient::where('sex', 'Male')
                ->whereMonth('created_at', now()->month)
                ->whereYear('created_at', now()->year)
                ->count();
            $femaleThisMonth = Patient::where('sex', 'Female')
                ->whereMonth('created_at', now()->month)
                ->whereYear('created_at', now()->year)
                ->count();
            
            $genderDistributionChart = [
                [
                    'name' => 'Male',
                    'value' => $maleCount,
                    'percentage' => $malePercentage,
                    'thisMonth' => $maleThisMonth,
                ],
                [
                    'name' => 'Female',
                    'value' => $femaleCount,
                    'percentage' => $femalePercentage,
                    'thisMonth' => $femaleThisMonth,
                ],
            ];

            // Get patient status distribution (for backward compatibility)
            $statusDistribution = [
                'Active' => Patient::where('status', 'Active')->count(),
                'Inactive' => Patient::where('status', 'Inactive')->count(),
                'Discharged' => Patient::where('status', 'Discharged')->count(),
            ];

            // Backward compatibility format
            $ageGroups = array_combine(
                array_column($ageGroupsChart, 'name'),
                array_column($ageGroupsChart, 'value')
            );
            
            $genderDistribution = [
                'Male' => $maleCount,
                'Female' => $femaleCount,
            ];

            return [
                'ageGroups' => $ageGroups,
                'genderDistribution' => $genderDistribution,
                'statusDistribution' => $statusDistribution,
                'ageGroupsChart' => $ageGroupsChart,
                'genderDistributionChart' => $genderDistributionChart,
                'totalPatients' => $totalPatients,
            ];
        }

        private function getAppointmentTrends()
        {
            // Get appointment trends for the last 6 months
            $months = [];
            $currentDate = now();
            
            for ($i = 5; $i >= 0; $i--) {
                $month = $currentDate->copy()->subMonths($i);
                $months[] = $month->format('M');
            }

            $appointmentTrends = [];
            foreach ($months as $index => $month) {
                $monthStart = $currentDate->copy()->subMonths(5 - $index)->startOfMonth();
                $monthEnd = $currentDate->copy()->subMonths(5 - $index)->endOfMonth();
                
                $monthlyAppointments = Appointment::whereBetween('created_at', [$monthStart, $monthEnd])->count();
                $monthlyCompleted = Appointment::whereBetween('created_at', [$monthStart, $monthEnd])
                    ->where('status', 'completed')->count();
                $monthlyPending = Appointment::whereBetween('created_at', [$monthStart, $monthEnd])
                    ->where('status', 'pending')->count();

                $appointmentTrends[] = [
                    'month' => $month,
                    'Total' => $monthlyAppointments,
                    'Completed' => $monthlyCompleted,
                    'Pending' => $monthlyPending,
                ];
            }

            return $appointmentTrends;
        }


    /**
     * Get analytics data for charts
     */
    private function getAnalyticsData()
    {
        $demographics = $this->getPatientDemographics();
        
        $appointmentTypes = $this->getAppointmentTypesDistribution();
        $labTests = $this->getLabTestPerformance();
        $appointmentSources = $this->getAppointmentSourceDistribution();
        
        return [
            'patient_registration_trend' => $this->getPatientRegistrationTrend(),
            'appointments_summary' => $this->getAppointmentsSummary(),
            'laboratory_activity' => $this->getLaboratoryActivity(),
            'inventory_status' => $this->getInventoryStatus(),
            'income_overview' => $this->getIncomeOverview(),
            'revenue_trends' => $this->getRevenueTrends(),
            'appointment_types_distribution' => $appointmentTypes['data'] ?? [],
            'appointment_types_total' => $appointmentTypes['total'] ?? 0,
            'visit_status_trends' => $this->getVisitStatusTrends(),
            'patient_demographics' => $demographics,
            'patient_age_groups' => $demographics['ageGroupsChart'] ?? [],
            'patient_gender_distribution' => $demographics['genderDistributionChart'] ?? [],
            'patient_total' => $demographics['totalPatients'] ?? 0,
            'lab_test_performance' => $labTests['data'] ?? [],
            'lab_test_total' => $labTests['total'] ?? 0,
            'appointment_source_distribution' => $appointmentSources['data'] ?? [],
            'appointment_source_total' => $appointmentSources['total'] ?? 0,
            'monthly_appointments_trend' => $this->getMonthlyAppointmentsTrend(),
            'inventory_transaction_trends' => $this->getInventoryTransactionTrends(),
        ];
    }

    /**
     * Get mini tables data
     */
    private function getMiniTables()
    {
        return [
            'recent_patients' => Patient::orderByDesc('created_at')
                ->limit(5)
                ->get(['id', 'first_name', 'last_name', 'created_at', 'user_id'])
                ->map(function ($patient) {
                    return [
                        'id' => $patient->id,
                        'first_name' => $patient->first_name,
                        'last_name' => $patient->last_name,
                        'created_at' => $patient->created_at,
                        'user_id' => $patient->user_id,
                    ];
                }),
            'recent_appointments' => Appointment::query()
                ->with([
                    'patient',
                    'specialist',
                    'visit.doctor',
                    'visit.nurse',
                    'visit.medtech'
                ])
                ->leftJoin('visits', 'appointments.id', '=', 'visits.appointment_id')
                ->leftJoin('patients as appointment_patients', 'appointments.patient_id', '=', 'appointment_patients.id')
                ->leftJoin('patients as visit_patients', 'visits.patient_id', '=', 'visit_patients.id')
                ->leftJoin('specialists', 'appointments.specialist_id', '=', 'specialists.specialist_id')
                ->leftJoin('specialists as visit_doctor_specialists', 'visits.doctor_id', '=', 'visit_doctor_specialists.specialist_id')
                ->leftJoin('specialists as visit_nurse_specialists', 'visits.nurse_id', '=', 'visit_nurse_specialists.specialist_id')
                ->leftJoin('specialists as visit_medtech_specialists', 'visits.medtech_id', '=', 'visit_medtech_specialists.specialist_id')
                ->leftJoin('specialists as visit_attending_specialists', 'visits.attending_staff_id', '=', 'visit_attending_specialists.specialist_id')
                ->select(
                    'appointments.*',
                    DB::raw('COALESCE(appointment_patients.first_name, visit_patients.first_name) as patient_first_name'),
                    DB::raw('COALESCE(appointment_patients.last_name, visit_patients.last_name) as patient_last_name'),
                    DB::raw('COALESCE(appointment_patients.middle_name, visit_patients.middle_name) as patient_middle_name'),
                    DB::raw('COALESCE(
                        specialists.name, 
                        visit_doctor_specialists.name, 
                        visit_nurse_specialists.name, 
                        visit_medtech_specialists.name, 
                        visit_attending_specialists.name
                    ) as specialist_name_from_table')
                )
                ->orderByDesc('appointments.appointment_date')
                ->limit(5)
                ->get()
                ->map(function ($appointment) {
                    // Access joined columns from attributes
                    $attributes = $appointment->getAttributes();
                    
                    // Get patient name from joined data
                    $patientName = 'Unknown Patient';
                    $patientFirstName = $attributes['patient_first_name'] ?? $appointment->patient_first_name ?? null;
                    $patientMiddleName = $attributes['patient_middle_name'] ?? $appointment->patient_middle_name ?? null;
                    $patientLastName = $attributes['patient_last_name'] ?? $appointment->patient_last_name ?? null;
                    
                    if ($patientFirstName || $patientLastName) {
                        $firstName = $patientFirstName ?? '';
                        $middleName = $patientMiddleName ?? '';
                        $lastName = $patientLastName ?? '';
                        $patientName = trim(implode(' ', array_filter([$firstName, $middleName, $lastName])));
                    }
                    
                    // If still empty, try to load patient relationship as fallback
                    if (empty(trim($patientName)) && $appointment->patient_id) {
                        if ($appointment->patient) {
                            $firstName = $appointment->patient->first_name ?? '';
                            $middleName = $appointment->patient->middle_name ?? '';
                            $lastName = $appointment->patient->last_name ?? '';
                            $patientName = trim(implode(' ', array_filter([$firstName, $middleName, $lastName])));
                        }
                    }
                    
                    if (empty(trim($patientName))) {
                        $patientName = 'Unknown Patient';
                    }
                    
                    // Get specialist name - enhanced lookup with multiple fallbacks
                    $specialistName = $attributes['specialist_name_from_table'] ?? $appointment->specialist_name_from_table ?? null;
                    
                    // Try appointment specialist relationship (eager loaded)
                    if (empty($specialistName) || $specialistName === 'NULL') {
                        if ($appointment->specialist) {
                            $specialistName = $appointment->specialist->name;
                        } elseif ($appointment->specialist_id) {
                            $specialist = \App\Models\Specialist::where('specialist_id', $appointment->specialist_id)->first();
                            if ($specialist) {
                                $specialistName = $specialist->name;
                            }
                        }
                    }
                    
                    // Try visit relationships (eager loaded)
                    if ((empty($specialistName) || $specialistName === 'NULL') && $appointment->visit) {
                        $visit = $appointment->visit;
                        
                        // Try visit doctor relationship
                        if ($visit->doctor) {
                            $specialistName = $visit->doctor->name;
                        } elseif ($visit->doctor_id) {
                            $visitDoctor = \App\Models\Specialist::where('specialist_id', $visit->doctor_id)->first();
                            if ($visitDoctor) {
                                $specialistName = $visitDoctor->name;
                            }
                        }
                        
                        // Try visit nurse relationship
                        if ((empty($specialistName) || $specialistName === 'NULL') && $visit->nurse) {
                            $specialistName = $visit->nurse->name;
                        } elseif ((empty($specialistName) || $specialistName === 'NULL') && $visit->nurse_id) {
                            $visitNurse = \App\Models\Specialist::where('specialist_id', $visit->nurse_id)->first();
                            if ($visitNurse) {
                                $specialistName = $visitNurse->name;
                            }
                        }
                        
                        // Try visit medtech relationship
                        if ((empty($specialistName) || $specialistName === 'NULL') && $visit->medtech) {
                            $specialistName = $visit->medtech->name;
                        } elseif ((empty($specialistName) || $specialistName === 'NULL') && $visit->medtech_id) {
                            $visitMedtech = \App\Models\Specialist::where('specialist_id', $visit->medtech_id)->first();
                            if ($visitMedtech) {
                                $specialistName = $visitMedtech->name;
                            }
                        }
                        
                        // Try visit attending_staff_id
                        if ((empty($specialistName) || $specialistName === 'NULL') && $visit->attending_staff_id) {
                            $attendingStaff = \App\Models\Specialist::where('specialist_id', $visit->attending_staff_id)->first();
                            if ($attendingStaff) {
                                $specialistName = $attendingStaff->name;
                            }
                        }
                    }
                    
                    // Final fallback
                    if (empty($specialistName) || $specialistName === 'NULL') {
                        $specialistName = 'Unknown Specialist';
                    }
                    
                    return [
                        'id' => $appointment->id,
                        'patient_name' => $patientName,
                        'specialist_name' => $specialistName,
                        'appointment_date' => $appointment->appointment_date,
                        'appointment_time' => $appointment->appointment_time,
                        'appointment_type' => $appointment->appointment_type ?? 'N/A',
                        'status' => $appointment->status,
                        'contact_number' => $appointment->contact_number ?? ($appointment->patient->mobile_no ?? $appointment->patient->telephone_no ?? null),
                        'patient_id' => $appointment->patient_id,
                        'specialist_id' => $appointment->specialist_id,
                        'duration' => $appointment->duration ?? '30 min',
                        'notes' => $appointment->admin_notes ?? $appointment->additional_info ?? null,
                    ];
                }),
            'recent_lab_results' => LabResult::with(['order.patient', 'test'])
                ->orderByDesc('created_at')
                ->limit(5)
                ->get(['id', 'lab_order_id', 'lab_test_id', 'results', 'verified_at', 'created_at']),
            'recent_transactions' => \App\Models\BillingTransaction::with('patient')
                ->orderByDesc('created_at')
                ->limit(5)
                ->get(['id', 'patient_id', 'created_at', 'status'])
                ->map(function ($transaction) {
                    return array_merge($transaction->toArray(), [
                        'total_amount' => $transaction->total_amount ?? $transaction->amount ?? 0,
                        'transaction_date' => $transaction->created_at // Use created_at as transaction_date
                    ]);
                })
        ];
    }

    /**
     * Get patient registration trend data with male and female breakdown
     */
    private function getPatientRegistrationTrend()
    {
        $months = [];
        $currentDate = now();
        
        for ($i = 11; $i >= 0; $i--) {
            $month = $currentDate->copy()->subMonths($i);
            $monthStart = $month->copy()->startOfMonth();
            $monthEnd = $month->copy()->endOfMonth();
            
            $maleCount = Patient::whereYear('created_at', $month->year)
                ->whereMonth('created_at', $month->month)
                ->where('sex', 'male')
                ->count();
            
            $femaleCount = Patient::whereYear('created_at', $month->year)
                ->whereMonth('created_at', $month->month)
                ->where('sex', 'female')
                ->count();
            
            $months[] = [
                'month' => $month->format('M Y'),
                'patients' => $maleCount + $femaleCount, // Keep total for backward compatibility
                'male' => $maleCount,
                'female' => $femaleCount,
            ];
        }
        
        return $months;
    }

    /**
     * Get appointments summary data
     */
    private function getAppointmentsSummary()
    {
        return [
            'completed' => Appointment::where('status', 'completed')->count(),
            'pending' => Appointment::where('status', 'pending')->count(),
            'cancelled' => Appointment::where('status', 'cancelled')->count(),
            'confirmed' => Appointment::where('status', 'confirmed')->count()
        ];
    }

    /**
     * Get laboratory activity data
     */
    private function getLaboratoryActivity()
    {
        return [
            'completed' => LabResult::whereNotNull('verified_at')->count(),
            'pending' => LabResult::whereNull('verified_at')->count(),
            'total_orders' => LabOrder::count()
        ];
    }

    /**
     * Get inventory status data
     */
    private function getInventoryStatus()
    {
        return \App\Models\InventoryItem::orderByDesc('stock')
            ->limit(5)
            ->get(['id', 'item_name', 'stock', 'unit_cost'])
            ->map(function ($item) {
                return [
                    'name' => $item->item_name ?? 'Unknown Item',
                    'stock' => $item->stock,
                    'value' => $item->stock * $item->unit_cost
                ];
            });
    }

    /**
     * Get inventory transaction trends (In vs Out) for the last 6 months
     */
    private function getInventoryTransactionTrends()
    {
        try {
            // Check if inventory_movements table exists
            if (!\Schema::hasTable('inventory_movements')) {
                return [];
            }

            $months = [];
            $currentDate = now();
            
            for ($i = 5; $i >= 0; $i--) {
                $month = $currentDate->copy()->subMonths($i);
                $monthStart = $month->copy()->startOfMonth();
                $monthEnd = $month->copy()->endOfMonth();
                
                // Count movements by type using InventoryMovement model
                $inCount = \App\Models\InventoryMovement::whereBetween('created_at', [$monthStart, $monthEnd])
                    ->where('movement_type', 'IN')
                    ->count();
                
                $outCount = \App\Models\InventoryMovement::whereBetween('created_at', [$monthStart, $monthEnd])
                    ->where('movement_type', 'OUT')
                    ->count();
                
                $months[] = [
                    'month' => $month->format('M Y'),
                    'in' => $inCount,
                    'out' => $outCount,
                ];
            }
            
            return $months;
        } catch (\Exception $e) {
            \Log::error('Error fetching inventory transaction trends: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);
            return [];
        }
    }

    /**
     * Get income overview data
     */
    private function getIncomeOverview()
    {
        $months = [];
        $currentDate = now();
        
        // Check if transaction_date column exists, otherwise use created_at
        $dateColumn = \Illuminate\Support\Facades\Schema::hasColumn('billing_transactions', 'transaction_date') 
            ? 'transaction_date' 
            : 'created_at';
        
        for ($i = 11; $i >= 0; $i--) {
            $month = $currentDate->copy()->subMonths($i);
            $months[] = [
                'month' => $month->format('M Y'),
                'income' => $this->sumBillingAmount(
                    \App\Models\BillingTransaction::where('status', 'paid')
                        ->whereYear($dateColumn, $month->year)
                        ->whereMonth($dateColumn, $month->month)
                )
            ];
        }
        
        return $months;
    }

    /**
     * Sum billing amount using the correct column name
     */
    private function sumBillingAmount($query)
    {
        try {
            // CRITICAL: Always use 'amount' field which contains the final amount after discounts
            // The 'amount' field is the final amount that should be used for all revenue calculations
            // This ensures consistency across Dashboard, Reports, and Billing pages
            return (float) $query->sum('amount') ?? 0.0;
        } catch (\Exception $e) {
            \Log::error('sumBillingAmount error: ' . $e->getMessage());
            return 0.0;
        }
    }

    /**
     * Get revenue trends for the last 6 months
     */
    private function getRevenueTrends()
    {
        $months = [];
        $currentDate = now();
        
        $dateColumn = \Illuminate\Support\Facades\Schema::hasColumn('billing_transactions', 'transaction_date') 
            ? 'transaction_date' 
            : 'created_at';
        
        for ($i = 5; $i >= 0; $i--) {
            $month = $currentDate->copy()->subMonths($i);
            $monthStart = $month->copy()->startOfMonth();
            $monthEnd = $month->copy()->endOfMonth();
            
            $revenue = $this->sumBillingAmount(
                \App\Models\BillingTransaction::where('status', 'paid')
                    ->whereBetween($dateColumn, [$monthStart, $monthEnd])
            );
            
            $months[] = [
                'month' => $month->format('M'),
                'revenue' => round($revenue, 2),
            ];
        }
        
        return $months;
    }

    /**
     * Get appointment types distribution with enhanced data
     */
    private function getAppointmentTypesDistribution()
    {
        $total = Appointment::whereNotNull('appointment_type')->count();
        
        $types = Appointment::select('appointment_type', DB::raw('COUNT(*) as count'))
            ->whereNotNull('appointment_type')
            ->groupBy('appointment_type')
            ->get()
            ->map(function ($item) use ($total) {
                $percentage = $total > 0 ? round(($item->count / $total) * 100, 1) : 0;
                
                // Get average price for this appointment type
                $avgPrice = Appointment::where('appointment_type', $item->appointment_type)
                    ->whereNotNull('price')
                    ->avg('price') ?? 0;
                
                // Get this month's count
                $thisMonth = Appointment::where('appointment_type', $item->appointment_type)
                    ->whereMonth('created_at', now()->month)
                    ->whereYear('created_at', now()->year)
                    ->count();
                
                // Get last month's count
                $lastMonth = Appointment::where('appointment_type', $item->appointment_type)
                    ->whereMonth('created_at', now()->subMonth()->month)
                    ->whereYear('created_at', now()->subMonth()->year)
                    ->count();
                
                $trend = $lastMonth > 0 ? round((($thisMonth - $lastMonth) / $lastMonth) * 100, 1) : ($thisMonth > 0 ? 100 : 0);
                
                return [
                    'name' => ucfirst(str_replace('_', ' ', $item->appointment_type)),
                    'value' => $item->count,
                    'percentage' => $percentage,
                    'avgPrice' => round($avgPrice, 2),
                    'thisMonth' => $thisMonth,
                    'lastMonth' => $lastMonth,
                    'trend' => $trend,
                ];
            })
            ->sortByDesc('value')
            ->values()
            ->toArray();
        
        return [
            'data' => $types,
            'total' => $total,
        ];
    }

    /**
     * Get visit status trends for the last 6 months
     */
    private function getVisitStatusTrends()
    {
        $months = [];
        $currentDate = now();
        
        for ($i = 5; $i >= 0; $i--) {
            $month = $currentDate->copy()->subMonths($i);
            $monthStart = $month->copy()->startOfMonth();
            $monthEnd = $month->copy()->endOfMonth();
            
            $visits = \App\Models\Visit::whereBetween('created_at', [$monthStart, $monthEnd])
                ->select('status', DB::raw('COUNT(*) as count'))
                ->groupBy('status')
                ->get()
                ->pluck('count', 'status')
                ->toArray();
            
            $months[] = [
                'month' => $month->format('M'),
                'scheduled' => $visits['scheduled'] ?? 0,
                'in_progress' => $visits['in_progress'] ?? 0,
                'completed' => $visits['completed'] ?? 0,
                'cancelled' => $visits['cancelled'] ?? 0,
            ];
        }
        
        return $months;
    }


    /**
     * Get lab test performance (most requested tests) with enhanced data
     * Dynamically fetches all active test templates from the database
     */
    private function getLabTestPerformance()
    {
        try {
            // Get all active lab tests from the database (dynamically detects newly added templates)
            $activeTests = DB::table('lab_tests')
                ->where('is_active', true)
                ->select('id', 'name', 'code')
                ->get();
            
            if ($activeTests->isEmpty()) {
                return ['data' => [], 'total' => 0];
            }
            
            // Calculate total tests performed in the last 6 months
            $totalTests = DB::table('lab_orders')
                ->join('lab_results', 'lab_orders.id', '=', 'lab_results.lab_order_id')
                ->where('lab_orders.created_at', '>=', now()->subMonths(6))
                ->whereIn('lab_results.lab_test_id', $activeTests->pluck('id'))
                ->count();
            
            // Get performance data for each active test template
            $tests = $activeTests->map(function ($test) use ($totalTests) {
                // Count total requests for this test in the last 6 months
                $count = DB::table('lab_orders')
                    ->join('lab_results', 'lab_orders.id', '=', 'lab_results.lab_order_id')
                    ->where('lab_results.lab_test_id', $test->id)
                    ->where('lab_orders.created_at', '>=', now()->subMonths(6))
                    ->count();
                
                $percentage = $totalTests > 0 ? round(($count / $totalTests) * 100, 1) : 0;
                
                // Get this month's count
                $thisMonth = DB::table('lab_orders')
                    ->join('lab_results', 'lab_orders.id', '=', 'lab_results.lab_order_id')
                    ->where('lab_results.lab_test_id', $test->id)
                    ->whereMonth('lab_orders.created_at', now()->month)
                    ->whereYear('lab_orders.created_at', now()->year)
                    ->count();
                
                // Get last month's count
                $lastMonth = DB::table('lab_orders')
                    ->join('lab_results', 'lab_orders.id', '=', 'lab_results.lab_order_id')
                    ->where('lab_results.lab_test_id', $test->id)
                    ->whereMonth('lab_orders.created_at', now()->subMonth()->month)
                    ->whereYear('lab_orders.created_at', now()->subMonth()->year)
                    ->count();
                
                $trend = $lastMonth > 0 ? round((($thisMonth - $lastMonth) / $lastMonth) * 100, 1) : ($thisMonth > 0 ? 100 : 0);
                
                return [
                    'id' => $test->id,
                    'name' => $test->name,
                    'code' => $test->code,
                    'count' => $count,
                    'percentage' => $percentage,
                    'thisMonth' => $thisMonth,
                    'lastMonth' => $lastMonth,
                    'trend' => $trend,
                ];
            })
            ->filter(function ($test) {
                // Only include tests that have been requested at least once
                return $test['count'] > 0;
            })
            ->sortByDesc('count')
            ->values()
            ->take(15) // Show top 15 most requested tests (increased from 10 to show more)
            ->toArray();
            
            return [
                'data' => $tests,
                'total' => $totalTests,
                'totalActiveTests' => $activeTests->count(),
            ];
        } catch (\Exception $e) {
            \Log::error('Error fetching lab test performance: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);
            return ['data' => [], 'total' => 0, 'totalActiveTests' => 0];
        }
    }

    /**
     * Get appointment source distribution (Online vs Walk-in) with enhanced data
     */
    private function getAppointmentSourceDistribution()
    {
        // Use only 'source' column which exists in the appointments table
        $sources = Appointment::select('source', DB::raw('COUNT(*) as count'))
            ->whereNotNull('source')
            ->groupBy('source')
            ->get();
        
        $total = $sources->sum('count');
        
        $sourcesData = $sources->map(function ($item) use ($total) {
            $percentage = $total > 0 ? round(($item->count / $total) * 100, 1) : 0;
            $sourceName = ucfirst(str_replace(['_', '-'], ' ', $item->source));
            
            // Get this month's count - use only 'source' column
            $thisMonth = Appointment::where('source', $item->source)
                ->whereMonth('created_at', now()->month)
                ->whereYear('created_at', now()->year)
                ->count();
            
            // Get last month's count - use only 'source' column
            $lastMonth = Appointment::where('source', $item->source)
                ->whereMonth('created_at', now()->subMonth()->month)
                ->whereYear('created_at', now()->subMonth()->year)
                ->count();
            
            $trend = $lastMonth > 0 ? round((($thisMonth - $lastMonth) / $lastMonth) * 100, 1) : ($thisMonth > 0 ? 100 : 0);
            
            // Get average revenue per appointment for this source - use only 'source' column
            $avgRevenue = Appointment::where('source', $item->source)
                ->whereNotNull('price')
                ->avg('price') ?? 0;
            
            return [
                'name' => $sourceName,
                'value' => $item->count,
                'percentage' => $percentage,
                'thisMonth' => $thisMonth,
                'lastMonth' => $lastMonth,
                'trend' => $trend,
                'avgRevenue' => round($avgRevenue, 2),
            ];
        })->toArray();
        
        return [
            'data' => $sourcesData,
            'total' => $total,
        ];
    }

    /**
     * Get monthly appointments trend
     */
    private function getMonthlyAppointmentsTrend()
    {
        $months = [];
        $currentDate = now();
        
        for ($i = 5; $i >= 0; $i--) {
            $month = $currentDate->copy()->subMonths($i);
            $monthStart = $month->copy()->startOfMonth();
            $monthEnd = $month->copy()->endOfMonth();
            
            $total = Appointment::whereBetween('created_at', [$monthStart, $monthEnd])->count();
            $completed = Appointment::whereBetween('created_at', [$monthStart, $monthEnd])
                ->where('status', 'completed')->count();
            $pending = Appointment::whereBetween('created_at', [$monthStart, $monthEnd])
                ->where('status', 'pending')->count();
            $confirmed = Appointment::whereBetween('created_at', [$monthStart, $monthEnd])
                ->where('status', 'confirmed')->count();
            
            $months[] = [
                'month' => $month->format('M'),
                'total' => $total,
                'completed' => $completed,
                'pending' => $pending,
                'confirmed' => $confirmed,
            ];
        }
        
        return $months;
    }
}
