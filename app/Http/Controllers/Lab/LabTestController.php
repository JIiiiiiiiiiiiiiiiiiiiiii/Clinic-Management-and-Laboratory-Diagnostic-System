<?php

namespace App\Http\Controllers\Lab;

use App\Http\Controllers\Controller;
use App\Models\LabTest;
use Illuminate\Http\Request;
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
            $validated = $request->validate([
                'name' => ['required', 'string', 'max:255'],
                'code' => ['required', 'string', 'max:64', 'unique:lab_tests,code'],
                'fields_schema' => ['nullable', 'array'],
                'is_active' => ['boolean'],
            ]);

            LabTest::create($validated);
            return back()->with('success', 'Laboratory test created successfully!');
        } catch (\Throwable $e) {
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
                'is_active' => ['boolean'],
            ]);

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


