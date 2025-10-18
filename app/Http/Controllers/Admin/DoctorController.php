<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Specialist;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DoctorController extends Controller
{
    public function index()
    {
        $doctors = Specialist::where('role', 'Doctor')
            ->orderBy('name')
            ->get();

        return Inertia::render('admin/specialists/doctors/index', [
            'doctors' => $doctors,
        ]);
    }

    public function create()
    {
        return Inertia::render('admin/specialists/doctors/create');
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'name' => ['required', 'string', 'max:255'],
                'email' => ['nullable', 'string', 'email', 'max:255'],
                'specialization' => ['nullable', 'string', 'max:255'],
                'contact' => ['nullable', 'string', 'max:20'],
                'status' => ['required', 'in:Active,Inactive'],
            ]);

            $validated['role'] = 'Doctor';
            
            // Generate specialist code if not provided
            if (empty($validated['specialist_code'])) {
                $validated['specialist_code'] = 'DOC' . str_pad(Specialist::where('role', 'Doctor')->count() + 1, 3, '0', STR_PAD_LEFT);
            }

            Specialist::create($validated);

            return back()->with('success', 'Doctor created successfully!');
        } catch (\Throwable $e) {
            return back()->with('error', 'Failed to create doctor: ' . $e->getMessage())->withInput();
        }
    }

    public function edit(Specialist $doctor)
    {
        if ($doctor->role !== 'Doctor') {
            return back()->with('error', 'Specialist is not a doctor.');
        }

        return Inertia::render('admin/specialists/doctors/edit', [
            'doctor' => $doctor,
        ]);
    }

    public function update(Request $request, Specialist $doctor)
    {
        if ($doctor->role !== 'Doctor') {
            return back()->with('error', 'Specialist is not a doctor.');
        }

        try {
            $validated = $request->validate([
                'name' => ['required', 'string', 'max:255'],
                'email' => ['nullable', 'string', 'email', 'max:255'],
                'specialization' => ['nullable', 'string', 'max:255'],
                'contact' => ['nullable', 'string', 'max:20'],
                'status' => ['required', 'in:Active,Inactive'],
            ]);

            $doctor->update($validated);

            return back()->with('success', 'Doctor updated successfully!');
        } catch (\Throwable $e) {
            return back()->with('error', 'Failed to update doctor: ' . $e->getMessage())->withInput();
        }
    }

    public function destroy(Specialist $doctor)
    {
        if ($doctor->role !== 'Doctor') {
            return back()->with('error', 'Specialist is not a doctor.');
        }

        try {
            $doctor->delete();
            return back()->with('success', 'Doctor deleted successfully!');
        } catch (\Throwable $e) {
            return back()->with('error', 'Failed to delete doctor: ' . $e->getMessage());
        }
    }
}
