<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Specialist;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class MedTechController extends Controller
{
    public function index()
    {
        $medtechs = Specialist::where('role', 'MedTech')
            ->orderBy('name')
            ->get()
            ->map(function ($medtech) {
                return [
                    'id' => $medtech->specialist_id,
                    'specialist_id' => $medtech->specialist_id,
                    'name' => $medtech->name,
                    'email' => $medtech->email,
                    'contact' => $medtech->contact,
                    'is_active' => $medtech->status === 'Active',
                    'created_at' => $medtech->created_at,
                    'updated_at' => $medtech->updated_at,
                ];
            });

        return Inertia::render('admin/specialists/medtechs/index', [
            'medtechs' => $medtechs,
        ]);
    }

    public function create()
    {
        return Inertia::render('admin/specialists/medtechs/create');
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

            $validated['role'] = 'MedTech';
            
            // Generate specialist code if not provided
            if (empty($validated['specialist_code'])) {
                $validated['specialist_code'] = 'MED' . str_pad(Specialist::where('role', 'MedTech')->count() + 1, 3, '0', STR_PAD_LEFT);
            }

            // Create specialist record
            $specialist = Specialist::create($validated);

            // Create user account if email is provided
            if (!empty($validated['email'])) {
                User::create([
                    'name' => $validated['name'],
                    'email' => $validated['email'],
                    'password' => Hash::make($validated['password']),
                    'role' => 'medtech',
                    'is_active' => $validated['status'] === 'Active',
                    'employee_id' => $validated['specialist_code'],
                ]);
            }

            return back()->with('success', 'Med Tech created successfully!');
        } catch (\Throwable $e) {
            return back()->with('error', 'Failed to create med tech: ' . $e->getMessage())->withInput();
        }
    }

    public function edit(Specialist $medtech)
    {
        if ($medtech->role !== 'MedTech') {
            return back()->with('error', 'Specialist is not a med tech.');
        }

        return Inertia::render('admin/specialists/medtechs/edit', [
            'medtech' => $medtech,
        ]);
    }

    public function update(Request $request, Specialist $medtech)
    {
        if ($medtech->role !== 'MedTech') {
            return back()->with('error', 'Specialist is not a med tech.');
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

            $medtech->update($validated);

            // Update user account if email is provided
            if (!empty($validated['email'])) {
                $user = User::where('employee_id', $medtech->specialist_code)
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

            return back()->with('success', 'Med Tech updated successfully!');
        } catch (\Throwable $e) {
            return back()->with('error', 'Failed to update med tech: ' . $e->getMessage())->withInput();
        }
    }

    public function destroy(Specialist $medtech)
    {
        if ($medtech->role !== 'MedTech') {
            return back()->with('error', 'Specialist is not a med tech.');
        }

        try {
            $medtech->delete();
            return back()->with('success', 'Med Tech deleted successfully!');
        } catch (\Throwable $e) {
            return back()->with('error', 'Failed to delete med tech: ' . $e->getMessage());
        }
    }
}
