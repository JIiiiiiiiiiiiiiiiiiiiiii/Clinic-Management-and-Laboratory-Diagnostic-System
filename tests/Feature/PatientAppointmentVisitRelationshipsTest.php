<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\Patient;
use App\Models\Appointment;
use App\Models\Visit;
use App\Services\AppointmentCreationService;
use Illuminate\Foundation\Testing\RefreshDatabase;

class PatientAppointmentVisitRelationshipsTest extends TestCase
{
    use RefreshDatabase;

    protected $appointmentService;

    protected function setUp(): void
    {
        parent::setUp();
        $this->appointmentService = new AppointmentCreationService();
    }

    /** @test */
    public function it_creates_patient_appointment_and_visit_when_creating_appointment()
    {
        $patientData = [
            'first_name' => 'John',
            'last_name' => 'Doe',
            'birthdate' => '1990-01-01',
            'age' => 34,
            'sex' => 'male',
            'civil_status' => 'single',
            'nationality' => 'Filipino',
            'present_address' => '123 Main St',
            'mobile_no' => '09123456789',
            'informant_name' => 'John Doe',
            'relationship' => 'Self',
            'arrival_date' => now()->toDateString(),
            'arrival_time' => now()->toTimeString(),
            'attending_physician' => 'Dr. Smith',
            'time_seen' => now()->toTimeString(),
        ];

        $appointmentData = [
            'patient_name' => 'John Doe',
            'contact_number' => '09123456789',
            'appointment_type' => 'consultation',
            'specialist_type' => 'doctor',
            'specialist_name' => 'Dr. Smith',
            'specialist_id' => 'D001',
            'appointment_date' => now()->addDay()->toDateString(),
            'appointment_time' => '09:00:00',
            'duration' => '30 min',
            'status' => 'Pending',
            'notes' => 'Regular checkup',
            'appointment_source' => 'admin',
            'billing_status' => 'pending',
            'price' => 300,
        ];

        $result = $this->appointmentService->createAppointmentWithPatient($appointmentData, $patientData);

        // Assert patient was created
        $this->assertInstanceOf(Patient::class, $result['patient']);
        $this->assertEquals('John', $result['patient']->first_name);
        $this->assertEquals('Doe', $result['patient']->last_name);

        // Assert appointment was created
        $this->assertInstanceOf(Appointment::class, $result['appointment']);
        $this->assertEquals($result['patient']->id, $result['appointment']->patient_id);
        $this->assertEquals('consultation', $result['appointment']->appointment_type);

        // Assert visit was auto-created
        $this->assertInstanceOf(Visit::class, $result['visit']);
        $this->assertEquals($result['appointment']->id, $result['visit']->appointment_id);
        $this->assertEquals($result['patient']->id, $result['visit']->patient_id);
    }

    /** @test */
    public function it_creates_appointment_for_existing_patient()
    {
        // Create patient first
        $patient = Patient::create([
            'first_name' => 'Jane',
            'last_name' => 'Smith',
            'birthdate' => '1985-05-15',
            'age' => 39,
            'sex' => 'female',
            'civil_status' => 'married',
            'nationality' => 'Filipino',
            'present_address' => '456 Oak St',
            'mobile_no' => '09987654321',
            'informant_name' => 'Jane Smith',
            'relationship' => 'Self',
            'arrival_date' => now()->toDateString(),
            'arrival_time' => now()->toTimeString(),
            'attending_physician' => 'Dr. Johnson',
            'time_seen' => now()->toTimeString(),
        ]);

        $appointmentData = [
            'patient_name' => 'Jane Smith',
            'contact_number' => '09987654321',
            'appointment_type' => 'checkup',
            'specialist_type' => 'doctor',
            'specialist_name' => 'Dr. Johnson',
            'specialist_id' => 'D002',
            'appointment_date' => now()->addDay()->toDateString(),
            'appointment_time' => '10:00:00',
            'duration' => '30 min',
            'status' => 'Confirmed',
            'notes' => 'Follow-up visit',
            'appointment_source' => 'admin',
            'billing_status' => 'pending',
            'price' => 300,
        ];

        $result = $this->appointmentService->createAppointmentForExistingPatient($patient->id, $appointmentData);

        // Assert appointment was created for existing patient
        $this->assertEquals($patient->id, $result['appointment']->patient_id);
        $this->assertEquals('checkup', $result['appointment']->appointment_type);

        // Assert visit was auto-created
        $this->assertInstanceOf(Visit::class, $result['visit']);
        $this->assertEquals($result['appointment']->id, $result['visit']->appointment_id);
        $this->assertEquals($patient->id, $result['visit']->patient_id);
    }

