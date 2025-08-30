# Role-Based Authentication System

This document explains the role-based authentication system implemented for the St. James Clinic application.

## Overview

The system implements role-based access control where different user roles have access to different modules and dashboards:

- **Patients**: Access to patient dashboard only
- **Clinic Staff**: Access to shared admin dashboard with role-specific modules
- **Admin**: Full access to all modules

## User Roles

### 1. Patient

- **Default role** for new registrations
- **Access**: Patient dashboard only
- **Features**: View medical records, appointments, prescriptions, test results

### 2. Laboratory Technologist

- **Access**: Admin dashboard with lab-specific modules
- **Features**: Manage lab tests, patient results, laboratory operations

### 3. MedTech

- **Access**: Admin dashboard with lab-specific modules
- **Features**: Manage lab tests, patient results, medical technology operations

### 4. Cashier

- **Access**: Admin dashboard with billing modules
- **Features**: Manage billing, payments, patient accounts

### 5. Doctor

- **Access**: Admin dashboard with medical modules
- **Features**: Manage patient records, medical history, prescriptions

### 6. Admin

- **Access**: Full admin dashboard with all modules
- **Features**: Complete system overview and management

## Implementation Details

### Database Changes

- Added `role` field to users table (enum with all role types)
- Added `is_active` boolean field for staff management
- Added `employee_id` field for clinic staff (nullable for patients)

### Middleware

- `CheckRole`: Protects routes based on user roles
- `RedirectBasedOnRole`: Redirects users to appropriate dashboards after login

### Route Protection

- **Patient routes**: Protected with `role:patient` middleware
- **Admin routes**: Protected with `role:laboratory_technologist,medtech,cashier,doctor,admin` middleware

### Authentication Flow

1. **Registration**: New users automatically get 'patient' role
2. **Login**: Users redirected based on their role
3. **Access Control**: Routes protected by role middleware

## File Structure

```
app/
├── Http/
│   ├── Middleware/
│   │   ├── CheckRole.php           # Role-based route protection
│   │   └── RedirectBasedOnRole.php # Post-login role-based redirects
│   └── Controllers/
│       └── Auth/
│           ├── RegisteredUserController.php # Updated for default patient role
│           └── AuthenticatedSessionController.php # Updated for role-based redirects
├── Models/
│   └── User.php                    # Updated with role methods

routes/
├── admin.php                       # Staff routes (shared dashboard)
├── patient.php                     # Patient routes
└── web.php                         # Main route file

resources/js/pages/
├── admin/
│   └── dashboard.tsx              # Role-based admin dashboard
└── patient/
    └── dashboard.tsx              # Patient dashboard
```

## Usage

### Testing the System

1. **Run migrations** (when database is available):

    ```bash
    php artisan migrate
    ```

2. **Seed test users**:

    ```bash
    php artisan db:seed --class=UserRoleSeeder
    ```

3. **Test accounts** (password: `password`):
    - Admin: `admin@clinic.com`
    - Doctor: `doctor@clinic.com`
    - Lab Tech: `labtech@clinic.com`
    - MedTech: `medtech@clinic.com`
    - Cashier: `cashier@clinic.com`
    - Patient: `patient@clinic.com`

### Adding New Roles

1. **Update User model** enum in migration
2. **Add role data** to dashboard component
3. **Update middleware** if needed
4. **Add role-specific routes** if needed

### Customizing Role Access

1. **Modify route middleware** in route files
2. **Update dashboard rendering** logic in admin dashboard
3. **Add role-specific components** as needed

## Security Features

- **Role validation** on backend
- **Route protection** with middleware
- **Data isolation** between roles
- **Automatic redirects** based on user role

## Future Enhancements

- **Permission system** for fine-grained access control
- **Role hierarchy** for complex permission structures
- **Audit logging** for role changes and access attempts
- **Dynamic role assignment** by administrators
- **Role-based navigation** menus

## Notes

- All clinic staff share the same admin dashboard UI
- Modules are rendered based on user role
- Patient experience is completely separate from staff experience
- System is designed to be easily extensible for new roles
