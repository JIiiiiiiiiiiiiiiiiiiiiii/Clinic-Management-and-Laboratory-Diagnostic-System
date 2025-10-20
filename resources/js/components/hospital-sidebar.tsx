import { Link, usePage } from '@inertiajs/react';
import { FileBarChartIcon, LayoutDashboardIcon, UsersIcon } from 'lucide-react';
import * as React from 'react';

import { NavMain } from '@/components/nav-main';
import { Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';

const data = {
    navMain: [
        {
            title: 'Dashboard',
            url: '/hospital/dashboard',
            icon: LayoutDashboardIcon,
            items: [
                {
                    title: 'Overview',
                    url: '/hospital/dashboard',
                },
            ],
        },
        {
            title: 'Patient Management',
            url: '/hospital/patients',
            icon: UsersIcon,
            items: [
                {
                    title: 'Manage Patients',
                    url: '/hospital/patients',
                },
                {
                    title: 'Add Patient',
                    url: '/hospital/patients/create',
                },
                {
                    title: 'Patient Transfers',
                    url: '/hospital/patients/refer',
                },
            ],
        },
        {
            title: 'Reports & Analytics',
            url: '/hospital/reports',
            icon: FileBarChartIcon,
            items: [
                {
                    title: 'Reports Dashboard',
                    url: '/hospital/reports',
                },
                {
                    title: 'Patient Reports',
                    url: '/hospital/reports/patients',
                },
                {
                    title: 'Appointment Reports',
                    url: '/hospital/reports/appointments',
                },
                {
                    title: 'Transfer Reports',
                    url: '/hospital/reports/transfers',
                },
                {
                    title: 'Laboratory Reports',
                    url: '/hospital/reports/laboratory',
                },
                {
                    title: 'Inventory Reports',
                    url: '/hospital/reports/inventory',
                },
                {
                    title: 'Financial Reports',
                    url: '/hospital/reports/billing',
                },
                {
                    title: 'Operations Reports',
                    url: '/hospital/reports/clinic/operations',
                },
            ],
        },
    ],
    navSecondary: [],
};

export function HospitalSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const page = usePage<any>();
    const { auth } = page.props;

    return (
        <Sidebar
            collapsible="icon"
            variant="inset"
            className="!border-green-500 !bg-green-600 [&_*]:!text-white [&_[data-sidebar=group-label]]:!font-semibold [&_[data-sidebar=group-label]]:!text-white [&_[data-sidebar=menu-action]]:!text-white [&_[data-sidebar=menu-action]]:hover:!bg-green-500/30 [&_[data-sidebar=menu-action]]:hover:!text-white [&_[data-sidebar=menu-button]]:!text-white [&_[data-sidebar=menu-button]]:hover:!bg-green-500/30 [&_[data-sidebar=menu-button]]:hover:!text-white [&_[data-sidebar=menu-button]]:data-[active=true]:!bg-green-500/40 [&_[data-sidebar=menu-button]]:data-[active=true]:!text-white [&_[data-sidebar=menu-sub-button]]:!text-white [&_[data-sidebar=menu-sub-button]]:hover:!bg-green-500/30 [&_[data-sidebar=menu-sub-button]]:hover:!text-white [&_[data-sidebar=menu-sub-button]]:data-[active=true]:!bg-green-500/40 [&_[data-sidebar=menu-sub-button]]:data-[active=true]:!text-white [&_span]:!text-white [&_svg]:!text-white"
            style={
                {
                    backgroundColor: '#16a34a !important',
                    color: 'white !important',
                    '--sidebar': '#16a34a',
                    '--sidebar-foreground': 'white',
                    '--sidebar-accent': 'rgba(34, 197, 94, 0.3)',
                    '--sidebar-accent-foreground': 'white',
                    '--sidebar-border': '#15803d',
                } as React.CSSProperties
            }
            {...props}
        >
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/hospital/dashboard">
                                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-white/90 p-1 shadow-lg">
                                    <img src="/st-james-logo.png" alt="St. James Hospital Logo" className="size-6 object-contain" />
                                </div>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-semibold text-white drop-shadow-sm">St. James Hospital</span>
                                    <span className="truncate text-xs text-white/90 drop-shadow-sm">Hospital Interface</span>
                                </div>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <NavMain items={data.navMain} />
            </SidebarContent>
        </Sidebar>
    );
}
