<?php

namespace App\Services;

use App\Models\Visit;
use App\Models\LabTest;
use App\Models\LabOrder;
use App\Models\LabResult;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class VisitLabService
{
    /**
     * Add lab tests to a visit
     */
    public function addLabTestsToVisit(Visit $visit, array $labTestIds, int $orderedBy, string $notes = null): array
    {
        Log::info('VisitLabService::addLabTestsToVisit called', [
            'visit_id' => $visit->id,
            'lab_test_ids' => $labTestIds,
            'ordered_by' => $orderedBy,
            'notes' => $notes
        ]);

        return DB::transaction(function () use ($visit, $labTestIds, $orderedBy, $notes) {
            try {
                // Check for duplicate tests already requested in this visit
                $existingTestIds = LabOrder::where('patient_visit_id', $visit->id)
                    ->with('results')
                    ->get()
                    ->flatMap(function ($order) {
                        return $order->results->pluck('lab_test_id');
                    })
                    ->unique()
                    ->values()
                    ->toArray();

                // Filter out duplicate test IDs
                $newTestIds = array_diff($labTestIds, $existingTestIds);
                
                if (empty($newTestIds)) {
                    $duplicateNames = LabTest::whereIn('id', array_intersect($labTestIds, $existingTestIds))
                        ->pluck('name')
                        ->toArray();
                    throw new \Exception('The following lab test(s) have already been requested for this visit: ' . implode(', ', $duplicateNames));
                }

                // Get lab tests (only the new ones)
                $labTests = LabTest::whereIn('id', $newTestIds)->get();
                
                if ($labTests->isEmpty()) {
                    throw new \Exception('No valid lab tests found');
                }

                $totalLabAmount = $labTests->sum('price');

                // Get attending physician/doctor from visit
                $attendingPhysician = $this->getAttendingPhysician($visit);
                
                // Build notes with attending physician information
                $orderNotes = [];
                if ($attendingPhysician) {
                    $orderNotes[] = "Attending Physician: {$attendingPhysician}";
                }
                if ($notes) {
                    $orderNotes[] = $notes;
                }
                $finalNotes = !empty($orderNotes) ? implode("\n", $orderNotes) : null;

                // Create lab order directly linked to visit
                $labOrder = LabOrder::create([
                    'patient_id' => $visit->patient_id,
                    'patient_visit_id' => $visit->id,
                    'ordered_by' => $orderedBy,
                    'status' => 'ordered',
                    'notes' => $finalNotes
                ]);

                // Create lab results for each test
                foreach ($labTests as $labTest) {
                    LabResult::create([
                        'lab_order_id' => $labOrder->id,
                        'lab_test_id' => $labTest->id,
                        'results' => []
                    ]);
                }

                Log::info('Lab tests added to visit', [
                    'visit_id' => $visit->id,
                    'lab_tests_count' => $labTests->count(),
                    'total_lab_amount' => $totalLabAmount,
                    'lab_order_id' => $labOrder->id,
                    'ordered_by' => $orderedBy
                ]);

                return [
                    'success' => true,
                    'total_lab_amount' => $totalLabAmount,
                    'lab_tests_added' => $labTests->count(),
                    'lab_order_id' => $labOrder->id
                ];

            } catch (\Exception $e) {
                Log::error('Failed to add lab tests to visit', [
                    'visit_id' => $visit->id,
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString()
                ]);
                
                throw $e;
            }
        });
    }

    /**
     * Get existing lab orders for a visit
     */
    public function getVisitLabOrders(Visit $visit)
    {
        return LabOrder::where('patient_visit_id', $visit->id)
            ->with(['labTests', 'orderedBy', 'results.test'])
            ->get();
    }

    /**
     * Get attending physician/doctor from visit
     */
    private function getAttendingPhysician(Visit $visit): ?string
    {
        // Try to get from attending staff relationship
        if ($visit->relationLoaded('attendingStaff') && $visit->attendingStaff) {
            return $visit->attendingStaff->name;
        }

        // Try to load and get attending staff
        if ($visit->attending_staff_id) {
            $staff = \App\Models\User::find($visit->attending_staff_id);
            if ($staff) {
                return $staff->name;
            }
        }

        // Try to get from appointment's specialist
        if ($visit->appointment_id) {
            $appointment = $visit->appointment ?? \App\Models\Appointment::find($visit->appointment_id);
            if ($appointment && $appointment->specialist) {
                return $appointment->specialist->name;
            }
        }

        return null;
    }
}

