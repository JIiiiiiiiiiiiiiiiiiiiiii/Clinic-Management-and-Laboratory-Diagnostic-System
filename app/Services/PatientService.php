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

        return Patient::create($validatedData);
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
}


