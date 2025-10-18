<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Specialist;
use Illuminate\Http\Request;
use Inertia\Inertia;

class NurseController extends Controller
{
    public function index()
    {
        $nurses = Specialist::where('role', 'Nurse')
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
                'email' => ['nullable', 'string', 'email', 'max:255'],
                'specialization' => ['nullable', 'string', 'max:255'],
                'contact' => ['nullable', 'string', 'max:20'],
                'status' => ['required', 'in:Active,Inactive'],
            ]);

            $validated['role'] = 'Nurse';
            
            // Generate specialist code if not provided
            if (empty($validated['specialist_code'])) {
                $validated['specialist_code'] = 'NUR' . str_pad(Specialist::where('role', 'Nurse')->count() + 1, 3, '0', STR_PAD_LEFT);
            }

            Specialist::create($validated);

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
                'specialization' => ['nullable', 'string', 'max:255'],
                'contact' => ['nullable', 'string', 'max:20'],
                'status' => ['required', 'in:Active,Inactive'],
            ]);

            $nurse->update($validated);

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
