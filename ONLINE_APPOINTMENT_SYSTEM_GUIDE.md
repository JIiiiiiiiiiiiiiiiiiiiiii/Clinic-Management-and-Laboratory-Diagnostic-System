# Online Appointment System - Complete Guide

## Overview

This document explains how the Online Appointment Form works to automatically create patient records and appointments that appear in the admin side.

## System Flow

### 1. **User Registration & Login**
   - New users register through the signup page
   - Users receive a `user_id` which links their account to future patient records
   - After registration, users can access the Online Appointment Form

### 2. **Online Appointment Form Access**
   - **Route**: `/patient/online-appointment`
   - **Controller**: `App\Http\Controllers\Patient\OnlineAppointmentController@show`
   - **Frontend**: `resources/js/pages/patient/online-appointment.tsx`

### 3. **Form Structure (6 Steps)**

The form is divided into 6 progressive steps that collect all required information:

#### **Step 1: Personal Information**
- Last Name (required)
- First Name (required)
- Middle Name
- Birthdate (required) - auto-calculates age
- Age (required)
- Sex (required)
- Nationality
- Civil Status (required)

#### **Step 2: Contact Details**
- Present Address (required)
- Telephone No.
- Mobile No. (required)

#### **Step 3: Emergency Contact**
- Informant Name (required)
- Relationship (required)

#### **Step 4: Insurance & Financial**
- Company Name
- HMO Name
- HMO/Company ID No.
- Validation/Approval Code
- Validity

#### **Step 5: Medical History**
- Drug Allergies
- Food Allergies
- Past Medical History
- Family History
- Social/Personal History
- Obstetrics & Gynecology History (for female patients)

#### **Step 6: Appointment Booking**
- Appointment Type (required) - Options: General Consultation, CBC, Fecalysis Test, Urinalysis Test
- Specialist Type (auto-generated based on appointment type)
  - General Consultation → Doctor
  - Lab Tests (CBC, Fecalysis, Urinalysis) → Medical Technologist
- Select Specialist (required) - Shows available doctors or med techs based on type
- Appointment Date (required) - Must be tomorrow or later, up to 30 days ahead
- Appointment Time (required) - 30-minute slots from 8:00 AM to 5:00 PM
- Notes
- Special Requirements
- Estimated Cost - Automatically calculated based on appointment type

## Database Structure

### **Patients Table** (`patients`)
Primary Key: `patient_id`

**Key Columns**:
- `patient_id` - Auto-incrementing primary key
- `patient_code` - Auto-generated (e.g., "P0001")
- `user_id` - Links to the user account
- `last_name`, `first_name`, `middle_name`
- `birthdate`, `age`, `sex`
- `nationality`, `civil_status`
- `address` - Maps from `present_address` in form
- `telephone_no`, `mobile_no`, `email`
- `emergency_name` - Maps from `informant_name` in form
- `emergency_relation` - Maps from `relationship` in form
- `insurance_company` - Maps from `company_name` in form
- `hmo_name`, `hmo_id_no`, `approval_code`, `validity`
- `drug_allergies`, `past_medical_history`, `family_history`
- `social_history` - Maps from `social_personal_history` in form
- `obgyn_history` - Maps from `obstetrics_gynecology_history` in form
- `status` - Default: 'Active'

### **Appointments Table** (`appointments`)
Primary Key: `appointment_id`

**Key Columns**:
- `appointment_id` - Auto-incrementing primary key
- `appointment_code` - Auto-generated (e.g., "A0001")
- `patient_id` - Foreign key to patients table
- `specialist_id` - Foreign key to specialists table
- `appointment_type` - Type of appointment
- `specialist_type` - 'doctor' or 'medtech'
- `appointment_date`, `appointment_time`
- `duration` - Default: 30 minutes
- `price` - Auto-calculated based on type
- `additional_info` - Combined notes and special requirements
- `source` - Always 'Online' for online appointments
- `status` - Default: 'Pending' (waiting for admin approval)
- `created_by` - User who created the appointment

## Backend Processing

### **Form Submission Flow**

1. **Frontend Submission**:
   ```javascript
   // File: resources/js/pages/patient/online-appointment.tsx
   // Line: ~398-406
   
   const response = await fetch('/api/appointments/online', {
     method: 'POST',
     headers: {
       'Content-Type': 'application/json',
       'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content'),
     },
     body: JSON.stringify({
       existingPatientId: isExistingPatient && patient ? patient.patient_id : 0,
       patient: !isExistingPatient ? { ...patientData } : undefined,
       appointment: { ...appointmentData }
     })
   });
   ```

2. **API Controller Processing**:
   ```php
   // File: app/Http/Controllers/Api/OnlineAppointmentController.php
   
   public function store(Request $request)
   {
       // 1. Validate request data
       // 2. Check if existing patient or create new patient
       // 3. Create appointment with status 'Pending'
       // 4. Generate appointment code
       // 5. Send notification to admin users
       // 6. Return success response with codes
   }
   ```

3. **Patient Creation**:
   - Check if patient exists by `user_id` (for returning users)
   - If not, create new patient record
   - Auto-generate `patient_code` (e.g., "P0001") via model boot method
   - Map all form fields to correct database columns
   - Set status to 'Active'

4. **Appointment Creation**:
   - Create appointment record linked to patient via `patient_id`
   - Set `source` to 'Online'
   - Set `status` to 'Pending'
   - Auto-calculate price based on appointment type:
     - General Consultation: ₱300
     - CBC: ₱500
     - Fecalysis: ₱500
     - Urinalysis: ₱500
   - Auto-generate `appointment_code` (e.g., "A0001")

5. **Admin Notification**:
   - Get all users with role 'admin'
   - Create notification record for each admin
   - Notification includes:
     - Patient name and code
     - Appointment type, date, and time
     - Specialist name
     - Price
     - Link to appointment details

