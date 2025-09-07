<?php

namespace App\Http\Requests\PatientVisit;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePatientVisitRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            // Arrival Information
            'arrival_date' => 'required|date',
            'arrival_time' => 'required',
            'mode_of_arrival' => 'nullable|string|max:255',

            // Visit Details
            'attending_physician' => 'required|string|max:255',
            'reason_for_consult' => 'nullable|string',
            'time_seen' => 'required',

            // Vital Signs
            'blood_pressure' => 'nullable|string|max:255',
            'heart_rate' => 'nullable|string|max:255',
            'respiratory_rate' => 'nullable|string|max:255',
            'temperature' => 'nullable|string|max:255',
            'weight_kg' => 'nullable|numeric|min:0|max:500',
            'height_cm' => 'nullable|numeric|min:0|max:300',
            'pain_assessment_scale' => 'nullable|string|max:255',
            'oxygen_saturation' => 'nullable|string|max:255',

            // Medical Assessment
            'history_of_present_illness' => 'nullable|string',
            'pertinent_physical_findings' => 'nullable|string',
            'plan_management' => 'nullable|string',
            'assessment_diagnosis' => 'nullable|string',
            'lmp' => 'nullable|string|max:255',

            // Visit Status
            'status' => 'required|in:active,completed,discharged',
            'notes' => 'nullable|string',
        ];
    }
}
