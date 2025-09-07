<?php

namespace App\Services;

use App\Models\Patient;
use App\Models\PatientVisit;

class PatientVisitService
{
    public function createVisit(Patient $patient, array $validatedData): PatientVisit
    {
        $validatedData['patient_id'] = $patient->id;
        return PatientVisit::create($validatedData);
    }

    public function updateVisit(PatientVisit $visit, array $validatedData): PatientVisit
    {
        $visit->update($validatedData);
        return $visit;
    }
}


