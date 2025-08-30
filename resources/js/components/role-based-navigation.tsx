import { useRoleAccess } from '@/hooks/useRoleAccess';
import { Link } from '@inertiajs/react';
import { BarChart3, Calendar, CreditCard, FileText, FlaskConical, Package2, Settings, Users } from 'lucide-react';

export default function RoleBasedNavigation() {
    const { permissions, canAccessModule, shouldRedirectToPatient } = useRoleAccess();

    // If user is a patient, don't show admin navigation
    if (shouldRedirectToPatient()) {
        return null;
    }

    const menuItems = [
        // Dashboard - All staff can access
        {
            name: 'Dashboard',
            href: '/admin/dashboard',
            icon: BarChart3,
            show: permissions.canAccessAdminPanel,
        },
        // Patients - All staff can access
        {
            name: 'Patients',
            href: '/admin/patient',
            icon: Users,
            show: permissions.canAccessPatients,
        },
        // Laboratory - Lab staff and admin only
        {
            name: 'Laboratory',
            href: '/admin/laboratory',
            icon: FlaskConical,
            show: permissions.canAccessLaboratory,
        },
        // Billing - Cashier and admin only
        {
            name: 'Billing & Payments',
            href: '/admin/billing',
            icon: CreditCard,
            show: permissions.canAccessBilling,
        },
        // Appointments - Doctor and admin only
        {
            name: 'Appointments',
            href: '/admin/appointments',
            icon: Calendar,
            show: permissions.canAccessAppointments,
        },
        // Inventory - Admin only
        {
            name: 'Inventory',
            href: '/admin/inventory',
            icon: Package2,
            show: permissions.canAccessInventory,
        },
        // Reports - Admin only
        {
            name: 'Reports',
            href: '/admin/reports',
            icon: FileText,
            show: permissions.canAccessReports,
        },
        // Roles & Permissions - Admin only
        {
            name: 'Roles & Permissions',
            href: '/admin/roles',
            icon: Users,
            show: permissions.canAccessSettings,
        },
        // Settings - Admin only
        {
            name: 'System Settings',
            href: '/admin/settings',
            icon: Settings,
            show: permissions.canAccessSettings,
        },
    ];

    // Filter menu items based on permissions - completely hide inaccessible modules
    const visibleMenuItems = menuItems.filter((item) => item.show);

    // If no modules are accessible, don't render navigation
    if (visibleMenuItems.length === 0) {
        return null;
    }

    return (
        <nav className="space-y-1">
            {visibleMenuItems.map((item) => {
                const Icon = item.icon;
                return (
                    <Link
                        key={item.name}
                        href={item.href}
                        className="group flex items-center rounded-md px-2 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    >
                        <Icon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
                        {item.name}
                    </Link>
                );
            })}
        </nav>
    );
}
