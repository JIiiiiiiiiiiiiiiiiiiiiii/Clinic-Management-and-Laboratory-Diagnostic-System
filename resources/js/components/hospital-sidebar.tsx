import * as React from "react"
import {
  LayoutDashboardIcon,
  UsersIcon,
  FileBarChartIcon,
} from "lucide-react"
import { Link, usePage } from "@inertiajs/react"

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { NavMain } from "@/components/nav-main"

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/hospital/dashboard",
      icon: LayoutDashboardIcon,
      items: [
        {
          title: "Overview",
          url: "/hospital/dashboard",
        },
      ],
    },
    {
      title: "Patients",
      url: "/hospital/patients",
      icon: UsersIcon,
      items: [
        {
          title: "View Patients",
          url: "/hospital/patients",
        },
        {
          title: "Add Patient",
          url: "/hospital/patients/create",
        },
        {
          title: "Refer Patient",
          url: "/hospital/patients/refer",
        },
      ],
    },
    {
      title: "View Reports",
      url: "/hospital/reports",
      icon: FileBarChartIcon,
      items: [
        {
          title: "All Patient Reports",
          url: "/hospital/reports/patients",
        },
        {
          title: "All Appointment Reports",
          url: "/hospital/reports/appointments",
        },
        {
          title: "All Transaction Reports",
          url: "/hospital/reports/transactions",
        },
        {
          title: "All Inventory Reports",
          url: "/hospital/reports/inventory",
        },
      ],
    },
  ],
  navSecondary: [  ],
}

export function HospitalSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const page = usePage<any>();
  const { auth } = page.props;

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
      {...props}
    >
      <SidebarHeader>
        <SidebarMenu>
            <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/hospital/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-white/90 p-1 shadow-lg">
                  <img 
                    src="/st-james-logo.png" 
                    alt="St. James Hospital Logo" 
                    className="size-6 object-contain"
                  />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold text-white drop-shadow-sm">St. James Clinic</span>
                  <span className="truncate text-xs text-white/90 drop-shadow-sm">Management System</span>
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
  )
}
