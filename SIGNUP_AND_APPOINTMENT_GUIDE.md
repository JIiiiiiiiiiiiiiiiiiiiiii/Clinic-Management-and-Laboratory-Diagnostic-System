# 🏥 Complete Signup & Appointment Guide

## 🎯 How to Test the Complete Flow

### **Step 1: Access the Login Page**
1. Go to: `http://localhost:8000/login`
2. You should see a login form with a "Sign up for a new account" link

### **Step 2: Create a New Account**
1. Click "Sign up for a new account"
2. Fill out the registration form:
   - **Name**: `John Doe`
   - **Email**: `john.doe@example.com`
   - **Password**: `password123`
   - **Confirm Password**: `password123`
3. Click "Create account"
4. You should be automatically logged in and redirected to the patient dashboard

### **Step 3: Book Your First Appointment**
1. You'll be on the patient dashboard
2. Click "Book New Appointment" or go to `/patient/online-appointment`
3. Fill out the 6-step appointment form:
   
   **Step 1 - Personal Information:**
   - Last Name: `Doe`
   - First Name: `John`
   - Birthdate: `1990-01-01`
   - Age: `34`
   - Sex: `Male`
   - Civil Status: `Single`

   **Step 2 - Contact Details:**
   - Present Address: `123 Main Street`
   - Mobile No: `09123456789`

   **Step 3 - Emergency Contact:**
   - Informant Name: `Jane Doe`
   - Relationship: `Spouse`

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

4. Click "Submit Online Appointment Request"
5. You should see: "✅ Appointment Created Successfully!"

### **Step 4: View Your Appointments**
1. Go to "My Appointments" or `/patient/appointments`
2. You should see your appointment in the list
3. The status should be "Pending" (waiting for admin approval)

### **Step 5: Book Additional Appointments**
1. Go back to `/patient/online-appointment`
2. The form should be pre-filled with your information
3. Create another appointment with a different date/time
4. Both appointments should appear in "My Appointments"

## 🔄 Complete User Journey

```
New User → Sign Up → Login → Book Appointment → View Appointments → Book More Appointments
```

## ✅ What Should Happen

1. **✅ Registration**: New user can create account
2. **✅ Auto Patient Record**: Patient record created automatically
3. **✅ First Appointment**: Can book first appointment
4. **✅ Multiple Appointments**: Can book additional appointments
5. **✅ Appointment History**: All appointments show in "My Appointments"

## 🧪 Test Multiple Users

1. **User 1**: `john.doe@example.com` / `password123`
2. **User 2**: `jane.smith@example.com` / `password123`
3. **User 3**: `bob.wilson@example.com` / `password123`

Each user should be able to:
- Create their own account
- Book their own appointments
- See only their own appointments

## 🚀 Ready to Test!

The system now supports:
- ✅ **User Registration** - Anyone can sign up
- ✅ **Automatic Patient Creation** - Patient record created on signup
- ✅ **Multiple Appointments** - Each user can book multiple appointments
- ✅ **User Isolation** - Each user only sees their own appointments

Try creating multiple accounts and booking appointments for each one!
