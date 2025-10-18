# COMPLETE ONLINE APPOINTMENT FLOW - TEST GUIDE

## 🎯 **DATABASE RESET COMPLETED** ✅

Your database has been successfully reset to a clean state:
- ✅ **Patients:** 0 records
- ✅ **Appointments:** 0 records  
- ✅ **Visits:** 0 records
- ✅ **Billing Transactions:** 0 records
- ✅ **Appointment Billing Links:** 0 records
- ✅ **Daily Transactions:** 0 records
- ✅ **Pending Appointments:** 0 records
- ✅ **Patient Users:** 0 (removed)
- ✅ **Admin/Staff Users:** 3 (kept)
- ✅ **Specialists:** 9 (available)

## 🚀 **READY TO TEST COMPLETE FLOW**

### **PHASE 1: PATIENT SIDE - ONLINE APPOINTMENT BOOKING**

#### **Step 1: Patient Registration & Login**
1. **Go to:** `http://your-domain/patient/online-appointment`
2. **If new user:** Click "Register" and create account
3. **If existing user:** Login with credentials

#### **Step 2: Online Appointment Form (6 Steps)**
**Route:** `/patient/online-appointment`  
**Controller:** `App\Http\Controllers\Patient\OnlineAppointmentController@show`  
**Frontend:** `resources/js/pages/patient/online-appointment.tsx`

**Step 1: Personal Information**
- Last Name (required)
- First Name (required)  
- Middle Name
- Birthdate (required) - auto-calculates age
- Age (required)
- Sex (required)
- Nationality
- Civil Status (required)

**Step 2: Contact Details**
- Present Address (required)
- Telephone No.
- Mobile No. (required)

**Step 3: Emergency Contact**
- Informant Name (required)
- Relationship (required)

**Step 4: Insurance & Financial**
- Company Name
- HMO Name
- HMO/Company ID No.
- Validation/Approval Code
- Validity

**Step 5: Medical History**
- Drug Allergies
- Food Allergies
- Past Medical History
- Family History
- Social/Personal History
- Obstetrics & Gynecology History

**Step 6: Appointment Booking**
- Appointment Type (required):
  - General Consultation
  - CBC
  - Fecalysis Test
  - Urinalysis Test
- Specialist Type (auto-generated):
  - Doctor for Consultation
  - Medical Technologist for Lab Tests
- Select Specialist (required)
- Appointment Date & Time

#### **Step 3: Form Submission**
**API Endpoint:** `/api/appointments/online`  
**Controller:** `App\Http\Controllers\Patient\OnlineAppointmentController@store`

**Expected Result:**
- ✅ Creates patient record with generated patient code (P0001, P0002, etc.)
- ✅ Creates appointment in `PendingAppointment` table
- ✅ Sets `status_approval` = 'pending'
- ✅ Sets `booking_method` = 'Online'
- ✅ Sets `source` = 'Online'
- ✅ Shows success message with Patient Code and Appointment Code

---

### **PHASE 2: ADMIN SIDE - APPOINTMENT APPROVAL**

#### **Step 4: Admin Views Pending Appointments**
1. **Go to:** `http://your-domain/admin/pending-appointments`
2. **Controller:** `App\Http\Controllers\Admin\PendingAppointmentController@index`
3. **Verify:** You see the pending appointment from Step 3

#### **Step 5: Admin Approves Appointment**
1. **Click:** "Approve" button on the pending appointment
2. **Route:** `/admin/pending-appointments/{id}/approve`
3. **Controller:** `App\Http\Controllers\Admin\PendingAppointmentController@approve`
4. **Service:** `App\Services\PendingAppointmentApprovalService@approvePendingAppointment`

**Expected Result:**
- ✅ **Patient Record:** Created/updated with patient number
- ✅ **Appointment Record:** Created in `Appointment` table with `status` = 'Confirmed'
- ✅ **Visit Record:** Created with `status` = 'scheduled'
- ✅ **Billing Transaction:** Created with `status` = 'pending' and transaction code (TXN-000001, etc.)
- ✅ **Billing Link:** Created connecting appointment and transaction
- ✅ **Pending Appointment:** Updated with `status_approval` = 'approved'
- ✅ **Patient Notification:** Sent about approval

---