    /** @test */
    public function it_deletes_patient_with_cascade_delete()
    {
        // Create patient with appointment and visit
        $patient = Patient::create([
            'first_name' => 'Test',
            'last_name' => 'Patient',
            'birthdate' => '1990-01-01',
            'age' => 34,
            'sex' => 'male',
            'civil_status' => 'single',
            'nationality' => 'Filipino',
            'present_address' => 'Test Address',
            'mobile_no' => '09123456789',
            'informant_name' => 'Test Patient',
            'relationship' => 'Self',
            'arrival_date' => now()->toDateString(),
            'arrival_time' => now()->toTimeString(),
            'attending_physician' => 'Dr. Test',
            'time_seen' => now()->toTimeString(),
        ]);

        $appointment = Appointment::create([
            'patient_id' => $patient->id,
            'patient_name' => 'Test Patient',
            'appointment_type' => 'consultation',
            'specialist_type' => 'doctor',
            'specialist_name' => 'Dr. Test',
            'specialist_id' => 'D001',
            'appointment_date' => now()->addDay()->toDateString(),
            'appointment_time' => '09:00:00',
            'status' => 'Pending',
            'appointment_source' => 'admin',
            'billing_status' => 'pending',
            'price' => 300,
        ]);

        $visit = Visit::create([
            'appointment_id' => $appointment->id,
            'patient_id' => $patient->id,
            'visit_date_time' => now()->addDay(),
            'purpose' => 'consultation',
            'attending_staff_id' => 1, // Assuming user with ID 1 exists
            'status' => 'scheduled',
            'visit_type' => 'initial',
        ]);

        // Verify records exist
        $this->assertDatabaseHas('patients', ['id' => $patient->id]);
        $this->assertDatabaseHas('appointments', ['id' => $appointment->id]);
        $this->assertDatabaseHas('visits', ['id' => $visit->id]);

        // Delete patient (should cascade delete appointments and visits)
        $this->appointmentService->deletePatientWithCascade($patient->id);

        // Verify all records are deleted
        $this->assertDatabaseMissing('patients', ['id' => $patient->id]);
        $this->assertDatabaseMissing('appointments', ['id' => $appointment->id]);
        $this->assertDatabaseMissing('visits', ['id' => $visit->id]);
    }

    /** @test */
    public function it_deletes_appointment_only_patient_remains()
    {
        // Create patient with appointment and visit
        $patient = Patient::create([
            'first_name' => 'Test',
            'last_name' => 'Patient',
            'birthdate' => '1990-01-01',
            'age' => 34,
            'sex' => 'male',
            'civil_status' => 'single',
            'nationality' => 'Filipino',
            'present_address' => 'Test Address',
            'mobile_no' => '09123456789',
            'informant_name' => 'Test Patient',
            'relationship' => 'Self',
            'arrival_date' => now()->toDateString(),
            'arrival_time' => now()->toTimeString(),
            'attending_physician' => 'Dr. Test',
            'time_seen' => now()->toTimeString(),
        ]);

        $appointment = Appointment::create([
            'patient_id' => $patient->id,
            'patient_name' => 'Test Patient',
            'appointment_type' => 'consultation',
            'specialist_type' => 'doctor',
            'specialist_name' => 'Dr. Test',
            'specialist_id' => 'D001',
            'appointment_date' => now()->addDay()->toDateString(),
            'appointment_time' => '09:00:00',
            'status' => 'Pending',
            'appointment_source' => 'admin',
            'billing_status' => 'pending',
            'price' => 300,
        ]);

        $visit = Visit::create([
            'appointment_id' => $appointment->id,
            'patient_id' => $patient->id,
            'visit_date_time' => now()->addDay(),
            'purpose' => 'consultation',
            'attending_staff_id' => 1, // Assuming user with ID 1 exists
            'status' => 'scheduled',
            'visit_type' => 'initial',
        ]);

        // Verify records exist
        $this->assertDatabaseHas('patients', ['id' => $patient->id]);
        $this->assertDatabaseHas('appointments', ['id' => $appointment->id]);
        $this->assertDatabaseHas('visits', ['id' => $visit->id]);

        // Delete appointment only
        $this->appointmentService->deleteAppointmentOnly($appointment->id);

        // Verify patient remains but appointment and visit are deleted
        $this->assertDatabaseHas('patients', ['id' => $patient->id]);
        $this->assertDatabaseMissing('appointments', ['id' => $appointment->id]);
        $this->assertDatabaseMissing('visits', ['id' => $visit->id]);
    }
}
