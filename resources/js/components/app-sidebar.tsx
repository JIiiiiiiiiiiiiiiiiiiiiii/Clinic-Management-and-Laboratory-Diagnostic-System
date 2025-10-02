import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { useRoleAccess } from '@/hooks/useRoleAccess';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import {
    BarChart3,
    BookOpen,
    BookUser,
    BriefcaseMedical,
    CalendarClock,
    Folder,
    LayoutGrid,
    Settings,
    Shield,
    Stethoscope,
    Table2,
    Wallet,
} from 'lucide-react';
import AppLogo from './app-logo';

export function AppSidebar() {
    const { permissions } = useRoleAccess();
    const { auth } = usePage().props as any;

    // Define all possible navigation items with their access requirements
    const allNavItems: NavItem[] = [
        {
            title: 'Dashboard',
            href: '/admin/dashboard',
            icon: LayoutGrid,
            requiredPermission: 'canAccessAdminPanel',
        },
        {
            title: 'Patient Management',
            href: '/admin/patient',
            icon: BookUser,
            requiredPermission: 'canAccessPatients',
        },
        {
            title: 'Doctor Management',
            href: '/admin/doctors',
            icon: Stethoscope,
            requiredPermission: 'canAccessSettings',
        },
        {
            title: 'Laboratory Diagnostics',
            href: '/admin/laboratory',
            icon: Table2,
            requiredPermission: 'canAccessLaboratory',
        },
        {
            title: 'Supply Management',
            href: '/admin/inventory',
            icon: BriefcaseMedical,
            requiredPermission: 'canAccessInventory',
        },
        {
            title: 'Billing Management',
            href: '/admin/billing',
            icon: Wallet,
            requiredPermission: 'canAccessBilling',
        },
        {
            title: 'Appointment Management',
            href: '/admin/appointments',
            icon: CalendarClock,
            requiredPermission: 'canAccessAppointments',
        },
        {
            title: 'Reports',
            href: '/admin/reports',
            icon: BarChart3,
            requiredPermission: 'canAccessReports',
        },
        {
            title: 'Roles & Permissions',
            href: '/admin/roles',
            icon: Shield,
            requiredPermission: 'canAccessSettings',
        },
        // {
        //     title: 'System Settings',
        //     href: '/admin/settings',
        //     icon: Settings,
        //     requiredPermission: 'canAccessSettings',
        // },
    ];

    // Filter navigation items based on user permissions
    const visibleNavItems = allNavItems.filter((item) => {
        if (!item.requiredPermission) return true;
        return permissions[item.requiredPermission as keyof typeof permissions];
    });

    // If no navigation items are visible, don't render the sidebar
    if (visibleNavItems.length === 0) {
        return null;
    }

    const footerNavItems: NavItem[] = [
        {
            title: 'Repository',
            href: 'https://github.com/laravel/react-starter-kit',
            icon: Folder,
        },
        {
            title: 'Documentation',
            href: 'https://laravel.com/docs/starter-kits#react',
            icon: BookOpen,
        },
    ];

    return (
        // <Sidebar collapsible="icon" variant="sidebar">
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild className="holographic-sidebar-item text-white" style={{backgroundColor: '#0b6839'}}>
                            <Link href="/admin/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={visibleNavItems} />
            </SidebarContent>

            <SidebarFooter>
                {/* <NavFooter items={footerNavItems} className="mt-auto" /> */}
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
