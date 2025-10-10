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
     * Get the next available patient number with sequential numbering
     * Ensures patient numbers are always sequential: 1, 2, 3, 4, etc.
     */
    private function getNextAvailablePatientNo()
    {
        // Get all existing patient numbers (including soft deleted) and sort them
        $existingNumbers = Patient::withTrashed()
            ->pluck('patient_no')
            ->map(function ($no) {
                return (int) $no; // Convert to integer for proper sorting
            })
            ->sort()
            ->values()
            ->toArray();
        
        // If no patients exist, start with 1
        if (empty($existingNumbers)) {
            return '1';
        }
        
        // Find the first missing number in the sequence
        $expectedNumber = 1;
        foreach ($existingNumbers as $existingNumber) {
            if ($existingNumber === $expectedNumber) {
                $expectedNumber++;
            } else {
                // Found a gap, use this number
                break;
            }
        }
        
        return (string) $expectedNumber;
    }
}


