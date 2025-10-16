<?php

namespace App\Services;

use App\Models\Patient;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class PatientService
{
    public function createPatient(array $validatedData): Patient
    {
        try {
            // Compute age from birthdate for consistency
            if (isset($validatedData['birthdate'])) {
                $validatedData['age'] = $this->calculateAge($validatedData['birthdate']);
            }

            // Validate required fields
            $this->validateRequiredFields($validatedData);

            // Auto-generate patient_no if not provided with smart reset logic
            // Use database transaction to prevent race conditions
            return DB::transaction(function () use ($validatedData) {
                if (empty($validatedData['patient_no'])) {
                    $validatedData['patient_no'] = $this->getNextAvailablePatientNo();
                }

                // Additional validation before creation
                $this->validatePatientData($validatedData);

                $patient = Patient::create($validatedData);

                Log::info('Patient created successfully', [
                    'patient_id' => $patient->id,
                    'patient_no' => $patient->patient_no,
                    'name' => $patient->full_name
                ]);

                return $patient;
            });
        } catch (\Exception $e) {
            Log::error('Failed to create patient', [
                'error' => $e->getMessage(),
                'data' => $validatedData
            ]);
            throw $e;
        }
    }

    public function updatePatient(Patient $patient, array $validatedData): Patient
    {
        try {
            // Compute age from birthdate for consistency
            if (isset($validatedData['birthdate'])) {
                $validatedData['age'] = $this->calculateAge($validatedData['birthdate']);
            }

            // Validate required fields
            $this->validateRequiredFields($validatedData);

            // Additional validation before update
            $this->validatePatientData($validatedData, $patient);

            $patient->update($validatedData);

            Log::info('Patient updated successfully', [
                'patient_id' => $patient->id,
                'patient_no' => $patient->patient_no,
                'name' => $patient->full_name
            ]);

            return $patient;
        } catch (\Exception $e) {
            Log::error('Failed to update patient', [
                'patient_id' => $patient->id,
                'error' => $e->getMessage(),
                'data' => $validatedData
            ]);
            throw $e;
        }
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

    /**
     * Calculate age from birthdate
     */
    private function calculateAge($birthdate): int
    {
        try {
            return Carbon::parse($birthdate)->age;
        } catch (\Exception $e) {
            Log::error('Invalid birthdate provided', ['birthdate' => $birthdate]);
            throw new \InvalidArgumentException('Invalid birthdate format');
        }
    }

    /**
     * Validate required fields
     */
    private function validateRequiredFields(array $data): void
    {
        $requiredFields = [
            'first_name',
            'last_name',
            'birthdate',
            'sex',
            'mobile_no',
            'present_address',
            'informant_name',
            'relationship'
        ];

        foreach ($requiredFields as $field) {
            if (empty($data[$field])) {
                throw new \InvalidArgumentException("The {$field} field is required.");
            }
        }
    }

    /**
     * Validate patient data
     */
    private function validatePatientData(array $data, ?Patient $existingPatient = null): void
    {
        // Validate age consistency
        if (isset($data['birthdate']) && isset($data['age'])) {
            $calculatedAge = $this->calculateAge($data['birthdate']);
            if ($calculatedAge !== $data['age']) {
                throw new \InvalidArgumentException('Age does not match birthdate.');
            }
        }

        // Validate mobile number format
        if (isset($data['mobile_no'])) {
            if (!preg_match('/^[0-9+\-\s()]+$/', $data['mobile_no'])) {
                throw new \InvalidArgumentException('Invalid mobile number format.');
            }
        }

        // Validate patient number uniqueness (if provided)
        if (isset($data['patient_no']) && $data['patient_no']) {
            $query = Patient::where('patient_no', $data['patient_no']);
            if ($existingPatient) {
                $query->where('id', '!=', $existingPatient->id);
            }

            if ($query->exists()) {
                throw new \InvalidArgumentException('Patient number already exists.');
            }
        }

        // Validate birthdate is not in the future
        if (isset($data['birthdate'])) {
            $birthdate = Carbon::parse($data['birthdate']);
            if ($birthdate->isFuture()) {
                throw new \InvalidArgumentException('Birthdate cannot be in the future.');
            }
        }
    }

    /**
     * Get patient statistics
     */
    public function getPatientStatistics(): array
    {
        return [
            'total_patients' => Patient::count(),
            'active_patients' => Patient::count(),
            'patients_with_visits' => 0,
            'new_patients_this_month' => Patient::whereMonth('created_at', now()->month)->count(),
            'patients_by_gender' => Patient::selectRaw('sex, COUNT(*) as count')
                ->groupBy('sex')
                ->pluck('count', 'sex')
                ->toArray(),
            'patients_by_age_group' => [
                '0-17' => Patient::whereBetween('age', [0, 17])->count(),
                '18-30' => Patient::whereBetween('age', [18, 30])->count(),
                '31-50' => Patient::whereBetween('age', [31, 50])->count(),
                '51-70' => Patient::whereBetween('age', [51, 70])->count(),
                '70+' => Patient::where('age', '>', 70)->count(),
            ]
        ];
    }

    /**
     * Search patients with advanced filters
     */
    public function searchPatients(array $filters = []): \Illuminate\Database\Eloquent\Collection
    {
        $query = Patient::query();

        // Search by name
        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                  ->orWhere('last_name', 'like', "%{$search}%")
                  ->orWhere('patient_no', 'like', "%{$search}%")
                  ->orWhere('mobile_no', 'like', "%{$search}%");
            });
        }

        // Filter by gender
        if (!empty($filters['sex'])) {
            $query->where('sex', $filters['sex']);
        }

        // Filter by age range
        if (!empty($filters['age_from'])) {
            $query->where('age', '>=', $filters['age_from']);
        }
        if (!empty($filters['age_to'])) {
            $query->where('age', '<=', $filters['age_to']);
        }

        // Filter by registration date
        if (!empty($filters['date_from'])) {
            $query->whereDate('created_at', '>=', $filters['date_from']);
        }
        if (!empty($filters['date_to'])) {
            $query->whereDate('created_at', '<=', $filters['date_to']);
        }

        // Filter by visit status

        return $query->with(['labOrders'])->get();
    }
}


