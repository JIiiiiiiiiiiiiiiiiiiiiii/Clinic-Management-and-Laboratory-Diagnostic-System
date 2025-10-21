# Lab Orders Database Reset Guide

## Overview
This guide explains how to reset the lab orders database while preserving user roles, authentication data, and lab test reference data.

## What Gets Cleared
- ✅ All lab order records
- ✅ All lab result records  
- ✅ All lab result value records
- ✅ All lab request records
- ✅ All laboratory report records
- ✅ All related lab transaction data
- ✅ All lab billing links
- ✅ All lab workflow data

## What Gets Preserved
- ✅ User accounts and authentication
- ✅ User roles (admin, doctor, patient, medtech, lab technologist, nurse, etc.)
- ✅ Lab tests (reference data) - these are the test definitions
- ✅ System configuration
- ✅ Database structure and relationships

## How to Reset the Lab Database

### Method 1: Using the Lab Reset Script (Recommended)
```bash
php reset_lab_orders_clean.php
```

### Method 2: Manual Verification
After running the reset script, verify the cleanup:
```bash
php verify_lab_clean_database.php
```

## What the Scripts Do

### `reset_lab_orders_clean.php`
1. Disables foreign key constraints temporarily
2. Clears all lab-related data in the correct order:
   - Lab result values (child records first)
   - Lab results
   - Lab requests
   - Lab orders
   - Laboratory reports
   - Related lab tables
3. Resets auto-increment counters to 1
4. Re-enables foreign key constraints
5. Verifies user roles are preserved
6. Confirms lab tests (reference data) are preserved
7. Provides detailed progress reporting

### `verify_lab_clean_database.php`
1. Checks that all lab tables are empty
2. Verifies user roles are intact
3. Confirms auto-increment counters are reset
4. Verifies lab tests (reference data) are preserved
5. Reports the status of related tables
6. Provides a comprehensive summary

## Expected Results After Reset

### Lab Database State
- **Lab Orders**: 0 records
- **Lab Results**: 0 records  
- **Lab Result Values**: 0 records
- **Lab Requests**: 0 records (if table exists)
- **Laboratory Reports**: 0 records
- **Users**: All preserved with roles intact
- **Lab Tests**: Preserved (reference data)
- **Auto-increment**: All reset to 1

### User Roles Preserved
- Admin users: 1
- Doctor users: 1
- Patient users: 6
- MedTech users: 1
- Lab technologist users: 0
- Hospital admin users: 0
- Nurse users: 0

### Lab Tests Preserved (Reference Data)
- Lab test definitions remain intact
- Test parameters and configurations preserved
- Pricing information maintained
- Test categories and types kept

## Safety Features

### Transaction Safety
- The script uses database transactions for safety
- All changes are rolled back if any error occurs
- Foreign key constraints are properly handled

### Data Preservation
- User authentication data is never touched
- User roles and permissions remain intact
- Lab test reference data is preserved
- System configuration is maintained

### Verification
- Comprehensive verification script included
- Detailed reporting of all operations
- Clear success/failure indicators
- Separate verification for lab-specific data

## Lab-Specific Considerations

### Reference Data Preservation
- **Lab Tests**: These are the test definitions and should NOT be cleared
- **Test Parameters**: Preserved to maintain system functionality
- **Test Categories**: Kept for proper organization
- **Pricing Information**: Maintained for billing purposes

### Foreign Key Relationships
- Lab result values → Lab results → Lab orders
- Lab requests → Visits → Patients
- Laboratory reports → Lab orders
- Proper order of deletion prevents constraint violations

## Troubleshooting

### If Lab Reset Fails
1. Check database connection
2. Verify user has proper permissions
3. Ensure no other processes are using the database
4. Check for foreign key constraint issues
5. Verify lab table structures

### If Verification Shows Issues
1. Re-run the lab reset script
2. Check for any remaining foreign key references
3. Manually clear any remaining lab data if needed
4. Verify lab test reference data is intact

## Important Notes

⚠️ **WARNING**: This operation permanently deletes all lab order data!
- Always backup your database before running the reset
- This cannot be undone
- Make sure you have proper backups

✅ **SAFE**: User accounts, roles, and lab test reference data are preserved
- All authentication remains intact
- User permissions are maintained
- Lab test definitions are kept
- System access is not affected

## Lab Test Reference Data

### What Are Lab Tests?
Lab tests are the reference definitions that define:
- Test names and codes
- Test parameters and normal ranges
- Test categories and types
- Pricing information
- Test descriptions and instructions

### Why Preserve Them?
- They are configuration data, not transactional data
- Clearing them would break the lab system
- They define what tests are available
- They contain pricing and parameter information

## Next Steps After Reset

1. **Test the lab system** - Verify all lab functionality works
2. **Check sorting** - Test if lab order sorting issues are resolved
3. **Create fresh lab orders** - Test with new lab orders
4. **Monitor performance** - Ensure the lab system runs smoothly
5. **Verify lab tests** - Confirm all test definitions are intact

## Files Created
- `reset_lab_orders_clean.php` - Main lab reset script
- `verify_lab_clean_database.php` - Lab verification script
- `LAB_ORDERS_RESET_GUIDE.md` - This documentation

## Lab System Workflow After Reset

1. **Create Lab Orders**: Start with fresh lab orders
2. **Process Results**: Add lab results to orders
3. **Generate Reports**: Create laboratory reports
4. **Test Sorting**: Verify sorting functionality works
5. **Monitor Performance**: Ensure system runs smoothly

## Support
If you encounter any issues:
1. Check the error messages in the script output
2. Verify database permissions
3. Ensure all dependencies are installed
4. Contact system administrator if needed
5. Verify lab test reference data is intact
