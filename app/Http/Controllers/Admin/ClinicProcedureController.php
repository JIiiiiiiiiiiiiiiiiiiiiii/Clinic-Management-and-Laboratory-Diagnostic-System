<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ClinicProcedure;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Validator;

class ClinicProcedureController extends Controller
{
    public function index(Request $request): Response
    {
        $query = ClinicProcedure::query();

        // Apply filters
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('code', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if ($request->filled('category') && $request->category !== 'all') {
            $query->where('category', $request->category);
        }

        if ($request->filled('subcategory') && $request->subcategory !== 'all') {
            $query->where('subcategory', $request->subcategory);
        }

        if ($request->filled('status') && $request->status !== 'all') {
            if ($request->status === 'active') {
                $query->where('is_active', true);
            } elseif ($request->status === 'inactive') {
                $query->where('is_active', false);
            }
        }

        $procedures = $query->ordered()->paginate(15);

        // Get categories and subcategories for filters
        $categories = ClinicProcedure::distinct()->pluck('category')->sort()->values();
        $subcategories = ClinicProcedure::distinct()->pluck('subcategory')->filter()->sort()->values();

        return Inertia::render('Admin/ClinicProcedures/Index', [
            'procedures' => $procedures,
            'filters' => $request->only(['search', 'category', 'subcategory', 'status']),
            'categories' => $categories,
            'subcategories' => $subcategories,
        ]);
    }

    public function create(): Response
    {
        $categories = [
            'laboratory' => 'Laboratory',
            'diagnostic' => 'Diagnostic',
            'treatment' => 'Treatment',
            'consultation' => 'Consultation',
        ];

        $subcategories = [
            'blood_test' => 'Blood Test',
            'urine_test' => 'Urine Test',
            'imaging' => 'Imaging',
            'therapy' => 'Therapy',
            'surgery' => 'Surgery',
            'consultation' => 'Consultation',
        ];

        $personnelRoles = [
            'doctor' => 'Doctor',
            'nurse' => 'Nurse',
            'medtech' => 'Medical Technologist',
            'laboratory_technologist' => 'Laboratory Technologist',
            'cashier' => 'Cashier',
        ];

        return Inertia::render('Admin/ClinicProcedures/Create', [
            'categories' => $categories,
            'subcategories' => $subcategories,
            'personnelRoles' => $personnelRoles,
        ]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:clinic_procedures,code',
            'description' => 'nullable|string|max:1000',
            'category' => 'required|string|in:laboratory,diagnostic,treatment,consultation',
            'subcategory' => 'nullable|string|max:100',
            'price' => 'required|numeric|min:0',
            'duration_minutes' => 'required|integer|min:1',
            'requirements' => 'nullable|array',
            'equipment_needed' => 'nullable|array',
            'personnel_required' => 'nullable|array',
            'is_active' => 'boolean',
            'requires_prescription' => 'boolean',
            'is_emergency' => 'boolean',
            'sort_order' => 'nullable|integer|min:0',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        try {
            ClinicProcedure::create($request->all());

            return redirect()->route('admin.clinic-procedures.index')
                ->with('success', 'Clinic procedure created successfully!');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to create procedure. Please try again.'])
                ->withInput();
        }
    }

    public function show(ClinicProcedure $clinicProcedure): Response
    {
        return Inertia::render('Admin/ClinicProcedures/Show', [
            'procedure' => $clinicProcedure,
        ]);
    }

    public function edit(ClinicProcedure $clinicProcedure): Response
    {
        $categories = [
            'laboratory' => 'Laboratory',
            'diagnostic' => 'Diagnostic',
            'treatment' => 'Treatment',
            'consultation' => 'Consultation',
        ];

        $subcategories = [
            'blood_test' => 'Blood Test',
            'urine_test' => 'Urine Test',
            'imaging' => 'Imaging',
            'therapy' => 'Therapy',
            'surgery' => 'Surgery',
            'consultation' => 'Consultation',
        ];

        $personnelRoles = [
            'doctor' => 'Doctor',
            'nurse' => 'Nurse',
            'medtech' => 'Medical Technologist',
            'laboratory_technologist' => 'Laboratory Technologist',
            'cashier' => 'Cashier',
        ];

        return Inertia::render('Admin/ClinicProcedures/Edit', [
            'procedure' => $clinicProcedure,
            'categories' => $categories,
            'subcategories' => $subcategories,
            'personnelRoles' => $personnelRoles,
        ]);
    }

    public function update(Request $request, ClinicProcedure $clinicProcedure)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:clinic_procedures,code,' . $clinicProcedure->id,
            'description' => 'nullable|string|max:1000',
            'category' => 'required|string|in:laboratory,diagnostic,treatment,consultation',
            'subcategory' => 'nullable|string|max:100',
            'price' => 'required|numeric|min:0',
            'duration_minutes' => 'required|integer|min:1',
            'requirements' => 'nullable|array',
            'equipment_needed' => 'nullable|array',
            'personnel_required' => 'nullable|array',
            'is_active' => 'boolean',
            'requires_prescription' => 'boolean',
            'is_emergency' => 'boolean',
            'sort_order' => 'nullable|integer|min:0',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        try {
            $clinicProcedure->update($request->all());

            return redirect()->route('admin.clinic-procedures.index')
                ->with('success', 'Clinic procedure updated successfully!');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to update procedure. Please try again.'])
                ->withInput();
        }
    }

    public function destroy(ClinicProcedure $clinicProcedure)
    {
        try {
            $clinicProcedure->delete();

            return redirect()->route('admin.clinic-procedures.index')
                ->with('success', 'Clinic procedure deleted successfully!');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to delete procedure. Please try again.']);
        }
    }

    public function toggleStatus(ClinicProcedure $clinicProcedure)
    {
        try {
            $clinicProcedure->update(['is_active' => !$clinicProcedure->is_active]);

            $status = $clinicProcedure->is_active ? 'activated' : 'deactivated';
            return back()->with('success', "Clinic procedure {$status} successfully!");
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to update procedure status. Please try again.']);
        }
    }

    public function getByCategory(Request $request)
    {
        $category = $request->get('category');
        
        if (!$category) {
            return response()->json([]);
        }

        $procedures = ClinicProcedure::active()
            ->byCategory($category)
            ->ordered()
            ->select('id', 'name', 'code', 'price', 'duration_minutes')
            ->get();

        return response()->json($procedures);
    }

    public function getBySubcategory(Request $request)
    {
        $subcategory = $request->get('subcategory');
        
        if (!$subcategory) {
            return response()->json([]);
        }

        $procedures = ClinicProcedure::active()
            ->bySubcategory($subcategory)
            ->ordered()
            ->select('id', 'name', 'code', 'price', 'duration_minutes')
            ->get();

        return response()->json($procedures);
    }
}
