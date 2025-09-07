<?php

namespace App\Http\Controllers;

use App\Http\Requests\PatientVisit\StorePatientVisitRequest;
use App\Http\Requests\PatientVisit\UpdatePatientVisitRequest;
use App\Models\Patient;
use App\Models\PatientVisit;
use App\Services\PatientVisitService;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class PatientVisitController extends Controller
{
    public function index(Patient $patient)
    {
        // Redirect to patient details with the Visit Records tab active to keep
        // visit functionality strictly under Patient Management
        return redirect()->to(route('admin.patient.show', $patient) . '?tab=visits');
    }

    public function create(Patient $patient)
    {
        $doctors = \App\Models\User::query()
            ->where('role', 'doctor')
            ->where(function ($q) {
                try {
                    $q->where('is_active', true);
                } catch (\Throwable $e) {
                    // ignore
                }
            })
            ->orderBy('name')
            ->get(['id', 'name']);

        return Inertia::render('admin/patient/visits/create', [
            'patient' => $patient,
            'doctors' => $doctors,
        ]);
    }

    public function store(StorePatientVisitRequest $request, Patient $patient, PatientVisitService $visitService)
    {
        try {
            $validated = $request->validated();

            $visit = $visitService->createVisit($patient, $validated);

            return redirect()->to(route('admin.patient.show', $patient) . '?tab=visits')
                ->with('success', 'Visit recorded successfully!');
        } catch (\Throwable $e) {
            return back()
                ->with('error', 'Failed to record visit: ' . $e->getMessage())
                ->withInput();
        }
    }

    public function show(Patient $patient, PatientVisit $visit)
    {
        $visit->load(['patient', 'labOrders.labTests']);

        return Inertia::render('admin/patient/visits/show', [
            'patient' => $patient,
            'visit' => $visit,
        ]);
    }

    public function edit(Patient $patient, PatientVisit $visit)
    {
        $doctors = \App\Models\User::query()
            ->where('role', 'doctor')
            ->orderBy('name')
            ->get(['id', 'name']);

        return Inertia::render('admin/patient/visits/edit', [
            'patient' => $patient,
            'visit' => $visit,
            'doctors' => $doctors,
        ]);
    }

    public function update(UpdatePatientVisitRequest $request, Patient $patient, PatientVisit $visit, PatientVisitService $visitService)
    {
        try {
            $validated = $request->validated();

            $visitService->updateVisit($visit, $validated);

            return redirect()->to(route('admin.patient.show', $patient) . '?tab=visits')
                ->with('success', 'Visit updated successfully!');
        } catch (\Throwable $e) {
            return back()
                ->with('error', 'Failed to update visit: ' . $e->getMessage())
                ->withInput();
        }
    }

    public function destroy(Patient $patient, PatientVisit $visit)
    {
        $visit->delete();

        return redirect()->to(route('admin.patient.show', $patient) . '?tab=visits')
            ->with('success', 'Visit deleted successfully!');
    }
}
