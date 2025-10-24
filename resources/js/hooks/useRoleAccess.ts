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
    canTransferPatients: boolean;

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
    const userPermissions = auth?.user?.permissions || [];

    const isAdmin = userRole === 'admin';
    const isDoctor = userRole === 'doctor';
    const isNurse = userRole === 'nurse';
    const isLabStaff = userRole === 'laboratory_technologist' || userRole === 'medtech';
    const isCashier = userRole === 'cashier';
    const isPatient = userRole === 'patient';
    const isHospital = userRole === 'hospital_admin' || userRole === 'hospital_staff';
    const isStaff = isDoctor || isNurse || isLabStaff || isCashier || isAdmin;

    // Helper function to check permissions using User model methods
    const checkPermission = (permission: string): boolean => {
        // Use role-based permission checking for all roles
        const [module, action] = permission.split('.');
        return checkModulePermission(module, action);
    };

    // Helper function to check module permissions for all roles
    const checkModulePermission = (module: string, action: string): boolean => {
        switch (userRole) {
            case 'admin':
                return true; // Admin has access to everything
            case 'doctor':
                if (module === 'patients') {
                    return ['create', 'read', 'update', 'delete', 'transfer'].includes(action);
                }
                if (module === 'laboratory') {
                    return ['create', 'read', 'update', 'delete'].includes(action);
                }
                if (module === 'reports') {
                    return ['read', 'export'].includes(action);
                }
                if (module === 'appointments') {
                    return ['create', 'read', 'update', 'delete'].includes(action);
                }
                if (module === 'inventory') {
                    return ['create', 'read', 'update', 'delete'].includes(action);
                }
                return false;
            case 'nurse':
                if (module === 'patients') {
                    return ['create', 'read', 'update', 'delete', 'transfer'].includes(action);
                }
                if (module === 'appointments') {
                    return ['create', 'read', 'update', 'delete'].includes(action);
                }
                if (module === 'inventory') {
                    return ['create', 'read', 'update', 'delete'].includes(action);
                }
                if (module === 'reports') {
                    return ['read', 'export'].includes(action);
                }
                return false;
            case 'medtech':
                if (module === 'laboratory') {
                    return ['create', 'read', 'update', 'delete'].includes(action);
                }
                if (module === 'inventory') {
                    return ['create', 'read', 'update', 'delete'].includes(action);
                }
                if (module === 'reports') {
                    return ['read', 'export'].includes(action);
                }
                if (module === 'patients') {
                    return ['read'].includes(action); // Read-only access for medtech
                }
                return false;
            case 'cashier':
                if (module === 'billing') {
                    return ['create', 'read', 'update', 'delete'].includes(action);
                }
                if (module === 'reports') {
                    return ['read', 'export'].includes(action);
                }
                return false;
            case 'hospital_admin':
            case 'hospital_staff':
                // Hospital users have access to patients, reports, and inventory
                if (module === 'patients') {
                    return ['create', 'read', 'update', 'delete', 'transfer'].includes(action);
                }
                if (module === 'reports') {
                    return ['read', 'export'].includes(action);
                }
                if (module === 'inventory') {
                    return ['create', 'read', 'update', 'delete'].includes(action);
                }
                return false;
            case 'patient':
                if (module === 'patients') {
                    return ['read'].includes(action); // Read-only access to own data
                }
                return false;
            default:
                return false;
        }
    };
    
    // If no role is found, assume staff (safer default for admin interface)
    const hasValidRole = userRole && (isAdmin || isDoctor || isLabStaff || isCashier || isPatient || isHospital);

    const permissions: RolePermissions = {
        // Module Access - Based on permission checks
        canAccessPatients: checkPermission('patients.read') || checkPermission('patients.create') || checkPermission('patients.update'),
        canAccessLaboratory: checkPermission('laboratory.read') || checkPermission('laboratory.create') || checkPermission('laboratory.update'),
        canAccessBilling: checkPermission('billing.read') || checkPermission('billing.create') || checkPermission('billing.update'),
        canAccessAppointments: checkPermission('appointments.read') || checkPermission('appointments.create') || checkPermission('appointments.update'),
        canAccessInventory: checkPermission('inventory.read') || checkPermission('inventory.create') || checkPermission('inventory.update'),
        canAccessReports: checkPermission('reports.read') || checkPermission('reports.export'),
        canAccessSettings: checkPermission('settings.read') || checkPermission('settings.update'),
        canAccessAdminPanel: isStaff || (isHospital && (checkPermission('patients.read') || checkPermission('reports.read'))),

        // Patient Permissions
        canCreatePatients: checkPermission('patients.create'),
        canEditPatients: checkPermission('patients.update'),
        canDeletePatients: checkPermission('patients.delete'),
        canTransferPatients: checkPermission('patients.transfer'),

        // Laboratory Permissions
        canCreateLabTests: checkPermission('laboratory.create'),
        canEditLabTests: checkPermission('laboratory.update'),
        canDeleteLabTests: checkPermission('laboratory.delete'),

        // Billing Permissions
        canCreateBilling: checkPermission('billing.create'),
        canEditBilling: checkPermission('billing.update'),
        canDeleteBilling: checkPermission('billing.delete'),

        // Appointment Permissions
        canCreateAppointments: checkPermission('appointments.create'),
        canEditAppointments: checkPermission('appointments.update'),
        canDeleteAppointments: checkPermission('appointments.delete'),
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
            return '/admin/dashboard';
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
        isNurse,
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
