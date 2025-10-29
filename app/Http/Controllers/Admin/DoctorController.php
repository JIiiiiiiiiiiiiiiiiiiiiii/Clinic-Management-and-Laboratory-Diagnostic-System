<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Specialist;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class DoctorController extends Controller
{
    public function index()
    {
        $doctors = Specialist::where('role', 'Doctor')
            ->orderBy('name')
            ->get()
            ->map(function ($doctor) {
                return [
                    'id' => $doctor->specialist_id,
                    'specialist_id' => $doctor->specialist_id,
                    'name' => $doctor->name,
                    'email' => $doctor->email,
                    'contact' => $doctor->contact,
                    'is_active' => $doctor->status === 'Active',
                    'created_at' => $doctor->created_at,
                    'updated_at' => $doctor->updated_at,
                    'schedule_data' => $doctor->schedule_data,
                ];
            });

        return Inertia::render('admin/specialists/doctors/index', [
            'doctors' => $doctors,
        ]);
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'name' => ['required', 'string', 'max:255'],
                'email' => ['nullable', 'string', 'email', 'max:255'],
                'password' => ['required', 'string', 'min:8', 'confirmed'],
                'contact' => ['nullable', 'string', 'max:20'],
                'status' => ['required', 'in:Active,Inactive'],
            ]);

            $validated['role'] = 'Doctor';
            
            // Generate specialist code if not provided
            if (empty($validated['specialist_code'])) {
                $validated['specialist_code'] = 'DOC' . str_pad(Specialist::where('role', 'Doctor')->count() + 1, 3, '0', STR_PAD_LEFT);
            }

            // Create specialist record
            $specialist = Specialist::create($validated);

            // Create user account if email is provided
            if (!empty($validated['email'])) {
                User::create([
                    'name' => $validated['name'],
                    'email' => $validated['email'],
                    'password' => Hash::make($validated['password']),
                    'role' => 'doctor',
                    'is_active' => $validated['status'] === 'Active',
                    'employee_id' => $validated['specialist_code'],
                ]);
            }

            return back()->with('success', 'Doctor created successfully!');
        } catch (\Throwable $e) {
            return back()->with('error', 'Failed to create doctor: ' . $e->getMessage())->withInput();
        }
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
                'password' => ['nullable', 'string', 'min:8'],
                'password_confirmation' => ['nullable', 'string', 'same:password'],
                'contact' => ['nullable', 'string', 'max:20'],
                'status' => ['required', 'in:Active,Inactive'],
            ]);

            // Remove password_confirmation from the data to be saved
            unset($validated['password_confirmation']);

            // Debug: Log the validated data
            \Log::info('Updating doctor with data:', $validated);

            $doctor->update($validated);

            // Update user account if email is provided
            if (!empty($validated['email'])) {
                $user = User::where('employee_id', $doctor->specialist_code)
                    ->orWhere('email', $validated['email'])
                    ->first();
                
                if ($user) {
                    $userData = [
                        'name' => $validated['name'],
                        'email' => $validated['email'],
                        'is_active' => $validated['status'] === 'Active',
                    ];
                    
                    // Only update password if provided
                    if (!empty($validated['password'])) {
                        $userData['password'] = Hash::make($validated['password']);
                    }
                    
                    $user->update($userData);
                }
            }

            // Debug: Log the updated doctor
            \Log::info('Updated doctor:', $doctor->fresh()->toArray());

            return back()->with('success', 'Doctor updated successfully!');
        } catch (\Throwable $e) {
            \Log::error('Doctor update failed:', ['error' => $e->getMessage(), 'data' => $request->all()]);
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
