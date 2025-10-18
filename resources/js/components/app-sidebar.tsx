import * as React from "react"
import {
  BarChartIcon,
  CalendarIcon,
  CreditCardIcon,
  FlaskConicalIcon,
  LayoutDashboardIcon,
  PackageIcon,
  UserCheckIcon,
  UsersIcon,
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
import { NavSecondary } from "@/components/nav-secondary"

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/admin/dashboard",
      href: "/admin/dashboard",
      icon: LayoutDashboardIcon,
      items: [
        {
          title: "Overview",
          url: "/admin/dashboard",
        },
      ],
    },
    {
      title: "Patients",
      url: "/admin/patient",
      href: "/admin/patient",
      icon: UsersIcon,
      items: [
        {
          title: "All Patients",
          url: "/admin/patient",
        },
        {
          title: "Add Patient",
          url: "/admin/patient/create",
        },
        {
          title: "Visits",
          url: "/admin/visits",
        },
      ],
    },
    {
      title: "Laboratory",
      url: "/admin/laboratory",
      href: "/admin/laboratory",
      icon: FlaskConicalIcon,
      items: [
        {
          title: "Lab Orders",
          url: "/admin/laboratory/orders",
        },
        {
          title: "Test Templates",
          url: "/admin/laboratory/tests",
        },
        {
          title: "Reports",
          url: "/admin/reports/laboratory",
        },
      ],
    },
    {
      title: "Inventory",
      url: "/admin/inventory",
      href: "/admin/inventory",
      icon: PackageIcon,
      items: [
        {
          title: "Overview",
          url: "/admin/inventory",
        },
        {
          title: "Create Product",
          url: "/admin/inventory/create",
        },
        {
          title: "Doctor & Nurse Supplies",
          url: "/admin/inventory/doctor-nurse",
        },
        {
          title: "Med Tech Supplies",
          url: "/admin/inventory/medtech",
        },
        {
          title: "Reports",
          url: "/admin/inventory/reports",
        },
      ],
    },
    {
      title: "Appointments",
      url: "/admin/appointments",
      href: "/admin/appointments",
      icon: CalendarIcon,
      items: [
        {
          title: "All Appointments",
          url: "/admin/appointments",
        },
        {
          title: "Pending Requests",
          url: "/admin/pending-appointments",
        },
        {
          title: "Doctor Availability",
          url: "/admin/appointments/availability",
        },
      ],
    },
    {
      title: "Reports",
      url: "/admin/reports",
      href: "/admin/reports",
      icon: BarChartIcon,
    },
  ],
  navSecondary: [
    {
      title: "Specialist Management",
      url: "/admin/specialists",
      href: "/admin/specialists",
      icon: UserCheckIcon,
      items: [
        {
          title: "Doctors",
          url: "/admin/specialists/doctors",
        },
        {
          title: "Nurses",
          url: "/admin/specialists/nurses",
        },
        {
          title: "Med Techs",
          url: "/admin/specialists/medtechs",
        },
      ],
    },
    {
      title: "Billing",
      url: "/admin/billing",
      href: "/admin/billing",
      icon: CreditCardIcon,
      items: [
        {
          title: "Transactions",
          url: "/admin/billing",
        },
        {
          title: "Doctor Payments",
          url: "/admin/billing/doctor-payments",
        },
        {
          title: "Reports",
          url: "/admin/billing/billing-reports",
        },
      ],
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
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
              <Link href="/admin/dashboard">
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
        <NavSecondary items={data.navSecondary} />
      </SidebarContent>
    </Sidebar>
  )
}
