<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Specialist;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SpecialistController extends Controller
{
    public function index()
    {
        // Map doctors to match the format from DoctorController
        $doctors = Specialist::where('role', 'Doctor')
            ->orderBy('name')
            ->get()
            ->map(function ($doctor) {
                return [
                    'id' => $doctor->specialist_id,
                    'specialist_id' => $doctor->specialist_id,
                    'name' => $doctor->name,
                    'email' => $doctor->email ?? null,
                    'contact' => $doctor->contact ?? null,
                    'role' => $doctor->role,
                    'is_active' => $doctor->status === 'Active',
                    'created_at' => $doctor->created_at,
                    'updated_at' => $doctor->updated_at,
                ];
            });
            
        // Map nurses to match the format from NurseController
        $nurses = Specialist::where('role', 'Nurse')
            ->orderBy('name')
            ->get()
            ->map(function ($nurse) {
                return [
                    'id' => $nurse->specialist_id,
                    'specialist_id' => $nurse->specialist_id,
                    'name' => $nurse->name,
                    'email' => $nurse->email ?? null,
                    'contact' => $nurse->contact ?? null,
                    'role' => $nurse->role,
                    'is_active' => $nurse->status === 'Active',
                    'created_at' => $nurse->created_at,
                    'updated_at' => $nurse->updated_at,
                ];
            });
            
        // Map medtechs to match the format from MedTechController
        $medtechs = Specialist::where('role', 'MedTech')
            ->orderBy('name')
            ->get()
            ->map(function ($medtech) {
                return [
                    'id' => $medtech->specialist_id,
                    'specialist_id' => $medtech->specialist_id,
                    'name' => $medtech->name,
                    'email' => $medtech->email ?? null,
                    'contact' => $medtech->contact ?? null,
                    'role' => $medtech->role,
                    'is_active' => $medtech->status === 'Active',
                    'created_at' => $medtech->created_at,
                    'updated_at' => $medtech->updated_at,
                ];
            });

        return Inertia::render('admin/specialists/index', [
            'doctors' => $doctors,
            'nurses' => $nurses,
            'medtechs' => $medtechs,
        ]);
    }
}
