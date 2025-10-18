<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Specialist;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MedTechController extends Controller
{
    public function index()
    {
        $medtechs = Specialist::where('role', 'MedTech')
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
                'email' => ['nullable', 'string', 'email', 'max:255'],
                'specialization' => ['nullable', 'string', 'max:255'],
                'contact' => ['nullable', 'string', 'max:20'],
                'status' => ['required', 'in:Active,Inactive'],
            ]);

            $validated['role'] = 'MedTech';
            
            // Generate specialist code if not provided
            if (empty($validated['specialist_code'])) {
                $validated['specialist_code'] = 'MED' . str_pad(Specialist::where('role', 'MedTech')->count() + 1, 3, '0', STR_PAD_LEFT);
            }

            Specialist::create($validated);

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
                'specialization' => ['nullable', 'string', 'max:255'],
                'contact' => ['nullable', 'string', 'max:20'],
                'status' => ['required', 'in:Active,Inactive'],
            ]);

            $medtech->update($validated);

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
