<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class DoctorController extends Controller
{
    public function index()
    {
        $doctors = User::where('role', 'doctor')
            ->orderBy('name')
            ->get();

        return Inertia::render('admin/doctors/index', [
            'doctors' => $doctors,
        ]);
    }

    public function create()
    {
        return Inertia::render('admin/doctors/create');
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'name' => ['required', 'string', 'max:255'],
                'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
                'password' => ['required', 'string', 'min:8', 'confirmed'],
                'specialization' => ['nullable', 'string', 'max:255'],
                'license_number' => ['nullable', 'string', 'max:255'],
                'is_active' => ['boolean'],
            ]);

            $validated['password'] = Hash::make($validated['password']);
            $validated['role'] = 'doctor';

            User::create($validated);

            return back()->with('success', 'Doctor created successfully!');
        } catch (\Throwable $e) {
            return back()->with('error', 'Failed to create doctor: ' . $e->getMessage())->withInput();
        }
    }

    public function edit(User $doctor)
    {
        if ($doctor->role !== 'doctor') {
            return back()->with('error', 'User is not a doctor.');
        }

        return Inertia::render('admin/doctors/edit', [
            'doctor' => $doctor,
        ]);
    }

    public function update(Request $request, User $doctor)
    {
        if ($doctor->role !== 'doctor') {
            return back()->with('error', 'User is not a doctor.');
        }

        try {
            $validated = $request->validate([
                'name' => ['required', 'string', 'max:255'],
                'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email,' . $doctor->id],
                'password' => ['nullable', 'string', 'min:8', 'confirmed'],
                'specialization' => ['nullable', 'string', 'max:255'],
                'license_number' => ['nullable', 'string', 'max:255'],
                'is_active' => ['boolean'],
            ]);

            if (!empty($validated['password'])) {
                $validated['password'] = Hash::make($validated['password']);
            } else {
                unset($validated['password']);
            }

            $doctor->update($validated);

            return back()->with('success', 'Doctor updated successfully!');
        } catch (\Throwable $e) {
            return back()->with('error', 'Failed to update doctor: ' . $e->getMessage())->withInput();
        }
    }

    public function destroy(User $doctor)
    {
        if ($doctor->role !== 'doctor') {
            return back()->with('error', 'User is not a doctor.');
        }

        try {
            $doctor->delete();
            return back()->with('success', 'Doctor deleted successfully!');
        } catch (\Throwable $e) {
            return back()->with('error', 'Failed to delete doctor: ' . $e->getMessage());
        }
    }
}
