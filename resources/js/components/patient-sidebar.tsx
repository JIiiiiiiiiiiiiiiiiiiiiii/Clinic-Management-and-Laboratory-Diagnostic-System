import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { Calendar, FileText, Heart, Home, MapPin, User } from 'lucide-react';
import AppLogo from './app-logo';

const patientNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/patient/dashboard',
        icon: Home,
    },
    {
        title: 'Medical Records',
        href: '/patient/records',
        icon: FileText,
    },
    {
        title: 'Appointments',
        href: '/patient/appointments',
        icon: Calendar,
    },
    {
        title: 'Test Results',
        href: '/patient/test-results',
        icon: Heart,
    },
    {
        title: 'Profile',
        href: '/patient/profile',
        icon: User,
    },
];

const footerNavItems: NavItem[] = [
    {
        title: 'Contact Clinic',
        href: '/patient/contact',
        icon: MapPin,
    },
];

export function PatientSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild className="holographic-sidebar-item">
                            <Link href="/patient/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={patientNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
