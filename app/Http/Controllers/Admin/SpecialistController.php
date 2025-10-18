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
        $doctors = Specialist::where('role', 'Doctor')
            ->orderBy('name')
            ->get();
            
        $nurses = Specialist::where('role', 'Nurse')
            ->orderBy('name')
            ->get();
            
        $medtechs = Specialist::where('role', 'MedTech')
            ->orderBy('name')
            ->get();

        return Inertia::render('admin/specialists/index', [
            'doctors' => $doctors,
            'nurses' => $nurses,
            'medtechs' => $medtechs,
        ]);
    }
}
