import { ReactNode } from 'react';

interface RoleBasedAccessProps {
    allowedRoles: string[];
    userRole: string;
    children: ReactNode;
    fallback?: ReactNode;
}

export default function RoleBasedAccess({ allowedRoles, userRole, children, fallback = null }: RoleBasedAccessProps) {
    if (allowedRoles.includes(userRole)) {
        return <>{children}</>;
    }

    return <>{fallback}</>;
}

// Convenience components for specific roles
export function AdminOnly({ userRole, children, fallback }: Omit<RoleBasedAccessProps, 'allowedRoles'>) {
    return (
        <RoleBasedAccess allowedRoles={['admin']} userRole={userRole} fallback={fallback}>
            {children}
        </RoleBasedAccess>
    );
}

export function DoctorOnly({ userRole, children, fallback }: Omit<RoleBasedAccessProps, 'allowedRoles'>) {
    return (
        <RoleBasedAccess allowedRoles={['doctor', 'admin']} userRole={userRole} fallback={fallback}>
            {children}
        </RoleBasedAccess>
    );
}

export function LabStaffOnly({ userRole, children, fallback }: Omit<RoleBasedAccessProps, 'allowedRoles'>) {
    return (
        <RoleBasedAccess allowedRoles={['laboratory_technologist', 'medtech', 'admin']} userRole={userRole} fallback={fallback}>
            {children}
        </RoleBasedAccess>
    );
}

export function CashierOnly({ userRole, children, fallback }: Omit<RoleBasedAccessProps, 'allowedRoles'>) {
    return (
        <RoleBasedAccess allowedRoles={['cashier', 'admin']} userRole={userRole} fallback={fallback}>
            {children}
        </RoleBasedAccess>
    );
}

export function StaffOnly({ userRole, children, fallback }: Omit<RoleBasedAccessProps, 'allowedRoles'>) {
    return (
        <RoleBasedAccess allowedRoles={['laboratory_technologist', 'medtech', 'cashier', 'doctor', 'admin']} userRole={userRole} fallback={fallback}>
            {children}
        </RoleBasedAccess>
    );
}
