<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class NurseController extends Controller
{
    public function index()
    {
        $nurses = User::where('role', 'nurse')
            ->orderBy('name')
            ->get();

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
                'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
                'password' => ['required', 'string', 'min:8', 'confirmed'],
                'specialization' => ['nullable', 'string', 'max:255'],
                'license_number' => ['nullable', 'string', 'max:255'],
                'is_active' => ['boolean'],
            ]);

            $validated['password'] = Hash::make($validated['password']);
            $validated['role'] = 'nurse';

            User::create($validated);

            return back()->with('success', 'Nurse created successfully!');
        } catch (\Throwable $e) {
            return back()->with('error', 'Failed to create nurse: ' . $e->getMessage())->withInput();
        }
    }

    public function edit(User $nurse)
    {
        if ($nurse->role !== 'nurse') {
            return back()->with('error', 'User is not a nurse.');
        }

        return Inertia::render('admin/specialists/nurses/edit', [
            'nurse' => $nurse,
        ]);
    }

    public function update(Request $request, User $nurse)
    {
        if ($nurse->role !== 'nurse') {
            return back()->with('error', 'User is not a nurse.');
        }

        try {
            $validated = $request->validate([
                'name' => ['required', 'string', 'max:255'],
                'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email,' . $nurse->id],
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

            $nurse->update($validated);

            return back()->with('success', 'Nurse updated successfully!');
        } catch (\Throwable $e) {
            return back()->with('error', 'Failed to update nurse: ' . $e->getMessage())->withInput();
        }
    }

    public function destroy(User $nurse)
    {
        if ($nurse->role !== 'nurse') {
            return back()->with('error', 'User is not a nurse.');
        }

        try {
            $nurse->delete();
            return back()->with('success', 'Nurse deleted successfully!');
        } catch (\Throwable $e) {
            return back()->with('error', 'Failed to delete nurse: ' . $e->getMessage());
        }
    }
}
