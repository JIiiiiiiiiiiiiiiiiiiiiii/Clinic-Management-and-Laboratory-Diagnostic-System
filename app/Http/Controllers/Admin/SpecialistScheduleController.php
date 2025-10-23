<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Specialist;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SpecialistScheduleController extends Controller
{
    /**
     * Show the schedule management page for a doctor
     */
    public function showDoctor(Specialist $doctor)
    {
        if ($doctor->role !== 'Doctor') {
            abort(404, 'Specialist is not a doctor.');
        }
        
        return Inertia::render('admin/specialists/schedule', [
            'specialist' => $doctor,
            'scheduleData' => $doctor->schedule_data ?? $this->getDefaultSchedule(),
        ]);
    }

    /**
     * Show the schedule management page for a nurse
     */
    public function showNurse(Specialist $nurse)
    {
        if ($nurse->role !== 'Nurse') {
            abort(404, 'Specialist is not a nurse.');
        }
        
        return Inertia::render('admin/specialists/schedule', [
            'specialist' => $nurse,
            'scheduleData' => $nurse->schedule_data ?? $this->getDefaultSchedule(),
        ]);
    }

    /**
     * Show the schedule management page for a medtech
     */
    public function showMedtech(Specialist $medtech)
    {
        if ($medtech->role !== 'MedTech') {
            abort(404, 'Specialist is not a medtech.');
        }
        
        return Inertia::render('admin/specialists/schedule', [
            'specialist' => $medtech,
            'scheduleData' => $medtech->schedule_data ?? $this->getDefaultSchedule(),
        ]);
    }

    /**
     * Update the doctor's schedule
     */
    public function updateDoctor(Request $request, Specialist $doctor)
    {
        if ($doctor->role !== 'Doctor') {
            abort(404, 'Specialist is not a doctor.');
        }
        
        $request->validate([
            'schedule_data' => 'required|array',
            'schedule_data.monday' => 'nullable|array',
            'schedule_data.tuesday' => 'nullable|array',
            'schedule_data.wednesday' => 'nullable|array',
            'schedule_data.thursday' => 'nullable|array',
            'schedule_data.friday' => 'nullable|array',
            'schedule_data.saturday' => 'nullable|array',
            'schedule_data.sunday' => 'nullable|array',
        ]);

        $doctor->update([
            'schedule_data' => $request->schedule_data,
        ]);

        return redirect()->back()->with('success', 'Schedule updated successfully!');
    }

    /**
     * Update the nurse's schedule
     */
    public function updateNurse(Request $request, Specialist $nurse)
    {
        if ($nurse->role !== 'Nurse') {
            abort(404, 'Specialist is not a nurse.');
        }
        
        $request->validate([
            'schedule_data' => 'required|array',
            'schedule_data.monday' => 'nullable|array',
            'schedule_data.tuesday' => 'nullable|array',
            'schedule_data.wednesday' => 'nullable|array',
            'schedule_data.thursday' => 'nullable|array',
            'schedule_data.friday' => 'nullable|array',
            'schedule_data.saturday' => 'nullable|array',
            'schedule_data.sunday' => 'nullable|array',
        ]);

        $nurse->update([
            'schedule_data' => $request->schedule_data,
        ]);

        return redirect()->back()->with('success', 'Schedule updated successfully!');
    }

    /**
     * Update the medtech's schedule
     */
    public function updateMedtech(Request $request, Specialist $medtech)
    {
        if ($medtech->role !== 'MedTech') {
            abort(404, 'Specialist is not a medtech.');
        }
        
        $request->validate([
            'schedule_data' => 'required|array',
            'schedule_data.monday' => 'nullable|array',
            'schedule_data.tuesday' => 'nullable|array',
            'schedule_data.wednesday' => 'nullable|array',
            'schedule_data.thursday' => 'nullable|array',
            'schedule_data.friday' => 'nullable|array',
            'schedule_data.saturday' => 'nullable|array',
            'schedule_data.sunday' => 'nullable|array',
        ]);

        $medtech->update([
            'schedule_data' => $request->schedule_data,
        ]);

        return redirect()->back()->with('success', 'Schedule updated successfully!');
    }

    /**
     * Get default empty schedule structure
     */
    private function getDefaultSchedule()
    {
        return [
            'monday' => [],
            'tuesday' => [],
            'wednesday' => [],
            'thursday' => [],
            'friday' => [],
            'saturday' => [],
            'sunday' => [],
        ];
    }

    /**
     * Get available time slots for a specialist on a specific day
     */
    public function getAvailableTimes(Specialist $specialist, $day)
    {
        $schedule = $specialist->schedule_data ?? [];
        $daySchedule = $schedule[$day] ?? [];
        
        return response()->json([
            'times' => $daySchedule,
            'day' => $day,
        ]);
    }
}