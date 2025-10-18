# Patient and Appointment Relationship - Visual Flow

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         USER REGISTRATION                                │
│                                                                          │
│  User creates account → Gets user_id → Can create patient record        │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    ONLINE APPOINTMENT FORM                               │
│                                                                          │
│  Step 1: Personal Information (Name, DOB, Age, Sex, etc.)              │
│  Step 2: Contact Details (Address, Phone, Mobile)                       │
│  Step 3: Emergency Contact (Name, Relationship)                         │
│  Step 4: Insurance & Financial (HMO, Company, Validity)                │
│  Step 5: Medical History (Allergies, Past History, Family History)     │
│  Step 6: Appointment Booking (Type, Specialist, Date, Time)            │
│                                                                          │
│  [Submit Online Appointment Request Button]                             │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        FORM SUBMISSION                                   │
│                                                                          │
│  POST /api/appointments/online                                          │
│  {                                                                       │
│    existingPatientId: 0 or patient_id,                                 │
│    patient: { personal_info, contact_info, medical_info },             │
│    appointment: { type, specialist, date, time, notes }                │
│  }                                                                       │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│            API CONTROLLER (OnlineAppointmentController)                  │
│                                                                          │
│  1. Validate all input data                                             │
│  2. Check if patient exists by user_id                                  │
│  3. If not exists → Create new patient                                  │
│  4. Create appointment linked to patient                                │
│  5. Generate codes (patient_code, appointment_code)                     │
│  6. Send notifications to admin                                         │
│  7. Return success response                                             │
└──────────────────┬──────────────────────────────────┬───────────────────┘
                   │                                  │
                   ▼                                  ▼
      ┌────────────────────────┐       ┌────────────────────────┐
      │  PATIENTS TABLE        │       │  APPOINTMENTS TABLE    │
      │  (patients)            │       │  (appointments)        │
      ├────────────────────────┤       ├────────────────────────┤
      │ patient_id (PK)        │◄──────┤ patient_id (FK)        │
      │ patient_code           │       │ appointment_id (PK)    │
      │ user_id (FK)           │       │ appointment_code       │
      │ last_name              │       │ appointment_type       │
      │ first_name             │       │ specialist_id (FK)     │
      │ middle_name            │       │ specialist_type        │
      │ birthdate              │       │ appointment_date       │
      │ age                    │       │ appointment_time       │
      │ sex                    │       │ duration               │
      │ nationality            │       │ price                  │
      │ civil_status           │       │ source: 'Online'       │
      │ address                │       │ status: 'Pending'      │
      │ telephone_no           │       │ additional_info        │
      │ mobile_no              │       │ admin_notes            │
      │ email                  │       │ created_by             │
      │ emergency_name         │       │ created_at             │
      │ emergency_relation     │       │ updated_at             │
      │ insurance_company      │       └────────────────────────┘
      │ hmo_name               │
      │ hmo_id_no              │
      │ approval_code          │
      │ validity               │
      │ drug_allergies         │
      │ past_medical_history   │
      │ family_history         │
      │ social_history         │
      │ obgyn_history          │
      │ status: 'Active'       │
      │ created_at             │
      │ updated_at             │
      └────────────────────────┘
                   │
                   ▼
      ┌────────────────────────┐
      │   USERS TABLE          │
      │   (users)              │
      ├────────────────────────┤
      │ id (PK)                │
      │ name                   │
      │ email                  │
      │ password               │
      │ role                   │
      │ created_at             │
      │ updated_at             │
      └────────────────────────┘
```

## Data Flow: New User → Patient → Appointment

```
┌──────────────┐
│   New User   │
│   Signup     │
└──────┬───────┘
       │
       │ Creates account
       │
       ▼
┌──────────────────┐
│  users table     │
│  id = 1          │
│  email = ...     │
│  role = patient  │
└──────┬───────────┘
       │
       │ Fills Online Appointment Form
       │ (All 6 steps)
       │
       ▼
┌──────────────────────────────────────────────────┐
│  System checks: Does patient exist for user_id?  │
│  → NO (First time user)                          │
└──────┬───────────────────────────────────────────┘
       │
       │ Create Patient Record
       │
       ▼
