# 🏥 Online Appointment Testing Guide

## 📋 Simple Testing Steps

### **Step 1: Access the Online Appointment Form**
1. Go to: `http://localhost:8000/patient/online-appointment`
2. You should see a 6-step form

### **Step 2: Fill Out the Form**
Complete all 6 steps:

**Step 1 - Personal Information:**
- Last Name: `Test`
- First Name: `Patient`
- Birthdate: `1990-01-01`
- Age: `34`
- Sex: `Male`
- Civil Status: `Single`

**Step 2 - Contact Details:**
- Present Address: `123 Test Street`
- Mobile No: `09123456789`

**Step 3 - Emergency Contact:**
- Informant Name: `Emergency Contact`
- Relationship: `Friend`

**Step 4 - Insurance & Financial:**
- Leave blank (optional)

**Step 5 - Medical History:**
- Drug Allergies: `NONE`
- Leave other fields blank

**Step 6 - Appointment Booking:**
- Appointment Type: `General Consultation`
- Specialist: Select any doctor
- Date: Tomorrow's date
- Time: Any available time

### **Step 3: Submit the Form**
1. Click "Submit Online Appointment Request"
2. You should see: "✅ Appointment Created Successfully!"
3. You'll be redirected to the appointments page

### **Step 4: Check Your Appointments**
1. Go to: `http://localhost:8000/patient/appointments`
2. You should see your appointment in the list

## 🔍 What Should Happen

✅ **Form Submission**: No errors, success message appears
✅ **Appointment Created**: Shows in "My Appointments" page
✅ **Status**: Shows as "Pending" (waiting for admin approval)

## ❌ If Something Goes Wrong

**Form doesn't submit:**
- Check browser console (F12) for errors
- Make sure all required fields are filled

**Appointment not showing:**
- Check if you're logged in as a patient
- Check the database for the appointment record

**Server errors:**
- Check Laravel logs: `storage/logs/laravel.log`
- Make sure the database is running

## 🧹 Clean Up Test Data

To clean up test data:
```sql
DELETE FROM appointments WHERE patient_id IN (
    SELECT patient_id FROM patients WHERE first_name = 'Test'
);
DELETE FROM patients WHERE first_name = 'Test';
```

## 📞 Support

If you encounter issues:
1. Check the browser console for JavaScript errors
2. Check the Laravel logs for server errors
3. Verify the database connection
4. Make sure all migrations are run: `php artisan migrate`
