<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SpecialistController extends Controller
{
    public function index()
    {
        $doctors = User::where('role', 'doctor')
            ->orderBy('name')
            ->get();
            
        $nurses = User::where('role', 'nurse')
            ->orderBy('name')
            ->get();
            
        $medtechs = User::where('role', 'medtech')
            ->orderBy('name')
            ->get();

        return Inertia::render('admin/specialists/index', [
            'doctors' => $doctors,
            'nurses' => $nurses,
            'medtechs' => $medtechs,
        ]);
    }
}