┌──────────────────────────┐
│  patients table          │
│  patient_id = 1          │
│  patient_code = "P0001"  │──┐
│  user_id = 1             │  │
│  last_name = "Doe"       │  │
│  first_name = "John"     │  │
│  ... (all form data)     │  │
│  status = "Active"       │  │
└──────────────────────────┘  │
                              │ Links via patient_id
                              │
                              ▼
                 ┌──────────────────────────────┐
                 │  appointments table          │
                 │  appointment_id = 1          │
                 │  appointment_code = "A0001"  │
                 │  patient_id = 1              │
                 │  specialist_id = 5           │
                 │  appointment_type = "cbc"    │
                 │  specialist_type = "medtech" │
                 │  appointment_date = "..."    │
                 │  appointment_time = "..."    │
                 │  price = 500.00              │
                 │  source = "Online"           │
                 │  status = "Pending"          │
                 └──────────────────────────────┘
                              │
                              │ Triggers
                              │
                              ▼
                 ┌──────────────────────────────┐
                 │  notifications table         │
                 │  → Sent to all admin users   │
                 │  "New Online Appointment"    │
                 │  "Patient: John Doe"         │
                 │  "Type: CBC"                 │
                 │  "Date: ..."                 │
                 └──────────────────────────────┘
```

## Data Flow: Existing User → Existing Patient → New Appointment

```
┌──────────────┐
│ Existing     │
│ User Login   │
└──────┬───────┘
       │
       │ user_id = 1
       │
       ▼
┌──────────────────────────────────────────────────┐
│  System checks: Does patient exist for user_id?  │
│  → YES (Returning user)                          │
└──────┬───────────────────────────────────────────┘
       │
       │ Load existing patient data
       │
       ▼
┌──────────────────────────┐
│  patients table          │
│  patient_id = 1          │
│  patient_code = "P0001"  │──┐
│  user_id = 1             │  │
│  (existing data)         │  │
└──────────────────────────┘  │
                              │
                              │ Pre-fills form
                              │ User only fills Step 6
                              │
                              │ Create NEW Appointment
                              │
                              ▼
                 ┌──────────────────────────────┐
                 │  appointments table          │
                 │  appointment_id = 2 (NEW!)   │
                 │  appointment_code = "A0002"  │
                 │  patient_id = 1 (SAME!)      │
                 │  specialist_id = 3           │
                 │  appointment_type = "..."    │
                 │  source = "Online"           │
                 │  status = "Pending"          │
                 └──────────────────────────────┘
```

## Admin Side View

```
┌────────────────────────────────────────────────────────────────┐
│                    ADMIN DASHBOARD                              │
└────────────────────────────────────────────────────────────────┘
                              │
                              │
            ┌─────────────────┴─────────────────┐
            │                                   │
            ▼                                   ▼
┌──────────────────────────┐      ┌──────────────────────────┐
│   PATIENTS PAGE          │      │   APPOINTMENTS PAGE      │
│   /admin/patients        │      │   /admin/appointments    │
├──────────────────────────┤      ├──────────────────────────┤
│                          │      │                          │
│ View All Patients:       │      │ View All Appointments:   │
│                          │      │                          │
│ P0001 - John Doe         │◄─────┤ A0001 - John Doe (P0001) │
│   Age: 25, Male          │      │   Type: CBC              │
│   Mobile: 09123456789    │      │   Date: Oct 18, 2025     │
│   Status: Active         │      │   Time: 10:00 AM         │
│   Created: Oct 17, 2025  │      │   Status: Pending        │
│                          │      │   Source: Online         │
│ P0002 - Jane Smith       │      │   Price: ₱500.00         │
│   Age: 30, Female        │      │                          │
│   Mobile: 09187654321    │      │ Actions:                 │
│   Status: Active         │      │ [Approve] [Reject]       │
│   Created: Oct 17, 2025  │      │ [Reschedule] [View]      │
│                          │      │                          │
└──────────────────────────┘      └──────────────────────────┘
```

## Appointment Status Workflow

```
┌────────────────┐
│   Patient      │
│   Submits      │
│   Online Form  │
└───────┬────────┘
        │
        ▼
