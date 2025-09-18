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

        // Auto-generate patient_no if not provided (no zero padding)
        // Use database transaction to prevent race conditions
        return \DB::transaction(function () use ($validatedData) {
            if (empty($validatedData['patient_no'])) {
                // Get next patient_no using MAX + 1 with FOR UPDATE to avoid duplicates
                $max = Patient::query()->lockForUpdate()->max('patient_no');
                $numericMax = is_numeric($max) ? (int) $max : (int) ltrim((string) $max, '0');
                $next = $numericMax + 1;
                // Ensure uniqueness in case of concurrent inserts
                while (Patient::where('patient_no', (string) $next)->exists()) {
                    $next++;
                }
                $validatedData['patient_no'] = (string) $next;
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
}


