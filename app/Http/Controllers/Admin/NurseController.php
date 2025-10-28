<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Specialist;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class NurseController extends Controller
{
    public function index()
    {
        $nurses = Specialist::where('role', 'Nurse')
            ->orderBy('name')
            ->get()
            ->map(function ($nurse) {
                return [
                    'id' => $nurse->specialist_id,
                    'specialist_id' => $nurse->specialist_id,
                    'name' => $nurse->name,
                    'email' => $nurse->email,
                    'contact' => $nurse->contact,
                    'is_active' => $nurse->status === 'Active',
                    'created_at' => $nurse->created_at,
                    'updated_at' => $nurse->updated_at,
                ];
            });

        return Inertia::render('admin/specialists/nurses/index', [
            'nurses' => $nurses,
        ]);
    }

    public function create()
    {
        return Inertia::render('admin/specialists/nurses/create');
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

            $validated['role'] = 'Nurse';
            
            // Generate specialist code if not provided
            if (empty($validated['specialist_code'])) {
                $validated['specialist_code'] = 'NUR' . str_pad(Specialist::where('role', 'Nurse')->count() + 1, 3, '0', STR_PAD_LEFT);
            }

            // Create specialist record
            $specialist = Specialist::create($validated);

            // Create user account if email is provided
            if (!empty($validated['email'])) {
                User::create([
                    'name' => $validated['name'],
                    'email' => $validated['email'],
                    'password' => Hash::make($validated['password']),
                    'role' => 'nurse',
                    'is_active' => $validated['status'] === 'Active',
                    'employee_id' => $validated['specialist_code'],
                ]);
            }

            return back()->with('success', 'Nurse created successfully!');
        } catch (\Throwable $e) {
            return back()->with('error', 'Failed to create nurse: ' . $e->getMessage())->withInput();
        }
    }

    public function edit(Specialist $nurse)
    {
        if ($nurse->role !== 'Nurse') {
            return back()->with('error', 'Specialist is not a nurse.');
        }

        return Inertia::render('admin/specialists/nurses/edit', [
            'nurse' => $nurse,
        ]);
    }

    public function update(Request $request, Specialist $nurse)
    {
        if ($nurse->role !== 'Nurse') {
            return back()->with('error', 'Specialist is not a nurse.');
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

            $nurse->update($validated);

            // Update user account if email is provided
            if (!empty($validated['email'])) {
                $user = User::where('employee_id', $nurse->specialist_code)
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

            return back()->with('success', 'Nurse updated successfully!');
        } catch (\Throwable $e) {
            return back()->with('error', 'Failed to update nurse: ' . $e->getMessage())->withInput();
        }
    }

    public function destroy(Specialist $nurse)
    {
        if ($nurse->role !== 'Nurse') {
            return back()->with('error', 'Specialist is not a nurse.');
        }

        try {
            $nurse->delete();
            return back()->with('success', 'Nurse deleted successfully!');
        } catch (\Throwable $e) {
            return back()->with('error', 'Failed to delete nurse: ' . $e->getMessage());
        }
    }
}
