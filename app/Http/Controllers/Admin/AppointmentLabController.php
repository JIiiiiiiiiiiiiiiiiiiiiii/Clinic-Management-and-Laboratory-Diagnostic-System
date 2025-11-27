<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\LabTest;
use App\Services\AppointmentLabService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class AppointmentLabController extends Controller
{
    protected $appointmentLabService;

    public function __construct(AppointmentLabService $appointmentLabService)
    {
        $this->appointmentLabService = $appointmentLabService;
    }

    /**
     * Show add lab tests page
     */
    public function showAddLabTests(Appointment $appointment)
    {
        // $this->authorize('view', $appointment); // TODO: Add authorization policy

        // Allow lab tests to be added to appointments without requiring existing billing transactions
        // The billing transaction will be created later with the complete total including lab tests

        // Get available lab tests
        $availableLabTests = LabTest::where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name', 'code', 'price']);

        // Get existing lab tests for this appointment
        $existingLabTests = $this->appointmentLabService->getAppointmentLabTests($appointment);

        // Fetch appointment with comprehensive patient and specialist data using LEFT JOIN
        $appointmentData = \App\Models\Appointment::query()
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
                ) as specialist_name_from_table'),
                DB::raw('COALESCE(
                    specialists.specialist_id, 
                    visit_doctor_specialists.specialist_id, 
                    visit_nurse_specialists.specialist_id, 
                    visit_medtech_specialists.specialist_id, 
                    visit_attending_specialists.specialist_id
                ) as specialist_id_from_table')
            )
            ->where('appointments.id', $appointment->id)
            ->first();

        // Get patient name from joined data
        $patientName = 'Unknown Patient';
        if ($appointmentData) {
            $attributes = $appointmentData->getAttributes();
            $patientFirstName = $attributes['patient_first_name'] ?? null;
            $patientMiddleName = $attributes['patient_middle_name'] ?? null;
            $patientLastName = $attributes['patient_last_name'] ?? null;
            
            if ($patientFirstName || $patientLastName) {
                $firstName = $patientFirstName ?? '';
                $middleName = $patientMiddleName ?? '';
                $lastName = $patientLastName ?? '';
                $patientName = trim(implode(' ', array_filter([$firstName, $middleName, $lastName])));
            }
            
            // Fallback to relationship if joined data is missing
            if (empty(trim($patientName)) && $appointment->patient_id) {
                $appointment->load('patient');
                if ($appointment->patient) {
                    $firstName = $appointment->patient->first_name ?? '';
                    $middleName = $appointment->patient->middle_name ?? '';
                    $lastName = $appointment->patient->last_name ?? '';
                    $patientName = trim(implode(' ', array_filter([$firstName, $middleName, $lastName])));
                }
            }
        }

        // Get specialist name from joined data
        $specialistName = 'Unknown Specialist';
        $specialistId = null;
        if ($appointmentData) {
            $attributes = $appointmentData->getAttributes();
            $specialistName = $attributes['specialist_name_from_table'] ?? null;
            $specialistId = $attributes['specialist_id_from_table'] ?? null;
            
            // Fallback to relationship if joined data is missing
            if (empty($specialistName) || $specialistName === 'NULL') {
                if ($appointment->specialist_id) {
                    $appointment->load('specialist');
                    if ($appointment->specialist) {
                        $specialistName = $appointment->specialist->name;
                        $specialistId = $appointment->specialist->specialist_id;
                    }
                }
            }
        }

        return Inertia::render('admin/appointments/add-lab-tests', [
            'appointment' => [
                'id' => $appointment->id,
                'patient_name' => $patientName,
                'appointment_type' => $appointment->appointment_type,
                'price' => (float) $appointment->price,
                'total_lab_amount' => (float) ($appointment->total_lab_amount ?? 0),
                'final_total_amount' => (float) ($appointment->final_total_amount ?? $appointment->price),
                'appointment_date' => $appointment->appointment_date?->format('Y-m-d'),
                'appointment_time' => $appointment->appointment_time?->format('H:i:s'),
                'specialist_name' => $specialistName,
                'specialist_id' => $specialistId,
                'status' => $appointment->status,
            ],
            'availableLabTests' => $availableLabTests->map(function ($test) {
                return [
                    'id' => $test->id,
                    'name' => $test->name,
                    'code' => $test->code,
                    'price' => (float) $test->price,
                ];
            }),
            'existingLabTests' => $existingLabTests->map(function ($labTest) {
                // Check if lab_test relationship exists before accessing its properties
                $labTestData = null;
                if ($labTest->lab_test) {
                    $labTestData = [
                        'id' => $labTest->lab_test->id,
                        'name' => $labTest->lab_test->name,
                        'code' => $labTest->lab_test->code,
                        'price' => (float) $labTest->lab_test->price,
                    ];
                }
                
                return [
                    'id' => $labTest->id,
                    'lab_test' => $labTestData,
                    'total_price' => (float) $labTest->total_price,
                    'status' => $labTest->status,
                    'added_by' => [
                        'name' => $labTest->addedBy->name ?? 'Unknown',
                    ],
                ];
            })->filter(function ($labTest) {
                // Filter out lab tests where the relationship is null
                return $labTest['lab_test'] !== null;
            })->values(),
        ]);
    }

    /**
     * Add lab tests to appointment
     */
    public function addLabTests(Request $request, Appointment $appointment)
    {
        // $this->authorize('update', $appointment); // TODO: Add authorization policy

        \Log::info('AddLabTests called', [
            'appointment_id' => $appointment->id,
            'request_data' => $request->all(),
            'request_input' => $request->input(),
            'request_json' => $request->json()->all(),
            'user_id' => auth()->id()
        ]);

        // Handle both form data and JSON data
        $labTestIds = $request->input('lab_test_ids', []);
        if (empty($labTestIds) && $request->has('lab_test_ids')) {
            $labTestIds = $request->get('lab_test_ids', []);
        }
        
        // If still empty, try to get from JSON
        if (empty($labTestIds) && $request->isJson()) {
            $labTestIds = $request->json('lab_test_ids', []);
        }

        \Log::info('Processed lab_test_ids', [
            'lab_test_ids' => $labTestIds,
            'is_array' => is_array($labTestIds),
            'count' => count($labTestIds)
        ]);

        $validated = $request->validate([
            'lab_test_ids' => 'required|array|min:1',
            'lab_test_ids.*' => 'exists:lab_tests,id',
            'notes' => 'nullable|string|max:1000'
        ]);

        try {
            $result = $this->appointmentLabService->addLabTestsToAppointment(
                $appointment,
                $validated['lab_test_ids'],
                auth()->id(),
                $validated['notes'] ?? null
            );

            return redirect()
                ->route('admin.appointments.index')
                ->with('success', "Successfully added {$result['lab_tests_added']} lab test(s) to appointment. New total: ₱" . number_format($result['final_total'], 2));

        } catch (\Exception $e) {
            return back()
                ->withInput()
                ->with('error', 'Failed to add lab tests: ' . $e->getMessage());
        }
    }

    /**
     * Get available lab tests (API endpoint)
     */
    public function getAvailableLabTests()
    {
        $labTests = LabTest::where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name', 'code', 'price']);

        return response()->json($labTests);
    }

    /**
     * Get appointment lab tests (API endpoint)
     */
    public function getAppointmentLabTests(Appointment $appointment)
    {
        // $this->authorize('view', $appointment); // TODO: Add authorization policy

        $labTests = $this->appointmentLabService->getAppointmentLabTests($appointment);

        return response()->json($labTests);
    }

    /**
     * Remove lab test from appointment
     */
    public function removeLabTest(Request $request, Appointment $appointment)
    {
        // $this->authorize('update', $appointment); // TODO: Add authorization policy

        $validated = $request->validate([
            'lab_test_id' => 'required|exists:lab_tests,id'
        ]);

        try {
            $result = $this->appointmentLabService->removeLabTestFromAppointment(
                $appointment,
                $validated['lab_test_id']
            );

            return response()->json([
                'success' => true,
                'message' => 'Lab test removed successfully',
                'data' => $result
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to remove lab test: ' . $e->getMessage()
            ], 400);
        }
    }

    /**
     * Get lab test pricing information
     */
    public function getLabTestPricing(Request $request)
    {
        $validated = $request->validate([
            'lab_test_ids' => 'required|array',
            'lab_test_ids.*' => 'exists:lab_tests,id'
        ]);

        $labTests = LabTest::whereIn('id', $validated['lab_test_ids'])
            ->get(['id', 'name', 'price']);

        $totalPrice = $labTests->sum('price');

        return response()->json([
            'lab_tests' => $labTests,
            'total_price' => $totalPrice,
            'formatted_total' => '₱' . number_format($totalPrice, 2)
        ]);
    }
}
