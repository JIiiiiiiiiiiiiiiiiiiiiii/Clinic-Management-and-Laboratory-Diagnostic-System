<?php

namespace App\Http\Requests\Patient;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePatientRequest extends FormRequest
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
        $patientId = optional($this->route('patient'))->id;
        return [
            // Patient Identification
            'last_name' => 'required|string|max:255',
            'first_name' => 'required|string|max:255',
            'middle_name' => 'nullable|string|max:255',
            'birthdate' => 'required|date',
            'age' => 'required|integer|min:0|max:150',
            'sex' => 'required|in:male,female',
            'patient_no' => ['nullable','string',"unique:patients,patient_no,{$patientId}"],

            // Demographics
            'occupation' => 'nullable|string|max:255',
            'religion' => 'nullable|string|max:255',
            'civil_status' => 'required|in:single,married,widowed,divorced,separated',
            'nationality' => 'nullable|string|max:255',

            // Contact Information
            'present_address' => 'required|string',
            'telephone_no' => 'nullable|string|max:255',
            'mobile_no' => 'required|string|max:255',
            'email' => 'nullable|email|max:255',

            // Emergency Contact (accept both old and new field names)
            'emergency_name' => 'nullable|string|max:255',
            'emergency_relation' => 'nullable|string|max:255',
            'informant_name' => 'nullable|string|max:255',
            'relationship' => 'nullable|string|max:255',

            // Financial/Insurance
            'company_name' => 'nullable|string|max:255',
            'hmo_name' => 'nullable|string|max:255',
            'hmo_company_id_no' => 'nullable|string|max:255',
            'validation_approval_code' => 'nullable|string|max:255',
            'validity' => 'nullable|string|max:255',

            // Medical History & Allergies
            'drug_allergies' => 'nullable|string|max:255',
            'food_allergies' => 'nullable|string|max:255',
            'past_medical_history' => 'nullable|string',
            'family_history' => 'nullable|string',
            'social_personal_history' => 'nullable|string',
            'obstetrics_gynecology_history' => 'nullable|string',
        ];
    }

    /**
     * Configure the validator instance.
     */
    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            // Ensure at least one emergency contact field is provided
            $emergencyName = $this->input('emergency_name') ?: $this->input('informant_name');
            $emergencyRelation = $this->input('emergency_relation') ?: $this->input('relationship');
            
            if (empty($emergencyName) || empty($emergencyRelation)) {
                $validator->errors()->add('emergency_contact', 'Both emergency contact name and relationship are required.');
            }
        });
    }
}