## Field Mapping (Form → Database)

The system handles both old and new field names for backward compatibility:

| Form Field | Database Column |
|------------|----------------|
| `present_address` | `address` |
| `informant_name` | `emergency_name` |
| `relationship` | `emergency_relation` |
| `company_name` | `insurance_company` |
| `hmo_company_id_no` | `hmo_id_no` |
| `validation_approval_code` | `approval_code` |
| `social_personal_history` | `social_history` |
| `obstetrics_gynecology_history` | `obgyn_history` |

## Admin Side - Viewing Appointments

### **Pending Appointments View**

Admins can view all pending online appointments in:
- **Route**: `/admin/appointments`
- **Controller**: `App\Http\Controllers\Admin\AppointmentController`

The appointments table shows:
- Appointment Code
- Patient Name and Code
- Appointment Type
- Date and Time
- Specialist
- Status (Pending)
- Source (Online)
- Price

### **Patient Records View**

Admins can view all patient records in:
- **Route**: `/admin/patients`
- **Controller**: `App\Http\Controllers\Admin\PatientController`

The patients table shows:
- Patient Code
- Full Name
- Age, Sex
- Contact Information
- Registration Date
- Status

### **Appointment Approval Workflow**

1. Admin receives notification of new online appointment
2. Admin reviews appointment details
3. Admin can:
   - **Approve**: Change status from 'Pending' to 'Confirmed'
   - **Reject**: Change status to 'Cancelled' with reason
   - **Reschedule**: Change date/time and notify patient
4. Patient receives notification of admin's decision

## Key Features

### **Auto-Generation**
- Patient Code: Automatically generated on patient creation
- Appointment Code: Automatically generated on appointment creation
- Age: Auto-calculated from birthdate
- Price: Auto-calculated based on appointment type

### **Smart Specialist Selection**
- General Consultation automatically selects "Doctor" type
- Lab tests automatically select "Medical Technologist" type
- Only shows relevant specialists based on selected type

### **Validation**
- Required fields are enforced
- Date validation (appointments must be future dates)
- Time slot validation (checks for conflicts)
- Age calculation from birthdate

### **Duplicate Prevention**
- System checks for existing patient by user_id
- If patient exists, reuses existing record
- If new patient, creates new record linked to user account

## Testing the System

### **Test Scenario 1: New Patient, New Appointment**

1. Create a new user account
2. Login with new account
3. Navigate to Online Appointment
4. Fill all 6 steps of the form
5. Submit appointment request
6. Expected Results:
   - New patient record created in `patients` table
   - New appointment record created in `appointments` table with status 'Pending'
   - Admin receives notification
   - Patient sees success message
   - Patient can view appointment in "My Appointments"
   - Admin can see appointment in "Pending Appointments"
   - Admin can see patient in "Patients" list

### **Test Scenario 2: Existing Patient, New Appointment**

1. Login with existing user who already has patient record
2. Navigate to Online Appointment
3. Form pre-fills with existing patient data
4. Skip to Step 6 (Appointment Booking)
5. Fill appointment details
6. Submit appointment request
7. Expected Results:
   - No new patient record created (uses existing)
   - New appointment record created linked to existing patient
   - Admin receives notification
   - Appointment appears in admin pending list

## Troubleshooting

### **Issue: Patient not created**
- Check if `user_id` is set correctly
- Verify all required fields are provided
- Check database migration has run
- Review logs at `storage/logs/laravel.log`

### **Issue: Appointment not showing in admin**
- Verify appointment status is 'Pending'
- Check `source` field is set to 'Online'
- Verify admin notifications are being created
- Check database foreign key constraints

### **Issue: Field mapping errors**
- Ensure Patient model fillable array includes all fields
- Verify column names match database schema
- Check for typos in field names
- Review migration files for correct column names

## Model Relationships

### **User → Patient**
```php
// A user can have one patient record
User hasOne Patient (via user_id)
Patient belongsTo User (via user_id)
```

### **Patient → Appointments**
```php
// A patient can have many appointments
Patient hasMany Appointments (via patient_id)
Appointment belongsTo Patient (via patient_id)
```

### **Specialist → Appointments**
```php
// A specialist can have many appointments
Specialist hasMany Appointments (via specialist_id)
Appointment belongsTo Specialist (via specialist_id)
```

## Price Structure

| Appointment Type | Price |
|-----------------|-------|
| General Consultation | ₱300 |
| CBC | ₱500 |
| Fecalysis Test | ₱500 |
| Urinalysis Test | ₱500 |
| X-ray | ₱700 |
| Ultrasound | ₱800 |

## Security Features

1. **Authentication Required**: Only logged-in users can access the form
2. **CSRF Protection**: All form submissions include CSRF token
3. **Input Validation**: All inputs are validated before processing
4. **SQL Injection Prevention**: Using Eloquent ORM and parameter binding
5. **XSS Prevention**: All output is escaped in views

## Best Practices

1. **Always validate on both frontend and backend**
2. **Use database transactions for multi-step operations**
3. **Log all important actions for debugging**
4. **Send notifications to admin for new appointments**
5. **Keep patient data confidential and secure**
6. **Regularly backup database**

## Conclusion

The Online Appointment System provides a seamless way for patients to:
1. Register their personal and medical information
2. Book appointments with available specialists
3. Receive automated patient and appointment codes
4. Wait for admin approval
5. Track appointment status

For admins, the system provides:
1. Centralized view of all pending appointments
2. Complete patient records automatically created
3. Notifications for new appointment requests
4. Easy approval/rejection workflow
5. Comprehensive patient and appointment management

---

**Last Updated**: October 17, 2025
**Version**: 1.0
**Maintained By**: Clinic System Development Team