┌────────────────────────┐
│ Status: Pending        │  ← Appears in Admin "Pending Appointments"
│ Source: Online         │
└───────┬────────────────┘
        │
        │ Admin Reviews
        │
        ▼
┌─────────────────────────────────────┐
│         Admin Actions                │
├─────────────────────────────────────┤
│ Option 1: Approve                   │ → Status: Confirmed
│ Option 2: Reject                    │ → Status: Cancelled
│ Option 3: Reschedule                │ → Status: Confirmed (new date/time)
└─────────────────────────────────────┘
        │
        │ Notification sent to patient
        │
        ▼
┌────────────────────────┐
│ Patient Notified       │
│ - Via in-app           │
│ - Can view in          │
│   "My Appointments"    │
└────────────────────────┘
```

## Key Relationships

### 1. **One-to-One: User ↔ Patient**
- Each user can have ONE patient record
- Each patient record belongs to ONE user
- Linked via `user_id`

### 2. **One-to-Many: Patient ↔ Appointments**
- Each patient can have MANY appointments
- Each appointment belongs to ONE patient
- Linked via `patient_id`

### 3. **One-to-Many: Specialist ↔ Appointments**
- Each specialist can have MANY appointments
- Each appointment is assigned to ONE specialist
- Linked via `specialist_id`

## Auto-Generated Codes

### Patient Code Generation
```
Logic: P + padded patient_id

Examples:
patient_id = 1   → patient_code = "P0001"
patient_id = 23  → patient_code = "P0023"
patient_id = 456 → patient_code = "P0456"
```

### Appointment Code Generation
```
Logic: A + padded appointment_id

Examples:
appointment_id = 1   → appointment_code = "A0001"
appointment_id = 23  → appointment_code = "A0023"
appointment_id = 456 → appointment_code = "A0456"
```

## Field Mapping Summary

### Form Field → Database Column Mappings

| Category | Form Field | Database Column | Required |
|----------|-----------|----------------|----------|
| **Identity** | last_name | last_name | Yes |
| | first_name | first_name | Yes |
| | middle_name | middle_name | No |
| | birthdate | birthdate | Yes |
| | age | age | Yes |
| | sex | sex | Yes |
| **Demographics** | nationality | nationality | No |
| | civil_status | civil_status | Yes |
| **Contact** | present_address | address | Yes |
| | telephone_no | telephone_no | No |
| | mobile_no | mobile_no | Yes |
| **Emergency** | informant_name | emergency_name | Yes |
| | relationship | emergency_relation | Yes |
| **Insurance** | company_name | insurance_company | No |
| | hmo_name | hmo_name | No |
| | hmo_company_id_no | hmo_id_no | No |
| | validation_approval_code | approval_code | No |
| | validity | validity | No |
| **Medical** | drug_allergies | drug_allergies | No |
| | past_medical_history | past_medical_history | No |
| | family_history | family_history | No |
| | social_personal_history | social_history | No |
| | obstetrics_gynecology_history | obgyn_history | No |

## Success Indicators

### When everything works correctly:

✅ **Patient Side:**
1. Form submits without errors
2. Success message appears
3. Patient code is generated (e.g., "P0001")
4. Appointment code is generated (e.g., "A0001")
5. Redirects to "My Appointments" page
6. New appointment appears with status "Pending"

✅ **Admin Side:**
1. Notification appears: "New Online Appointment Request"
2. New patient appears in Patients list
3. New appointment appears in Appointments list (Pending section)
4. All patient data is correctly displayed
5. All appointment details are correctly displayed
6. Admin can approve/reject the appointment

✅ **Database:**
1. New record in `patients` table (if new patient)
2. New record in `appointments` table
3. `patient_id` correctly links appointment to patient
4. `user_id` correctly links patient to user
5. All foreign keys are valid
6. No null values in required fields

---

**Last Updated**: October 17, 2025

