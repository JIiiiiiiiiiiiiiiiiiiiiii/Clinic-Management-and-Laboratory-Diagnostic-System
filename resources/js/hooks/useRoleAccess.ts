import { usePage } from '@inertiajs/react';

export interface RolePermissions {
    // Module Access
    canAccessPatients: boolean;
    canAccessLaboratory: boolean;
    canAccessBilling: boolean;
    canAccessAppointments: boolean;
    canAccessInventory: boolean;
    canAccessReports: boolean;
    canAccessSettings: boolean;
    canAccessAdminPanel: boolean;

    // Patient Permissions
    canCreatePatients: boolean;
    canEditPatients: boolean;
    canDeletePatients: boolean;

    // Laboratory Permissions
    canCreateLabTests: boolean;
    canEditLabTests: boolean;
    canDeleteLabTests: boolean;

    // Billing Permissions
    canCreateBilling: boolean;
    canEditBilling: boolean;
    canDeleteBilling: boolean;

    // Appointment Permissions
    canCreateAppointments: boolean;
    canEditAppointments: boolean;
    canDeleteAppointments: boolean;
}

export function useRoleAccess() {
    const { auth } = usePage().props as any;
    const userRole = auth?.user?.role;

    const isAdmin = userRole === 'admin';
    const isDoctor = userRole === 'doctor';
    const isLabStaff = userRole === 'laboratory_technologist' || userRole === 'medtech';
    const isCashier = userRole === 'cashier';
    const isPatient = userRole === 'patient';
    const isHospital = userRole === 'hospital_admin' || userRole === 'hospital_staff';
    const isStaff = isDoctor || isLabStaff || isCashier || isAdmin;
    
    // If no role is found, assume staff (safer default for admin interface)
    const hasValidRole = userRole && (isAdmin || isDoctor || isLabStaff || isCashier || isPatient || isHospital);

    const permissions: RolePermissions = {
        // Module Access - Only staff can access admin panel
        canAccessPatients: isStaff,
        canAccessLaboratory: isLabStaff || isDoctor || isAdmin,
        canAccessBilling: isCashier || isAdmin,
        canAccessAppointments: isDoctor || isAdmin,
        canAccessInventory: isStaff, // All staff can access inventory
        canAccessReports: isAdmin,
        canAccessSettings: isAdmin,
        canAccessAdminPanel: isStaff, // Patients cannot access admin panel

        // Patient Permissions
        canCreatePatients: isStaff,
        canEditPatients: isStaff,
        canDeletePatients: isAdmin,

        // Laboratory Permissions
        canCreateLabTests: isLabStaff || isAdmin,
        canEditLabTests: isLabStaff || isAdmin,
        canDeleteLabTests: isAdmin,

        // Billing Permissions
        canCreateBilling: isCashier || isAdmin,
        canEditBilling: isCashier || isAdmin,
        canDeleteBilling: isAdmin,

        // Appointment Permissions
        canCreateAppointments: isDoctor || isAdmin,
        canEditAppointments: isDoctor || isAdmin,
        canDeleteAppointments: isAdmin,
    };

    const hasPermission = (permission: keyof RolePermissions): boolean => {
        return permissions[permission];
    };

    const canAccessModule = (module: string): boolean => {
        switch (module) {
            case 'patients':
                return permissions.canAccessPatients;
            case 'laboratory':
                return permissions.canAccessLaboratory;
            case 'billing':
                return permissions.canAccessBilling;
            case 'appointments':
                return permissions.canAccessAppointments;
            case 'inventory':
                return permissions.canAccessInventory;
            case 'reports':
                return permissions.canAccessReports;
            case 'settings':
                return permissions.canAccessSettings;
            default:
                return false;
        }
    };

    // Get the appropriate dashboard route based on role
    const getDashboardRoute = (): string => {
        if (isPatient && hasValidRole) {
            return '/patient/dashboard';
        }
        if (isHospital) {
            return '/hospital/dashboard';
        }
        // Default to admin dashboard for staff or undefined roles
        return '/admin/dashboard';
    };

    // Check if user should be redirected
    const shouldRedirectToPatient = (): boolean => {
        // Only redirect to patient if explicitly a patient
        // If role is undefined or invalid, assume staff (admin interface)
        return isPatient && hasValidRole;
    };

    return {
        userRole,
        isAdmin,
        isDoctor,
        isLabStaff,
        isCashier,
        isPatient,
        isHospital,
        isStaff,
        permissions,
        hasPermission,
        canAccessModule,
        getDashboardRoute,
        shouldRedirectToPatient,
    };
}
