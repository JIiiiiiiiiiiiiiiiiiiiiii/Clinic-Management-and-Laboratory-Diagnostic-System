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

            // Map form fields to database fields FIRST
            if (empty($validatedData['emergency_name']) && !empty($validatedData['informant_name'])) {
                $validatedData['emergency_name'] = $validatedData['informant_name'];
            }
            if (empty($validatedData['emergency_relation']) && !empty($validatedData['relationship'])) {
                $validatedData['emergency_relation'] = $validatedData['relationship'];
            }

            // Log the mapped data for debugging
            Log::info('Patient creation - mapped data', [
                'emergency_name' => $validatedData['emergency_name'] ?? 'NOT_SET',
                'emergency_relation' => $validatedData['emergency_relation'] ?? 'NOT_SET',
                'informant_name' => $validatedData['informant_name'] ?? 'NOT_SET',
                'relationship' => $validatedData['relationship'] ?? 'NOT_SET'
            ]);

            // Ensure address field is populated (use present_address if address is not provided)
            if (empty($validatedData['address']) && !empty($validatedData['present_address'])) {
                $validatedData['address'] = $validatedData['present_address'];
            }

            // Set required arrival fields if not provided
            if (empty($validatedData['arrival_date'])) {
                $validatedData['arrival_date'] = now()->format('Y-m-d');
            }
            if (empty($validatedData['arrival_time'])) {
                $validatedData['arrival_time'] = now()->format('H:i:s');
            }
            if (empty($validatedData['time_seen'])) {
                $validatedData['time_seen'] = now()->format('H:i:s');
            }
            if (empty($validatedData['attending_physician'])) {
                $validatedData['attending_physician'] = 'To be assigned';
            }

            // Validate required fields
            $this->validateRequiredFields($validatedData);

            // Auto-generate patient_no if not provided with smart reset logic
            // Use database transaction to prevent race conditions
            return DB::transaction(function () use ($validatedData) {
                if (empty($validatedData['patient_no'])) {
                    $validatedData['patient_no'] = $this->getNextAvailablePatientNo();
                }

                // patient_no is already set, no need for patient_code

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
     * Uses consistent "P" + padded format (e.g., P001, P002, P003)
     */
    private function getNextAvailablePatientNo()
    {
        // Get the highest sequence number (including soft deleted)
        $maxSequence = Patient::max('id');

        if ($maxSequence === null) {
            // No patients exist, start with 1
            return 'P001';
        }

        // Find the first missing sequence number starting from 1
        for ($i = 1; $i <= 999; $i++) {
            if (!Patient::withTrashed()->where('id', $i)->exists()) {
                return 'P' . str_pad($i, 3, '0', STR_PAD_LEFT);
            }
        }

        // If all numbers 1-999 are taken, find the next available
        $nextSequence = $maxSequence + 1;
        return 'P' . str_pad($nextSequence, 3, '0', STR_PAD_LEFT);
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
            'present_address', // Use actual database column name
            'address', // Add address field which is required in database
            'arrival_date', // Required field
            'arrival_time', // Required field
            'time_seen', // Required field
            'attending_physician', // Required field
        ];

        foreach ($requiredFields as $field) {
            if (empty($data[$field])) {
                throw new \InvalidArgumentException("The {$field} field is required.");
            }
        }

        // Check emergency contact fields (either emergency_name or informant_name)
        $hasEmergencyName = !empty($data['emergency_name']);
        $hasInformantName = !empty($data['informant_name']);
        
        Log::info('Emergency field validation', [
            'emergency_name' => $data['emergency_name'] ?? 'NOT_SET',
            'informant_name' => $data['informant_name'] ?? 'NOT_SET',
            'has_emergency_name' => $hasEmergencyName,
            'has_informant_name' => $hasInformantName
        ]);
        
        if (!$hasEmergencyName && !$hasInformantName) {
            throw new \InvalidArgumentException("The emergency_name or informant_name field is required.");
        }

        // Check emergency relation fields (either emergency_relation or relationship)
        $hasEmergencyRelation = !empty($data['emergency_relation']);
        $hasRelationship = !empty($data['relationship']);
        
        Log::info('Emergency relation field validation', [
            'emergency_relation' => $data['emergency_relation'] ?? 'NOT_SET',
            'relationship' => $data['relationship'] ?? 'NOT_SET',
            'has_emergency_relation' => $hasEmergencyRelation,
            'has_relationship' => $hasRelationship
        ]);
        
        if (!$hasEmergencyRelation && !$hasRelationship) {
            throw new \InvalidArgumentException("The emergency_relation or relationship field is required.");
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
            'active_patients' => Patient::where('status', 'Active')->count(),
            'inactive_patients' => Patient::where('status', 'Inactive')->count(),
            'new_patients_this_month' => Patient::whereMonth('created_at', now()->month)->count(),
            'patients_with_appointments' => Patient::whereHas('appointments')->count(),
            'patients_with_completed_visits' => Patient::whereHas('appointments', function($query) {
                $query->where('status', 'Completed');
            })->count(),
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
            ],
            'patients_by_civil_status' => Patient::selectRaw('civil_status, COUNT(*) as count')
                ->groupBy('civil_status')
                ->pluck('count', 'civil_status')
                ->toArray(),
            'senior_citizens' => Patient::where('age', '>=', 60)->count(),
            'patients_with_insurance' => Patient::whereNotNull('hmo_name')->count(),
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


