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
    const userRole = auth?.user?.role || 'patient';

    const isAdmin = userRole === 'admin';
    const isDoctor = userRole === 'doctor';
    const isLabStaff = userRole === 'laboratory_technologist' || userRole === 'medtech';
    const isCashier = userRole === 'cashier';
    const isPatient = userRole === 'patient';
    const isStaff = isDoctor || isLabStaff || isCashier || isAdmin;

    const permissions: RolePermissions = {
        // Module Access - Only staff can access admin panel
        canAccessPatients: isStaff,
        canAccessLaboratory: isLabStaff || isDoctor || isAdmin,
        canAccessBilling: isCashier || isAdmin,
        canAccessAppointments: isDoctor || isAdmin,
        canAccessInventory: isAdmin,
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
        if (isPatient) {
            return '/patient/dashboard';
        }
        return '/admin/dashboard';
    };

    // Check if user should be redirected
    const shouldRedirectToPatient = (): boolean => {
        return isPatient;
    };

    return {
        userRole,
        isAdmin,
        isDoctor,
        isLabStaff,
        isCashier,
        isPatient,
        isStaff,
        permissions,
        hasPermission,
        canAccessModule,
        getDashboardRoute,
        shouldRedirectToPatient,
    };
}
