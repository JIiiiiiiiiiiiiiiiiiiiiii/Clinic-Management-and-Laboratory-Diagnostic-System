<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class MedTechController extends Controller
{
    public function index()
    {
        $medtechs = User::where('role', 'medtech')
            ->orderBy('name')
            ->get();

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
                'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
                'password' => ['required', 'string', 'min:8', 'confirmed'],
                'specialization' => ['nullable', 'string', 'max:255'],
                'license_number' => ['nullable', 'string', 'max:255'],
                'is_active' => ['boolean'],
            ]);

            $validated['password'] = Hash::make($validated['password']);
            $validated['role'] = 'medtech';

            User::create($validated);

            return back()->with('success', 'Med Tech created successfully!');
        } catch (\Throwable $e) {
            return back()->with('error', 'Failed to create med tech: ' . $e->getMessage())->withInput();
        }
    }

    public function edit(User $medtech)
    {
        if ($medtech->role !== 'medtech') {
            return back()->with('error', 'User is not a med tech.');
        }

        return Inertia::render('admin/specialists/medtechs/edit', [
            'medtech' => $medtech,
        ]);
    }

    public function update(Request $request, User $medtech)
    {
        if ($medtech->role !== 'medtech') {
            return back()->with('error', 'User is not a med tech.');
        }

        try {
            $validated = $request->validate([
                'name' => ['required', 'string', 'max:255'],
                'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email,' . $medtech->id],
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

            $medtech->update($validated);

            return back()->with('success', 'Med Tech updated successfully!');
        } catch (\Throwable $e) {
            return back()->with('error', 'Failed to update med tech: ' . $e->getMessage())->withInput();
        }
    }

    public function destroy(User $medtech)
    {
        if ($medtech->role !== 'medtech') {
            return back()->with('error', 'User is not a med tech.');
        }

        try {
            $medtech->delete();
            return back()->with('success', 'Med Tech deleted successfully!');
        } catch (\Throwable $e) {
            return back()->with('error', 'Failed to delete med tech: ' . $e->getMessage());
        }
    }
}
