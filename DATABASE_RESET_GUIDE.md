# Database Reset Guide

## Overview
This guide explains how to reset the clinic database while preserving user roles and authentication data.

## What Gets Cleared
- ✅ All patient records
- ✅ All appointment records  
- ✅ All visit records
- ✅ All billing transaction records
- ✅ All lab-related data
- ✅ All supply-related data
- ✅ All related foreign key data

## What Gets Preserved
- ✅ User accounts and authentication
- ✅ User roles (admin, doctor, patient, medtech, nurse, etc.)
- ✅ System configuration
- ✅ Database structure and relationships

## How to Reset the Database

### Method 1: Using the Reset Script (Recommended)
```bash
php reset_clinic_data_clean.php
```

### Method 2: Manual Verification
After running the reset script, verify the cleanup:
```bash
php verify_clean_database.php
```

## What the Scripts Do

### `reset_clinic_data_clean.php`
1. Disables foreign key constraints temporarily
2. Clears all clinic-related data in the correct order
3. Resets auto-increment counters to 1
4. Re-enables foreign key constraints
5. Verifies user roles are preserved
6. Provides detailed progress reporting

### `verify_clean_database.php`
1. Checks that all main tables are empty
2. Verifies user roles are intact
3. Confirms auto-increment counters are reset
4. Reports the status of related tables
5. Provides a comprehensive summary

## Expected Results After Reset

### Database State
- **Patients**: 0 records
- **Appointments**: 0 records  
- **Visits**: 0 records
- **Billing Transactions**: 0 records
- **Users**: All preserved with roles intact
- **Auto-increment**: All reset to 1

### User Roles Preserved
- Admin users: 1
- Doctor users: 1
- Patient users: 6
- MedTech users: 1
- Hospital admin users: 0
- Nurse users: 0

## Safety Features

### Transaction Safety
- The script uses database transactions for safety
- All changes are rolled back if any error occurs
- Foreign key constraints are properly handled

### Data Preservation
- User authentication data is never touched
- User roles and permissions remain intact
- System configuration is preserved

### Verification
- Comprehensive verification script included
- Detailed reporting of all operations
- Clear success/failure indicators

## Troubleshooting

### If Reset Fails
1. Check database connection
2. Verify user has proper permissions
3. Ensure no other processes are using the database
4. Check for foreign key constraint issues

### If Verification Shows Issues
1. Re-run the reset script
2. Check for any remaining foreign key references
3. Manually clear any remaining data if needed

## Important Notes

⚠️ **WARNING**: This operation permanently deletes all clinic data!
- Always backup your database before running the reset
- This cannot be undone
- Make sure you have proper backups

✅ **SAFE**: User accounts and roles are preserved
- All authentication remains intact
- User permissions are maintained
- System access is not affected

## Next Steps After Reset

1. **Test the system** - Verify all functionality works
2. **Check sorting** - Test if sorting issues are resolved
3. **Add fresh data** - Create new patients, appointments, etc.
4. **Monitor performance** - Ensure the system runs smoothly

## Files Created
- `reset_clinic_data_clean.php` - Main reset script
- `verify_clean_database.php` - Verification script
- `DATABASE_RESET_GUIDE.md` - This documentation

## Support
If you encounter any issues:
1. Check the error messages in the script output
2. Verify database permissions
3. Ensure all dependencies are installed
4. Contact system administrator if needed