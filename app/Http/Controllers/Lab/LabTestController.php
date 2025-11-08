<?php

namespace App\Http\Controllers\Lab;

use App\Http\Controllers\Controller;
use App\Models\LabTest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class LabTestController extends Controller
{
    public function index()
    {
        $tests = LabTest::orderBy('name')->get();
        return Inertia::render('admin/laboratory/tests/index', ['tests' => $tests]);
    }

    public function create()
    {
        return Inertia::render('admin/laboratory/tests/create');
    }

    public function store(Request $request)
    {
        try {
            // Log the incoming request data for debugging
            \Log::info('Lab test creation request data:', $request->all());

            $validated = $request->validate([
                'name' => ['required', 'string', 'max:255'],
                'code' => ['required', 'string', 'max:64', 'unique:lab_tests,code'],
                'fields_schema' => ['nullable', 'array'],
                'is_active' => ['nullable', 'boolean'],
            ]);

            // Ensure is_active defaults to true if not provided
            $validated['is_active'] = $validated['is_active'] ?? true;
            $validated['version'] = 1; // Set default version

            \Log::info('Validated data:', $validated);

            // Workaround for ID auto-increment issue: manually get next ID
            // Use database transaction to prevent race conditions
            $labTest = DB::transaction(function () use ($validated) {
                // Get the next ID safely
                $maxId = DB::table('lab_tests')->max('id');
                $nextId = ($maxId ?? 0) + 1;
                $validated['id'] = $nextId;

                return LabTest::create($validated);
            });
            \Log::info('Lab test created successfully', ['id' => $labTest->id]);

            return back()->with('success', 'Laboratory test created successfully!');
        } catch (\Throwable $e) {
            \Log::error('Lab test creation failed:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'request_data' => $request->all()
            ]);
            return back()->with('error', 'Failed to create test: ' . $e->getMessage())->withInput();
        }
    }

    public function edit(LabTest $labTest)
    {
        return Inertia::render('admin/laboratory/tests/edit', [
            'test' => $labTest,
        ]);
    }

    public function update(Request $request, LabTest $labTest)
    {
        try {
            $validated = $request->validate([
                'name' => ['required', 'string', 'max:255'],
                'code' => ['required', 'string', 'max:64', 'unique:lab_tests,code,'.$labTest->id],
                'fields_schema' => ['nullable', 'array'],
                'is_active' => ['nullable', 'boolean'],
            ]);

            // Ensure is_active is set properly
            $validated['is_active'] = $validated['is_active'] ?? false;

            $labTest->update($validated);
            return back()->with('success', 'Laboratory test updated successfully!');
        } catch (\Throwable $e) {
            return back()->with('error', 'Failed to update test: ' . $e->getMessage())->withInput();
        }
    }

    public function destroy(LabTest $labTest)
    {
        $labTest->delete();
        return back()->with('success', 'Laboratory test deleted');
    }
}


