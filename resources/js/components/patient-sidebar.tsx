import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
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
        items: [
            {
                title: 'Overview',
                href: '/patient/dashboard',
            },
        ],
    },
    {
        title: 'Appointments',
        href: '/patient/appointments',
        icon: Calendar,
        items: [
            {
                title: 'View Appointments',
                href: '/patient/appointments',
            },
        ],
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
        <Sidebar 
          collapsible="icon" 
          variant="inset" 
          className="!bg-green-600 !border-green-500 [&_[data-sidebar=menu-button]]:!text-white [&_[data-sidebar=menu-button]]:hover:!bg-green-500/30 [&_[data-sidebar=menu-button]]:hover:!text-white [&_[data-sidebar=menu-button]]:data-[active=true]:!bg-green-500/40 [&_[data-sidebar=menu-button]]:data-[active=true]:!text-white [&_[data-sidebar=group-label]]:!text-white [&_[data-sidebar=group-label]]:!font-semibold [&_[data-sidebar=menu-sub-button]]:!text-white [&_[data-sidebar=menu-sub-button]]:hover:!bg-green-500/30 [&_[data-sidebar=menu-sub-button]]:hover:!text-white [&_[data-sidebar=menu-sub-button]]:data-[active=true]:!bg-green-500/40 [&_[data-sidebar=menu-sub-button]]:data-[active=true]:!text-white [&_[data-sidebar=menu-action]]:!text-white [&_[data-sidebar=menu-action]]:hover:!bg-green-500/30 [&_[data-sidebar=menu-action]]:hover:!text-white [&_*]:!text-white [&_span]:!text-white [&_svg]:!text-white" 
          style={{
            backgroundColor: '#16a34a !important',
            color: 'white !important',
            '--sidebar': '#16a34a',
            '--sidebar-foreground': 'white',
            '--sidebar-accent': 'rgba(34, 197, 94, 0.3)',
            '--sidebar-accent-foreground': 'white',
            '--sidebar-border': '#15803d'
          } as React.CSSProperties}
        >
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
            </SidebarFooter>
        </Sidebar>
    );
}
