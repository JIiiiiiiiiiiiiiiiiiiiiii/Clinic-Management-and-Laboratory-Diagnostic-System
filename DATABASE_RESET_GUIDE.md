# Database Reset Guide for Clinic System

## Overview
This guide provides safe methods to reset the clinic database while preserving system functionality. The reset scripts will clear all patient, appointment, billing, and visit data while maintaining admin users, specialists, and system configuration.

## Available Reset Scripts

### 1. Simple Database Reset (Recommended)
**File:** `simple_database_reset.php`
- ✅ Safest option
- ✅ No transaction complications
- ✅ Comprehensive verification
- ✅ Preserves system integrity

### 2. Safe Database Reset (Advanced)
**File:** `safe_database_reset.php`
- ⚠️ Uses transactions (may have issues)
- ✅ More comprehensive error handling
- ✅ User confirmation prompt

### 3. Existing Reset Scripts
- `reset_database_clean.php` - Original clean reset
- `reset_database_for_fresh_test.php` - Fresh test reset

## What Gets Cleared

### Patient-Related Data
- ✅ `patients` - All patient records
- ✅ `appointments` - All appointment records
- ✅ `visits` - All visit records
- ✅ `billing_transactions` - All billing records
- ✅ `billing_transaction_items` - All billing items
- ✅ `appointment_billing_links` - All appointment-billing links
- ✅ `daily_transactions` - All daily transaction records
- ✅ `pending_appointments` - All pending appointment records
- ✅ `notifications` - All notifications
- ✅ `patient_referrals` - All patient referrals

### User Accounts
- ✅ Patient users (role = 'patient')
- ✅ Preserves admin users
- ✅ Preserves doctor users
- ✅ Preserves medtech users
- ✅ Preserves nurse users

### Sequences
- ✅ Resets auto-increment counters to 1
- ✅ Ensures clean numbering for new records

## What Gets Preserved

### System Configuration
- ✅ Admin users and credentials
- ✅ Staff users (doctors, nurses, medtechs)
- ✅ Specialists table
- ✅ User roles and permissions
- ✅ System settings
- ✅ Database structure and relationships

## How to Use

### Step 1: Run the Reset Script
```bash
php simple_database_reset.php
```

### Step 2: Verify System Functionality
```bash
php verify_system_after_reset.php
```

### Step 3: Test the System
1. Go to `/patient/online-appointment`
2. Create a new patient account
3. Book an appointment
4. Test the complete workflow

## Expected Results

### After Reset
- ✅ All patient data cleared (0 records)
- ✅ All appointment data cleared (0 records)
- ✅ All billing data cleared (0 records)
- ✅ All visit data cleared (0 records)
- ✅ Patient users removed
- ✅ Admin/staff users preserved
- ✅ Specialists preserved
- ✅ Sequences reset to 1

### System Verification
- ✅ Database connectivity working
- ✅ All essential tables present
- ✅ Foreign key constraints working
- ✅ Admin access available
- ✅ Specialists available for appointments
- ✅ System ready for fresh testing

## Testing Sequence

### 1. Patient Registration
- Go to `/patient/online-appointment`
- Create new patient account
- Verify patient record created

### 2. Appointment Booking
- Fill out 6-step appointment form
- Submit appointment
- Verify pending appointment created

### 3. Admin Approval
- Login as admin (`admin@clinic.com`)
- Go to `/admin/pending-appointments`
- Approve appointment
- Verify appointment status changed

### 4. Payment Processing
- Process payment
- Verify billing transaction created
- Check payment status

### 5. Visit Creation
- Create visit record
- Verify visit linked to appointment
- Check visit status

### 6. Daily Reports
- Generate daily report
- Verify data appears correctly
- Check report formatting

## Troubleshooting

### Common Issues

#### 1. Foreign Key Errors
- **Problem:** Foreign key constraint violations
- **Solution:** Scripts disable foreign key checks during reset
- **Verification:** Check that constraints are re-enabled

#### 2. Transaction Errors
- **Problem:** "No active transaction" errors
- **Solution:** Use `simple_database_reset.php` instead
- **Note:** Simple script doesn't use transactions

#### 3. Missing Specialists
- **Problem:** No specialists available for appointments
- **Solution:** Script creates test specialists if none exist
- **Verification:** Check specialists table has records

#### 4. Admin Access Issues
- **Problem:** No admin users after reset
- **Solution:** Script creates test admin if none exist
- **Credentials:** `admin@test.com` / `password`

### Verification Checklist

- [ ] All patient tables have 0 records
- [ ] Admin users exist and accessible
- [ ] Specialists available for appointments
- [ ] Foreign key constraints working
- [ ] Auto-increment sequences reset to 1
- [ ] Database connectivity working
- [ ] System ready for testing

## Safety Features

### Data Protection
- ✅ Only clears patient-related data
- ✅ Preserves system configuration
- ✅ Maintains admin access
- ✅ Keeps specialists for appointments

### Error Handling
- ✅ Comprehensive error messages
- ✅ Rollback on failure (safe script)
- ✅ Verification steps
- ✅ System integrity checks

### Backup Recommendations
- ✅ Export database before reset
- ✅ Document current state
- ✅ Test in development environment first

## Admin Credentials

### Default Admin User
- **Email:** `admin@clinic.com`
- **Password:** (existing password)
- **Role:** `admin`

### Test Admin User (if created)
- **Email:** `admin@test.com`
- **Password:** `password`
- **Role:** `admin`

## Available Specialists

After reset, the system will have specialists available:
- **Doctors:** For consultations and checkups
- **MedTechs:** For laboratory procedures
- **Nurses:** For general nursing care

## Next Steps

1. **Run Reset:** Execute the reset script
2. **Verify System:** Run verification script
3. **Test Flow:** Complete end-to-end testing
4. **Document Issues:** Note any problems found
5. **Report Results:** Confirm system is working

## Support

If you encounter issues:
1. Check the verification script output
2. Review error messages carefully
3. Ensure database connectivity
4. Verify all required tables exist
5. Check foreign key constraints

The reset scripts are designed to be safe and preserve system functionality while clearing patient data for fresh testing.
