# 🔐 Login Credentials - St. James Clinic Management System

## **📋 Default User Accounts**

All users have the same password: **`password`**

---

## **🏥 HOSPITAL ACCOUNTS**

### **Hospital Admin**
- **Email**: `hospital@stjames.com`
- **Password**: `password`
- **Role**: Admin (Hospital Interface)
- **Access**: Hospital dashboard, patient management, transfer system

---

## **🏥 CLINIC ADMIN ACCOUNTS**

### **Clinic Admin**
- **Email**: `admin@clinic.com`
- **Password**: `password`
- **Role**: Admin
- **Access**: Full admin dashboard, all clinic operations

### **Doctor**
- **Email**: `doctor@clinic.com`
- **Password**: `password`
- **Role**: Doctor
- **Access**: Patient management, appointments, lab orders

### **Lab Technician**
- **Email**: `labtech@clinic.com`
- **Password**: `password`
- **Role**: Laboratory Technologist
- **Access**: Lab orders, test results, lab management

### **MedTech**
- **Email**: `medtech@clinic.com`
- **Password**: `password`
- **Role**: MedTech
- **Access**: Lab procedures, test processing

### **Cashier**
- **Email**: `cashier@clinic.com`
- **Password**: `password`
- **Role**: Cashier
- **Access**: Billing, payments, financial reports

---

## **👤 PATIENT ACCOUNTS**

### **Patient**
- **Email**: `patient@clinic.com`
- **Password**: `password`
- **Role**: Patient
- **Access**: Patient portal, appointment booking, personal records

---

## **🚀 Quick Login Guide**

### **For Hospital Staff:**
1. Go to: `http://localhost:8000/hospital/dashboard`
2. Login with: `hospital@stjames.com` / `password`

### **For Clinic Staff:**
1. Go to: `http://localhost:8000/admin/dashboard`
2. Login with any clinic staff email / `password`

### **For Patients:**
1. Go to: `http://localhost:8000/patient/dashboard`
2. Login with: `patient@clinic.com` / `password`

---

## **🎯 Role-Based Access**

### **Hospital Admin** (`hospital@stjames.com`)
- ✅ Hospital dashboard
- ✅ Patient data management
- ✅ Patient transfer to clinic
- ✅ Hospital reports
- ✅ View clinic operations

### **Clinic Admin** (`admin@clinic.com`)
- ✅ Full admin dashboard
- ✅ All clinic operations
- ✅ User management
- ✅ System settings
- ✅ Analytics and reports

### **Doctor** (`doctor@clinic.com`)
- ✅ Patient management
- ✅ Appointment scheduling
- ✅ Lab order creation
- ✅ Patient records
- ✅ Medical reports

### **Lab Technician** (`labtech@clinic.com`)
- ✅ Lab order processing
- ✅ Test result entry
- ✅ Lab equipment management
- ✅ Lab reports
- ✅ Quality control

### **MedTech** (`medtech@clinic.com`)
- ✅ Lab procedures
- ✅ Test processing
- ✅ Equipment operation
- ✅ Lab maintenance
- ✅ Procedure reports

### **Cashier** (`cashier@clinic.com`)
- ✅ Billing transactions
- ✅ Payment processing
- ✅ Financial reports
- ✅ Receipt generation
- ✅ HMO management

### **Patient** (`patient@clinic.com`)
- ✅ Personal dashboard
- ✅ Appointment booking
- ✅ Medical records
- ✅ Test results
- ✅ Payment history

---

## **🔧 Testing Different Roles**

### **Test Hospital Interface:**
1. Login: `hospital@stjames.com` / `password`
2. Go to: `http://localhost:8000/hospital/dashboard`
3. Test patient management and transfers

### **Test Clinic Admin:**
1. Login: `admin@clinic.com` / `password`
2. Go to: `http://localhost:8000/admin/dashboard`
3. Test all admin features

### **Test Patient Portal:**
1. Login: `patient@clinic.com` / `password`
2. Go to: `http://localhost:8000/patient/dashboard`
3. Test appointment booking

### **Test Lab Operations:**
1. Login: `labtech@clinic.com` / `password`
2. Go to: `http://localhost:8000/admin/laboratory`
3. Test lab order processing

### **Test Billing:**
1. Login: `cashier@clinic.com` / `password`
2. Go to: `http://localhost:8000/admin/billing`
3. Test payment processing

---

## **📱 Interface URLs**

### **Hospital Interface:**
- **Dashboard**: `http://localhost:8000/hospital/dashboard`
- **Patients**: `http://localhost:8000/hospital/patients`
- **Reports**: `http://localhost:8000/hospital/reports`

### **Clinic Admin Interface:**
- **Dashboard**: `http://localhost:8000/admin/dashboard`
- **Patients**: `http://localhost:8000/admin/patients`
- **Appointments**: `http://localhost:8000/admin/appointments`
- **Laboratory**: `http://localhost:8000/admin/laboratory`
- **Billing**: `http://localhost:8000/admin/billing`
- **Inventory**: `http://localhost:8000/admin/inventory`
- **Analytics**: `http://localhost:8000/admin/analytics`

### **Patient Interface:**
- **Dashboard**: `http://localhost:8000/patient/dashboard`
- **Appointments**: `http://localhost:8000/patient/appointments`
- **Medical Records**: `http://localhost:8000/patient/records`

---

## **🔐 Security Notes**

### **Default Password:**
- All accounts use `password` as the default password
- **Change passwords** in production environment
- **Use strong passwords** for security

### **Role Permissions:**
- Each role has specific permissions
- **Cannot access** features outside their role
- **Secure access** based on user roles

### **Session Management:**
- **Automatic logout** after inactivity
- **Session timeout** for security
- **Role-based redirects** after login

---

## **🚨 Troubleshooting**

### **If Login Doesn't Work:**
1. **Check email spelling** - Make sure email is correct
2. **Check password** - Use `password` (lowercase)
3. **Check server** - Make sure server is running
4. **Clear browser cache** - Clear cookies and cache
5. **Try different browser** - Test in Chrome, Firefox, Edge

### **If You Get Permission Errors:**
1. **Check user role** - Make sure you're using the right account
2. **Check permissions** - Some features require specific roles
3. **Contact admin** - If you need access to restricted features

### **If Pages Don't Load:**
1. **Check server status** - Make sure Laravel server is running
2. **Check database** - Make sure database is connected
3. **Check migrations** - Run `php artisan migrate`
4. **Check seeders** - Run `php artisan db:seed`

---

## **🎉 Quick Start**

### **For Testing the System:**
1. **Start with Hospital**: `hospital@stjames.com` / `password`
2. **Test Clinic Admin**: `admin@clinic.com` / `password`
3. **Test Patient Portal**: `patient@clinic.com` / `password`
4. **Test Lab Operations**: `labtech@clinic.com` / `password`
5. **Test Billing**: `cashier@clinic.com` / `password`

### **For Production:**
1. **Change all passwords** to secure ones
2. **Create new users** with proper roles
3. **Set up proper permissions**
4. **Configure security settings**

---

## **📞 Support**

### **If You Need Help:**
1. **Check this guide** for correct credentials
2. **Verify server is running** on port 8000
3. **Check browser console** for errors
4. **Contact system administrator**

### **Common Issues:**
1. **Wrong email** - Double-check the email address
2. **Wrong password** - Use `password` (all lowercase)
3. **Server not running** - Start with `php artisan serve`
4. **Database issues** - Run migrations and seeders

**All accounts are ready to use with the password: `password`** 🔐
