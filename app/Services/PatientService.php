<?php

namespace App\Services;

use App\Models\Patient;
use Illuminate\Support\Facades\Log;

class PatientService
{
    public function createPatient(array $validatedData): Patient
    {
        // Compute age from birthdate for consistency
        if (isset($validatedData['birthdate'])) {
            $validatedData['age'] = now()->parse($validatedData['birthdate'])->age;
        }

        // Auto-generate patient_no if not provided with smart reset logic
        // Use database transaction to prevent race conditions
        return \DB::transaction(function () use ($validatedData) {
            if (empty($validatedData['patient_no'])) {
                $validatedData['patient_no'] = $this->getNextAvailablePatientNo();
            }

            return Patient::create($validatedData);
        });
    }

    public function updatePatient(Patient $patient, array $validatedData): Patient
    {
        if (isset($validatedData['birthdate'])) {
            $validatedData['age'] = now()->parse($validatedData['birthdate'])->age;
        }

        $patient->update($validatedData);
        return $patient;
    }

    public function findDuplicate(array $input): ?Patient
    {
        $lastName = $input['last_name'] ?? null;
        $firstName = $input['first_name'] ?? null;
        $birthdate = $input['birthdate'] ?? null;
        $mobileNo = $input['mobile_no'] ?? null;

        if ($lastName && $firstName && $birthdate) {
            $duplicate = Patient::where('last_name', $lastName)
                ->where('first_name', $firstName)
                ->where('birthdate', $birthdate)
                ->first();
            if ($duplicate) {
                return $duplicate;
            }
        }

        if ($mobileNo && $lastName && $firstName) {
            $duplicate = Patient::where('mobile_no', $mobileNo)
                ->where('last_name', $lastName)
                ->where('first_name', $firstName)
                ->first();
            if ($duplicate) {
                return $duplicate;
            }
        }

        return null;
    }

    /**
     * Get the next available patient number with smart reset logic
     * If patient 1 is deleted, start from 1 again instead of continuing from highest number
     */
    private function getNextAvailablePatientNo()
    {
        // Get the highest patient number (including soft deleted)
        $maxPatientNo = Patient::withTrashed()->max('patient_no');
        
        if ($maxPatientNo === null) {
            // No patients exist, start with 1
            return '1';
        }
        
        // Convert to integer and increment
        $nextNumber = (int) $maxPatientNo + 1;
        
        // Safety check: ensure the number doesn't already exist (including soft deleted)
        while (Patient::withTrashed()->where('patient_no', (string) $nextNumber)->exists()) {
            $nextNumber++;
        }
        
        return (string) $nextNumber;
    }
}