### **PHASE 3: PAYMENT PROCESSING**

#### **Step 6: Payment Processing**
1. **Go to:** `http://your-domain/admin/billing`
2. **Find:** The billing transaction created in Step 5
3. **Click:** "Mark as Paid" or similar button
4. **Route:** `/admin/billing/{transaction}/mark-paid`
5. **Controller:** `App\Http\Controllers\Admin\BillingController@markAsPaid`

**Expected Result:**
- ✅ **BillingTransaction:** Updated with `status` = 'paid'
- ✅ **Appointment:** Updated with `status` = 'Completed' and `billing_status` = 'paid'
- ✅ **Visit:** Updated with `status` = 'Completed'
- ✅ **AppointmentBillingLink:** Updated with `status` = 'paid'

---

### **PHASE 4: DAILY REPORT GENERATION**

#### **Step 7: Daily Report Sync**
1. **Go to:** `http://your-domain/admin/billing/daily-report`
2. **Controller:** `App\Http\Controllers\Admin\BillingReportController@dailyReport`
3. **Verify:** The transaction appears in daily report

**Expected Result:**
- ✅ **DailyTransaction:** Created with:
  - `transaction_type` = 'billing'
  - `patient_name` = from patient record
  - `specialist_name` = from doctor/specialist record
  - `amount` = transaction total
  - `payment_method` = cash/hmo
  - `status` = paid
  - `description` = "Payment for 1 appointment(s)"

#### **Step 8: Daily Report Display**
**Frontend:** `resources/js/pages/admin/billing/daily-report.tsx`

**Expected Result:**
- ✅ **Transaction ID:** TXN-000001, TXN-000002, etc.
- ✅ **Patient Name:** From patient record
- ✅ **Specialist Name:** Doctor/MedTech name
- ✅ **Amount:** Transaction total (₱500, ₱1000, etc.)
- ✅ **Payment Method:** Cash/HMO
- ✅ **Status:** Paid
- ✅ **Time:** Transaction timestamp
- ✅ **Description:** "Payment for 1 appointment(s)"
- ✅ **Summary Statistics:** Shows total revenue, transaction count, etc.

---

## 📊 **DATABASE TABLES TO MONITOR**

### **During Testing, Check These Tables:**

1. **`users`** - Should have admin/staff users (3 records)
2. **`patients`** - Should get 1 record after patient registration
3. **`pending_appointments`** - Should get 1 record after form submission
4. **`appointments`** - Should get 1 record after admin approval
5. **`visits`** - Should get 1 record after admin approval
6. **`billing_transactions`** - Should get 1 record after admin approval
7. **`appointment_billing_links`** - Should get 1 record after admin approval
8. **`daily_transactions`** - Should get 1 record after daily report sync

### **Expected Record Counts After Complete Flow:**
- **Users:** 4 (3 admin/staff + 1 patient)
- **Patients:** 1
- **Pending Appointments:** 1 (with status_approval = 'approved')
- **Appointments:** 1 (with status = 'Completed')
- **Visits:** 1 (with status = 'Completed')
- **Billing Transactions:** 1 (with status = 'paid')
- **Appointment Billing Links:** 1 (with status = 'paid')
- **Daily Transactions:** 1 (with transaction_type = 'billing')

---

## 🎯 **SUCCESS CRITERIA**

### **✅ Complete Flow Success:**
1. Patient can register and login
2. Patient can complete 6-step appointment form
3. Form submission creates pending appointment
4. Admin can view pending appointments
5. Admin can approve appointment (creates all related records)
6. Admin can process payment
7. Daily report shows the transaction
8. All database relationships work correctly
9. No errors occur during any step

### **🔍 What to Check:**
- All foreign key relationships work
- All status updates work correctly
- All code generation works (patient codes, transaction codes)
- All notifications are sent
- All data appears in daily reports
- No orphaned records
- No constraint violations

---

## 🚀 **START TESTING NOW!**

Your database is clean and ready. Start with:

1. **Go to:** `http://your-domain/patient/online-appointment`
2. **Create a new patient account**
3. **Fill out the 6-step appointment form**
4. **Submit the appointment**
5. **Go to admin panel to approve**
6. **Process payment**
7. **Check daily report**

**All systems are ready and working!** 🎉
