<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Patient;
use App\Models\Appointment;
use App\Models\Staff;
use App\Models\Visit;
use App\Models\BillingTransaction;
use App\Services\TransactionalAppointmentService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class UpdatedAppointmentController extends Controller
{
    protected $appointmentService;

    public function __construct(TransactionalAppointmentService $appointmentService)
    {
        $this->appointmentService = $appointmentService;
    }

    /**
     * Display a listing of appointments
     */
    public function index(Request $request)
    {
        $query = Appointment::with(['patient', 'specialist']);

        // Filter by status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Filter by source
        if ($request->filled('source')) {
            $query->where('source', $request->source);
        }

        // Filter by date range
        if ($request->filled('date_from')) {
            $query->where('appointment_date', '>=', $request->date_from);
        }
        if ($request->filled('date_to')) {
            $query->where('appointment_date', '<=', $request->date_to);
        }

        $appointments = $query->orderBy('appointment_date', 'desc')
            ->orderBy('appointment_time', 'desc')
            ->paginate(15);

        return Inertia::render('admin/appointments/index', [
            'appointments' => $appointments,
            'filters' => $request->only(['status', 'source', 'date_from', 'date_to'])
        ]);
    }

    /**
     * Display pending appointments
     */
    public function pending()
    {
        $appointments = Appointment::with(['patient', 'specialist'])
            ->where('status', 'Pending')
            ->where('source', 'Online')
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        return Inertia::render('admin/appointments/pending', [
            'appointments' => $appointments
        ]);
    }

    /**
     * Show appointment details
     */
    public function show(Appointment $appointment)
    {
        $appointment->load(['patient', 'specialist', 'visits', 'billingTransactions']);

        // Format the appointment data for frontend display
        $formattedAppointment = [
            'id' => $appointment->id,
            'patient_name' => $appointment->patient_name,
            'patient_id' => $appointment->patient_id,
            'contact_number' => $appointment->contact_number,
            'appointment_type' => $appointment->appointment_type,
            'price' => $appointment->price,
            'specialist_type' => $appointment->specialist_type,
            'specialist_name' => $appointment->specialist_name,
            'specialist_id' => $appointment->specialist_id,
            'appointment_date' => $appointment->appointment_date ? $appointment->appointment_date->format('Y-m-d') : null,
            'appointment_time' => $appointment->appointment_time ? $appointment->appointment_time->format('H:i:s') : null,
            'duration' => $appointment->duration,
            'status' => $appointment->status,
            'billing_status' => $appointment->billing_status,
            'notes' => $appointment->notes,
            'special_requirements' => $appointment->special_requirements,
            'created_at' => $appointment->created_at,
            'updated_at' => $appointment->updated_at,
            'patient' => $appointment->patient,
            'specialist' => $appointment->specialist,
            'visits' => $appointment->visits,
            'billingTransactions' => $appointment->billingTransactions
        ];

        return Inertia::render('admin/appointments/show', [
            'appointment' => $formattedAppointment
        ]);
    }

    /**
     * Approve pending appointment
     */
    public function approve(Request $request, Appointment $appointment)
    {
        $request->validate([
            'admin_notes' => 'nullable|string|max:500',
            'assigned_staff_id' => 'nullable|integer|exists:staff,staff_id'
        ]);

        try {
            $result = $this->appointmentService->approveAppointment(
                $appointment->id,
                $request->admin_notes,
                $request->assigned_staff_id
            );

            return redirect()->route('admin.appointments.pending')
                ->with('success', 'Appointment approved successfully! Visit and billing transaction created.')
                ->with('appointment_code', $result['appointment']->appointment_code)
                ->with('visit_code', $result['visit_code'])
                ->with('transaction_code', $result['transaction_code']);

        } catch (\Exception $e) {
            \Log::error('Failed to approve appointment', [
                'error' => $e->getMessage(),
                'appointment_id' => $appointment->id
            ]);

            return back()
                ->with('error', 'Failed to approve appointment: ' . $e->getMessage());
        }
    }

    /**
     * Create walk-in appointment
     */
    public function createWalkIn()
    {
        $doctors = Staff::where('role', 'Doctor')->where('status', 'Active')->get();
        $medtechs = Staff::where('role', 'MedTech')->where('status', 'Active')->get();

        $appointmentTypes = [
            'general_consultation' => 'General Consultation',
            'cbc' => 'Complete Blood Count (CBC)',
            'fecalysis_test' => 'Fecalysis Test',
            'urinarysis_test' => 'Urinarysis Test',
        ];

        return Inertia::render('admin/appointments/create-walkin', [
            'doctors' => $doctors,
            'medtechs' => $medtechs,
            'appointmentTypes' => $appointmentTypes
        ]);
    }

    /**
     * Store walk-in appointment
     */
    public function storeWalkIn(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'appointment_type' => 'required|string|in:general_consultation,cbc,fecalysis_test,urinarysis_test',
            'specialist_type' => 'required|string|in:doctor,medtech',
            'specialist_id' => 'required|integer|exists:staff,staff_id',
            'appointment_date' => 'required|date|after_or_equal:today',
            'appointment_time' => 'required|string',
            'notes' => 'nullable|string|max:500',
            
            // Patient data
            'last_name' => 'required|string|max:100',
            'first_name' => 'required|string|max:100',
            'middle_name' => 'nullable|string|max:100',
            'birthdate' => 'nullable|date',
            'age' => 'nullable|integer|min:0|max:150',
            'sex' => 'nullable|in:Male,Female',
            'nationality' => 'nullable|string|max:50',
            'civil_status' => 'nullable|string|max:50',
            'address' => 'nullable|string',
            'telephone_no' => 'nullable|string|max:20',
            'mobile_no' => 'nullable|string|max:20',
            'emergency_name' => 'nullable|string|max:100',
            'emergency_relation' => 'nullable|string|max:50',
            'insurance_company' => 'nullable|string|max:100',
            'hmo_name' => 'nullable|string|max:100',
            'hmo_id_no' => 'nullable|string|max:100',
            'approval_code' => 'nullable|string|max:100',
            'validity' => 'nullable|date',
            'drug_allergies' => 'nullable|string',
            'past_medical_history' => 'nullable|string',
            'family_history' => 'nullable|string',
            'social_history' => 'nullable|string',
            'obgyn_history' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        try {
            // Check for time conflicts
            $conflictCheck = Appointment::where('specialist_id', $request->specialist_id)
                ->where('appointment_date', $request->appointment_date)
                ->where('appointment_time', $this->formatTimeForDatabase($request->appointment_time))
                ->where('status', '!=', 'Cancelled')
                ->exists();

            if ($conflictCheck) {
                return back()->withErrors(['appointment_time' => 'This time slot is already booked. Please choose another time.']);
            }

            // Prepare appointment data
            $appointmentData = [
                'appointment_type' => $request->appointment_type,
                'specialist_type' => ucfirst($request->specialist_type),
                'specialist_id' => $request->specialist_id,
                'appointment_date' => $request->appointment_date,
                'appointment_time' => $this->formatTimeForDatabase($request->appointment_time),
                'duration' => '30 min',
                'price' => $this->calculatePrice($request->appointment_type),
                'additional_info' => $request->notes,
            ];

            // Prepare patient data
            $patientData = [
                'last_name' => $request->last_name,
                'first_name' => $request->first_name,
                'middle_name' => $request->middle_name,
                'birthdate' => $request->birthdate,
                'age' => $request->age,
                'sex' => $request->sex,
                'nationality' => $request->nationality,
                'civil_status' => $request->civil_status,
                'address' => $request->address,
                'telephone_no' => $request->telephone_no,
                'mobile_no' => $request->mobile_no,
                'emergency_name' => $request->emergency_name,
                'emergency_relation' => $request->emergency_relation,
                'insurance_company' => $request->insurance_company,
                'hmo_name' => $request->hmo_name,
                'hmo_id_no' => $request->hmo_id_no,
                'approval_code' => $request->approval_code,
                'validity' => $request->validity,
                'drug_allergies' => $request->drug_allergies,
                'past_medical_history' => $request->past_medical_history,
                'family_history' => $request->family_history,
                'social_history' => $request->social_history,
                'obgyn_history' => $request->obgyn_history,
                'status' => 'Active',
            ];

            // Create walk-in appointment using transactional service
            $result = $this->appointmentService->createWalkInAppointment($appointmentData, $patientData);

            \Log::info('Walk-in appointment created successfully', [
                'appointment_id' => $result['appointment_id'],
                'appointment_code' => $result['appointment_code'],
                'visit_id' => $result['visit_id'],
                'visit_code' => $result['visit_code'],
                'transaction_id' => $result['transaction_id'],
                'transaction_code' => $result['transaction_code']
            ]);

            return redirect()->route('admin.appointments.index')
                ->with('success', 'Walk-in appointment created successfully! Visit and billing transaction created.')
                ->with('appointment_code', $result['appointment_code'])
                ->with('visit_code', $result['visit_code'])
                ->with('transaction_code', $result['transaction_code']);

        } catch (\Exception $e) {
            \Log::error('Failed to create walk-in appointment', [
                'error' => $e->getMessage(),
                'request_data' => $request->all()
            ]);

            return back()
                ->with('error', 'Failed to create walk-in appointment: ' . $e->getMessage())
                ->withInput();
        }
    }

    /**
     * Process payment for billing transaction
     */
    public function processPayment(Request $request, BillingTransaction $transaction)
    {
        $request->validate([
            'payment_method' => 'required|in:Cash,Card,HMO',
            'reference_no' => 'nullable|string|max:100'
        ]);

        try {
            $result = $this->appointmentService->processPayment(
                $transaction->id,
                $request->payment_method,
                $request->reference_no
            );

            return redirect()->route('admin.billing.pending')
                ->with('success', 'Payment processed successfully!')
                ->with('transaction_code', $result['transaction']->transaction_code);

        } catch (\Exception $e) {
            \Log::error('Failed to process payment', [
                'error' => $e->getMessage(),
                'transaction_id' => $transaction->id
            ]);

            return back()
                ->with('error', 'Failed to process payment: ' . $e->getMessage());
        }
    }

    /**
     * Format time for database storage
     */
    private function formatTimeForDatabase($time)
    {
        return date('H:i:s', strtotime($time));
    }

    /**
     * Calculate price based on appointment type
     */
    private function calculatePrice($appointmentType)
    {
        return match($appointmentType) {
            'general_consultation' => 500.00,
            'cbc' => 300.00,
            'fecalysis_test' => 200.00,
            'urinarysis_test' => 200.00,
            default => 0.00
        };
    }
}

